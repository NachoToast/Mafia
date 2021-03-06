import { JwtPayload, verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { CONNECTION_SYSTEM } from '../constants/logging';
import { EMITTED_PLAYER_EVENTS, RECEIVED_PLAYER_EVENTS } from '../constants/socketEvent';
import { jwt_secret } from '../config/gameSecrets.json';
import Logger, { BaseLoggerParams } from './Logger';

export type JoinVerification = 'token' | 'ip' | 'username' | 'gamecode';

/** An external function to be called on a connection event. */
type ConnectionFunction = (payload: StageThreeConnection) => any;

/** An external function to be called on a leave event, determines whether the
 * connection should be able to reconnect or not.
 */
export type LeaveFunction = (
    connection: StageThreeConnection,
    intentional: boolean,
) => {
    shouldRemove: boolean;
    removalReason?: string;
};

/** External verification function to act in addition to internal one, on stage 2 -> 3 connection upgrades. */
type ValidationFunction =
    | ((connection: StageTwoConnection | StageThreeConnection) => {
          isValid: boolean;
          reasons: string[];
      })
    | null;

type AnyConnection = StageOneConnection | StageTwoConnection | StageThreeConnection;

type TimeoutFunction = (payload: AnyConnection) => void;

type UpgradeFunction = (connection: StageTwoConnection, payload: SocketTokenPayload) => void;

export interface SocketTokenPayload {
    token: string;
    username: string;
    gameCode: string;
}

/**
 * @description The connection system handles connecting, disconnecting,and reconnecting players to a game. It uses a 3 step system:
 * 1. "Reserve" a slot (identified by ip)
 * 2. Get a socket connection
 * 3. Get socket's credentials (pre-defined socket emit)
 */
export class ConnectionSystem {
    private readonly stageOneConnections: { [ip: string]: StageOneConnection } = {};
    private readonly stageTwoConnections: { [username: string]: StageTwoConnection } = {};
    private readonly stageThreeConnections: {
        [username: string]: StageThreeConnection;
    } = {};

    private readonly ipList: string[] = [];
    private readonly usernameList: string[] = [];
    private readonly gameCode: string;

    private readonly onJoin: ConnectionFunction;
    private readonly onLeave: LeaveFunction;
    private readonly onReconnect: ConnectionFunction;
    private readonly validateJoin: ValidationFunction;
    private readonly validateReconnect: ValidationFunction;
    private readonly logger?: Logger;

    private verificationMethods: JoinVerification[];

    /**
     * @param {string} gameCode Game code of associated game, for verification and logging purposes.
     * @param {ConnectionFunction} onJoin Function that runs when a player successfully joins the game, no return value needed.
     * @param {ConnectionFunction} onLeave Function that runs when a player disconnects, and returns whether to permanently remove the player or not.
     * @param {ConnectionFunction} onReconnect Like `onJoin` but for reconnects.
     * @param {ValidationFunction?} validateJoinFunction If specified, provides additional steps to establish a valid connection.
     * @param {ValidationFunction} validateReconnectFunction Same as `validateJoinFunction` but for reconnects.
     * @param {boolean?} makeLogger Whether to make and log to a `connections.log` file.
     */
    constructor(
        gameCode: string,
        onJoin: ConnectionFunction,
        onLeave: LeaveFunction,
        onReconnect: ConnectionFunction,
        validateJoinFunction: ValidationFunction,
        validateReconnectFunction: ValidationFunction,
        verificationMethods: JoinVerification[] = ['token', 'ip'],
        makeLogger?: boolean,
        loggerParams?: BaseLoggerParams,
    ) {
        this.gameCode = gameCode;
        this.onJoin = onJoin;
        this.onLeave = onLeave;
        this.onReconnect = onReconnect;
        this.validateJoin = validateJoinFunction;
        this.validateReconnect = validateReconnectFunction;
        this.verificationMethods = verificationMethods;

        if (makeLogger) {
            this.logger = new Logger({
                name: 'connections',
                path: `games/${gameCode}`,
                ...loggerParams,
            });
        }

        this.removeConnection = this.removeConnection.bind(this);
        this.toStageThree = this.toStageThree.bind(this);
        this.timeoutReconnectingSocket = this.timeoutReconnectingSocket.bind(this);
    }

    public static getIPFromSocket(socket: Socket) {
        return socket.handshake.address.split(':').slice(-1)[0];
    }

    public isDuplicateIP(
        ip: string,
        allowReconnects?: boolean,
        allowDuplicateIP?: boolean,
    ): boolean {
        if (allowDuplicateIP) return false;
        if (ip === 'Unknown') return true;
        const index = this.ipList.indexOf(ip);
        if (index === -1) return false;
        if (!allowReconnects) return true;

        const disconnectedWithSameIP = Object.keys(this.stageThreeConnections).find(
            (name) =>
                this.stageThreeConnections[name].ip === ip &&
                !this.stageThreeConnections[name].connected,
        );

        return !disconnectedWithSameIP;
    }

    public isDuplicateUsername(username: string, allowReconnects?: boolean): boolean {
        username = username.toLowerCase();
        const index = this.usernameList.indexOf(username);
        if (index === -1) return false;
        if (!allowReconnects) return true;

        const playerWithSameUsername = Object.keys(this.stageThreeConnections).includes(username);

        // seems counter-intuitive, but it means that the username is taken by a stage 1 or 2 connection instead.
        if (!playerWithSameUsername) return true;

        return this.stageThreeConnections[username].connected;
    }

    /**
     * @returns Whether or not operation was successful.
     */
    public newStageOne(
        username: string,
        token: string,
        ip: string,
        allowReconnects?: boolean,
        requestTimeoutSeconds?: number,
    ): boolean {
        // FIXME: reconnect detection for when same IP address registered to multiple players
        if (this.usernameList.includes(username) || this.ipList.includes(username)) {
            this.logger?.log(
                `New stage on connection from ${username} (${ip}) is already in: ${
                    this.usernameList.includes(username) ? 'username list, ' : ''
                }${
                    this.ipList.includes(username) ? 'ip list, ' : ''
                }this should NEVER occur (unless...)`,
            );
            return false;
            // if (allowReconnects) {
            //     CONNECTION_SYSTEM.POST_LIKELY_RECONNECT(username, ip);
            // } else {
            //     this.logger?.log(CONNECTION_SYSTEM.POST_LIKELY_RECONNECT_DISABLED(username, ip));
            // }
            // return !!allowReconnects;
        }

        this.logger?.log(CONNECTION_SYSTEM.SENT_INITIAL_POST(ip, username));
        const stageOne = new StageOneConnection(
            username,
            token,
            ip,
            this.removeConnection,
            requestTimeoutSeconds,
        );
        this.stageOneConnections[ip] = stageOne;

        this.ipList.push(ip);
        this.usernameList.push(username.toLowerCase());

        return true;
    }

    public toStageTwo(socket: Socket, allowReconnects?: boolean): void {
        const ip = ConnectionSystem.getIPFromSocket(socket);

        const associatedStageOneConnection: StageOneConnection | undefined =
            this.stageOneConnections[ip];

        if (!associatedStageOneConnection) {
            // no associated player: check if ip matches a disconnected stage three connection
            // or possible stage three:
            if (allowReconnects && this.ipList.includes(ip)) {
                const possibleConnection: StageThreeConnection | undefined =
                    this.stageThreeConnections[
                        Object.keys(this.stageThreeConnections).filter(
                            (name) =>
                                this.stageThreeConnections[name].ip === ip &&
                                !this.stageThreeConnections[name].connected,
                        )[0]
                    ];

                if (!!possibleConnection) {
                    this.logger?.log(
                        CONNECTION_SYSTEM.POSSIBLE_SOCKET_RECONNECTION(possibleConnection),
                    );
                    this.handlePossibleReconnect(possibleConnection, socket);
                    return;
                }
            }
            this.logger?.log(CONNECTION_SYSTEM.UNKNOWN_SOCKET_CONNECTION(ip, socket));
            EMITTED_PLAYER_EVENTS.UNREGISTERED(socket);
            return;
        }

        // associatedConnection found, upgrade to stage 2
        this.logger?.log(CONNECTION_SYSTEM.INITIAL_SOCKET_CONNECTION(associatedStageOneConnection));
        this.removeConnection(associatedStageOneConnection, true);
        const stageTwo = new StageTwoConnection(
            associatedStageOneConnection,
            socket,
            this.removeConnection,
            this.toStageThree,
        );

        this.stageTwoConnections[associatedStageOneConnection.username.toLowerCase()] = stageTwo;
    }

    private toStageThree(connection: StageTwoConnection, tokenPayload: SocketTokenPayload) {
        const { isValid, reasons } = this.verification(connection, tokenPayload);

        this.removeConnection(connection, isValid);

        if (!isValid) {
            this.logger?.log(CONNECTION_SYSTEM.INVALID_CREDENTIALS(connection, reasons));
            return;
        }

        const stageThree = new StageThreeConnection(connection);
        this.logger?.log(CONNECTION_SYSTEM.SUCCESSFUL_CONNECTION(connection));
        this.onJoin(stageThree);
        this.stageThreeConnections[connection.username.toLowerCase()] = stageThree;
        RECEIVED_PLAYER_EVENTS.LEAVE(stageThree.socket, (reason: string) =>
            this.handleDisconnect(stageThree, reason),
        );
        RECEIVED_PLAYER_EVENTS.INTENTIONAL_LEAVE(stageThree.socket, () =>
            this.handleDisconnect(stageThree, 'intentional disconnect', true),
        );
    }

    public handleDisconnect(
        connection: StageThreeConnection,
        reason: string,
        intentional: boolean = false,
    ): void {
        connection.disconnectedAt = Date.now();
        connection.connected = false;
        this.logger?.log(CONNECTION_SYSTEM.DISCONNECTED(connection, reason));
        const { shouldRemove, removalReason }: { shouldRemove: boolean; removalReason?: string } =
            this.onLeave(connection, intentional);
        if (shouldRemove) {
            this.logger?.log(
                CONNECTION_SYSTEM.HARD_DISCONNECT(
                    connection,
                    intentional ? reason : removalReason || 'game config set to always remove',
                ),
            );
            this.removeConnection(connection);
        } else {
            this.logger?.log(CONNECTION_SYSTEM.SOFT_DISCONNECT(connection));
        }
    }

    private handlePossibleReconnect(connection: StageThreeConnection, socket: Socket): void {
        connection.socket = socket;
        RECEIVED_PLAYER_EVENTS.HERE_IS_TOKEN(socket, (payload: SocketTokenPayload) => {
            this.handleReconnect(connection, payload);
        });
        EMITTED_PLAYER_EVENTS.GIVE_TOKEN(socket);
        connection.beginCountdown(this.timeoutReconnectingSocket as TimeoutFunction);
    }

    private timeoutReconnectingSocket(connection: StageThreeConnection): void {
        this.logger?.log(CONNECTION_SYSTEM.RECONNECTION_INVALID_1(connection));
        EMITTED_PLAYER_EVENTS.UNREGISTERED(connection.socket);
    }

    private handleReconnect(
        connection: StageThreeConnection,
        tokenPayload: SocketTokenPayload,
    ): void {
        const { isValid, reasons } = this.verification(connection, tokenPayload);

        if (!!connection?.timeoutFunction) {
            clearTimeout(connection.timeoutFunction);
        }

        if (!isValid) {
            this.logger?.log(CONNECTION_SYSTEM.RECONNECTION_INVALID_2(connection, reasons));
            EMITTED_PLAYER_EVENTS.UNREGISTERED(connection.socket);
            return;
        }

        this.logger?.log(CONNECTION_SYSTEM.RECONNECTION_SUCCESSFUL(connection));
        connection.connected = true;
        connection.lastConnectedAt = Date.now();
        connection.bindSocket(connection.socket);
        this.onReconnect(connection);
        RECEIVED_PLAYER_EVENTS.LEAVE(connection.socket, (reason: string) =>
            this.handleDisconnect(connection, reason),
        );
        RECEIVED_PLAYER_EVENTS.INTENTIONAL_LEAVE(connection.socket, () =>
            this.handleDisconnect(connection, 'intentional disconnect', true),
        );
    }

    /** Verifies credentials sent by a token using JoinValidationMethods defined in `gameConfig.json` */
    private verification(
        connection: StageTwoConnection | StageThreeConnection,
        tokenPayload: SocketTokenPayload,
        isReconnect: boolean = false,
    ): {
        isValid: boolean;
        reasons: string[];
    } {
        let isValid = true;
        const reasons: string[] = [];
        const { token, username, gameCode } = tokenPayload;

        if (!isReconnect && !!this.validateJoin) {
            const result = this.validateJoin(connection);
            isValid = result.isValid;
            reasons.push(...result.reasons);
        } else if (isReconnect && !!this.validateReconnect) {
            const result = this.validateReconnect(connection);
            isValid = result.isValid;
            reasons.push(...result.reasons);
        }

        if (this.verificationMethods?.includes('token')) {
            // token verifies gameCode and username
            try {
                const validatedToken = verify(token, jwt_secret) as JwtPayload;
                if (
                    !validatedToken?.username ||
                    !validatedToken?.exp ||
                    !validatedToken?.gameCode
                ) {
                    isValid = false;
                    reasons.push('invalid token');
                } else {
                    if (validatedToken.exp * 1000 < Date.now()) {
                        isValid = false;
                        reasons.push('token expired');
                    }
                    if (validatedToken.username !== connection.username) {
                        isValid = false;
                        reasons.push('username discrepancy');
                    }
                    if (validatedToken.gameCode !== this.gameCode) {
                        isValid = false;
                        reasons.push('game code discrepancy');
                    }
                }
            } catch (error) {
                isValid = false;
                reasons.push('erroneous token');
                this.logger?.log(CONNECTION_SYSTEM.ERRONEOUS_TOKEN(connection, error));
            }
        } else {
            // if token isn't specified, check for alternate forms of verification
            // Note these are nowhere near as secure as jwt
            if (
                this.verificationMethods?.includes('username') &&
                username !== connection.username
            ) {
                isValid = false;
                reasons.push('non-matching username');
            }
            if (this.verificationMethods?.includes('gamecode') && gameCode !== this.gameCode) {
                isValid = false;
                reasons.push('non-matching game code');
            }
        }

        if (
            this.verificationMethods?.includes('ip') &&
            connection.ip !== ConnectionSystem.getIPFromSocket(connection.socket)
        ) {
            isValid = false;
            reasons.push('non-matching IP address');
        }

        return { isValid, reasons };
    }

    /** Completely erases a connection. */
    private removeConnection(connection: AnyConnection, isUpgrade: boolean = false): void {
        const { ip } = connection;
        const username = connection.username.toLowerCase();

        if (!isUpgrade) {
            this.removeIPandUsername(ip, username);
        }

        if (connection instanceof StageThreeConnection) {
            if (!isUpgrade) {
                connection.socket.removeAllListeners();
                connection.socket.disconnect();
            }
            delete this.stageThreeConnections[username];
        } else {
            if (!!connection.timeoutFunction) {
                clearTimeout(connection.timeoutFunction);
            }

            if (connection instanceof StageTwoConnection) {
                if (!isUpgrade) {
                    this.logger?.log(CONNECTION_SYSTEM.TIMEOUT_NO_CREDENTIALS(connection));
                    connection.socket.disconnect();
                }
                delete this.stageTwoConnections[username];
            } else {
                if (!isUpgrade) {
                    this.logger?.log(CONNECTION_SYSTEM.TIMEOUT_NO_SOCKET(connection));
                }
                delete this.stageOneConnections[ip];
            }
        }
    }

    private removeIPandUsername(ip: string, username: string): void {
        const ipIndex = this.ipList.indexOf(ip);
        const usernameIndex = this.usernameList.indexOf(username);

        if (ipIndex === -1) {
            this.logger?.log(CONNECTION_SYSTEM.FAILED_IP_REMOVAL(username, ip));
        } else this.ipList.splice(ipIndex, 1);

        if (usernameIndex === -1) {
            this.logger?.log(CONNECTION_SYSTEM.FAILED_USERNAME_REMOVAL(username, ip));
        } else this.usernameList.splice(usernameIndex, 1);
    }
}

interface ConnectionArgs {
    username: string;
    token: string;
    ip: string;
    stageOneAt?: number;
    stageTwoAt?: number;
    stageThreeAt?: number;
    logger?: Logger;
    requestTimeout?: number;
}

class ConnectionBase {
    public readonly username: string;
    public readonly token: string;
    public ip: string;
    public readonly stageOneAt: number;
    public readonly stageTwoAt: number;
    public readonly stageThreeAt: number;

    public readonly requestTimeout: number;

    public constructor({
        username,
        token,
        ip,
        stageOneAt,
        stageTwoAt,
        stageThreeAt,
        requestTimeout = 10,
    }: ConnectionArgs | AnyConnection) {
        this.username = username;
        this.token = token;
        this.ip = ip;
        this.stageOneAt = stageOneAt || Date.now();
        this.stageTwoAt = stageTwoAt || 0;
        this.stageThreeAt = stageThreeAt || 0;

        this.requestTimeout = requestTimeout;
    }
}

/** Reserved slots via POST request. */
export class StageOneConnection extends ConnectionBase {
    public timeoutFunction?: NodeJS.Timeout;

    constructor(
        username: string,
        token: string,
        ip: string,
        callback: TimeoutFunction,
        requestTimeout?: number,
    ) {
        super({ username, token, ip, requestTimeout });
        this.beginCountdown(callback);
    }

    private beginCountdown(callback: TimeoutFunction) {
        this.timeoutFunction = setTimeout(() => {
            callback(this);
        }, 1000 * this.requestTimeout);
    }
}

/** Stage one but with an associated (but unverified) socket. */
export class StageTwoConnection extends ConnectionBase {
    public timeoutFunction?: NodeJS.Timeout;
    public readonly socket: Socket;

    constructor(
        stageOne: StageOneConnection,
        socket: Socket,
        timeoutCallback: TimeoutFunction,
        upgradeCallback: UpgradeFunction,
    ) {
        super({ ...stageOne, stageTwoAt: Date.now() });
        this.socket = socket;
        this.beginCountdown(timeoutCallback);

        RECEIVED_PLAYER_EVENTS.HERE_IS_TOKEN(socket, (payload: SocketTokenPayload) => {
            upgradeCallback(this, payload);
        });
        EMITTED_PLAYER_EVENTS.GIVE_TOKEN(socket);
    }

    private beginCountdown(callback: TimeoutFunction) {
        this.timeoutFunction = setTimeout(() => {
            callback(this);
        }, 1000 * this.requestTimeout);
    }
}

/** Stage two but the socket is verified. */
export class StageThreeConnection extends ConnectionBase {
    /** Unlike other connection stages, this timeout function is for disconnecting a pending socket. */
    public timeoutFunction?: NodeJS.Timeout;
    public socket: Socket;
    public connected: boolean = true;

    // public socketReserved: boolean = false;
    // FIXME: during period of time awaiting for reconnecting socket to send credentials,
    // an error is possible since a second reconnecting socket can 'overwrite' this one,
    // using a socketReserved property can fix this, only allowing the first socket to submit details

    // for reconnection logging purposes
    public readonly firstConnectedAt: number = Date.now();
    public lastConnectedAt: number = Date.now();
    public disconnectedAt: number = 0;

    constructor(previousConnection: StageTwoConnection) {
        super({ ...previousConnection, stageThreeAt: Date.now() });
        this.socket = previousConnection.socket;
        this.bindSocket(previousConnection.socket);
    }

    public bindSocket(socket: Socket) {
        this.socket = socket;
        this.connected = true;
    }

    public beginCountdown(callback: TimeoutFunction) {
        this.timeoutFunction = setTimeout(() => {
            callback(this);
        }, 1000 * this.requestTimeout);
    }
}
