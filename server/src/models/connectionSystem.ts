export type JoinVerification = 'token' | 'ip' | 'username' | 'gameCode';

import { JwtPayload, verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { CONNECTION_SYSTEM } from '../constants/logging';
import {
    EMITTED_PLAYER_EVENTS,
    RECEIVED_PLAYER_EVENTS,
} from '../constants/socketEvent';
import {
    allowDuplicateIP,
    requestTimeoutSeconds,
    playerVerification,
    allowReconnects,
} from '../gameConfig.json';
import { jwt_secret } from '../gameSecrets.json';
import Logger from './logger';

/** An external function to be called on a connection event. */
type ConnectionFunction = (payload: StageThreeConnection) => any;

/** Internal or external validation function for all connection stages. */
type ValidationFunction =
    | ((connection: StageTwoConnection | StageThreeConnection) => {
          isValid: boolean;
          reasons: string[];
      })
    | null;

type AnyConnection =
    | StageOneConnection
    | StageTwoConnection
    | StageThreeConnection;

type TimeoutFunction = (payload: AnyConnection) => void;

type UpgradeFunction = (
    connection: StageTwoConnection,
    payload: SocketTokenPayload,
) => void;

export interface SocketTokenPayload {
    token: string;
    username: string;
    gameCode: string;
}

/**
 * @description The connection system handles connecting, disconnecting, and reconnecting players to a game. It uses a 3 step system:
 * 1. "Reserve" a slot (identified by ip)
 * 2. Get a socket connection
 * 3. Get socket's credentials (pre-defined socket emit)
 */
export class ConnectionSystem {
    private stageOneConnections: { [ip: string]: StageOneConnection } = {};

    private stageTwoConnections: { [username: string]: StageTwoConnection } =
        {};

    private stageThreeConnections: {
        [username: string]: StageThreeConnection;
    } = {};

    private ipList: string[] = [];
    private usernameList: string[] = [];
    private readonly gameCode: string;

    private onJoin: ConnectionFunction;
    private onLeave: ConnectionFunction;
    private onReconnect: ConnectionFunction;
    private validateJoin: ValidationFunction;
    private validateReconnect: ValidationFunction;
    private logger?: Logger;

    constructor(
        gameCode: string,
        onJoin: ConnectionFunction,
        onLeave: ConnectionFunction,
        onReconnect: ConnectionFunction,
        validateJoinFunction: ValidationFunction,
        validateReconnectFunction: ValidationFunction,
        makeLogger?: boolean,
    ) {
        this.gameCode = gameCode;
        this.onJoin = onJoin;
        this.onLeave = onLeave;
        this.onReconnect = onReconnect;
        this.validateJoin = validateJoinFunction;
        this.validateReconnect = validateReconnectFunction;
        if (!!makeLogger) {
            this.logger = new Logger({
                name: 'connections',
                path: `games/${gameCode}`,
            });
        }

        this.removeConnection = this.removeConnection.bind(this);
        this.toStageThree = this.toStageThree.bind(this);
        this.timeoutReconnectingSocket =
            this.timeoutReconnectingSocket.bind(this);
    }

    private static getIPFromSocket(socket: Socket) {
        return socket.handshake.address.split(':').slice(-1)[0];
    }

    public isDuplicateIP(ip: string): boolean {
        if (allowDuplicateIP) return false;
        if (ip === 'Unknown') return true;
        const index = this.ipList.indexOf(ip);
        if (index === -1) return false;
        if (!allowReconnects) return true;

        const disconnectedWithSameIP = Object.keys(
            this.stageThreeConnections,
        ).find(
            (name) =>
                this.stageThreeConnections[name].ip === ip &&
                !this.stageThreeConnections[name].connected,
        );

        return !disconnectedWithSameIP;
    }

    public isDuplicateUsername(username: string): boolean {
        username = username.toLowerCase();
        const index = this.usernameList.indexOf(username);
        if (index === -1) return false;
        if (!allowReconnects) return true;

        const playerWithSameUsername = Object.keys(
            this.stageThreeConnections,
        ).includes(username);

        // seems counter-intuitive, but it means that the username is taken by a stage 1 or 2 connection instead.
        if (!playerWithSameUsername) return true;

        return this.stageThreeConnections[username].connected;
    }

    public newStageOne(username: string, token: string, ip: string): void {
        this.logger?.log(CONNECTION_SYSTEM.SENT_INITIAL_POST(ip, username));
        const stageOne = new StageOneConnection(
            username,
            token,
            ip,
            this.removeConnection,
            this.logger,
        );
        this.stageOneConnections[ip] = stageOne;

        this.ipList.push(ip);
        this.usernameList.push(username.toLowerCase());
    }

    public toStageTwo(socket: Socket): void {
        const ip = ConnectionSystem.getIPFromSocket(socket);

        const associatedConnection: StageOneConnection | undefined =
            this.stageOneConnections[ip];

        if (!associatedConnection) {
            // no associated player, check if ip matches a disconnected stage three connection
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
                        CONNECTION_SYSTEM.POSSIBLE_SOCKET_RECONNECTION(
                            possibleConnection,
                        ),
                    );
                    this.handlePossibleReconnect(possibleConnection, socket);
                    return;
                }
            }
            this.logger?.log(
                CONNECTION_SYSTEM.UNKNOWN_SOCKET_CONNECTION(ip, socket),
            );
            EMITTED_PLAYER_EVENTS.UNREGISTERED(socket);
            return;
        }
        // associatedConnection found, upgrade to stage 2
        this.logger?.log(
            CONNECTION_SYSTEM.INITIAL_SOCKET_CONNECTION(associatedConnection),
        );
        this.removeConnection(associatedConnection, true);
        const stageTwo = new StageTwoConnection(
            associatedConnection,
            socket,
            this.removeConnection,
            this.toStageThree,
        );

        this.stageTwoConnections[associatedConnection.username.toLowerCase()] =
            stageTwo;
    }

    private toStageThree(
        connection: StageTwoConnection,
        tokenPayload: SocketTokenPayload,
    ) {
        const { isValid, reasons } = this.verification(
            connection,
            tokenPayload,
        );

        this.removeConnection(connection, isValid);

        if (!isValid) {
            this.logger?.log(
                CONNECTION_SYSTEM.INVALID_CREDENTIALS(connection, reasons),
            );
            return;
        }

        const stageThree = new StageThreeConnection(connection);
        this.logger?.log(CONNECTION_SYSTEM.SUCCESSFUL_CONNECTION(connection));
        this.onJoin(stageThree);
        this.stageThreeConnections[connection.username.toLowerCase()] =
            stageThree;
        RECEIVED_PLAYER_EVENTS.LEAVE(stageThree.socket, (reason: string) =>
            this.handleDisconnect(stageThree, reason),
        );
    }

    public handleDisconnect(
        connection: StageThreeConnection,
        reason: string,
    ): void {
        connection.disconnectedAt = Date.now();
        connection.connected = false;
        this.logger?.log(CONNECTION_SYSTEM.DISCONNECTED(connection, reason));
        this.onLeave(connection);
        if (!allowReconnects) {
            this.removeConnection(connection);
        }
    }

    private handlePossibleReconnect(
        connection: StageThreeConnection,
        socket: Socket,
    ) {
        connection.socket = socket;
        RECEIVED_PLAYER_EVENTS.HERE_IS_TOKEN(
            socket,
            (payload: SocketTokenPayload) => {
                this.handleReconnect(connection, payload);
            },
        );
        EMITTED_PLAYER_EVENTS.GIVE_TOKEN(socket);
        connection.beginCountdown(
            this.timeoutReconnectingSocket as TimeoutFunction,
        );
    }

    private timeoutReconnectingSocket(connection: StageThreeConnection) {
        this.logger?.log(CONNECTION_SYSTEM.RECONNECTION_INVALID_1(connection));
        EMITTED_PLAYER_EVENTS.UNREGISTERED(connection.socket);
        connection.socket.disconnect();
    }

    private handleReconnect(
        connection: StageThreeConnection,
        tokenPayload: SocketTokenPayload,
    ) {
        const { isValid, reasons } = this.verification(
            connection,
            tokenPayload,
        );

        if (!!connection?.timeoutFunction) {
            clearTimeout(connection.timeoutFunction);
        }

        if (!isValid) {
            this.logger?.log(
                CONNECTION_SYSTEM.RECONNECTION_INVALID_2(connection, reasons),
            );
            EMITTED_PLAYER_EVENTS.UNREGISTERED(connection.socket);
            connection.socket.disconnect();
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
        const verificationMethods = playerVerification as JoinVerification[];
        let isValid = true;
        const reasons: string[] = [];
        const { token, username, gameCode } = tokenPayload;

        if (!isReconnect && !!this.validateJoin) {
            const result = this.validateJoin(connection);
            isValid &&= result.isValid;
            reasons.push(...result.reasons);
        } else if (isReconnect && !!this.validateReconnect) {
            const result = this.validateReconnect(connection);
            isValid &&= result.isValid;
            reasons.push(...result.reasons);
        }

        if (verificationMethods.includes('token')) {
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
                this.logger?.log(
                    CONNECTION_SYSTEM.ERRONEOUS_TOKEN(connection, error),
                );
            }
        } else {
            // if token isn't specified, check for alternate forms of verification
            // Note these are nowhere near as secure as jwt
            if (
                verificationMethods.includes('username') &&
                username !== connection.username
            ) {
                isValid = false;
                reasons.push('non-matching username');
            }
            if (
                verificationMethods.includes('gameCode') &&
                gameCode !== this.gameCode
            ) {
                isValid = false;
                reasons.push('non-matching game code');
            }
        }

        if (
            verificationMethods.includes('ip') &&
            connection.ip !==
                ConnectionSystem.getIPFromSocket(connection.socket)
        ) {
            isValid = false;
            reasons.push('non-matching IP address');
        }

        return { isValid, reasons };
    }

    /** Completely erases a connection. */
    private removeConnection(
        connection: AnyConnection,
        isUpgrade: boolean = false,
    ): void {
        const { ip } = connection;
        const username = connection.username.toLowerCase();

        if (!isUpgrade) {
            this.removeIPandUsername(ip, username);
        }

        if (connection instanceof StageThreeConnection) {
            if (!isUpgrade) connection.socket.disconnect();
            delete this.stageThreeConnections[username];
        } else {
            if (!!connection?.timeoutFunction) {
                clearTimeout(connection.timeoutFunction);
            }

            if (connection instanceof StageTwoConnection) {
                if (!isUpgrade) connection.socket.disconnect();
                delete this.stageTwoConnections[username];
            } else {
                delete this.stageOneConnections[ip];
            }
        }
    }

    private removeIPandUsername(ip: string, username: string) {
        const ipIndex = this.ipList.indexOf(ip);
        const usernameIndex = this.usernameList.indexOf(username);

        if (ipIndex === -1) {
            this.logger?.log(CONNECTION_SYSTEM.FAILED_IP_REMOVAL(username, ip));
        } else this.ipList.splice(ipIndex, 1);

        if (usernameIndex === -1) {
            this.logger?.log(
                CONNECTION_SYSTEM.FAILED_USERNAME_REMOVAL(username, ip),
            );
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
}
class ConnectionBase {
    public readonly username: string;
    public readonly token: string;
    public ip: string;
    public readonly stageOneAt: number;
    public readonly stageTwoAt: number;
    public readonly stageThreeAt: number;

    public readonly logger?: Logger;

    public constructor({
        username,
        token,
        ip,
        stageOneAt,
        stageTwoAt,
        stageThreeAt,
        logger,
    }: ConnectionArgs | AnyConnection) {
        this.username = username;
        this.token = token;
        this.ip = ip;
        this.stageOneAt = stageOneAt || Date.now();
        this.stageTwoAt = stageTwoAt || 0;
        this.stageThreeAt = stageThreeAt || 0;

        this.logger = logger;
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
        logger?: Logger,
    ) {
        super({ username, token, ip });
        this.beginCountdown(callback);
    }

    private beginCountdown(callback: TimeoutFunction) {
        this.timeoutFunction = setTimeout(() => {
            this.logger?.log(CONNECTION_SYSTEM.TIMEOUT_NO_SOCKET(this));
            callback(this);
        }, 1000 * requestTimeoutSeconds);
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

        RECEIVED_PLAYER_EVENTS.HERE_IS_TOKEN(
            socket,
            (payload: SocketTokenPayload) => {
                upgradeCallback(this, payload);
            },
        );
        EMITTED_PLAYER_EVENTS.GIVE_TOKEN(socket);
    }

    private beginCountdown(callback: TimeoutFunction) {
        this.timeoutFunction = setTimeout(() => {
            this.logger?.log(CONNECTION_SYSTEM.TIMEOUT_NO_CREDENTIALS(this));
            callback(this);
        }, 1000 * requestTimeoutSeconds);
    }
}

/** Stage two but the socket is verified. */
export class StageThreeConnection extends ConnectionBase {
    /** Unlike other connection stages, this timeout function is for disconnecting a pending socket. */
    public timeoutFunction?: NodeJS.Timeout;
    public socket: Socket;
    public connected: boolean = true;

    // public socketReserved: boolean = false;
    // FIXME: during period of time awaiting for reconnecting socket to send credentials, an error is possible since a second reconnecting socket can 'overwrite' this one, using a socketReserved property can fix this, only allowing the first socket to submit details

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
        }, 1000 * requestTimeoutSeconds);
    }
}
