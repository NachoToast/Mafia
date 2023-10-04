import { existsSync } from 'fs';
import express from 'express';
import { Example } from '../../shared/Example';
// import { Example } from '../../shared/Example';

const p: Example = {};
p;

const config = existsSync('../config.json')
    ? require('../../config.json')
    : require('../../config.example.json');

const app = express();

const port = config.port ?? 5000;

app.get('/', (_req, res) => res.status(200).send('mafia'));

app.listen(port, () => console.log(`Server is listening on port ${port}`));
