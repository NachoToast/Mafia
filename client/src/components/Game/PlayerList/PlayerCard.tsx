import React from 'react';
import Player from '../../../types/Player';

const PlayerCard = ({ player }: { player: Player }) => {
    const { username, connected } = player;
    return (
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
    );
};

export default PlayerCard;
