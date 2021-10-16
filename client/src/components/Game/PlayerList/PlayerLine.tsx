import React from 'react';
import { Player } from './PlayerList';
import { Fade, Stack } from '@mui/material';

const PlayerLine = ({ player }: { player: Player }) => {
    return (
        <Fade in>
            <Stack
                direction="row"
                style={{
                    overflowX: 'hidden',
                    overflowY: 'auto',
                }}
            >
                {player.number}.&nbsp;
                {player.username}
                {player.extra && ` (${player.extra})`}
            </Stack>
        </Fade>
    );
};

export default PlayerLine;
