import { Socket } from 'socket.io';
import { usernameValidator } from '../constants/misc';
import { EVENTS } from '../constants/socketEvent';
import { Game } from './game';

export class PendingPlayer {
    private parentGame: Game;
    public socket: Socket;
    public ip: string;

    public constructor(game: Game, socket: Socket, ip: string) {
        this.parentGame = game;
        this.socket = socket;
        this.ip = ip;

        this.socket.on('disconnect', (reason: string) =>
            this.parentGame.removePendingPlayer(this, reason),
        );

        this.socket.on(EVENTS.USERNAME_SUBMIT, (username: string) => this.attemptJoin(username));

        console.log(`${this.ip} Connected`);
    }

    private attemptJoin(username: string) {
        if (this.parentGame.isDuplicateUsername(username)) {
            this.socket.emit('usernameTaken');
            return;
        }
        if (!usernameValidator.test(username)) {
            this.socket.emit('usernameInvalid');
            return;
        }

        this.parentGame.movePlayer(this, username);
    }
}

export class Player {
    private parentGame: Game;
    public socket: Socket;
    public ip: string;

    public name: string;

    public constructor(game: Game, socket: Socket, ip: string, name: string) {
        this.parentGame = game;
        this.socket = socket;
        this.ip = ip;
        this.name = name;

        this.socket.on('disconnect', (reason: string) =>
            this.parentGame.removePlayer(this, reason),
        );

        this.socket.on('sendPlayerMessage', (message: string) =>
            this.parentGame.globalChatMessage(message, this),
        );

        console.log(`${this.name} Joined`);
    }
}
