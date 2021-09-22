import { createServer, IncomingMessage } from 'http';
import { Server, Socket } from 'socket.io';
import { Player } from './models/player';

const httpServer = createServer();
const io = new Server(httpServer, {
    // ...
    cors: {
        origin: true,
    },
});

const isValid = (req: IncomingMessage) => {
    return true;
};

const playerList: Player[] = [];

io.use((socket, next) => {
    if (isValid(socket.request)) {
        next();
    } else {
        next(new Error('thou shall not pass'));
    }
});

io.on('connection', (socket: Socket) => {
    console.log(`Connection from ${socket.id}`);
    io.emit('clientNumberUpdate', io.engine.clientsCount);

    socket.on('sendMessage', (message: string, username: string) => {
        console.log(`New message [${username}]: ${message}`);
        io.emit('newMessage', {
            content: message,
            author: username,
            timestamp: new Date().toISOString(),
        });
    });

    socket.on('disconnect', () => {
        io.emit('clientNumberUpdate', io.engine.clientsCount);
    });

    socket.on('registerUser', (username: string) => {
        console.log(`Registering new user with username ${username}`);
        if (playerList.map((e) => e.name).includes(username)) {
            socket.emit('usernameTaken');
        } else {
            io.emit('newUser', username);
            playerList.push(new Player(username));
        }
    });
});

httpServer.listen(3001, () => console.log(`Server listening on port *:3001`));
