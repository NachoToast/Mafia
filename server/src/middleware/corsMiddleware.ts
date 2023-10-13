import cors, { CorsOptions } from 'cors';
import { CorsError } from '../errors';
import { MiddlewareProvider } from '../types/Express';

export const corsMiddleware: MiddlewareProvider = (config) => {
    const { clientUrls } = config;

    let originFn: CorsOptions['origin'];

    if (clientUrls.has('*')) originFn = '*';
    else {
        originFn = (origin, callback) => {
            // Origin is undefined on non-browser requests (e.g. Insomnia).
            if (origin === undefined || clientUrls.has(origin)) {
                callback(null, true);
            } else {
                callback(new CorsError());
            }
        };
    }

    return cors({
        origin: originFn,
        exposedHeaders: [
            'RateLimit-Limit',
            'RateLimit-Remaining',
            'RateLimit-Reset',
            'Retry-After',
            'RateLimit-Bypassed',
        ],
    });
};
