import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Game } from './models/game';
import { Server } from 'socket.io';
import cors from 'cors';
import gameRoutes from './routes/game';

class ServerHub {
    private games: { [key: string]: Game } = {};
    private app = express();
    private httpServer = createServer(this.app);

    public constructor(port: number) {
        this.addRoutes();
        this.httpServer.listen(port, () => console.log(`Server hub listening on port ${port}`));
    }

    private addRoutes() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use('/mafia/', gameRoutes);
    }

    private static alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

    /** Gets a game instance by game code. */
    public getGame(gameCode: string) {
        try {
            return this.games[gameCode];
        } catch (error) {
            console.log(error);
            return;
        }
    }

    public createGame(gameCode?: string) {
        // do stuff
        if (!gameCode) gameCode = ServerHub.makeRandomGameCode();

        const io = new Server(this.httpServer, {
            cors: { origin: true },
            path: `/${gameCode}`,
        });

        this.games[gameCode] = new Game(io);
        console.log(`Added a new game with code '${gameCode}'`);
    }
}

export const serverHub = new ServerHub(3001);

serverHub.createGame('worm');
