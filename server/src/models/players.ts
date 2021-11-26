import { Socket } from 'socket.io';
import { PlayerStatuses } from '../constants/mafia';
import { RECEIVED_PLAYER_EVENTS, ROOMS } from '../constants/socketEvent';
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

    public bindSocket(socket: Socket) {
        this.socket = socket;
        this.connected = true;
        RECEIVED_PLAYER_EVENTS.CHAT_MESSAGE(socket, (message: string) => this.message(message));
    }

    private message(message: string) {
        if (message.length < 1) return;
        if (message[0] === '/') {
            // TODO: commands
            return;
        }
        this.parentGame.sendChatMessage(this, message);
    }
}
