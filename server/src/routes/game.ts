import express from 'express';
import { countGames } from '../controllers/gameCounter';
import { findGame } from '../controllers/gameFinder';
import { validateBasics } from '../middleware/validateBasics';

const router = express.Router();

router.post('/gameFinder', validateBasics, findGame);
router.get('/gameCounter', countGames);

export default router;
