import { Server, Socket } from 'socket.io';
import { Player } from '../models/players';
import { PlayerStatuses } from './mafia';

/** Events captured by the game's global io instance, `io.on()`  */
export const RECEIVED_SERVER_EVENTS = {
    JOIN: 'connect',
};

/** Events captured by server-side player-specific socket instances- `socket.on()` */
export const RECEIVED_PLAYER_EVENTS = {
    USERNAME_SUBMIT: 'usernameSubmit',
    LEAVE: 'disconnect',
    HERE_IS_TOKEN: 'heresToken',
    CHAT_MESSAGE: 'chatMessage',
};

/** Events emitted by the game's global io instance - `io.emit()`  */
export const EMITTED_SERVER_EVENTS = {
    CHAT_MESSAGE: 'emittedChatMessage',
    PLAYER_ADD: 'playerJoined', // username: string, status: PlayerStatuses
    /** When a user has changed status, also applies to new users. */
    PLAYER_UPDATE: (emitter: Server | Socket, payload: PlayerUpdate) =>
        emitter.emit('playerChange', payload),
};
export interface PlayerUpdate {
    username: string;
    status: PlayerStatuses;
    extra?: string; // e.g. putting (godfather) after the username for other mafia members
    connected: boolean;
}

/** Events emitted by the player-specific socket instance - `socket.emit()` */
export const EMITTED_PLAYER_EVENTS = {
    UNREGISTERED: 'unregistered',
    GIVE_TOKEN: 'giveToken',
};

export type ROOMS = 'ALIVE' | 'DEAD' | 'SPECTATORS';

export const ROOM_NAMES: { [key in ROOMS]: string } = {
    ALIVE: 'alivePlayers',
    DEAD: 'deadPlayers', // shouldn't need to be used at all
    SPECTATORS: 'spectators', // should also include dead people
};
