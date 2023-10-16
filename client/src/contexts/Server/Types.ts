import { PostRootResponse, SiteErrorObject } from '@shared';

export enum ServerConnectionStatus {
    /** Not yet tried to connect to the server. */
    Initial,
    /** In the process of making a request to the server. */
    Connecting,
    /** Successfully received a response from the server. */
    Connected,
    /**
     * An error occurred in sending a request to, or parsing a response from,
     * the server. */
    Errored,
}

interface ServerStateInitial {
    connectionStatus: ServerConnectionStatus.Initial;
    data: null;
    rateLimitBypassed: undefined;
}

interface ServerStateConnecting {
    connectionStatus: ServerConnectionStatus.Connecting;
    data: null;
    rateLimitBypassed: undefined;
}

interface ServerStateConnected {
    connectionStatus: ServerConnectionStatus.Connected;
    data: PostRootResponse;

    rateLimitBypassed: boolean | null;
}

interface ServerStateErrored {
    connectionStatus: ServerConnectionStatus.Errored;
    data: SiteErrorObject;
    rateLimitBypassed: undefined;
}

export type ServerState =
    | ServerStateInitial
    | ServerStateConnecting
    | ServerStateConnected
    | ServerStateErrored;

export interface ServerControllers {
    /**
     * Attempts to connect to the server using the configured server URL.
     * @param {AbortController} [controller] Controller that can be used to
     * abort the request later (e.g. in a useEffect cleanup).
     */
    connect(controller?: AbortController): Promise<void>;

    /**
     * Aborts the outgoing request, if present. This is identical to calling
     * `controller.abort()` on the controller passed to `connect()`.
     */
    reset(): void;
}

export interface IServerContext {
    serverState: ServerState;

    serverControllers: ServerControllers;
}
