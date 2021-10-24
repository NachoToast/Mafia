import { Stack, Paper, Divider, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import PlayerLine from './PlayerLine';

import AliveIcon from '@mui/icons-material/Person';
import DeadIcon from '@mui/icons-material/AirlineSeatFlat';
import SpectatorIcon from '@mui/icons-material/RemoveRedEye';
import { STORAGE } from '../../../constants/localStorageVariables';
import PlayerCard from './PlayerCard';
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
    connected: boolean;
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
                connected: boolean,
                extra?: string,
            ) => {
                if (username === myUsername) extra = 'You';
                const newPlayer: Player = {
                    username,
                    status,
                    number,
                    extra,
                    connected,
                };
                setPlayerList([...playerList, newPlayer]);

                // fake player population for testing purposes
                // const newPlayers: Player[] = new Array(99)
                //     .fill(0)
                //     .map((e, i) => {
                //         return {
                //             username: `player ${++i}`,
                //             number: ++i,
                //             status:
                //                 i < 20
                //                     ? PlayerStatuses.alive
                //                     : i > 40
                //                     ? PlayerStatuses.spectator
                //                     : PlayerStatuses.dead,
                //             connected: Math.random() < 0.5,
                //         };
                //     });
                // setPlayerList([...playerList, ...newPlayers]);
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

        socket.on(
            'playerUpdate',
            (
                username: string,
                status: PlayerStatuses,
                number: number,
                extra: string,
                connected: boolean,
            ) => {
                const existingPlayer = playerList.find(
                    (player) => player.username === username,
                );
                if (!!existingPlayer) {
                    existingPlayer.status = status;
                    existingPlayer.extra = extra || existingPlayer.extra;
                    existingPlayer.connected = connected;
                    setPlayerList([...playerList]);
                } else {
                    const newPlayer: Player = {
                        username,
                        status,
                        extra,
                        connected,
                        number,
                    };
                    setPlayerList([...playerList, newPlayer]);
                }
            },
        );

        return () => {
            socket.off('playerJoined');
            socket.off('playerLeft');
            socket.off('playerUpdate');
        };
    });

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
                style={{
                    height: '100vh',
                    padding: '3px',
                    overflowY: 'auto',
                    maxHeight: '100vh',
                }}
                justifyContent="space-between"
            >
                {/* alive */}
                <Paper
                    style={{
                        flexGrow: 1,
                        padding: '10px',
                        maxHeight: '33%',
                    }}
                    square
                >
                    <Typography
                        variant="h5"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <AliveIcon />
                        &nbsp;Alive ({alivePlayers.length})
                    </Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack
                        spacing={0.75}
                        divider={<Divider flexItem />}
                        style={{ overflowY: 'auto', maxHeight: '80%' }}
                    >
                        {alivePlayers.map((e) => (
                            <PlayerLine key={e.username} player={e} />
                        ))}
                    </Stack>
                </Paper>
                {/* dead */}
                <Paper
                    style={{
                        flexGrow: 1,
                        padding: '10px',
                        maxHeight: '33%',
                    }}
                    square
                >
                    <Typography
                        variant="h5"
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <DeadIcon />
                        &nbsp;Dead ({deadPlayers.length})
                    </Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack
                        spacing={0.75}
                        divider={<Divider flexItem />}
                        style={{ overflowY: 'auto', maxHeight: '80%' }}
                    >
                        {deadPlayers.map((e) => (
                            <PlayerLine key={e.username} player={e} />
                        ))}
                    </Stack>
                </Paper>
                {/* spectators */}
                <Paper
                    style={{
                        flexGrow: 1,
                        padding: '10px',
                        maxHeight: '33%',
                    }}
                    square
                >
                    <Typography
                        variant="h5"
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <SpectatorIcon />
                        &nbsp;Spectating ({spectators.length})
                    </Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <div
                        style={{
                            display: 'flex',
                            flexFlow: 'row wrap',
                            overflowY: 'auto',
                            maxHeight: '80%',
                        }}
                    >
                        {spectators.map((e, i) => (
                            <PlayerCard player={e} key={e.username} />
                        ))}
                    </div>
                </Paper>
            </Stack>
        </Paper>
    );
};

export default PlayerList;
