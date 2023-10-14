import { Express } from 'express';
import { Config } from '../Config';
import { UserModel } from '../Database';

/** A route provider is a function that registers routes on an Express app. */
export type RouteProvider = (
    app: Express,
    config: Config,
    userModel: UserModel,
) => void;
