import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AirlineSeatFlatIcon from '@mui/icons-material/AirlineSeatFlat';
import { ListedPlayer } from './PlayerList';
import { Fade, Stack } from '@mui/material';

const PlayerLine = ({ player }: { player: ListedPlayer }) => {
    console.log(`${player.username} ${player.connected}`);
    const icon = !player.connected ? (
        <DeviceUnknownIcon />
    ) : player.status === 'lobby' ? (
        <PersonIcon />
    ) : player.status === 'spectator' ? (
        <RemoveRedEyeIcon />
    ) : player.status === 'dead' ? (
        <AirlineSeatFlatIcon />
    ) : null;

    return (
        <Fade in>
            <Stack direction="row">
                {icon}
                {player.username}
                {player.extra && ` (${player.extra})`}
            </Stack>
        </Fade>
    );
};

export default PlayerLine;
