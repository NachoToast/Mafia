import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GAME_EXT, SERVER_GENERAL } from '../constants/logging';
import {
    defaultTimePeriods,
    PlayerStatuses,
    TimePeriodLibrary,
    TimePeriodNames,
} from '../constants/mafia';
import {
    ChatMessage,
    EMITTED_PLAYER_EVENTS,
    EMITTED_SERVER_EVENTS,
    RECEIVED_SERVER_EVENTS,
    ROOMS,
} from '../constants/socketEvent';
import { ConnectionSystem, StageThreeConnection } from './ConnectionSystem';
import Logger from './Logger';
import Player from './Player';
import {
    connectionSettings as defaultConnectionSettings,
    defaultMaxPlayers,
    loggingSettings as defaultLoggingSettings,
} from '../config/defaultConfig';
import { connectionOverrides, loggingOverrides, maxPlayerOverride } from '../config/overrideConfig';
import { ConnectionSettings, LoggingSettings } from '../types/settings';
import { StringIndexed } from '../types/miscTypes';

export interface GameCreator {
    ip: string;
    username: string;
    isConnected: boolean;
}

export interface CreateGameOptions {
    httpServer: HttpServer;
    gameCode: string;
    createdBy?: GameCreator;
    maxPlayers?: number;
    connectionSettings?: ConnectionSettings;
    loggingSettings?: LoggingSettings;
}

/** A single game/lobby. */
export class Game {
    private readonly io: Server;
    public readonly gameCode: string;
    public createdBy?: GameCreator;
    public createdAt: number;
    public gameOwner?: Player;
    public temporaryGameOwner?: Player;
    public maxPlayers: number = defaultMaxPlayers;

    private timePeriod: TimePeriodNames = 'pregame';
    private timeRemaining: number = -1;
    private timePeriods: TimePeriodLibrary = JSON.parse(JSON.stringify(defaultTimePeriods));

    private dayNumber: number = 0;
    public inProgress: boolean = false;

    /** Handles player connections. */
    public readonly connectionSystem: ConnectionSystem;

    /** Logging for game events, like day/night cycles, voting, etc.. */
    private readonly logger?: Logger;

    private players: { [username: string]: Player } = {};

    /** For filling-in skipped player number slots. Ordered by when the player joined. */
    private takenNumbers: number[] = [];

    public readonly connectionSettings: ConnectionSettings = JSON.parse(
        JSON.stringify(defaultConnectionSettings),
    );
    public readonly loggingSettings: LoggingSettings = JSON.parse(
        JSON.stringify(defaultLoggingSettings),
    );

    public constructor({
        httpServer,
        gameCode,
        createdBy,
        maxPlayers,
        connectionSettings,
        loggingSettings,
    }: CreateGameOptions) {
        this.io = new Server(httpServer, {
            cors: { origin: true },
            path: `/${gameCode}`,
        });

        this.gameCode = gameCode;
        this.createdBy = createdBy;
        this.createdAt = Date.now();

        /** Stuff we want to log but don't have a logger yet (i.e. logger option report) */
        const loggingQueue = [];

        if (maxPlayers) {
            if (maxPlayerOverride) {
                loggingQueue.push(
                    `Max players was attempted to be overridden to ${maxPlayers} but disallowed`,
                );
            } else {
                this.maxPlayers = maxPlayers;
            }
        }

        if (loggingSettings) {
            for (const key of Object.keys(loggingSettings)) {
                const isOverriden = loggingOverrides.includes(key as never);
                if (isOverriden) {
                    loggingQueue.push(`Option '${key}' can't be overridden`);
                } else {
                    (this.loggingSettings as StringIndexed)[key] = (
                        loggingSettings as StringIndexed
                    )[key];
                }
            }
        }

        if (connectionSettings) {
            for (const key of Object.keys(connectionSettings)) {
                const isOverridden = connectionOverrides.includes(key as never);
                if (isOverridden) {
                    // put in logging queue so it'll be logged in same place as logging settings for consistency
                    loggingQueue.push(`Option '${key}' can't be overriden`);
                } else {
                    console.log(`overriding ${key}`);
                    (this.connectionSettings as StringIndexed)[key] = (
                        connectionSettings as StringIndexed
                    )[key];
                }
            }
        }

        this.connectionSystem = new ConnectionSystem(
            gameCode,
            (connection) => this.onJoin(connection),
            (connection, intentional) => this.onLeave(connection, intentional),
            (connection) => this.onReconnect(connection),
            null,
            null,
            this.connectionSettings.playerVerification,
            !!this.loggingSettings.logConnections,
            { ...this.loggingSettings.connectionParams },
        );

        if (this.loggingSettings.enabled) {
            this.logger = new Logger({
                name: 'game',
                path: `games/${gameCode}`,
                ...this.loggingSettings.baseParams,
            });

            for (const msg of loggingQueue) {
                this.logger.log(msg, { customTimestamp: '' });
            }
        }

        RECEIVED_SERVER_EVENTS.JOIN(this.io, (socket: Socket) =>
            this.connectionSystem.toStageTwo(socket, this.connectionSettings.allowReconnects),
        );

        this.logger?.log(SERVER_GENERAL.GAME_CONFIG(this), { customTimestamp: '' });
        this.logger?.log(SERVER_GENERAL.GAME_CREATED(this));
    }

    public getNumPlayers(): number {
        return Object.keys(this.players).length;
    }

    private playerNumberGenerator(): number {
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
    private joinRejoinHandlers(player: Player, socket: Socket): void {
        player.bindSocket(socket);

        // emitting all current players
        const usernameLower = player.username.toLowerCase();
        for (const playerName of Object.keys(this.players)) {
            if (playerName === usernameLower) continue;
            const { username, status, number, connected, isOwner } = this.players[playerName];
            EMITTED_PLAYER_EVENTS.PLAYER_HERE(
                socket,
                username,
                status,
                number,
                connected,
                '',
                isOwner,
            );
        }

        // socket room joining
        if (player.status === PlayerStatuses.alive) {
            socket.join(ROOMS.alive);
        } else {
            socket.join(ROOMS.notAlive);
        }

        // game ownership
        if (!this.gameOwner?.connected) {
            let isOwner = false;
            if (this.getNumPlayers() === 1 && !this.gameOwner) {
                isOwner = true;
                this.logger?.log(GAME_EXT.NEW_GAME_OWNER(player.username));
            } else if (
                this.gameOwner &&
                player.username === this.gameOwner.username &&
                player.ip === this.gameOwner.ip
            ) {
                isOwner = true;
                this.logger?.log(`Reconnected player '${player.username}' is the game owner`);
                EMITTED_SERVER_EVENTS.SERVER_CHAT_MESSAGE(
                    this.io,
                    GAME_EXT.NEW_GAME_OWNER(player.username),
                );
            }
            if (isOwner) {
                this.gameOwner = player;
                player.isOwner = true;
                EMITTED_SERVER_EVENTS.PLAYER_UPDATE(
                    this.io,
                    player.username,
                    player.status,
                    player.number,
                    '',
                    true,
                    true,
                );

                if (this.temporaryGameOwner) {
                    EMITTED_SERVER_EVENTS.PLAYER_UPDATE(
                        this.io,
                        this.temporaryGameOwner.username,
                        this.temporaryGameOwner.status,
                        this.temporaryGameOwner.number,
                        '',
                        true,
                        false,
                    );
                    this.temporaryGameOwner.isOwner = false;
                    delete this.temporaryGameOwner;
                }
            }
        }

        // time period
        EMITTED_PLAYER_EVENTS.TIMEPERIOD_INFO(
            player.socket,
            this.timePeriods[this.timePeriod],
            this.timeRemaining,
            this.dayNumber,
        );

        player.connected = true;
    }

    private onJoin(connection: StageThreeConnection): void {
        const { username, socket } = connection;

        const status = this.inProgress ? PlayerStatuses.spectator : PlayerStatuses.alive;

        const number = this.playerNumberGenerator();
        const newPlayer = new Player(this, number, socket, username, status);

        if (this.inProgress && status !== PlayerStatuses.spectator) {
            this.logger?.log(GAME_EXT.JOINED_GAME(username));
        }

        this.players[username.toLowerCase()] = newPlayer;

        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(
            this.io,
            username,
            status,
            number,
            '',
            true,
            newPlayer.isOwner,
        );

        EMITTED_SERVER_EVENTS.SERVER_CHAT_MESSAGE(
            this.io,
            GAME_EXT.JOINED_GAME(username),
            !this.inProgress ? undefined : ROOMS.notAlive,
        );

        this.joinRejoinHandlers(newPlayer, socket);
    }

    private makeTemporaryGameOwner(playerWhoLeft: string): void {
        const firstConnectedPlayer = Object.keys(this.players).find(
            (username) => this.players[username].connected,
        );
        if (!firstConnectedPlayer) {
            EMITTED_SERVER_EVENTS.SERVER_CHAT_MESSAGE(
                this.io,
                `Failed to find player to assign as game owner, game shutting down`,
            );
            return void this.logger?.log(
                `Failed to find connected player to make temporary owner, closing lobby`,
            );
            // TODO: close game here
        } else {
            const tempOwner = this.players[firstConnectedPlayer];
            this.temporaryGameOwner = tempOwner;
            tempOwner.isOwner = true;
            this.logger?.log(
                `Made '${tempOwner.username}' the new temporary game owner after ${playerWhoLeft} left`,
            );
            EMITTED_SERVER_EVENTS.SERVER_CHAT_MESSAGE(
                this.io,
                GAME_EXT.NEW_GAME_OWNER(tempOwner.username),
            );
            EMITTED_SERVER_EVENTS.PLAYER_UPDATE(
                this.io,
                tempOwner.username,
                tempOwner.status,
                tempOwner.number,
                '',
                true,
                true,
            );
        }
    }

    /** Called if a player who is marked as a game owner leaves them game. */
    private manageGameOwnerLeave(player: Player): any {
        if (player.username === this.gameOwner?.username && player.ip === this.gameOwner.ip) {
            // primary game owner left, make a temporary game owner

            if (!this.temporaryGameOwner) {
                this.makeTemporaryGameOwner(player.username);
            } else {
                // there is already a temporary game owner, this should never happen since temp game owners
                // are deleted when the primary game owner rejoins (independent of allowReconnects settings)
                this.logger?.log(
                    `Found temporary game owner '${this.temporaryGameOwner.username}' who should've been removed when '${this.gameOwner.username}' rejoined`,
                );
            }
        } else {
            if (
                !this.gameOwner?.connected &&
                player.username === this.temporaryGameOwner?.username &&
                ConnectionSystem.getIPFromSocket(player.socket) === this.temporaryGameOwner.ip
            ) {
                // otherwise if no primary game owner is present, and the person who left is a temporary game owner, make a temporary game owner
                this.makeTemporaryGameOwner(player.username);
            } else {
            }
            player.isOwner = false;
            EMITTED_SERVER_EVENTS.PLAYER_UPDATE(
                this.io,
                player.username,
                player.status,
                player.number,
                '',
                false,
                false,
            );
        }
    }

    private onLeave(
        connection: StageThreeConnection,
        intentional: boolean,
    ): {
        shouldRemove: boolean;
        removalReason?: string;
    } {
        const usernameLower = connection.username.toLowerCase();

        const leavingPlayer = this.players[usernameLower];
        if (!leavingPlayer) {
            this.logger?.log(
                `ConnectionSystem wanted to disconnect player ${connection.username} (${connection.ip}) but no such player exists`,
            );
            return { shouldRemove: true };
        }
        leavingPlayer.connected = false;

        const { number, status, username } = leavingPlayer;

        EMITTED_SERVER_EVENTS.SERVER_CHAT_MESSAGE(
            this.io,
            GAME_EXT.LEFT_GAME(username),
            this.inProgress && status === PlayerStatuses.spectator ? ROOMS.notAlive : undefined,
        );

        if (this.inProgress && status !== PlayerStatuses.spectator) {
            this.logger?.log(GAME_EXT.LEFT_GAME(username));
        }

        if (leavingPlayer.isOwner) this.manageGameOwnerLeave(leavingPlayer);

        // permanently remove player
        const removeBecauseNotStarted =
            !this.inProgress && !this.connectionSettings.allowPregameReconnects;
        const removeBecauseSpectator =
            status === PlayerStatuses.spectator &&
            !this.connectionSettings.allowSpectatorReconnects;
        const removeBecauseNoReconnects = !this.connectionSettings.allowReconnects;
        if (
            removeBecauseNoReconnects ||
            removeBecauseSpectator ||
            removeBecauseNotStarted ||
            intentional
        ) {
            EMITTED_SERVER_EVENTS.PLAYER_LEFT(this.io, username);
            this.takenNumbers.splice(this.takenNumbers.indexOf(number), 1);

            delete this.players[usernameLower];
            return {
                shouldRemove: true,
                removalReason: intentional
                    ? 'intentional disconnect'
                    : !this.inProgress
                    ? 'game not started yet'
                    : 'player was spectator',
            };
        }

        if (
            this.connectionSettings.killDisconnectedPlayers &&
            status === PlayerStatuses.alive &&
            this.inProgress
        ) {
            // TODO: kill player here
        }
        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(
            this.io,
            username,
            status,
            number,
            '',
            false,
            this.players[usernameLower].isOwner,
        );

        return { shouldRemove: false };
    }

    private onReconnect(connection: StageThreeConnection) {
        const reconnectedPlayer = this.players[connection.username.toLowerCase()];
        if (!reconnectedPlayer) {
            this.logger?.log(
                `ConnectionSystem wanted to reconnect player ${connection.username} (${connection.ip}) but no such player exists`,
            );
            return;
        }
        reconnectedPlayer.socket = connection.socket;
        const { username, status, socket, number } = reconnectedPlayer;

        EMITTED_SERVER_EVENTS.SERVER_CHAT_MESSAGE(
            this.io,
            GAME_EXT.RECONNECTED(username),
            status === PlayerStatuses.spectator && this.inProgress ? ROOMS.notAlive : undefined,
        );

        if (this.inProgress && status !== PlayerStatuses.spectator) {
            this.logger?.log(GAME_EXT.RECONNECTED(username));
        }

        EMITTED_SERVER_EVENTS.PLAYER_UPDATE(
            this.io,
            username,
            status,
            number,
            '',
            true,
            reconnectedPlayer.isOwner,
        );

        this.joinRejoinHandlers(reconnectedPlayer, socket);
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

    public sendWhisper(player: Player, target: string, message: string, presTarget: string): void {
        if (player.status !== PlayerStatuses.alive) {
            return void EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                player.socket,
                `You can only whisper to alive players`,
            );
        }
        let targetPlayer: Player | undefined;
        if (Number.isInteger(Number(target))) {
            const numberToLookFor = parseInt(target);
            const foundPlayerName = Object.keys(this.players).find(
                (username) => this.players[username].number === numberToLookFor,
            );
            if (!foundPlayerName) {
                return void EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                    player.socket,
                    `Player number ${numberToLookFor} does not exist`,
                );
            }
            targetPlayer = this.players[foundPlayerName];
        } else {
            targetPlayer = this.players[target];
        }

        if (!targetPlayer) {
            return void EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                player.socket,
                `Player '${presTarget}
                ' does not exist`,
            );
        }

        if (!targetPlayer.connected) {
            return void EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                player.socket,
                `${targetPlayer.username} is disconnected`,
            );
        }

        if (targetPlayer.username === player.username) {
            return void EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                player.socket,
                `You cannot whisper to yourself`,
            );
        }

        if (this.timePeriod === 'night') {
            return void EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                player.socket,
                `You cannot whisper at night`,
            );
        }

        const messageBody: ChatMessage = {
            content: `${player.username} whispers to you: ${message}`,
            author: player.username,
            props: { hideAuthor: true, color: 'gold' },
        };

        EMITTED_PLAYER_EVENTS.PRIVATE_CHAT_MESSAGE(targetPlayer.socket, messageBody);

        EMITTED_PLAYER_EVENTS.PRIVATE_CHAT_MESSAGE(player.socket, {
            content: `You whisper to ${targetPlayer.username}: ${message}`,
            author: 'Server',
            props: { hideAuthor: true, color: 'gold' },
        });

        EMITTED_SERVER_EVENTS.CHAT_MESSAGE(this.io, {
            content: `${player.username} is whispering to ${targetPlayer.username}`,
            author: player.username,
            props: { hideAuthor: true, color: 'gray' },
        });

        this.logger?.log(`${player.username} whispers to ${targetPlayer.username}: ${message}`);
    }

    public start(player: Player): void {
        if (!player.isOwner) {
            return void EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                player.socket,
                `You aren't the host`,
            );
        }
        this.timePeriod = 'gameStarting';
        this.timeRemaining = this.timePeriods[this.timePeriod].durationSeconds;
        this.inProgress = true;
        EMITTED_SERVER_EVENTS.SERVER_CHAT_MESSAGE(this.io, `Game started by ${player.username}`);
        EMITTED_SERVER_EVENTS.TIMEPERIOD_INFO(
            this.io,
            this.timePeriods[this.timePeriod],
            this.timeRemaining,
        );
        this.logger?.log(`Game started by ${player.username}`);
    }
}
