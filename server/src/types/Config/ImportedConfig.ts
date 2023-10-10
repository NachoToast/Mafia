import { JSONValue, ValuesOf } from '../Utility';
import { Config } from './Config';

type KeysThatRequireTransforming = ValuesOf<{
    [k in keyof Config]: Config[k] extends JSONValue ? never : k;
}>;

/**
 * Expected shape of `config.json`.
 *
 * This explicitly defines the shape of values in `config.json`
 * that must be transformed, such as sets and regular expressions.
 */
export interface ImportedConfig
    extends Partial<Omit<Config, KeysThatRequireTransforming>> {
    clientUrls?: string[];

    rateLimitBypassTokens?: string[];
}
