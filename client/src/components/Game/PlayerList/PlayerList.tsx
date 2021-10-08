import { Stack, Box } from '@mui/material';
import React from 'react';

const PlayerList = () => {
    return (
        <Stack style={{ backgroundColor: 'maroon', height: '100vh' }} justifyContent="space-evenly">
            <Box>Alive People</Box>
            <Box>Dead People</Box>
            <Box>Spectators</Box>
        </Stack>
    );
};

export default PlayerList;
