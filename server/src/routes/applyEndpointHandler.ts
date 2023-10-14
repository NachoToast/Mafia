import { User } from '@shared';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { AuthenticationService, UserService } from '../services';
import { SiteTokenPayload } from '../types/Auth';
import { Config } from '../types/Config';
import { UserModel } from '../types/Database';
import { EndpointProvider, AuthScope } from '../types/Express';

function giveEndpointProviderContext<T extends EndpointProvider<AuthScope>>(
    endpointHandler: T,
    config: Config,
    userModel: UserModel,
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    switch (endpointHandler.authScope) {
        case AuthScope.None:
            return async (req, res, next) => {
                try {
                    await endpointHandler.handler({
                        req,
                        res,
                        next,
                        config,
                        userModel,
                        auth: null,
                        user: null,
                    });
                } catch (error) {
                    next(error);
                }
            };
        case AuthScope.TokenOnly:
            return async (req, res, next) => {
                try {
                    await endpointHandler.handler({
                        req,
                        res,
                        next,
                        config,
                        userModel,
                        auth: AuthenticationService.validateSiteToken(
                            req.get('Authorization'),
                            config,
                        ),
                        user: null,
                    });
                } catch (error) {
                    next(error);
                }
            };
        case AuthScope.OptionalUser:
            return async (req, res, next) => {
                try {
                    let auth: SiteTokenPayload | null = null;
                    let user: User | null = null;

                    const authHeader = req.get('Authorization');
                    if (authHeader !== undefined) {
                        auth = AuthenticationService.validateSiteToken(
                            authHeader,
                            config,
                        );
                        user = await UserService.getUserById(
                            auth.id,
                            userModel,
                        );
                    }

                    await endpointHandler.handler({
                        req,
                        res,
                        next,
                        config,
                        userModel,
                        auth,
                        user,
                    });
                } catch (error) {
                    next(error);
                }
            };
        case AuthScope.User:
            return async (req, res, next) => {
                try {
                    const auth = AuthenticationService.validateSiteToken(
                        req.get('Authorization'),
                        config,
                    );
                    const user = await UserService.getUserById(
                        auth.id,
                        userModel,
                    );

                    await endpointHandler.handler({
                        req,
                        res,
                        next,
                        config,
                        userModel,
                        auth,
                        user,
                    });
                } catch (error) {
                    next(error);
                }
            };
    }
}

export function applyEndpointHandler<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends EndpointProvider<AuthScope, any, any>,
>(endpointProvider: T, config: Config, userModel: UserModel): RequestHandler {
    const handler = giveEndpointProviderContext(
        endpointProvider,
        config,
        userModel,
    );

    return (req, res, next) => {
        handler(req, res, next).catch(next);
    };
}
