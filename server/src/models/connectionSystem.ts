export type JoinValidationMethods = (
    | 'token'
    | 'ip'
    | 'username'
    | 'gameCode'
)[];
import { Socket } from 'socket.io';
import { LOG_MESSAGES } from '../constants/logging';
import {
    allowDuplicateIP,
    requestTimeoutSeconds,
    tokenDuration,
    joinValidation,
    allowReconnects,
    killDisconnectedPlayers,
} from '../gameConfig.json';
import Logger from './logger';

/** An external function to be called on a connection event. */
type ConnectionFunction = (payload: StageThreeConnection) => any;

/** Internal or external validation function for all connection stages. */
type ValidationFunction = (payload: any) => boolean;

type TimeoutFunction = (
    payload: StageOneConnection | StageTwoConnection | StageThreeConnection,
) => void;

/**
 * @description The connection system handles connecting, disconnecting, and reconnecting players to a game. It uses a 3 step system:
 * 1. "Reserve" a slot (identified by ip)
 * 2. Get a socket connection
 * 3. Get socket's credentials (pre-defined socket emit)
 */
class ConnectionSystem {
    private stageOneConnections: { [ip: string]: StageOneConnection } = {};

    private stageTwoConnections: { [username: string]: StageTwoConnection } =
        {};

    private stageThreeConnections: {
        [username: string]: StageThreeConnection;
    } = {};

    private ipList: string[] = [];
    private usernameList: string[] = [];

    private onJoin: ConnectionFunction;
    private onLeave: ConnectionFunction;
    private onReconnect: ConnectionFunction;
    private validateJoin: ValidationFunction;
    private validateReconnect: ValidationFunction;
    private logger?: Logger;

    constructor(
        onJoin: ConnectionFunction,
        onLeave: ConnectionFunction,
        onReconnect: ConnectionFunction,
        validateJoinFunction: ValidationFunction,
        validateReconnectFunction: ValidationFunction,
        logger?: Logger,
    ) {
        this.onJoin = onJoin;
        this.onLeave = onLeave;
        this.onReconnect = onReconnect;
        this.validateJoin = validateJoinFunction;
        this.validateReconnect = validateReconnectFunction;
        this.logger = logger;
    }

    public isDuplicateIP(ip: string): boolean {
        if (allowDuplicateIP) return false;
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

    public newStageOne(username: string, token: string, ip: string) {
        this.logger?.log(LOG_MESSAGES.SENT_INITIAL_POST(ip, username));
        const newStageOne = new StageOneConnection(
            username,
            token,
            ip,
            Date.now(),
        );
        this.stageOneConnections[username.toLowerCase()] = newStageOne;
        newStageOne.beginCountdown(this.timeoutConnection);
    }

    private timeoutConnection(
        connection: StageOneConnection | StageTwoConnection,
    ) {
        const stage = connection instanceof StageTwoConnection ? 2 : 1;
        this.logger?.log(
            LOG_MESSAGES.TIMEOUT(
                connection.username,
                connection.ip,
                connection.sentAt,
            ),
        );
    }

    private connectionCleanup(ip: string, username: string) {
        const ipIndex = this.ipList.indexOf(ip);
        const usernameIndex = this.usernameList.indexOf(username);

        if (ipIndex === -1)
            this.logger?.log(LOG_MESSAGES.FAILED_IP_REMOVAL(username, ip));
        else this.ipList.splice;
    }
}

/** Reserved slots via POST request. */
class StageOneConnection {
    public username: string;
    public token: string;
    public ip: string;
    public sentAt: number;
    public timeoutFunction?: NodeJS.Timeout;

    constructor(username: string, token: string, ip: string, sentAt: number) {
        this.username = username;
        this.token = token;
        this.ip = ip;
        this.sentAt = sentAt;
    }

    public beginCountdown(callback: TimeoutFunction) {
        this.timeoutFunction = setTimeout(() => {
            callback(this);
        }, 1000 * requestTimeoutSeconds);
    }
}

/** Stage one but with an associated (but unverified) socket. */
class StageTwoConnection extends StageOneConnection {
    public socket: Socket;

    constructor(
        username: string,
        token: string,
        ip: string,
        sentAt: number,
        socket: Socket,
    ) {
        super(username, token, ip, sentAt);
        this.socket = socket;
    }
}

/** Stage two but the socket is verified. */
class StageThreeConnection extends StageTwoConnection {
    public connected: boolean = true;
}
