import { Socket } from 'socket.io';
import { PlayerStatuses } from '../constants/mafia';
import { Game } from './game';

export default class Player {
    private readonly parentGame: Game;
    public socket: Socket;
    public readonly username: string;
    public number: number;
    public connected: boolean = true;
    public status: PlayerStatuses;

    public constructor(
        game: Game,
        number: number,
        socket: Socket,
        username: string,
        status: PlayerStatuses,
    ) {
        this.parentGame = game;
        this.socket = socket;
        this.username = username;
        this.number = number;
        this.status = status;
    }
}
