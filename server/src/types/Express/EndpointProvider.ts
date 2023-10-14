import { User } from '@shared';
import { NextFunction, Request, Response } from 'express';
import { SiteTokenPayload } from '../Auth';
import { Config } from '../Config';
import { UserModel } from '../Database';
import { AuthScope } from './AuthScope';

/**
 * Parameters that are present in the path of a request,
 * these can only be strings.
 *
 * @example
 * ```ts
 * app.get('/users/:id', myHandler);
 * // GET /users/123
 * console.log(req.params.id); // "123"
 * ```
 */
type PathParams = Record<string, string>;

/**
 * Parameters that are present in the query of a request.
 *
 * @example
 * ```ts
 * // GET /users?name=John&age=20
 * console.log(req.query.name); // "John"
 * console.log(req.query.age); // "20"
 * ```
 */
interface ParsedQueryParams {
    [key: string]:
        | undefined
        | string
        | string[]
        | ParsedQueryParams
        | ParsedQueryParams[];
}

/**
 * Parameter values of endpoint providers,
 * which change based on their authorisation scope.
 *
 * @see {@link AuthScope}
 */
interface EndpointHandlerParams<
    TAuth extends AuthScope = AuthScope.None,
    TRequest = void,
    TResponse = void,
    TPathParams extends PathParams = never,
    TQueryParams extends ParsedQueryParams = never,
> {
    config: Config;

    userModel: UserModel;

    req: Request<TPathParams, TResponse, TRequest, TQueryParams>;

    res: Response<TResponse>;

    next: NextFunction;

    auth: TAuth extends AuthScope.User
        ? SiteTokenPayload
        : TAuth extends AuthScope.OptionalUser
        ? SiteTokenPayload | null
        : TAuth extends AuthScope.TokenOnly
        ? SiteTokenPayload
        : null;

    user: TAuth extends AuthScope.User
        ? User
        : TAuth extends AuthScope.OptionalUser
        ? User | null
        : null;
}

/**
 * An endpoint provider is a object that contains a function that handles
 * a request sent to a specific endpoint.
 *
 * To avoid duplicated logic, endpoint providers contain an
 * {@link AuthScope} to determine whether or not the user needs
 * to be logged in to access the endpoint.
 */
export interface EndpointProvider<
    TAuth extends AuthScope = AuthScope.None,
    TRequest = void,
    TResponse = void,
    TPathParams extends PathParams = PathParams,
    TQueryParams extends ParsedQueryParams = ParsedQueryParams,
> {
    authScope: TAuth;
    handler: ({
        config,
        userModel,
        req,
        res,
        next,
        auth,
        user,
    }: EndpointHandlerParams<
        TAuth,
        TRequest,
        TResponse,
        TPathParams,
        TQueryParams
    >) => Promise<void> | void;
}
