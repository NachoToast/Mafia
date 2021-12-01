import { Socket } from 'socket.io';
import { PlayerStatuses } from '../constants/mafia';
import {
    EMITTED_PLAYER_EVENTS,
    EMITTED_SERVER_EVENTS,
    RECEIVED_PLAYER_EVENTS,
} from '../constants/socketEvent';
import { ConnectionSystem } from './ConnectionSystem';
import { Game } from './Game';

export default class Player {
    private readonly parentGame: Game;
    public socket: Socket;
    public ip: string;
    public readonly username: string;
    public number: number;
    public connected: boolean = true;
    public status: PlayerStatuses;

    public isOwner: boolean = false;

    public constructor(
        game: Game,
        number: number,
        socket: Socket,
        username: string,
        status: PlayerStatuses,
    ) {
        this.parentGame = game;
        this.socket = socket;
        this.ip = ConnectionSystem.getIPFromSocket(socket);
        this.username = username;
        this.number = number;
        this.status = status;
    }

    public bindSocket(socket: Socket) {
        this.socket = socket;
        this.ip = ConnectionSystem.getIPFromSocket(socket);
        this.connected = true;
        RECEIVED_PLAYER_EVENTS.CHAT_MESSAGE(socket, (message: string) => this.message(message));
    }

    private message(message: string): void {
        if (message.length < 1) return;
        if (message[0] === '/') {
            message = message.slice(1);
            const messageLower = message.toLowerCase();
            const [command, ...args] = messageLower.split(' ');
            const [presCommand, ...presArgs] = message.split(' ');

            switch (command) {
                case 'w':
                case 'whisper':
                    this.parentGame.sendWhisper(
                        this,
                        args[0],
                        presArgs?.slice(1)?.join(' '),
                        presArgs[0],
                    );
                    break;
                case 'start':
                    this.parentGame.start(this);
                    break;
                default:
                    EMITTED_PLAYER_EVENTS.SERVER_PRIVATE_CHAT_MESSAGE(
                        this.socket,
                        `Command '${command}' does not exist`,
                    );

                    break;
            }
        } else {
            this.parentGame.sendChatMessage(this, message);
        }
    }
}
