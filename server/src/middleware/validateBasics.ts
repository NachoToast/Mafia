import { NextFunction, Response, Request } from 'express';
import { gameCodeValidator, usernameValidator } from '../constants/auth';
import { INTERNAL_ERRORS } from '../constants/serverMessages';
import { globalLogger } from '../models/logger';

/** Validates gameCode and username. */
export async function validateBasics(req: Request, res: Response, next: NextFunction) {
    try {
        const { gameCode, username } = req.body;

        if (!gameCode || !gameCodeValidator.test(gameCode)) {
            return res.status(200).json('Invalid Game Code');
        }

        if (!username || !usernameValidator.test(username)) {
            return res.status(200).json('Invalid Username');
        }

        next();
    } catch (error) {
        globalLogger.log(error);
        res.status(500).json(INTERNAL_ERRORS.BASIC(error));
    }
}
