import express from 'express';
import { createServer } from 'http';
import { Game, GameCreator } from './Game';
import cors from 'cors';
import gameRoutes from '../routes/game';
import { gameCodeValidator } from '../constants/auth';
import Logger, { globalLogger } from './Logger';
import { CODE_GENERATION, SERVER_GENERAL } from '../constants/logging';
import { ConnectionSettings, LoggingSettings } from '../types/settings';
import { serverHubSettings as config, serverHubSettings } from '../config/defaultConfig';
import { promisify } from 'util';

const wait = promisify(setTimeout);

export interface CreateGameOptions {
    createdBy?: GameCreator;
    gameCode?: string;
    maxPlayers?: number;
    connectionSettings?: ConnectionSettings;
    loggingSettings?: LoggingSettings;
}

export default class ServerHub {
    private readonly games: { [gameCode: string]: Game } = {};
    public readonly app = express();
    private readonly httpServer = createServer(this.app);

    private ready: boolean = false;

    /** Logging for key server events, like game creation and destruction. */
    private readonly logger = config.logKeyServerEvents
        ? new Logger({ name: 'main', path: 'serverHub', ...serverHubSettings.KSEParams })
        : null;

    /** Logging for game code generation. */
    private readonly gameCodeLogger = config.logGameCodeGeneration
        ? new Logger({ name: 'codes', path: 'serverHub', ...serverHubSettings.GCGParams })
        : null;

    public constructor(port: number, path: string = 'mafia') {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(`/${path}/`, gameRoutes);

        const startTime = Date.now();

        this.httpServer.listen(port, () => {
            const msg = `Server hub '${path}' started on port ${port} (took ${
                Date.now() - startTime
            }ms)`;
            console.log(msg);
            this.logger?.log(msg);
            globalLogger.log(msg);
            this.ready = true;
        });
    }

    private static alphabet = 'abcdefghijklmnopqrstuvwxyz';
    /** Makes a random game code, consisting of 3-5 random letters between a-z (inclusive, case sensitive) */
    private static makeRandomGameCode(): string {
        const codeLength = 3 + Math.floor(Math.random() * 3); // 3 to 5 inclusive
        let code = '';
        for (let i = 0; i < codeLength; i++) {
            const index = Math.floor(Math.random() * 26); // 0 to 26 exclusive
            code += this.alphabet[index];
        }
        return code;
    }

    public getNumberOfGames(): number {
        return Object.keys(this.games).length;
    }

    public getGame(gameCode: string): Game | undefined {
        return this.games[gameCode];
    }

    public async createGame(options: CreateGameOptions): Promise<void> {
        let waitAttempts = 0;
        while (!this.ready && waitAttempts < 10) {
            this.logger?.log(
                `Queueing attempt to start game until server is ready (attempt ${++waitAttempts})`,
            );
            await wait(100);
        }
        if (!this.ready) {
            return void this.logger?.log(
                `Took too long to start listening! Game creation cancelled.`,
            );
        }

        if (!options.gameCode) {
            // no game code specified
            this.gameCodeLogger?.log(CODE_GENERATION.MAKING_NEW(options.createdBy));
            options.gameCode = ServerHub.makeRandomGameCode();
            while (this.games[options.gameCode] !== undefined) {
                this.gameCodeLogger?.log(CODE_GENERATION.REROLLING(options.gameCode));
                options.gameCode = ServerHub.makeRandomGameCode();
            }
        } else if (!gameCodeValidator.test(options.gameCode)) {
            // game code specified but invalid
            return void this.gameCodeLogger?.log(CODE_GENERATION.INVALID(options.gameCode));
        } else if (this.games[options.gameCode] !== undefined) {
            // game code taken
            return void this.gameCodeLogger?.log(CODE_GENERATION.TAKEN(options.gameCode));
        }

        this.gameCodeLogger?.log(CODE_GENERATION.ACCEPTED(options.gameCode));

        const newGame = (this.games[options.gameCode] = new Game({
            httpServer: this.httpServer,
            gameCode: options.gameCode,
            createdBy: options.createdBy,
            maxPlayers: options.maxPlayers,
            connectionSettings: options.connectionSettings,
            loggingSettings: options.loggingSettings,
        }));

        this.logger?.log(SERVER_GENERAL.GAME_CREATED(newGame));
    }
}
