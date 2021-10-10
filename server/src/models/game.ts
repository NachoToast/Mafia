import { createServer, Server as HttpServer } from 'http';
import { memoryUsage } from 'process';
import { Socket, Server } from 'socket.io';
import { GAME_LOG, LOG_MESSAGES } from '../constants/logging';
import {
    EMITTED_PLAYER_EVENTS,
    EMITTED_SERVER_EVENTS,
    PlayerUpdate,
    RECEIVED_PLAYER_EVENTS,
    RECEIVED_SERVER_EVENTS,
    ROOM_NAMES,
} from '../constants/socketEvent';
// import { DUPLICATE, INTERNAL_ERRORS } from '../constants/serverMessages';
// import { PendingPlayer, Player } from './player';

import { statsReportInterval, joinValidation } from '../gameConfig.json';
import Logger from './logger';
import { IPfromSocket, PendingPlayer, Player, SocketTokenPayload } from './players';
import { GameCreator } from './serverHub';
import { JwtPayload, verify } from 'jsonwebtoken';
import { jwt_secret } from '../gameSecrets.json';
import { TimePeriods } from '../constants/mafia';
import { ChatMessage } from './chatMessage';

export function getIPFromSocket(socket: Socket) {
    return socket.handshake.address.split(':').slice(-1)[0];
}

/** A single game/lobby. */
export class Game {
    private io: Server;
    private gameCode: string;
    private createdBy: GameCreator;
    private timePeriod: TimePeriods = 'pregame';
    private dayNumber: number = 0;
    public inProgress: boolean = false;

    /** Logging for game events, like day/night cycles, voting, etc.. */
    private logger: Logger;

    /** Logging for player joins, disconnects, and reconnects. */
    private playerLogger: Logger;

    /** Players who have sent the POST request to `gameFinder` endpoint but haven't connected with a socket yet. */
    private pendingPlayers: { [ip: string]: PendingPlayer } = {};

    private players: { [username: string]: Player } = {};

    private ipList: string[] = [];

    public constructor(httpServer: HttpServer, gameCode: string, createdBy: GameCreator) {
        this.io = new Server(httpServer, {
            cors: { origin: true },
            path: `/${gameCode}`,
        });

        this.gameCode = gameCode;
        this.createdBy = createdBy;

        this.logger = new Logger({ name: 'game', path: `games/${gameCode}` });
        this.playerLogger = new Logger({ name: 'players', path: `games/${gameCode}` });

        this.logger.log(LOG_MESSAGES.GAME_CREATED(createdBy.ip, createdBy.username, gameCode));

        this.io.on(RECEIVED_SERVER_EVENTS.JOIN, (socket: Socket) =>
            this.handleSocketConnection(socket),
        );
    }

    public isDuplicateIP(ip: string) {
        const ipIndex = this.ipList.indexOf(ip);
        if (ipIndex === -1) return false;
        if (this.pendingPlayers[ip]) return true;

        // see if there's a disconnected player with same IP
        const possiblePlayer: Player | undefined =
            this.players[
                Object.keys(this.players).filter(
                    (name) => this.players[name].ip === ip && !this.players[name].connected,
                )[0]
            ];
        if (!!possiblePlayer) {
            return false;
        }
        return true;
    }

    public isDuplicateUsername(username: string) {
        const playerWithSameUsername = this.players[username.toLowerCase()];
        if (playerWithSameUsername && playerWithSameUsername.connected) return true;
        return false;
    }

    /** On initially entering game code and username, if both are valid this function is called to 'reserve' a slot in the game. */
    public createPendingPlayer(token: string, username: string, ip: string) {
        const pendingPlayer = new PendingPlayer(this, token, username, ip);

        this.playerLogger.log(LOG_MESSAGES.SENT_INITIAL_POST(ip, username));
        this.pendingPlayers[ip] = pendingPlayer;
        this.ipList.push(ip);

        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, {
            username,
            status: 'lobby',
            connected: false,
        });
    }

    /** Pending players are removed if (stage):
     * 1. No socket connection in time (specified in `gameConfig.json`)
     * 2. Socket doesn't sent credentials in time or they are invalid
     * 3. They're becoming an actual player.
     */
    public removePendingPlayer(player: PendingPlayer, stage: 0 | 1 | 3) {
        if (stage !== 3) {
            // stage 3 marks transition from pending to actual player
            // which has its own logging and cleanup
            this.playerLogger.log(LOG_MESSAGES.TIMEOUT(player, stage));
            EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, {
                username: player.username,
                status: 'removed',
                connected: false,
            });

            const ipIndex = this.ipList.indexOf(player.ip);
            if (ipIndex === -1) {
                this.playerLogger.log(LOG_MESSAGES.FAILED_IP_REMOVAL(player));
            } else this.ipList.splice(ipIndex, 1);
        }
        clearTimeout(player.timeOutFunction);
        delete this.pendingPlayers[player.ip];
    }

    /**
     * Handles initial (unverified) socket connections, ends up doing 1 of three things:
     * 1. If there is a pendingPlayer with same IP, prepares credential verification.
     * 2. If there is a disconnected player with same IP, prepares credential verification.
     * 3. Otherwise tells socket it is unregistered, and disconnects it.
     */
    private handleSocketConnection(socket: Socket) {
        const ip = getIPFromSocket(socket);

        const associatedPlayer: PendingPlayer | undefined = this.pendingPlayers[ip];

        if (!associatedPlayer) {
            if (this.ipList.includes(ip)) {
                // ip is taken by an existing player, check if that player is connected
                const possiblePlayer: Player | undefined =
                    this.players[
                        Object.keys(this.players).filter(
                            (name) => this.players[name].ip === ip && !this.players[name].connected,
                        )[0]
                    ];
                if (!!possiblePlayer) {
                    this.playerLogger.log(
                        LOG_MESSAGES.POSSIBLE_SOCKET_RECONNECTION(ip, possiblePlayer),
                    );
                    socket.emit(EMITTED_PLAYER_EVENTS.GIVE_TOKEN);
                    socket.on(
                        RECEIVED_PLAYER_EVENTS.HERE_IS_TOKEN,
                        (payload: SocketTokenPayload) => {
                            this.handleReonnectTokenSend(possiblePlayer, socket, payload);
                        },
                    );
                    return;
                }
            }
            this.playerLogger.log(LOG_MESSAGES.UNKNOWN_SOCKET_CONNECTION(ip, socket));
            socket.emit(EMITTED_PLAYER_EVENTS.UNREGISTERED);
            socket.disconnect();
            return;
        }

        this.playerLogger.log(LOG_MESSAGES.INITIAL_SOCKET_CONNECTION(ip, associatedPlayer));
        associatedPlayer.addSocket(socket);
    }

    /** Verifies that token, ip, username, and other credentials (configured in `gameConfig.json`) match the player. */
    private verifyCredentials(
        token: string,
        player: Player | PendingPlayer,
        username: string,
        gameCode: string,
    ): { isValid: boolean; reasons: string[] } {
        let isValid = true;
        const reasons: string[] = [];

        if (joinValidation.includes('token')) {
            // token validates gameCode and username
            try {
                const validatedToken = verify(token, jwt_secret) as JwtPayload;
                if (validatedToken?.username && validatedToken?.exp && validatedToken?.gameCode) {
                    if (validatedToken.exp * 1000 < Date.now()) {
                        isValid = false;
                        reasons.push('expired token');
                    } else if (username !== validatedToken.username) {
                        isValid = false;
                        reasons.push('username discrepancy');
                    } else if (gameCode !== validatedToken.gameCode) {
                        isValid = false;
                        reasons.push('game code discrepancy');
                    }
                } else {
                    isValid = false;
                    reasons.push('invalid token');
                }
            } catch (error) {
                this.playerLogger.log(error);
                isValid = false;
                reasons.push('erroneous token');
            }
        } else {
            // these secondary forms of validation are NOT secure, they're only here if
            // you *really* don't want to use JWT but still want to feel safe.
            if (joinValidation.includes('username') && username !== player.username) {
                isValid = false;
                reasons.push('non-matching username');
            } else if (joinValidation.includes('gameCode') && gameCode !== this.gameCode) {
                reasons.push('non-matching game code');
            }
        }
        if (joinValidation.includes('ip')) {
            isValid &&= player.ip === getIPFromSocket(player.socket as Socket);
        }

        return { isValid, reasons };
    }

    /** Verifies pending player socket connections. */
    public handleSocketCredentials(
        player: PendingPlayer,
        token: string,
        gameCode: string,
        username: string,
    ) {
        const { isValid, reasons } = this.verifyCredentials(token, player, username, gameCode);

        if (!isValid) {
            this.playerLogger.log(LOG_MESSAGES.INVALID_CREDENTIALS(player, reasons));
            (player.socket as Socket).emit(EMITTED_PLAYER_EVENTS.UNREGISTERED);
            (player.socket as Socket).disconnect();
            return;
        }

        const newPlayer = new Player(
            this,
            player.socket as Socket,
            player.username,
            token,
            this.inProgress ? 0 : this.getNumPlayers() + 1,
        );

        this.playerLogger.log(LOG_MESSAGES.SUCCESSFUL_CONNECTION(newPlayer, player.sentAt));
        this.players[player.username.toLowerCase()] = newPlayer;
        this.logger.log(GAME_LOG.JOINED_GAME(newPlayer));
        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, {
            username: newPlayer.username,
            status: newPlayer.status,
            connected: true,
        });
        this.showCurrentPlayers(newPlayer.socket, newPlayer.username);
        const message: ChatMessage = {
            author: 'Server',
            content: GAME_LOG.JOINED_GAME(newPlayer),
            props: { hideAuthor: true },
        };
        if (this.inProgress) {
            this.io.to(ROOM_NAMES.SPECTATORS).emit(EMITTED_SERVER_EVENTS.CHAT_MESSAGE, message);
        } else {
            this.io.emit(EMITTED_SERVER_EVENTS.CHAT_MESSAGE, message);
        }
        this.removePendingPlayer(player, 3);
    }

    /** Sends a list of current players to a specified socket. */
    private showCurrentPlayers(socket: Socket, playerName: string) {
        playerName = playerName.toLowerCase();
        const updates: PlayerUpdate[] = [];
        for (const name of Object.keys(this.players)) {
            if (name === playerName) continue;
            const update: PlayerUpdate = {
                username: this.players[name].username,
                status: this.players[name].status,
                connected: this.players[name].connected,
            };
            updates.push(update);
        }

        for (const ip of Object.keys(this.pendingPlayers)) {
            const pendingPlayer = this.pendingPlayers[ip];
            updates.push({
                username: pendingPlayer.username,
                status: 'loading',
                connected: false,
            });
        }

        for (const update of updates) {
            EMITTED_SERVER_EVENTS.PLAYER_UPDATE(socket, update);
        }
    }

    /** Verifies reconnecting player socket connections. */
    private handleReonnectTokenSend(
        player: Player,
        newSocket: Socket,
        credentials: SocketTokenPayload,
    ) {
        const { token, username, gameCode } = credentials;
        const { isValid, reasons } = this.verifyCredentials(token, player, username, gameCode);
        if (isValid) {
            this.playerLogger.log(LOG_MESSAGES.RECONNECTION_SUCCESSFUL(player));
            player.reconnect(newSocket);
            this.logger.log(GAME_LOG.RECONNECTED(player));
            EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, {
                username: username,
                status: player.status,
                connected: true,
            });
            this.showCurrentPlayers(newSocket, username);
            const message: ChatMessage = {
                author: 'Server',
                content: GAME_LOG.RECONNECTED(player),
                props: { hideAuthor: true },
            };
            if (this.inProgress && player.status !== 'alive') {
                this.io.to(ROOM_NAMES.SPECTATORS).emit(EMITTED_SERVER_EVENTS.CHAT_MESSAGE, message);
            } else {
                this.io.emit(EMITTED_SERVER_EVENTS.CHAT_MESSAGE, message);
            }
        } else {
            newSocket.emit(EMITTED_PLAYER_EVENTS.UNREGISTERED);
            this.playerLogger.log(LOG_MESSAGES.RECONNECTION_INVALID(player, reasons));
            newSocket.disconnect();
        }
    }

    /** Does not include pending players. */
    private getNumPlayers() {
        return Object.keys(this.players).length;
    }

    /** Logs player disconnects. */
    public handleDisconnect(player: Player, reason: string) {
        this.playerLogger.log(LOG_MESSAGES.DISCONNECTED(player, reason));
        player.disconnectedAt = Date.now();
        this.logger.log(GAME_LOG.LEFT_GAME(player));
        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, {
            username: player.username,
            status: player.status,
            connected: false,
        });
        const message: ChatMessage = {
            author: 'Server',
            content: GAME_LOG.LEFT_GAME(player),
            props: { hideAuthor: true },
        };
        if (this.inProgress && player.status !== 'alive') {
            this.io.to(ROOM_NAMES.SPECTATORS).emit(EMITTED_SERVER_EVENTS.CHAT_MESSAGE, message);
        } else {
            this.io.emit(EMITTED_SERVER_EVENTS.CHAT_MESSAGE, message);
        }
    }

    public messageSender(player: Player, message: ChatMessage) {
        const exportedMessage = {
            author: message.author,
            content: message.content,
            props: message.props,
        };
        this.io.emit(EMITTED_SERVER_EVENTS.CHAT_MESSAGE, exportedMessage);
        this.logger.log(`[${message.author}] ${message.content}`);
    }
}
