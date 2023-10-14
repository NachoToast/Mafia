import { defaultConfig } from '../constants';
import { ImportedConfig, Config } from '../types/Config';
import { Colour } from '../types/Utility';

/**
 * Helper function for {@link loadConfig} that logs missing values to the
 * console, because I like nicely formatted error messages, sue me.
 */
function logMissingValues(importedConfig: ImportedConfig): void {
    const missing: string[] = [];

    // Add missing required keys to the 'missing' array.
    for (const key of [
        'mongoURI',
        'discordClientId',
        'discordClientSecret',
    ] as const) {
        if (importedConfig[key] === undefined) {
            missing.push(key);
        }
    }

    // Add colour to missing value names.
    for (let i = 0; i < missing.length; i++) {
        missing[i] = `${Colour.FgRed}${missing[i]}${Colour.Reset}`;
    }

    // Decide which verb to use, and how to join the values.
    let missingStr: string;
    let missingVerb: 'is' | 'are';

    switch (missing.length) {
        // 1 Value: "x is missing from config.json".
        case 1:
            missingStr = missing[0];
            missingVerb = 'is';
            break;
        // 2 Values: "x and y are missing from config.json".
        case 2:
            missingStr = missing.join(' and ');
            missingVerb = 'are';
            break;
        // 3+ Values: "x, y, and z are missing from config.json".
        default:
            missingStr = `${missing.slice(0, -1).join(', ')}, and ${
                missing.slice(-1)[0]
            }`;
            missingVerb = 'are';
            break;
    }

    console.log(
        `${missingStr} ${missingVerb} missing from ${Colour.FgMagenta}config.json${Colour.Reset}`,
    );
}

/**
 * Imports and transforms values from `config.json`, using the
 * {@link defaultConfig default config} values as a fallback
 * for any missing non-required values.
 *
 * Exits the process if any required values are missing,
 * or if values are otherwise invalid.
 */
export function loadConfig(): Config {
    // The `config.json` file may not exist (e.g. in CI environments), so can't
    // use import here since it would otherwise result in a compile-time error.

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const importedConfig = require('../../../config.json') as ImportedConfig;

    // Required value checking.

    if (
        importedConfig.mongoURI === undefined ||
        importedConfig.discordClientId === undefined ||
        importedConfig.discordClientSecret === undefined
    ) {
        logMissingValues(importedConfig);
        process.exit(1);
    }

    if (
        importedConfig.mongoDbName !== undefined &&
        importedConfig.mongoDbName.length > 38
    ) {
        console.log(
            `${Colour.FgRed}mongoDbName${Colour.Reset} cannot be more than 38 characters long (currently ${importedConfig.mongoDbName.length}).`,
        );
        process.exit(1);
    }

    // Recommended value checking.

    if (importedConfig.jwtSecret === undefined) {
        console.log(
            `${Colour.FgYellow}Warning:${Colour.Reset} No jwtSecret defined in ${Colour.FgMagenta}config.json${Colour.Reset}, sessions will not persist between resets!`,
        );
    }

    // Special value transformations.

    const clientUrls: Config['clientUrls'] = importedConfig.clientUrls
        ? new Set(importedConfig.clientUrls)
        : defaultConfig.clientUrls;

    const rateLimitBypassTokens: Config['rateLimitBypassTokens'] =
        importedConfig.rateLimitBypassTokens
            ? new Set(importedConfig.rateLimitBypassTokens)
            : defaultConfig.rateLimitBypassTokens;

    // Combining it all together.

    return {
        ...defaultConfig,
        ...importedConfig,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        mongoURI: importedConfig.mongoURI,
        clientUrls,
        rateLimitBypassTokens,
    };
}
