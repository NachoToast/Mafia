import express from 'express';
import { findGame } from '../controllers/gameFinder';
import { validateBasics } from '../middleware/validateBasics';

const router = express.Router();

router.post('/gameFinder', validateBasics, findGame);

export default router;
