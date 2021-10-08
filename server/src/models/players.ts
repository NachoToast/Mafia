import { Socket } from 'socket.io';
import { Game } from './game';
import { requestTimeoutSeconds, joinValidation } from '../gameConfig.json';
import { EMITTED_PLAYER_EVENTS, RECEIVED_PLAYER_EVENTS } from '../constants/socketEvent';
import { MafiaRoles, PlayerStatuses } from '../constants/mafia';

export function IPfromSocket(socket: Socket) {
    return socket.handshake.address.split(':').slice(-1)[0];
}

export class Player {
    private parentGame: Game;
    public socket: Socket;
    public username: string;
    public token: string;
    public ip: string;
    public role: MafiaRoles = 'None';
    public status: PlayerStatuses;
    public connected: boolean = true;
    public joinedAt = Date.now();
    public disconnectedAt = Date.now();

    public constructor(game: Game, socket: Socket, username: string, token: string) {
        this.parentGame = game;
        this.socket = socket;
        this.username = username;
        this.token = token;
        this.ip = IPfromSocket(socket);

        if (game.inProgress) this.status = 'spectator';
        else this.status = 'lobby';

        this.addSocketListeners(socket);
    }

    private addSocketListeners(socket: Socket) {
        socket.on(RECEIVED_PLAYER_EVENTS.LEAVE, (reason: string) => this.leaveGame(reason));

        socket.on('connect', () => console.log('SOMEHOW RECONNEWCTED?'));
    }

    private leaveGame(reason: string) {
        // parentgame leaving methods go here
        this.connected = false;
        this.disconnectedAt = Date.now();
    }

    public addReconnectionListener(newSocket: Socket) {
        newSocket.emit(EMITTED_PLAYER_EVENTS.GIVE_TOKEN);
        newSocket.on(
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
                this.parentGame.handleTokenReconnectAttempt(
                    token,
                    gameCode,
                    username,
                    this,
                    newSocket,
                );
            },
        );
    }

    public reconnect(newSocket: Socket) {
        this.connected = true;
        this.socket = newSocket;
        this.addSocketListeners(newSocket);
    }
}

/** Made on initial POST request for findGame, this class contains information like a token, ip, and username. This is later used for matching a socket to a player. */
export class PendingTokenIP {
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
            this.parentGame.timeoutJoiningPlayer(this, 0);
        }, requestTimeoutSeconds * 1000);
    }

    public addSocket(socket: Socket) {
        clearTimeout(this.timeOutFunction);
        this.timeOutFunction = setTimeout(() => {
            this.parentGame.timeoutJoiningPlayer(this, 1);
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
