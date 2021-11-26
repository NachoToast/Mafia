import express from 'express';
import { createServer } from 'http';
import { Game } from './game';
import cors from 'cors';
import gameRoutes from '../routes/game';
import { gameCodeValidator } from '../constants/auth';
import Logger, { globalLogger } from './logger';
import { CODE_GENERATION, SERVER_GENERAL } from '../constants/logging';

export interface GameCreator {
    ip: string;
    username: string;
    token: string;
}

export default class ServerHub {
    private games: { [gameCode: string]: Game } = {};
    private app = express();
    private httpServer = createServer(this.app);

    /** Logging for key server events, like game creation and destruction. */
    private logger = new Logger({ name: 'main', path: 'serverHub' });

    /** Logging for game code generation. */
    private gameCodeLogger = new Logger({ name: 'codes', path: 'serverHub' });

    public constructor(port: number) {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use('/mafia/', gameRoutes);

        this.httpServer.listen(port, () => {
            const msg = `Server hub started on port ${port}`;
            console.log(msg);
            this.logger.log(msg);
            globalLogger.log(msg);
        });
    }

    private static alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    /** Makes a random game code, consisting of 3-5 random letters between a-z (inclusive, case sensitive) */
    private static makeRandomGameCode() {
        const codeLength = 3 + Math.floor(Math.random() * 3); // 3 to 5 inclusive
        let code = '';
        for (let i = 0; i < codeLength; i++) {
            const index = Math.floor(Math.random() * 52); // 0 to 52 exclusive
            code += this.alphabet[index];
        }
        return code;
    }

    public getNumberOfGames() {
        return Object.keys(this.games).length;
    }

    public getGame(gameCode: string) {
        return this.games[gameCode];
    }

    public createGame(createdBy: GameCreator, gameCode?: string) {
        const { ip, username } = createdBy;

        if (!gameCode) {
            // no gameCode specified
            this.gameCodeLogger.log(CODE_GENERATION.MAKING_NEW(ip, username));

            gameCode = ServerHub.makeRandomGameCode();
            while (this.games[gameCode] !== undefined) {
                this.gameCodeLogger.log(CODE_GENERATION.REROLLING(gameCode));
                gameCode = ServerHub.makeRandomGameCode();
            }
        } else if (!gameCodeValidator.test(gameCode)) {
            // gameCode specified but invalid
            this.gameCodeLogger.log(CODE_GENERATION.INVALID(gameCode));
            return;
        } else if (this.games[gameCode] !== undefined) {
            // gameCode taken
            this.gameCodeLogger.log(CODE_GENERATION.TAKEN(gameCode));
            return;
        }

        this.gameCodeLogger.log(CODE_GENERATION.ACCEPTED(gameCode));
        this.logger.log(SERVER_GENERAL.GAME_CREATED(ip, username, gameCode));

        this.games[gameCode] = new Game(this.httpServer, gameCode, createdBy);
    }
}
