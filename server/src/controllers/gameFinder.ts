import { Request, Response } from 'express';
import { allowDuplicateIP, tokenDuration } from '../gameConfig.json';
import { jwt_secret } from '../gameSecrets.json';
import { serverHub } from '..';
import jwt from 'jsonwebtoken';
import { INTERNAL_ERRORS } from '../constants/serverMessages';

export async function findGame(req: Request, res: Response) {
    try {
        const { gameCode, username } = req.body;

        const foundGame = serverHub.getGame(gameCode);
        if (!foundGame) {
            return res.status(200).json(`Game '${gameCode}' Not Found`);
        }

        if (!allowDuplicateIP || true) {
            const address = req.socket.remoteAddress;
            if (!!address) {
                const ip = address.split(':').slice(-1)[0];
                if (foundGame.isDuplicateIP(ip)) {
                    return res.status(200).json(`Duplicate IP`);
                }
            }
        }

        if (foundGame.isDuplicateUsername(username)) {
            return res.status(200).json(`Username '${username}' Taken`);
        }

        const token = jwt.sign({ username, gameCode }, jwt_secret, { expiresIn: tokenDuration });

        res.status(202).json(token);
    } catch (error) {
        console.log(error);
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
