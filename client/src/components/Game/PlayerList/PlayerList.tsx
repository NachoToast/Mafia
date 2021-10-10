import { Stack, Paper, Divider, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import PlayerLine from './PlayerLine';

export interface ListedPlayer {
    username: string;
    status: PlayerStatuses;
    extra?: string;
    connected: boolean;
}

export type PlayerStatuses = 'spectator' | 'alive' | 'dead' | 'lobby' | 'loading' | 'removed';

const PlayerList = ({ socket }: { socket: Socket }) => {
    const [playerList, setPlayerList]: [ListedPlayer[], Dispatch<SetStateAction<any>>] = useState(
        [],
    );

    useEffect(() => {
        socket.on('playerChange', (payload: ListedPlayer) => {
            console.log(`playerChange`, payload);
            let existingPlayer = playerList.find(({ username }) => username === payload.username);

            if (!!existingPlayer) {
                if (
                    payload.status === 'removed' &&
                    (existingPlayer.status === 'alive' ||
                        existingPlayer.status === 'dead' ||
                        existingPlayer.status === 'lobby')
                ) {
                    existingPlayer.connected = false;
                } else {
                    playerList.splice(playerList.indexOf(existingPlayer), 1);
                }
                setPlayerList([...playerList]);
            } else {
                setPlayerList([...playerList, payload]);
            }
        });

        socket.on('playerList', (newPlayerList: ListedPlayer[]) => {
            let newPlayers: ListedPlayer[] = [];
            for (const player of newPlayerList) {
                if (!playerList.includes(player)) {
                    newPlayers.push(player);
                }
            }

            if (!!newPlayers.length) {
                setPlayerList([...playerList, ...newPlayers]);
            }
        });
        return () => {
            socket.off('playerChange');
        };
    });

    console.log('rendering player list!');

    const alivePlayers = playerList.filter(
        ({ status }) => status === 'lobby' || status === 'alive',
    );
    const deadPlayers = playerList.filter(({ status }) => status === 'dead');
    const spectators = playerList.filter(({ status }) => status === 'spectator');

    return (
        <Paper elevation={24} square>
            <Stack
                style={{ height: '100vh', overflowY: 'auto', padding: '3px' }}
                justifyContent="space-evenly"
                spacing={0.75}
            >
                {/* alive */}
                <Paper style={{ flexGrow: 1, padding: '10px' }} square>
                    <Typography variant="h5">Alive ({alivePlayers.length})</Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack spacing={0.75} divider={<Divider flexItem />}>
                        {alivePlayers.map((e) => (
                            <PlayerLine key={e.username} player={e} />
                        ))}
                    </Stack>
                </Paper>
                {/* dead */}
                <Paper style={{ flexGrow: 1, padding: '10px' }} square>
                    <Typography variant="h5">Dead ({deadPlayers.length})</Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack spacing={0.75} divider={<Divider flexItem />}>
                        {deadPlayers.map((e) => (
                            <PlayerLine key={e.username} player={e} />
                        ))}
                    </Stack>
                </Paper>
                {/* spectators */}
                <Paper style={{ flexGrow: 1, padding: '10px' }} square>
                    <Typography variant="h5">Spectating ({spectators.length})</Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack spacing={0.75} divider={<Divider flexItem />}>
                        {spectators.map((e) => (
                            <PlayerLine key={e.username} player={e} />
                        ))}
                    </Stack>
                </Paper>
            </Stack>
        </Paper>
    );
};

export default PlayerList;
