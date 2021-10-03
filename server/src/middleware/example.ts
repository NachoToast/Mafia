import { createServer, IncomingMessage } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: true,
    },
});

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
