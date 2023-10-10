import express, { RequestHandler } from 'express';
import request, { SuperTest, Test } from 'supertest';
import { Config } from '../types/Config';
import { MiddlewareProvider } from '../types/Express';
import { mockConfig } from './mocks';

export function stubApp(
    partialConfig?: Partial<Config>,
    preRouteMiddlewares?: MiddlewareProvider[],
    postRouteMiddlewares?: MiddlewareProvider[],
    requestHandler?: RequestHandler,
): SuperTest<Test> {
    const app = express();

    const config = { ...mockConfig(), ...partialConfig };

    if (preRouteMiddlewares !== undefined) {
        for (const middlewareProvider of preRouteMiddlewares) {
            app.use(middlewareProvider(config));
        }
    }

    if (requestHandler !== undefined) {
        app.get('/', requestHandler);
    } else {
        app.get('/', (_req, res) => res.sendStatus(200));
    }

    if (postRouteMiddlewares !== undefined) {
        for (const middlewareProvider of postRouteMiddlewares) {
            app.use(middlewareProvider(config));
        }
    }

    return request(app);
}
