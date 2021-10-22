import { Tooltip } from '@mui/material';
import React from 'react';
import { Player } from './PlayerList';

const PlayerCard = ({ player, index }: { player: Player; index: number }) => {
    const { username, connected } = player;
    return (
        <Tooltip title={connected ? '' : 'Disconnected'}>
            <span
                style={{
                    color: connected ? 'white' : 'gray',
                    backgroundColor: '#444',
                    margin: '2px 5px',
                    padding: '2px 3px',
                    borderRadius: '5px',
                }}
            >
                {username}
            </span>
        </Tooltip>
    );
};

export default PlayerCard;
