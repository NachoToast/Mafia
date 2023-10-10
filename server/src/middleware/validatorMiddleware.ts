import { join } from 'path';
import { middleware } from 'express-openapi-validator';
import { MiddlewareProvider } from '../types/Express';

export const validatorMiddleware: MiddlewareProvider = () => {
    return middleware({
        apiSpec: join(__dirname, '../', 'openapi.json'),
        validateRequests: true,
        validateResponses: true,
    });
};
