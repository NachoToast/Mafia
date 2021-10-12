import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { SERVER_GENERAL } from '../constants/logging';
import { TimePeriods } from '../constants/mafia';
import { RECEIVED_SERVER_EVENTS } from '../constants/socketEvent';
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
            this.onJoin,
            this.onLeave,
            this.onReconnect,
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

    private onJoin(connection: StageThreeConnection) {
        console.log(connection.username, 'joined!');
    }

    private onLeave(connection: StageThreeConnection) {
        console.log(connection.username, 'left!');
    }

    private onReconnect(connection: StageThreeConnection) {
        console.log(connection.username, 'reconnected!');
    }
}
