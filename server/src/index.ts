import { createServer } from 'http';
import { Server } from 'socket.io';
import { Game } from './models/game';

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: true,
    },
});

const game = new Game(io);

// io.on('connection', (socket: Socket) => {
//     console.log(`${socket.id} Connected`);

//     socket.on('sendPlayerMessage', (message: string, username: string) => {
//         console.log(`New message [${username}]: ${message}`);
//         console.log(game.usernamesList);

//         if (username === 'NachoToast' && message === '/start') {
//             if (!game.running) {
//                 console.log('starting game...');
//             } else {
//                 socket.emit('');
//             }
//             return;
//         }

//         io.emit('playerMessage', message, username);
//     });

//     socket.on('userJoined', (username: string) => {
//         game.usernamesList.push(username);
//         io.emit('systemMessage', `${username} joined the lobby.`);
//     });

//     socket.on('disconnect', () => {
//         io.emit('clientNumberUpdate', io.engine.clientsCount);
//     });
// });

httpServer.listen(3001, () => console.log(`Server listening on port *:3001`));
