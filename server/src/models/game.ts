import { createServer, Server as HttpServer } from 'http';
import { memoryUsage } from 'process';
import { Socket, Server } from 'socket.io';
import { LOG_MESSAGES } from '../constants/logging';
import {
    EMITTED_PLAYER_EVENTS,
    RECEIVED_PLAYER_EVENTS,
    RECEIVED_SERVER_EVENTS,
} from '../constants/socketEvent';
// import { DUPLICATE, INTERNAL_ERRORS } from '../constants/serverMessages';
// import { PendingPlayer, Player } from './player';

import { statsReportInterval, allowDuplicateIP, joinValidation } from '../gameConfig.json';
import Logger from './logger';
import { IPfromSocket, PendingTokenIP, Player } from './players';
import { GameCreator } from './serverHub';
import { JwtPayload, verify } from 'jsonwebtoken';
import { jwt_secret } from '../gameSecrets.json';

export function getIPFromSocket(socket: Socket) {
    return socket.handshake.address.split(':').slice(-1)[0];
}

/** A single game/lobby. */
export class Game {
    private io: Server;
    private gameCode: string;
    private createdBy: GameCreator;
    public readonly inProgress: boolean = false;

    /** Logging for game events, like day/night cycles, voting, etc.. */
    private logger: Logger;

    /** Logging for player joins, disconnects, and reconnects. */
    private playerLogger: Logger;

    /** Players who have sent the POST request to `gameFinder` but haven't connected with a socket yet. */
    private pendingTokenIPs: { [ip: string]: PendingTokenIP } = {};

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
        if (this.pendingTokenIPs[ip]) return true;

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
        const playerWithSameUsername = this.players[username];
        if (this.pendingTokenIPs[username]) return true;
        if (playerWithSameUsername && playerWithSameUsername.connected) return true;
        return false;
    }

    /** On initially entering game code and username, if both are valid this function is called to 'reserve' a slot in the game. */
    public prepareForPlayer(token: string, username: string, ip: string) {
        const pendingPlayer = new PendingTokenIP(this, token, username, ip);

        this.playerLogger.log(LOG_MESSAGES.SENT_INITIAL_POST(ip, username));
        this.pendingTokenIPs[ip] = pendingPlayer;
        this.ipList.push(ip);
    }

    /** If a pending player (see `prepareForPlayer` method) doesn't join in the specified amount of time, the game will remove them from the list. */
    public timeoutJoiningPlayer(player: PendingTokenIP, stage: 0 | 1 | 3) {
        if (stage !== 3) {
            // stage 3 is a success, and has its own logging & cleanup
            this.playerLogger.log(LOG_MESSAGES.TIMEOUT(player, stage));

            const ipIndex = this.ipList.indexOf(player.ip);
            if (ipIndex === -1) {
                this.playerLogger.log(LOG_MESSAGES.FAILED_IP_REMOVAL(player));
            } else this.ipList.splice(ipIndex, 1);
        }

        clearTimeout(player.timeOutFunction);
        delete this.pendingTokenIPs[player.ip];
    }

    public handleSocketConnection(socket: Socket) {
        const ip = getIPFromSocket(socket);

        const associatedPlayer: PendingTokenIP | undefined = this.pendingTokenIPs[ip];

        if (!associatedPlayer) {
            if (this.ipList.includes(ip)) {
                // ip is included, so check if player with same ip exists and they are disconnected
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
                    possiblePlayer.addReconnectionListener(socket);
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

    public verifyCredentials(
        token: string,
        player: Player | PendingTokenIP,
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

    public handleTokenSend(
        player: PendingTokenIP,
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

        this.playerLogger.log(LOG_MESSAGES.SUCCESSFUL_CONNECTION(player));

        // TODO: enforce lowercase on player.username keys in this.players
        this.players[player.username] = new Player(
            this,
            player.socket as Socket,
            player.username,
            player.token,
        );
        this.timeoutJoiningPlayer(player, 3);
    }

    public handleTokenReconnectAttempt(
        token: string,
        gameCode: string,
        username: string,
        player: Player,
        newSocket: Socket,
    ) {
        const { isValid, reasons } = this.verifyCredentials(token, player, username, gameCode);
        if (isValid) {
            this.playerLogger.log(LOG_MESSAGES.RECONNECTION_SUCCESSFUL(player));
            player.reconnect(newSocket);
        } else {
            newSocket.emit(EMITTED_PLAYER_EVENTS.UNREGISTERED);
            this.playerLogger.log(LOG_MESSAGES.RECONNECTION_INVALID(player, reasons));
            newSocket.disconnect();
        }
    }
}
