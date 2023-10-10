import { Config } from '../../types/Config';

/**
 * Helper function that constructs a request body that
 * can be sent to any of the Discord OAuth endpoints.
 */
export function makeRequestBody(config: Config): URLSearchParams {
    return new URLSearchParams({
        client_id: config.discordClientId,
        client_secret: config.discordClientSecret,
    });
}
