import { ConnectionSettings, LoggingSettings, ServerHubSettings } from '../types/settings';

export const defaultMaxPlayers: number = 15;

export const connectionSettings: ConnectionSettings = {
    allowDuplicateIP: true,
    tokenDuration: '1h',
    requestTimeoutSeconds: 10,
    playerVerification: ['token', 'ip'],
    allowReconnects: true,
    allowSpectatorReconnects: true,
    allowPregameReconnects: true,
};

export const loggingSettings: LoggingSettings = {
    enabled: true,
    baseParams: {
        overwrite: true,
        timestampFormat: 'time',
    },
    logConnections: true,
    connectionParams: {
        overwrite: true,
        timestampFormat: 'time',
    },
};

export const serverHubSettings: ServerHubSettings = {
    logKeyServerEvents: true,
    KSEParams: {
        overwrite: true,
        timestampFormat: 'time',
    },

    logGameCodeGeneration: true,
    GCGParams: {
        overwrite: true,
        timestampFormat: 'time',
    },
};
