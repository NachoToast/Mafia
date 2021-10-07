import { Request, Response } from 'express';
import { allowDuplicateIP, tokenDuration } from '../gameConfig.json';
import { jwt_secret } from '../gameSecrets.json';
import { serverHub } from '..';
import jwt from 'jsonwebtoken';
import { INTERNAL_ERRORS } from '../constants/serverMessages';

export async function countGames(req: Request, res: Response) {
    try {
        const numGames = serverHub.getNumberOfGames();
        res.status(200).json(numGames);
    } catch (error) {
        console.log(error);
        res.status(500).json(INTERNAL_ERRORS.BASIC(error));
    }
}
