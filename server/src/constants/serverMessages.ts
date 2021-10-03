import { Socket } from 'socket.io';
import { PendingPlayer, Player } from '../models/player';
import { getIPFromSocket } from '../models/game';

export const DUPLICATE = {
    SOCKET_ID: (socket: Socket, player: PendingPlayer | Player) =>
        `Socket ID '${socket.id}' used by ${getIPFromSocket(socket)} already in use by ${
            player instanceof Player ? `${player.name} (${player.ip})` : `${player.ip}`
        }`,
    IP: (player: PendingPlayer | Player) =>
        `IP '${player.ip}' already in use${player instanceof Player ? ` by ${player.name}` : ''}.`,
};

export const INTERNAL_ERRORS = {
    NO_IP_TO_REMOVE: (player: PendingPlayer | Player) =>
        `Couldn't find IP ${player.ip} to remove from list${
            player instanceof Player ? ` (for player ${player.name}) ` : ''
        }.`,
    NO_NAME_TO_REMOVE: (player: Player) =>
        `Couldn't find name '${player.name}' to remove from list.`,
};
