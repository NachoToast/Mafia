import React, { MouseEvent } from 'react';
import { Tooltip } from '@mui/material';
import JoinGameButton from './JoinGame';

function CreateGameButton({
    handleClick,
}: {
    handleClick: (event: MouseEvent<Element, globalThis.MouseEvent>) => void;
}) {
    return (
        <Tooltip title="Coming Soon™" placement="top" arrow>
            <span>
                <JoinGameButton style={{ pointerEvents: 'none' }} onClick={handleClick}>
                    Create Game
                </JoinGameButton>
            </span>
        </Tooltip>
    );
}

export default CreateGameButton;
