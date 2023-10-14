import express from 'express';
import { HttpError } from 'express-openapi-validator/dist/framework/types';
import request from 'supertest';
import { beforeAll, describe, expect, test } from 'vitest';
import { mockConfig, ResponseData, getResponseData } from '../tests';
import { validatorErrorHandler } from './validatorErrorHandler';

describe.concurrent(validatorErrorHandler.name, () => {
    const app = express();
    const config = mockConfig();

    app.get('/httpError', () => {
        throw new HttpError({ name: '', path: '', status: 401 });
    });

    app.get('/error', () => {
        throw new Error();
    });

    app.use(validatorErrorHandler(config));

    let responseHttpError: ResponseData;
    let responseError: ResponseData;

    beforeAll(async () => {
        const [response1, response2] = await Promise.all([
            request(app).get('/httpError').send(),
            request(app).get('/error').send(),
        ]);

        responseHttpError = getResponseData(response1);
        responseError = getResponseData(response2);
    });

    test('catches HttpErrors', () => {
        expect(responseHttpError.status).toBe(400);
    });

    test('skips other errors', () => {
        expect(responseError.status).toBe(500);
    });
});
