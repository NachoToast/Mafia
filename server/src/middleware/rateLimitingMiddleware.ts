import { rateLimit } from 'express-rate-limit';
import { MiddlewareProvider } from '../types/Express';

export const rateLimitingMiddleware: MiddlewareProvider = (config) => {
    const { maxRequestsPerMinute, rateLimitBypassTokens } = config;

    return rateLimit({
        windowMs: 60 * 1000,
        limit: maxRequestsPerMinute,
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req, res) => {
            const token = req.get('RateLimit-Bypass-Token');
            if (token === undefined) return false;

            if (rateLimitBypassTokens.has(token)) {
                res.setHeader('RateLimit-Bypassed', 'true');
                return true;
            }

            res.setHeader('RateLimit-Bypassed', 'false');
            return false;
        },
    });
};
