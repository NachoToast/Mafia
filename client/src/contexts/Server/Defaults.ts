import {
    IServerContext,
    ServerConnectionStatus,
    ServerControllers,
    ServerState,
} from './Types';

export const defaultServerState: ServerState = {
    connectionStatus: ServerConnectionStatus.Initial,
    data: null,
    rateLimitBypassed: null,
    sentAt: null,
    receivedAt: null,
};

export const defaultServerControllers: ServerControllers = {
    connect() {
        throw new Error('Function not implemented.');
    },

    reset() {
        throw new Error('Function not implemented.');
    },
};

export const defaultServerContext: IServerContext = {
    serverState: defaultServerState,

    serverControllers: defaultServerControllers,
};
