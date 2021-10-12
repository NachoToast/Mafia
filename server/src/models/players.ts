import { Socket } from 'socket.io';
import { Game } from './game';

export default class Player {
    private readonly parentGame: Game;
    public socket: Socket;
    public readonly username: string;
    public number: number;

    public constructor(
        game: Game,
        number: number,
        { socket, username }: { socket: Socket; username: string },
    ) {
        this.parentGame = game;
        this.socket = socket;
        this.username = username;
        this.number = number;
    }
}
