import { Server, Socket } from 'socket.io';
import { SocketTokenPayload } from '../models/connectionSystem';
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
        socket.on('heresToken', (payload: SocketTokenPayload) =>
            callback(payload),
        ),
    CHAT_MESSAGE: (socket: Socket, callback: Function) =>
        socket.on('chatMessage', (message: string) => callback(message)),
    // CHAT_MESSAGE: 'chatMessage',
};

/** Events emitted by the game's global io instance - `io.emit()`  */
export const EMITTED_SERVER_EVENTS = {
    // CHAT_MESSAGE: 'emittedChatMessage',
    CHAT_MESSAGE: (io: Server, message: ChatMessage) => {
        if (!!message?.to)
            io.to(message.to).emit('emittedChatMessage', message);
        else io.emit('emittedChatMessage', message);
    },
    /** @deprecated Use `PLAYER_UPDATE` instead. */
    PLAYER_JOINED: (
        io: Server,
        username: string,
        status: PlayerStatuses,
        number: number,
        extra?: string,
    ) => io.emit('playerJoined', username, status, number, true, extra),
    PLAYER_LEFT: (io: Server, username: string) =>
        io.emit('playerLeft', username),
    PLAYER_UPDATE: (
        io: Server,
        username: string,
        status: PlayerStatuses,
        number: number,
        extra: string = '',
        connected: boolean = true,
    ) => io.emit('playerUpdate', username, status, number, extra, connected),
    // username: string, status: PlayerStatuses
    /** When a user has changed status, also applies to new users. */
    // PLAYER_UPDATE: (emitter: Server | Socket, payload: PlayerUpdate) =>
    //     emitter.emit('playerChange', payload),
};

/** Events emitted by the player-specific socket instance - `socket.emit()` */
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
        extra?: string,
    ) =>
        socket.emit('playerJoined', username, status, number, connected, extra),
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
