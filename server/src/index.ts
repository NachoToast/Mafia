import ServerHub from './classes/ServerHub';

export const serverHub = new ServerHub(3001);

serverHub.createGame({
    gameCode: 'dev',
});

serverHub.app.get('/', (_, res) => {
    res.status(200).send('Mafia server endpoint!');
});
