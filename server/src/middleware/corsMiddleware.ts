import cors, { CorsOptions } from 'cors';
import { CorsError } from '../errors';
import { Config } from '../types/Config';
import { MiddlewareProvider } from '../types/Express';

export function makeOriginFunction(config: Config): CorsOptions['origin'] {
    if (config.clientUrls.has('*')) return '*';

    return (origin, callback) => {
        // Origin is undefined on non-browser requests (e.g. Insomnia).
        if (origin === undefined || config.clientUrls.has(origin)) {
            callback(null, true);
        } else {
            callback(new CorsError());
        }
    };
}

export const corsMiddleware: MiddlewareProvider = (config) => {
    return cors({
        origin: makeOriginFunction(config),
        exposedHeaders: [
            'RateLimit-Limit',
            'RateLimit-Remaining',
            'RateLimit-Reset',
            'Retry-After',
            'RateLimit-Bypassed',
        ],
    });
};
