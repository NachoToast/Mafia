import { execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { Config } from '../types/Config';

function getCommit(): Config['commit'] {
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch {
        // If the git command fails, we're probably not in a git repo.
        return 'unknown';
    }
}

/**
 * Default config values, keep this in sync with `.github/config-schema.json`.
 */
export const defaultConfig: Omit<Config, 'mongoURI'> = {
    port: 5000,

    clientUrls: new Set(['*']),

    numProxies: 0,

    maxRequestsPerMinute: 30,

    rateLimitBypassTokens: new Set(),

    /**
     * This default is undocumented in the schema,
     * as it should only be used for testing!
     */
    mongoDbName: 'mafia_default',

    /**
     * This ensures cryptographic security, but also means it
     * will change every time the server restarts, so user sessions
     * will not persist between server restarts either.
     *
     * This default is undocumented in the schema
     * as it cannot be faithfully represented.
     */
    jwtSecret: randomBytes(8).toString('hex'),

    /**
     * This default is undocumented in the schema,
     * as it should only be used for testing.
     */
    discordClientId: 'dummy Discord client ID',

    /**
     * This default is undocumented in the schema,
     * as it should only be used for testing.
     */
    discordClientSecret: 'dummy Discord client secret',

    commit: getCommit(),

    startedAt: new Date().toISOString(),
};
