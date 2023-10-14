import { join } from 'path';
import express, { static as serveStatic, Express, json } from 'express';
import { serve, setup } from 'swagger-ui-express';
import {
    corsMiddleware,
    rateLimitingMiddleware,
    validatorMiddleware,
    validatorErrorHandler,
    siteErrorHandler,
} from '../middleware';
import apiSpec from '../openapi.json';
import { applyRoutes } from '../routes';
import { Config } from '../types/Config';
import { UserModel } from '../types/Database';

/**
 * Sets up the {@link Express} app. Including static files, routes, and
 * middleware.
 */
export function loadExpress(config: Config, userModel: UserModel): Express {
    const app: Express = express();

    app.set('trust proxy', config.numProxies);

    app.use('/static', serveStatic('static', { extensions: ['html'] }));

    app.use(
        '/api-docs',
        serve,
        setup(apiSpec, { customSiteTitle: 'Mafia API' }),
    );

    app.use('/spec', serveStatic(join(__dirname, '../', 'openapi.json')));

    // Pre-route middleware, like input validation and user authentication.
    app.use(json());
    app.use(corsMiddleware(config));
    app.use(rateLimitingMiddleware(config));
    app.use(validatorMiddleware(config));
    // Unlike normal errors, validation errors should be handled before routes.
    app.use(validatorErrorHandler(config));

    applyRoutes(app, config, userModel);

    // Post-route middleware, like error handling.
    app.use(siteErrorHandler(config));

    return app;
}
