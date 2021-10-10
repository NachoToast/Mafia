import { Socket } from 'socket.io';
import { PendingPlayer, Player } from '../models/players';

export const LOG_MESSAGES = {
    GAME_CREATED: (ip: string, username: string, gameCode: string) =>
        `Game '${gameCode}' created by ${username} (${ip})`,
    SENT_INITIAL_POST: (ip: string, username: string) =>
        `${username} (${ip}) started joining (1/3)`,
    TIMEOUT: (player: PendingPlayer, stage: 0 | 1) =>
        `Timed out ${player.username} (${player.ip}) after ${Math.floor(
            (Date.now() - player.sentAt) / 1000,
        )} seconds after not receiving a ${stage === 0 ? 'socket connection' : 'token'}`,
    INVALID_CREDENTIALS: (player: PendingPlayer, invalidCredentials: string[]) =>
        `Disconnected socket connection from ${player.username} (${
            player.ip
        }) due to ${invalidCredentials.join(', ')}`,
    FAILED_IP_REMOVAL: (player: PendingPlayer) =>
        `Couldn't find IP ${player.ip} of ${player.username} to remove from IP list.`,
    INITIAL_SOCKET_CONNECTION: (ip: string, player: PendingPlayer) =>
        `${player.username} connected socket with IP ${ip} after ${
            Date.now() - player.sentAt
        } ms (2/3)`,
    UNKNOWN_SOCKET_CONNECTION: (ip: string, socket: Socket) =>
        `Unregistered socket connection from ${ip} (${socket.id})`,
    POSSIBLE_SOCKET_RECONNECTION: (ip: string, player: Player) =>
        `Socket connection from ${ip} matches disconnected player ${player.username} (1/2)`,
    RECONNECTION_INVALID: (player: Player, invalidCredentials: string[]) =>
        `Socket reconnection for ${player.username} (${
            player.ip
        }) failed due to ${invalidCredentials.join(', ')}`,
    SUCCESSFUL_CONNECTION: (player: Player, sentAt: number) =>
        `${player.username} (${player.ip}) [${
            player.playerNumber
        }] passed all checks and connected after ${Date.now() - sentAt} ms (3/3)`,
    RECONNECTION_SUCCESSFUL: (player: Player) => {
        let timeTaken = Date.now() - player.disconnectedAt;
        let timeStep = 'ms';
        if (timeTaken > 1000) {
            timeTaken = Math.floor(timeTaken / 1000);
            timeStep = ' seconds';
        }
        return `${player.username} (${player.ip}) successfully reconnected after ${timeTaken}${timeStep} (2/2)`;
    },
    DISCONNECTED: (player: Player, reason: string) =>
        `${player.username} (${player.ip}) disconnected after ${Math.floor(
            (Date.now() - player.disconnectedAt) / 1000,
        )} seconds with reason: ${reason}`,
};

export const CODE_GENERATION_MESSAGES = {
    MAKING_NEW: (ip: string, username: string) => `Making random game code for ${username} (${ip})`,
    REROLLING: (gameCode: string) => `Duplicate game code '${gameCode}', re-rolling...`,
    INVALID: (gameCode: string) => `Code '${gameCode}' is not a valid game code`,
    TAKEN: (gameCode: string) => `Game '${gameCode}' already exists`,
    ACCEPTED: (gameCode: string) => `Got valid code '${gameCode}'`,
};

export const GAME_LOG = {
    JOINED_GAME: (player: Player) => `${player.username} joined the game`,
    LEFT_GAME: (player: Player) => `${player.username} left the game`,
    RECONNECTED: (player: Player) => `${player.username} reconnected`,
};
