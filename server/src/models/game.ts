import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { GAME_EXT, SERVER_GENERAL } from '../constants/logging';
import { PlayerStatuses, TimePeriods } from '../constants/mafia';
import {
    EMITTED_PLAYER_EVENTS,
    EMITTED_SERVER_EVENTS,
    RECEIVED_SERVER_EVENTS,
    ROOMS,
} from '../constants/socketEvent';
import { ConnectionSystem, StageThreeConnection } from './connectionSystem';
import Logger from './logger';
import Player from './players';
import { GameCreator } from './serverHub';

/** A single game/lobby. */
export class Game {
    private readonly io: Server;
    private readonly gameCode: string;
    private readonly createdBy: GameCreator;
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
            (connection: StageThreeConnection) => this.onLeave(connection),
            (connection: StageThreeConnection) => this.onReconnect(connection),
            null,
            null,
            true,
        );

        if (doLogging) {
            this.logger = new Logger({
                name: 'game',
                path: `games/${gameCode}`,
            });
            this.logger.log(
                SERVER_GENERAL.GAME_CREATED(
                    createdBy.ip,
                    createdBy.username,
                    gameCode,
                ),
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

    private onJoin(connection: StageThreeConnection) {
        const { username, socket } = connection;

        const status = this.inProgress
            ? PlayerStatuses.spectator
            : PlayerStatuses.alive;

        const number = this.playerNumberGenerator();
        const newPlayer = new Player(this, number, socket, username, status);

        for (const playerName of Object.keys(this.players)) {
            const { username, status, number } = this.players[playerName];
            EMITTED_PLAYER_EVENTS.PLAYER_HERE(socket, username, status, number);
        }

        this.players[username.toLowerCase()] = newPlayer;

        EMITTED_SERVER_EVENTS.PLAYER_JOINED(this.io, username, status, number);

        EMITTED_SERVER_EVENTS.CHAT_MESSAGE(this.io, {
            author: 'Server',
            content: GAME_EXT.JOINED_GAME(username),
            to: !this.inProgress ? undefined : 'notAlive',
            props: { hideAuthor: true },
        });
    }

    private onLeave(connection: StageThreeConnection) {
        const { username } = connection;

        const { number, status } = this.players[username.toLowerCase()];
        this.takenNumbers.splice(this.takenNumbers.indexOf(number), 1);

        delete this.players[username.toLowerCase()];

        EMITTED_SERVER_EVENTS.PLAYER_LEFT(this.io, username);

        EMITTED_SERVER_EVENTS.CHAT_MESSAGE(this.io, {
            author: 'Server',
            content: GAME_EXT.LEFT_GAME(username),
            to:
                !this.inProgress || status === PlayerStatuses.alive
                    ? undefined
                    : 'notAlive',
            props: { hideAuthor: true },
        });
    }

    private onReconnect(connection: StageThreeConnection) {
        console.log('a reconnection!');
        this.onJoin(connection);
    }
}
