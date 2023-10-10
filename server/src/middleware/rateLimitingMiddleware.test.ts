import { beforeAll, describe, expect, test } from 'vitest';
import { ResponseData, getResponseData, stubApp } from '../tests';
import { rateLimitingMiddleware } from './rateLimitingMiddleware';

const rateLimitHeader = 'ratelimit-bypassed';

describe.concurrent(rateLimitingMiddleware.name, () => {
    // Not Ratelimited yet.
    let responseNormalA: ResponseData;
    let responseNormalB: ResponseData;
    // Ratelimiting starts.
    let responseRateLimited: ResponseData;
    // Ratelimiting continues, this one has a valid token.
    let responseBypassed: ResponseData;
    // Ratelimiting continues, this one has an invalid token.
    let responseInvalidToken: ResponseData;

    const validToken = 'someBypassToken';

    beforeAll(async () => {
        const app = stubApp(
            {
                maxRequestsPerMinute: 2,
                rateLimitBypassTokens: new Set([validToken]),
            },
            [rateLimitingMiddleware],
        );

        const [response1, response2] = await Promise.all([
            app.get('/').send(),
            app.get('/').send(),
        ]);

        const [response3, response4, response5] = await Promise.all([
            app.get('/').send(),
            app.get('/').set('RateLimit-Bypass-Token', validToken).send(),
            app.get('/').set('RateLimit-Bypass-Token', 'someOtherToken').send(),
        ]);

        responseNormalA = getResponseData(response1, rateLimitHeader);
        responseNormalB = getResponseData(response2, rateLimitHeader);
        responseRateLimited = getResponseData(response3, rateLimitHeader);
        responseBypassed = getResponseData(response4, rateLimitHeader);
        responseInvalidToken = getResponseData(response5, rateLimitHeader);
    });

    test("does nothing when not limit isn't yet reached", () => {
        expect(responseNormalA.status).toBe(200);
        expect(responseNormalB.status).toBe(200);
    });

    test('starts rate limiting when limit is reached', () => {
        expect(responseRateLimited.status).toBe(429);
    });

    test('accepts valid RateLimit-Bypass-Token headers', () => {
        expect(responseBypassed.status).toBe(200);
        expect(responseBypassed.headerValue).toBe('true');
    });

    test('gives feedback for missing RateLimit-Bypass-Token headers', () => {
        expect(responseInvalidToken.status).toBe(429);
        expect(responseInvalidToken.headerValue).toBe('false');
    });
});
