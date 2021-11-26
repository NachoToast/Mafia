import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GAME_EXT, SERVER_GENERAL } from '../constants/logging';
import { PlayerStatuses, TimePeriods } from '../constants/mafia';
import {
    ChatMessage,
    EMITTED_PLAYER_EVENTS,
    EMITTED_SERVER_EVENTS,
    RECEIVED_SERVER_EVENTS,
    ROOMS,
} from '../constants/socketEvent';
import { ConnectionSystem, StageThreeConnection } from './connectionSystem';
import Logger from './logger';
import Player from './players';
import { GameCreator } from './serverHub';
import {
    killDisconnectedPlayers,
    alwaysAllowReconnects,
    allowReconnects,
} from '../gameConfig.json';

/** A single game/lobby. */
export class Game {
    private readonly io: Server;
    private readonly gameCode: string;
    private createdBy: GameCreator;
    private timePeriod: TimePeriods = TimePeriods.pregame;
    private dayNumber: number = 0;
    public maxPlayers: number;
    public inProgress: boolean = false;

    /** Logging for game events, like day/night cycles, voting, etc.. */
    private readonly logger?: Logger;

    /** Handles player connections. */
    public readonly connectionSystem: ConnectionSystem;

    private players: { [username: string]: Player } = {};

    /** For filling-in skipped player number slots. */
    private takenNumbers: number[] = [];

    public constructor(
        httpServer: HttpServer,
        gameCode: string,
        createdBy: GameCreator,
        maxPlayers: number = 15,
        doLogging: boolean = true,
    ) {
        this.io = new Server(httpServer, {
            cors: { origin: true },
            path: `/${gameCode}`,
        });

        this.gameCode = gameCode;
        this.createdBy = createdBy;
        this.maxPlayers = maxPlayers;
        this.connectionSystem = new ConnectionSystem(
            gameCode,
            (connection: StageThreeConnection) => this.onJoin(connection),
            (connection: StageThreeConnection, intentional: boolean) =>
                this.onLeave(connection, intentional),
            (connection: StageThreeConnection) => this.onReconnect(connection),
            null,
            null,
            doLogging,
        );

        if (doLogging) {
            this.logger = new Logger({
                name: 'game',
                path: `games/${gameCode}`,
            });
            this.logger.log(
                SERVER_GENERAL.GAME_CREATED(createdBy.ip, createdBy.username, gameCode),
            );
        }

        RECEIVED_SERVER_EVENTS.JOIN(this.io, (socket: Socket) =>
            this.connectionSystem.toStageTwo(socket),
        );
    }

    // private getNumPlayers(): number {
    //     return Object.keys(this.players).length;
    // }

    private playerNumberGenerator() {
        let num = 1;
        while (this.takenNumbers.includes(num)) {
            num++;
        }
        this.takenNumbers.push(num);
        return num;
    }

    /** Stuff that happens on both join and rejoin, such as
     * socket binding,
     * emitting existing players to the newly (re)joined one,
     * and joining rooms
     */
    private joinRejoinHandlers(player: Player, socket: Socket) {
        player.bindSocket(socket);

        const usernameLower = player.username.toLowerCase();
        for (const playerName of Object.keys(this.players)) {
            if (playerName === usernameLower) continue;
            const { username, status, number, connected } = this.players[playerName];
            EMITTED_PLAYER_EVENTS.PLAYER_HERE(socket, username, status, number, connected);
        }

        if (player.status === PlayerStatuses.alive) {
            socket.join(ROOMS.alive);
        } else {
            socket.join(ROOMS.notAlive);
        }
    }

    private onJoin(connection: StageThreeConnection) {
        const { username, socket } = connection;

        const status = this.inProgress ? PlayerStatuses.spectator : PlayerStatuses.alive;

        const number = this.playerNumberGenerator();
        const newPlayer = new Player(this, number, socket, username, status);

        this.joinRejoinHandlers(newPlayer, socket);

        if (this.inProgress && status !== PlayerStatuses.spectator) {
            this.logger?.log(GAME_EXT.JOINED_GAME(username));
        }

        this.players[username.toLowerCase()] = newPlayer;

        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, username, status, number);

        EMITTED_SERVER_EVENTS.CHAT_MESSAGE(this.io, {
            author: 'Server',
            content: GAME_EXT.JOINED_GAME(username),
            to: !this.inProgress ? undefined : ROOMS.notAlive,
            props: { hideAuthor: true },
        });
    }

    private onLeave(
        connection: StageThreeConnection,
        intentional: boolean,
    ): {
        shouldRemove: boolean;
        removalReason?: string;
    } {
        const { username } = connection;

        const leavingPlayer = this.players[username.toLowerCase()];
        if (!leavingPlayer) {
            this.logger?.log(
                `ConnectionSystem wanted to disconnect player ${connection.username} (${connection.ip}) but no such player exists`,
            );
            return { shouldRemove: true };
        }

        const { number, status } = leavingPlayer;

        EMITTED_SERVER_EVENTS.CHAT_MESSAGE(this.io, {
            author: 'Server',
            content: GAME_EXT.LEFT_GAME(username),
            to: this.inProgress && status === PlayerStatuses.spectator ? ROOMS.notAlive : undefined,
            props: { hideAuthor: true },
        });

        if (this.inProgress && status !== PlayerStatuses.spectator) {
            this.logger?.log(GAME_EXT.LEFT_GAME(username));
        }

        // permanently remove player
        const removeBecauseNotStarted = !this.inProgress && !alwaysAllowReconnects;
        const removeBecauseSpectator =
            status === PlayerStatuses.spectator && !alwaysAllowReconnects;
        const removeBecauseNoReconnects = !allowReconnects;
        if (
            removeBecauseNoReconnects ||
            removeBecauseSpectator ||
            removeBecauseNotStarted ||
            intentional
        ) {
            EMITTED_SERVER_EVENTS.PLAYER_LEFT(this.io, username);
            this.takenNumbers.splice(this.takenNumbers.indexOf(number), 1);
            delete this.players[username.toLowerCase()];
            return {
                shouldRemove: true,
                removalReason: intentional
                    ? 'intentional disconnect'
                    : !this.inProgress
                    ? 'game not started yet'
                    : 'player was spectator',
            };
        } else {
            this.players[username.toLowerCase()].connected = false;

            if (killDisconnectedPlayers && status === PlayerStatuses.alive && this.inProgress) {
                // TODO: kill player here
            }
            EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, username, status, number, '', false);

            return { shouldRemove: false };
        }
    }

    private onReconnect(connection: StageThreeConnection) {
        const disconnectedPlayer = this.players[connection.username.toLowerCase()];
        if (!disconnectedPlayer) {
            this.logger?.log(
                `ConnectionSystem wanted to reconnect player ${connection.username} (${connection.ip}) but no such player exists`,
            );
            return;
        }
        disconnectedPlayer.socket = connection.socket;
        const { username, status, socket, number } = disconnectedPlayer;

        EMITTED_SERVER_EVENTS.CHAT_MESSAGE(this.io, {
            author: 'Server',
            content: GAME_EXT.RECONNECTED(username),
            to: status === PlayerStatuses.spectator && this.inProgress ? ROOMS.notAlive : undefined,
            props: { hideAuthor: true },
        });

        if (this.inProgress && status !== PlayerStatuses.spectator) {
            this.logger?.log(GAME_EXT.RECONNECTED(username));
        }

        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(this.io, username, status, number, '', true);

        const usernameLower = username.toLowerCase();

        this.joinRejoinHandlers(disconnectedPlayer, socket);
    }

    public sendChatMessage(player: Player, message: string) {
        let room: ROOMS | undefined;
        if (this.inProgress) {
            room = player.status === PlayerStatuses.alive ? ROOMS.alive : ROOMS.notAlive;

            this.logger?.log(`<${player.username}> (to ${room}) ${message}`);
        }

        const constructedMessage: ChatMessage = {
            author: player.username,
            content: message,
            to: room,
        };
        EMITTED_SERVER_EVENTS.CHAT_MESSAGE(this.io, constructedMessage);
    }
}
