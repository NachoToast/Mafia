interface PossibleOverrides {
    serverEndpoint?: string;
    serverPort?: number;
    serverName?: string;
}

let overrides: PossibleOverrides | undefined;

try {
    overrides = require('../config/endPointOverrides.json') as PossibleOverrides;
} catch {}

/** Endpoint for the websocket to hit. */
export const serverEndpoint: string = overrides?.serverEndpoint || 'http://ntgc.ddns.net';

/** Port for the websocket to use. */
export const serverPort: number = overrides?.serverPort || 3001;

/** Name of the server hub. */
export const serverName: string = overrides?.serverName || 'mafia';
