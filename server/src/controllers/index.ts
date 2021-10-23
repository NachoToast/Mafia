import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { allowDuplicateIP, tokenDuration } from '../gameConfig.json';
import { INTERNAL_ERRORS } from '../constants/serverMessages';
import { jwt_secret } from '../gameSecrets.json';
import { serverHub } from '..';
import { globalLogger } from '../models/logger';

export async function findGame(req: Request, res: Response) {
    try {
        const { gameCode, username } = req.body;

        const foundGame = serverHub.getGame(gameCode);
        if (!foundGame) {
            return res.status(200).json(`Game '${gameCode}' Not Found`);
        }

        const address = req.socket.remoteAddress;
        const ip = address?.split(':')?.slice(-1)[0] || 'Unknown';

        if (foundGame.connectionSystem.isDuplicateIP(ip)) {
            return res.status(200).json('Duplicate IP');
        }

        if (foundGame.connectionSystem.isDuplicateUsername(username)) {
            return res.status(200).json('Username Taken');
        }

        const token = jwt.sign({ username, gameCode }, jwt_secret, {
            expiresIn: tokenDuration,
        });
        const successfulReservation = foundGame.connectionSystem.newStageOne(
            username,
            token,
            ip,
        );
        if (!successfulReservation) {
            res.status(200).json('Cannot connect under that username/IP');
        } else {
            res.status(202).json(token);
        }
    } catch (error) {
        globalLogger.log(error);
        res.status(500).json(INTERNAL_ERRORS.BASIC(error));
    }
}

export async function createGame(req: Request, res: Response) {
    console.log(`creating game...`);
    /**
     * player count
     * role list
     * creator
     */
    // creategame middleware
}

export async function countGames(req: Request, res: Response) {
    try {
        const numGames = serverHub.getNumberOfGames();
        res.status(200).json(numGames);
    } catch (error) {
        globalLogger.log(error);
        res.status(500).json(INTERNAL_ERRORS.BASIC(error));
    }
}
