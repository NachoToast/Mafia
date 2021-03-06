import ServerHub from './classes/ServerHub';

export const serverHub = new ServerHub(3001, 'mafia');

serverHub.createGame({
    gameCode: 'dev',
    connectionSettings: {
        allowPregameReconnects: false,
    },
});

serverHub.app.get('/', (_, res) => {
    res.status(200).send('Mafia server endpoint!');
});
