import { Stack, Paper, Divider, Typography } from '@mui/material';
import { useEffect } from 'react';
import PlayerLine from './PlayerLine';

import AliveIcon from '@mui/icons-material/Person';
import DeadIcon from '@mui/icons-material/AirlineSeatFlat';
import SpectatorIcon from '@mui/icons-material/RemoveRedEye';
import PlayerCard from './PlayerCard';
import { useDispatch, useSelector } from 'react-redux';
import { addOrUpdatePlayer, getPlayers, removePlayer } from '../../../redux/slices/gameSlice';
import { getUsername } from '../../../redux/slices/basicInfoSlice';
import mafiaSocket from '../../../utils/socket';
import Player, { PlayerStatuses } from '../../../types/Player';

const PlayerList = () => {
    const dispatch = useDispatch();

    const playerList = useSelector(getPlayers);
    const myUsername = useSelector(getUsername);

    function playerUpdateHandler(player: Player): void {
        if (player.username === myUsername) {
            player.extra = 'You';
        }
        dispatch(addOrUpdatePlayer(player));
    }

    function playerLeftHandler(username: string): void {
        dispatch(removePlayer(username));
    }

    useEffect(() => {
        mafiaSocket.on('playerUpdate', playerUpdateHandler);

        mafiaSocket.on('playerLeft', playerLeftHandler);

        return () => {
            mafiaSocket.off('playerUpdate', playerUpdateHandler);
            mafiaSocket.off('playerLeft', playerLeftHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function sortByPlayerNumber(username1: string, username2: string) {
        return playerList[username1].number - playerList[username2].number;
    }

    const alivePlayers = Object.keys(playerList)
        .filter((username) => playerList[username].status === PlayerStatuses.alive)
        .sort(sortByPlayerNumber);
    const deadPlayers = Object.keys(playerList)
        .filter((username) => playerList[username].status === PlayerStatuses.dead)
        .sort(sortByPlayerNumber);
    const spectators = Object.keys(playerList)
        .filter((username) => playerList[username].status === PlayerStatuses.spectator)
        .sort(sortByPlayerNumber);

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
                        {alivePlayers.map((username) => (
                            <PlayerLine key={username} player={playerList[username]} />
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
                    <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }}>
                        <DeadIcon />
                        &nbsp;Dead ({deadPlayers.length})
                    </Typography>
                    <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                    <Stack
                        spacing={0.75}
                        divider={<Divider flexItem />}
                        style={{ overflowY: 'auto', maxHeight: '80%' }}
                    >
                        {deadPlayers.map((username) => (
                            <PlayerLine key={username} player={playerList[username]} />
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
                    <Typography variant="h5" style={{ display: 'flex', alignItems: 'center' }}>
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
                        {spectators.map((username) => (
                            <PlayerCard key={username} player={playerList[username]} />
                        ))}
                    </div>
                </Paper>
            </Stack>
        </Paper>
    );
};

export default PlayerList;
