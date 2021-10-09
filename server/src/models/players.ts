import { Socket } from 'socket.io';
import { Game } from './game';
import { requestTimeoutSeconds } from '../gameConfig.json';
import {
    EMITTED_PLAYER_EVENTS,
    RECEIVED_PLAYER_EVENTS,
    ROOM_NAMES,
} from '../constants/socketEvent';
import { MafiaRoles, PlayerStatuses } from '../constants/mafia';
import { ChatMessage } from './chatMessage';

export function IPfromSocket(socket: Socket) {
    return socket.handshake.address.split(':').slice(-1)[0];
}

export interface SocketTokenPayload {
    token: string;
    gameCode: string;
    username: string;
}

export class Player {
    private parentGame: Game;
    public socket: Socket;
    public username: string;
    public token: string;
    public ip: string;
    public status: PlayerStatuses;
    public connected: boolean = true;
    public joinedAt = Date.now();
    public disconnectedAt = Date.now();

    public role: MafiaRoles = 'None';

    public constructor(game: Game, socket: Socket, username: string, token: string) {
        this.parentGame = game;
        this.socket = socket;
        this.username = username;
        this.token = token;
        this.ip = IPfromSocket(socket);

        if (game.inProgress) {
            this.status = 'spectator';
            socket.join(ROOM_NAMES.SPECTATORS);
        } else this.status = 'lobby';

        this.setupSocket(socket);
    }

    private setupSocket(socket: Socket) {
        socket.on(RECEIVED_PLAYER_EVENTS.LEAVE, (reason: string) => this.leaveGame(reason));
        socket.on(RECEIVED_PLAYER_EVENTS.CHAT_MESSAGE, (message: string) =>
            this.messageIntentionGetter(message),
        );
    }

    private leaveGame(reason: string) {
        this.connected = false;
        this.parentGame.handleDisconnect(this, reason);
    }

    /** Rebinds new socket connection and does relevant actions. */
    public reconnect(newSocket: Socket) {
        this.connected = true;
        this.socket = newSocket;
        this.setupSocket(newSocket);
        if (this.parentGame.inProgress) {
            if (this.status === 'alive') newSocket.join(ROOM_NAMES.ALIVE);
            else if (this.status === 'dead') newSocket.join(ROOM_NAMES.DEAD);
            else newSocket.join(ROOM_NAMES.SPECTATORS);
        }
    }

    /** Checks whether a message is a normal chat message or a command. */
    private messageIntentionGetter(message: string) {
        if (message[0] === '/') {
            // command stuff
        } else this.messageReceiver(message);
    }

    /** Handles passing a received message from client to the game server. */
    private messageReceiver(message: string) {
        const fullMessage: ChatMessage = {
            author: this.username,
            content: message,
        };
        this.parentGame.messageSender(this, fullMessage);
    }
}

/** Made on initial POST request for findGame, this class contains information like a token, ip, and username. This is later used for matching a socket to a player. */
export class PendingPlayer {
    public parentGame: Game;
    public token: string;
    public username: string;
    public ip: string;
    public sentAt = Date.now();
    public timeOutFunction: NodeJS.Timeout;

    public socket: Socket | undefined = undefined;

    constructor(game: Game, token: string, username: string, ip: string) {
        this.parentGame = game;
        this.token = token;
        this.username = username;
        this.ip = ip;

        this.timeOutFunction = setTimeout(() => {
            this.parentGame.removePendingPlayer(this, 0);
        }, requestTimeoutSeconds * 1000);
    }

    public addSocket(socket: Socket) {
        clearTimeout(this.timeOutFunction);
        this.timeOutFunction = setTimeout(() => {
            this.parentGame.removePendingPlayer(this, 1);
        }, requestTimeoutSeconds * 1000);

        this.socket = socket;
        socket.emit(EMITTED_PLAYER_EVENTS.GIVE_TOKEN);

        this.socket.on(
            RECEIVED_PLAYER_EVENTS.HERE_IS_TOKEN,
            ({
                token,
                gameCode,
                username,
            }: {
                token: string;
                gameCode: string;
                username: string;
            }) => {
                this.parentGame.handleTokenSend(this, token, gameCode, username);
            },
        );
    }
}
