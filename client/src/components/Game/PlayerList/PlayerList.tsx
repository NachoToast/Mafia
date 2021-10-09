import { Stack, Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ListedPlayer {
    username: string;
    connected: boolean;
    isLobby: boolean;
}

type PlayerStatuses = 'spectator' | 'alive' | 'dead' | 'lobby';

const PlayerList = ({ socket }: { socket: Socket }) => {
    const [alivePlayers, setAlivePlayers]: [ListedPlayer[], Dispatch<SetStateAction<any>>] =
        useState([]);
    const [deadPlayers, setDeadPlayers]: [ListedPlayer[], Dispatch<SetStateAction<any>>] = useState(
        [],
    );
    const [spectators, setSpectators]: [ListedPlayer[], Dispatch<SetStateAction<any>>] = useState(
        [],
    );

    useEffect(() => {
        socket.on('playerJoined', (username: string, status: PlayerStatuses) => {
            const newPlayer: ListedPlayer = {
                username,
                connected: true,
                isLobby: status === 'lobby',
            };
            if (status === 'lobby' || status === 'alive') {
                setAlivePlayers([...alivePlayers, newPlayer]);
            } else if (status === 'dead') {
                setDeadPlayers([...deadPlayers, newPlayer]);
            } else {
                setSpectators([...spectators, newPlayer]);
            }
        });

        socket.on('playerLeft', (username: string, status: PlayerStatuses) => {
            if (status === 'lobby' || status === 'alive') {
                console.log(username, 'left');
                const newPlayer = alivePlayers.find((e) => e.username === username);
                if (!newPlayer) return;
                newPlayer.connected = false;
                setAlivePlayers([...alivePlayers, newPlayer]);
            } else if (status === 'dead') {
                const newPlayer = deadPlayers.find((e) => e.username === username);
                if (!newPlayer) return;
                newPlayer.connected = false;
                setDeadPlayers([...deadPlayers, newPlayer]);
            } else {
                const newPlayer = spectators.find((e) => e.username === username);
                if (!newPlayer) return;
                const newSpectators = spectators;
                newSpectators.splice(newSpectators.indexOf(newPlayer), 1);
                setSpectators(newSpectators);
            }
        });
        return () => {
            socket.off('playerJoined');
        };
    });

    return (
        <Stack style={{ backgroundColor: 'maroon', height: '100vh' }} justifyContent="space-evenly">
            <Box>
                Alive People:{' '}
                {alivePlayers.map((e) => `${e.username}${!!e.connected}${!!e.isLobby}`)}
            </Box>
            <Box>
                Dead People {deadPlayers.map((e) => `${e.username}${!!e.connected}${!!e.isLobby}`)}
            </Box>
            <Box>
                Spectators {spectators.map((e) => `${e.username}${!!e.connected}${!!e.isLobby}`)}
            </Box>
        </Stack>
    );
};

export default PlayerList;
