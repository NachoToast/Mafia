import { serverEndpoint, serverPort } from '../config/endPoints.json';
import { io, Socket } from 'socket.io-client';
import { TypedEmitter } from 'tiny-typed-emitter';
import TimePeriod, { STP } from '../types/TimePeriod';
import ChatMessage, { SCM } from '../types/ChatMessage';
import { v4 as uuid } from 'uuid';
import Player, { PlayerStatuses } from '../types/Player';

interface MafiaEvents {
    connected: () => void;
    unregistered: () => void;
    disconnected: (reason: Socket.DisconnectReason) => void;
    timePeriodUpdate: (timePeriod: TimePeriod) => void;
    timeRemainingUpdate: (time: number) => void;
    chatMessage: (message: ChatMessage) => void;
    playerUpdate: (player: Player) => void;
    playerLeft: (username: string) => void;
}

class MafiaSocket extends TypedEmitter<MafiaEvents> {
    public socket?: Socket;
    private token?: string;
    private gameCode?: string;
    private username?: string;

    public constructor() {
        super();
    }

    public connect(gameCode: string, token: string, username: string) {
        this.gameCode = gameCode;
        this.token = token;
        this.username = username;
        this.socket = io(`${serverEndpoint}:${serverPort}`, {
            path: `/${this.gameCode}`,
        });
        this.socket.on('connect', () => {
            this.emit('connected');
        });
        this.socket.on('unregistered', () => {
            this.emit('unregistered');
        });
        this.socket.on('giveToken', () => {
            this.socket?.emit('heresToken', {
                gameCode: this.gameCode,
                token: this.token,
                username: this.username,
            });
        });
        this.socket.on('disconnect', (reason) => {
            this.emit('disconnected', reason);
        });

        this.timePeriodListeners(this.socket);
        this.chatMessageListeners(this.socket);
        this.playerListListeners(this.socket);
    }

    private timePeriodListeners(socket: Socket) {
        socket.on('connect', () =>
            this.emit('timePeriodUpdate', {
                name: 'Loading',
                toolTip: 'Getting Data From Server',
                maxDuration: -1,
                day: -1,
            }),
        );

        socket.on(
            'timePeriodUpdate',
            ({ name, description, durationSeconds }: STP, timeLeft: number, day: number) => {
                this.emit('timePeriodUpdate', {
                    name,
                    toolTip: description,
                    maxDuration: durationSeconds,
                    day,
                });
                this.emit('timeRemainingUpdate', timeLeft);
            },
        );

        socket.on('disconnect', () =>
            this.emit('timePeriodUpdate', {
                name: `Disconnected`,
                toolTip: 'Disconnected From The Server',
                maxDuration: -1,
                day: -1,
            }),
        );
    }

    private chatMessageListeners(socket: Socket) {
        socket.on('emittedChatMessage', ({ author, content, props }: SCM) => {
            this.emit('chatMessage', {
                id: uuid(),
                author,
                content,
                props,
            });
        });
    }

    private playerListListeners(socket: Socket) {
        socket.on(
            'playerUpdate',
            (
                username: string,
                status: PlayerStatuses,
                number: number,
                extra: string,
                connected: boolean,
                isOwner: boolean,
            ) => {
                this.emit('playerUpdate', {
                    username,
                    number,
                    status,
                    extra,
                    connected,
                    isOwner,
                });
            },
        );

        socket.on('playerLeft', (username: string) => {
            this.emit('playerLeft', username);
        });
    }

    public disconnect(intentional: boolean = false) {
        if (intentional) {
            this.socket?.emit('intentionalDisconnect');
        }
        this.socket?.disconnect();
    }

    public sendChatMessage(content: string): void {
        this.socket?.emit('chatMessage', content);
    }

    get connected() {
        return !!this.socket?.connected;
    }
}

const mafiaSocket = new MafiaSocket();

export default mafiaSocket;
