import express from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { SiteError } from '../errors';
import { mockConfig, ResponseData, getResponseData } from '../tests';
import { siteErrorHandler } from './siteErrorHandler';

const consoleMock = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined);

class MockedSiteError extends SiteError {
    public override readonly statusCode: number = 401;

    public constructor() {
        super('', '', undefined);
    }
}

describe.concurrent(siteErrorHandler.name, () => {
    const app = express();

    app.get('/siteError', () => {
        throw new MockedSiteError();
    });

    app.get('/error', () => {
        throw new Error();
    });

    app.use(siteErrorHandler(mockConfig()));

    let responseSiteError: ResponseData;
    let responseError: ResponseData;

    beforeAll(async () => {
        const [response1, response2] = await Promise.all([
            request(app).get('/siteError').send(),
            request(app).get('/error').send(),
        ]);

        responseSiteError = getResponseData(response1);
        responseError = getResponseData(response2);
    });

    test('catches SiteErrors', () => {
        expect(responseSiteError.status).toBe(401);
    });

    test('skips other errors', () => {
        expect(responseError.status).toBe(500);
    });

    test('logs errors when in development mode', async () => {
        app.set('env', 'development');

        const res = await request(app).get('/siteError').send();

        expect(consoleMock).toHaveBeenCalledTimes(1);

        consoleMock.mockReset();

        expect(res.statusCode).toBe(401);
    });
});
