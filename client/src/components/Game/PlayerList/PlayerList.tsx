import { Stack, Paper, Divider, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import PlayerLine from './PlayerLine';

import AliveIcon from '@mui/icons-material/Person';
import DeadIcon from '@mui/icons-material/AirlineSeatFlat';
import SpectatorIcon from '@mui/icons-material/RemoveRedEye';
import { STORAGE } from '../../../constants/localStorageVariables';
// import DisconnectedIcon from '@mui/icons-material/DeviceUnknown';

export enum PlayerStatuses {
    spectator,
    alive,
    dead,
}
export interface Player {
    username: string;
    number: number;
    status: PlayerStatuses;
    extra?: string;
}

const PlayerList = ({ socket }: { socket: Socket }) => {
    const [playerList, setPlayerList]: [
        Player[],
        Dispatch<SetStateAction<any>>,
    ] = useState([]);

    const myUsername = localStorage.getItem(STORAGE.usernameKeyName) as string;

    useEffect(() => {
        socket.on(
            'playerJoined',
            (
                username: string,
                status: PlayerStatuses,
                number: number,
                extra?: string,
            ) => {
                if (username === myUsername) extra = 'You';
                setPlayerList([
                    ...playerList,
                    { username, status, number, extra },
                ]);
            },
        );

        socket.on('playerLeft', (username: string) => {
            const foundPlayer = playerList.find(
                (player) => player.username === username,
            );
            if (!!foundPlayer) {
                playerList.splice(playerList.indexOf(foundPlayer), 1);
                setPlayerList([...playerList]);
            }
        });

        return () => {
            socket.off('playerJoined');
            socket.off('playerLeft');
        };
    });

    console.log('rendering player list!');

    const alivePlayers = playerList
        .filter(({ status }) => status === PlayerStatuses.alive)
        .sort((a, b) => a.number - b.number);

    const deadPlayers = playerList
        .filter(({ status }) => status === PlayerStatuses.dead)
        .sort((a, b) => (a.number = b.number));

    const spectators = playerList.filter(
        ({ status }) => status === PlayerStatuses.spectator,
    );

    return (
        <Paper elevation={24} square style={{ boxShadow: 'none' }}>
            <Stack
                style={{ height: '100vh', overflowY: 'auto', padding: '3px' }}
                justifyContent="space-evenly"
                spacing={0.75}
            >
                {/* alive */}
                <Paper style={{ flexGrow: 1, padding: '10px' }} square>
                    <Typography
                        variant="h5"
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <AliveIcon />
                        &nbsp;Alive ({alivePlayers.length})
                    </Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack spacing={0.75} divider={<Divider flexItem />}>
                        {alivePlayers.map((e) => (
                            <PlayerLine key={e.username} player={e} />
                        ))}
                    </Stack>
                </Paper>
                {/* dead */}
                <Paper style={{ flexGrow: 1, padding: '10px' }} square>
                    <Typography
                        variant="h5"
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <DeadIcon />
                        &nbsp;Dead ({deadPlayers.length})
                    </Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack spacing={0.75} divider={<Divider flexItem />}>
                        {deadPlayers.map((e) => (
                            <PlayerLine key={e.username} player={e} />
                        ))}
                    </Stack>
                </Paper>
                {/* spectators */}
                <Paper style={{ flexGrow: 1, padding: '10px' }} square>
                    <Typography
                        variant="h5"
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <SpectatorIcon />
                        &nbsp;Spectating ({spectators.length})
                    </Typography>
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
