import { join } from 'path';
import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
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
import { UserModel } from '../types/User';

/**
 * Sets up the {@link Express} app. Including static files, routes, and
 * middleware.
 */
export function loadExpress(config: Config, userModel: UserModel): Express {
    const app: Express = express();

    app.set('trust proxy', config.numProxies);

    app.use('/static', express.static('static', { extensions: ['html'] }));

    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(apiSpec, { customSiteTitle: 'Mafia API' }),
    );

    app.use('/spec', express.static(join(__dirname, '../', 'openapi.json')));

    // app.use('/', express.static('static/index.html'));

    // Pre-route middleware, like input validation and user authentication.
    app.use(express.json());
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
