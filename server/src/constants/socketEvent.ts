import { Server, Socket } from 'socket.io';
import { SocketTokenPayload } from '../classes/ConnectionSystem';
import { PlayerStatuses } from './mafia';

/** Events captured by the game's global io instance, `io.on()`  */
export const RECEIVED_SERVER_EVENTS = {
    JOIN: (io: Server, callback: Function) =>
        io.on('connect', (socket: Socket) => callback(socket)),
};

/** Events captured by server-side player-specific socket instances- `socket.on()` */
export const RECEIVED_PLAYER_EVENTS = {
    LEAVE: (socket: Socket, callback: Function) =>
        socket.on('disconnect', (reason: string) => callback(reason)),
    HERE_IS_TOKEN: (socket: Socket, callback: Function) =>
        socket.on('heresToken', (payload: SocketTokenPayload) => callback(payload)),
    CHAT_MESSAGE: (socket: Socket, callback: Function) =>
        socket.on('chatMessage', (message: string) => callback(message.trim())),
    INTENTIONAL_LEAVE: (socket: Socket, callback: Function) =>
        socket.on('intentionalDisconnect', () => callback()),
};

/** Events emitted by the game's global io instance - `io.emit()`  */
export const EMITTED_SERVER_EVENTS = {
    // CHAT_MESSAGE: 'emittedChatMessage',
    CHAT_MESSAGE: (io: Server, message: ChatMessage) => {
        if (message?.to) io.to(message.to).emit('emittedChatMessage', message);
        else io.emit('emittedChatMessage', message);
    },
    SERVER_CHAT_MESSAGE: (io: Server, content: string, to?: ROOMS) => {
        const messageBody: ChatMessage = {
            content,
            author: 'Server',
            props: { hideAuthor: true, color: '#FFFF00' },
        };
        if (to) io.to(to).emit('emittedChatMessage', messageBody);
        else io.emit('emittedChatMessage', messageBody);
    },
    PLAYER_LEFT: (io: Server, username: string) => io.emit('playerLeft', username),
    PLAYER_UPDATE: (
        io: Server,
        username: string,
        status: PlayerStatuses,
        number: number,
        extra: string,
        connected: boolean,
        isOwner: boolean,
    ) => io.emit('playerUpdate', username, status, number, extra, connected, isOwner),
};

/** Events emitted to the player-specific socket instance - `socket.emit()` */
export const EMITTED_PLAYER_EVENTS = {
    UNREGISTERED: (socket: Socket) => {
        socket.emit('unregistered');
        socket.disconnect();
    },
    GIVE_TOKEN: (socket: Socket) => socket.emit('giveToken'),
    // TODO: make PLAYER_HERE use playerUpdate instead of playerJoined
    PLAYER_HERE: (
        socket: Socket,
        username: string,
        status: PlayerStatuses,
        number: number,
        connected: boolean,
        extra: string,
        isOwner: boolean,
    ) => socket.emit('playerUpdate', username, status, number, extra, connected, isOwner),
    PRIVATE_CHAT_MESSAGE: (socket: Socket, message: ChatMessage) => {
        socket.emit('emittedChatMessage', message);
    },
    SERVER_PRIVATE_CHAT_MESSAGE: (socket: Socket, content: string) => {
        const messageBody: ChatMessage = {
            content,
            author: 'Server',
            props: { hideAuthor: true, color: '#FFFF00' },
        };
        socket.emit('emittedChatMessage', messageBody);
    },
};

export enum ROOMS {
    alive = 'alive',
    /** includes spectators */
    notAlive = 'notAlive',
}

export interface MessageProps {
    color?: string;
    hideAuthor?: boolean;
    isWhisper?: boolean;
}

export interface ChatMessage {
    author: string;
    content: string;
    to?: ROOMS;
    props?: MessageProps;
}
