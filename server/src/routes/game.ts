import { Router } from 'express';
import { findGame, countGames, createGame } from '../controllers';
import { validateBasics } from '../middleware/validateBasics';

const router = Router();

router.post('/gameFinder', validateBasics, findGame);
router.post('/gameCreator', validateBasics, createGame);
router.get('/gameCounter', countGames);

export default router;
