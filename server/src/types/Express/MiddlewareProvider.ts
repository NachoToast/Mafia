import { RequestHandler, ErrorRequestHandler } from 'express';
import { Config } from '../Config';

/**
 * A middleware provider is a function that registers
 * middleware on an Express app or route.
 */
export type MiddlewareProvider = (
    config: Config,
) =>
    | RequestHandler
    | ErrorRequestHandler
    | RequestHandler[]
    | ErrorRequestHandler[];
