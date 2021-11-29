import { Socket } from 'socket.io';
import {
    StageOneConnection,
    StageThreeConnection,
    StageTwoConnection,
} from '../classes/ConnectionSystem';
import { Game, GameCreator } from '../classes/Game';
import {
    connectionSettings as defaultConnectionSettings,
    loggingSettings as defaultLoggingSettings,
} from '../config/defaultConfig';

function compareObjectValues(val1: any, val2: any): boolean {
    if (Array.isArray(val1)) {
        return val1.map((_, i) => compareObjectValues(val1[i], val2[i])).every((e) => e);
    } else return val1 === val2;
}

function mapObjectKeys(
    obj: { [index: string]: any },
    defaultObj: { [index: string]: any },
    offset: number = 4,
): string[] {
    const output: string[] = [];
    for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            output.push(...mapObjectKeys(obj[key], defaultObj[key], offset + 4));
            // const res = mapObjectKeys(obj[key], defaultObj[key], offset + 4);
            // console.log(key, obj[key], defaultObj[key]);
            // console.log(res);
            // output.push(`${' '.repeat(offset)}${key}:`, `/shrug`);
        } else {
            output.push(
                `${' '.repeat(offset)}${key}: ${obj[key]}${
                    compareObjectValues(obj[key], defaultObj[key])
                        ? ''
                        : ` (default: ${defaultObj[key]})`
                }`,
            );
        }
    }
    return output;
}

export const SERVER_GENERAL = {
    GAME_CONFIG: (game: Game) => {
        const output: string[] = [`Connection Settings`];
        output.push(...mapObjectKeys(game.connectionSettings, defaultConnectionSettings));
        output.push(
            `Logging Settings`,
            ...mapObjectKeys(game.loggingSettings, defaultLoggingSettings),
        );
        return output.join('\n');
    },
    GAME_CREATED: (game: Game) => {
        return `Game '${game.gameCode}' created by ${
            game.createdBy ? `${game.createdBy.username} (${game.createdBy.ip})` : 'server'
        }`;
    },
    GAME_CLOSED: (game: Game, reason: string) =>
        `Game '${game.gameCode}' created by ${
            game.createdBy ? `${game.createdBy.username} (${game.createdBy.ip})` : 'server'
        } closed after ${Math.floor(
            (Date.now() - game.createdAt) / 1000,
        )} seconds with reason: ${reason}`,
};

export const CONNECTION_SYSTEM = {
    SENT_INITIAL_POST: (ip: string, username: string) =>
        `${username} (${ip}) started joining (1/3)`,
    INITIAL_SOCKET_CONNECTION: ({ username, ip, stageOneAt }: StageOneConnection) =>
        `${username} (${ip}) connected socket after ${Date.now() - stageOneAt} ms (2/3)`,
    SUCCESSFUL_CONNECTION: ({ username, ip, stageOneAt, stageTwoAt }: StageTwoConnection) =>
        `${username} (${ip}) passed all checks and connected after ${Date.now() - stageOneAt}/${
            Date.now() - stageTwoAt
        } ms (3/3)`,
    TIMEOUT_NO_SOCKET: ({ username, ip, stageOneAt }: StageOneConnection) =>
        `Timed out ${username} (${ip}) after ${
            Date.now() - stageOneAt
        } ms after not receiving a socket connection`,
    TIMEOUT_NO_CREDENTIALS: ({ username, ip, stageOneAt, stageTwoAt }: StageTwoConnection) =>
        `Timed out ${username} (${ip}) after ${Date.now() - stageOneAt}/${
            Date.now() - stageTwoAt
        } ms after not receiving socket credentials.`,
    INVALID_CREDENTIALS: (
        { username, ip }: StageTwoConnection | StageThreeConnection,
        invalidCredentials: string[],
    ) =>
        `Disconnected socket connection from ${username} (${ip}) due to ${invalidCredentials.join(
            ', ',
        )}`,
    FAILED_IP_REMOVAL: (username: string, ip: string) =>
        `Couldn't find IP ${ip} of ${username} to remove from IP list.`,
    FAILED_USERNAME_REMOVAL: (username: string, ip: string) =>
        `Couldn't find username ${username} of ${ip} to remove from IP list.`,
    UNKNOWN_SOCKET_CONNECTION: (ip: string, socket: Socket) =>
        `Unregistered socket connection from ${ip} (${socket.id})`,
    POSSIBLE_SOCKET_RECONNECTION: ({ username, ip }: StageThreeConnection) =>
        `Socket connection from ${ip} matches disconnected player ${username} (1/2)`,
    RECONNECTION_INVALID_1: ({ username, ip }: StageThreeConnection) =>
        `Socket reconnection for ${username} (${ip}) failed due to not supplying any authentication`,
    RECONNECTION_INVALID_2: (
        { username, ip }: StageThreeConnection,
        invalidCredentials: string[],
    ) =>
        `Socket reconnection for ${username} (${ip}) failed due to ${invalidCredentials.join(
            ', ',
        )}`,
    RECONNECTION_SUCCESSFUL: ({ username, ip, disconnectedAt }: StageThreeConnection) => {
        let timeTaken = Date.now() - disconnectedAt;
        let timeStep = 'ms';
        if (timeTaken > 1000) {
            timeTaken = Math.floor(timeTaken / 1000);
            timeStep = 'seconds';
        }
        return `${username} (${ip}) successfully reconnected after ${timeTaken} ${timeStep} (2/2)`;
    },
    DISCONNECTED: ({ username, ip, lastConnectedAt }: StageThreeConnection, reason: string) =>
        `${username} (${ip}) disconnected after ${Math.floor(
            (Date.now() - lastConnectedAt) / 1000,
        )} seconds with reason: ${reason}`,
    ERRONEOUS_TOKEN: (
        { username, ip }: StageTwoConnection | StageThreeConnection,
        error: unknown,
    ) => `Error processing token of player ${username} (${ip}): ${error}`,
    /** Disconnected and removed from connection list, will not be able to reconnect - but username slot will be unreserved. */
    HARD_DISCONNECT: ({ username, ip }: StageThreeConnection, reason: string) =>
        `${username} (${ip}) removed from connections list with reason: ${reason}`,
    /** Disconnected, but reconnection is possible. */
    SOFT_DISCONNECT: ({ username, ip }: StageThreeConnection) =>
        `${username} (${ip}) will be able to reconnect`,
    // POST_LIKELY_RECONNECT: (username: string, ip: string) =>
    //     `${username} (${ip}) started joining and is likely a reconnecting player`,
    // POST_LIKELY_RECONNECT_DISABLED: (username: string, ip: string) =>
    //     `${username} (${ip}) started joining and is likely a reconnecting player, this should never occur since reconnects are disabled`,
};

export const CODE_GENERATION = {
    MAKING_NEW: (creator?: GameCreator) =>
        `Making random game code for ${
            !creator ? 'server' : `${creator.username} (${creator.ip})`
        }`,
    REROLLING: (gameCode: string) => `Duplicate game code '${gameCode}', re-rolling...`,
    INVALID: (gameCode: string) => `Code '${gameCode}' is not a valid game code`,
    TAKEN: (gameCode: string) => `Game '${gameCode}' already exists`,
    ACCEPTED: (gameCode: string) => `Got valid code '${gameCode}'`,
};

/** 'External' game messages, aka out of game context but still shown in chat. */
export const GAME_EXT = {
    JOINED_GAME: (username: string) => `${username} joined the game`,
    LEFT_GAME: (username: string) => `${username} left the game`,
    RECONNECTED: (username: string) => `${username} reconnected`,
};

/** PLAYERNAME died to mafia, PLAYERNAME was shot by, etc... */
export const GAME_NIGHT = {};

/** PLAYERNAME has been put on trial, PLAYERNAME has been found guilty by a vote of 3-2, etc... */
export const GAME_DAY = {};
