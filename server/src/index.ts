import { createServer, IncomingMessage } from 'http';
import { Server, Socket } from 'socket.io';
import { Game } from './models/Game';

const httpServer = createServer();
const io = new Server(httpServer, {
    // ...
    cors: {
        origin: true,
    },
});
const game = new Game();

// middleware for future maybe
const isValid = (req: IncomingMessage) => {
    return true;
};
io.use((socket, next) => {
    if (isValid(socket.request)) {
        next();
    } else {
        next(new Error('thou shall not pass'));
    }
});

io.on('connection', (socket: Socket) => {
    console.log(`${socket.id} Connected`);

    socket.on('sendPlayerMessage', (message: string, username: string) => {
        console.log(`New message [${username}]: ${message}`);
        console.log(game.usernamesList);

        if (username === 'NachoToast' && message === '/start') {
            if (!game.running) {
                console.log('starting game...');
            } else {
                socket.emit('');
            }
            return;
        }

        io.emit('playerMessage', message, username);
    });

    socket.on('userJoined', (username: string) => {
        game.usernamesList.push(username);
        io.emit('systemMessage', `${username} joined the lobby.`);
    });

    socket.on('disconnect', () => {
        io.emit('clientNumberUpdate', io.engine.clientsCount);
    });
});

httpServer.listen(3001, () => console.log(`Server listening on port *:3001`));
