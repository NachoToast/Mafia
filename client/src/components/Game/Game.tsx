import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { STORAGE } from '../../constants/localStorageVariables';

const Game = () => {
    const gameCode = localStorage.getItem(STORAGE.gameCodeKeyName);
    const socket: Socket = io(`ntgc.ddns.net:3001`, {
        path: `/${gameCode}`,
    });
    socket.connect();
    console.log('game render');

    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));
        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    });

    return <div>poggers {isConnected ? 'yes' : 'no'}</div>;
};

export default Game;
