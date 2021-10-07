import React from 'react';
import { Fade, TextField } from '@mui/material';
import { GameStateInput } from '../JoinGame';

function getColour({ value, error, label }: GameStateInput) {
    if (!value.length) return 'primary';
    if (error) return 'error';
    if (label === 'Game Code') return 'success';
    return 'primary';
}

function isVisible({ label, value }: GameStateInput) {
    return !!value.length && label === 'Username';
}

function GameCodeInput({
    gameCode,
    username,
    handleInput,
}: {
    gameCode: GameStateInput;
    username: GameStateInput;
    handleInput: (event: React.FormEvent<HTMLInputElement>) => void;
}) {
    const { value, error, label } = gameCode;
    return (
        <Fade in={isVisible(username)}>
            <TextField
                color={getColour(gameCode)}
                error={error}
                variant="outlined"
                label={label}
                fullWidth
                margin="normal"
                onInput={handleInput}
                value={value}
            />
        </Fade>
    );
}

export default GameCodeInput;
