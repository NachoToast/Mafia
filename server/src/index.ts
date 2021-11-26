import ServerHub from './models/serverHub';

export const serverHub = new ServerHub(3001);

serverHub.createGame({ ip: '127.0.0.1', username: 'Server', token: '' }, 'dev');

serverHub.app.get('/', (_, res) => {
    res.status(200).send(
        "Congratulations, you found the mafia server endpoint! Shame you're not a websocket.",
    );
});

serverHub.app.get('/status', (_, res) => {
    res.status(200).send(`Server is up with ${serverHub.getNumberOfGames()} game(s)`);
});
