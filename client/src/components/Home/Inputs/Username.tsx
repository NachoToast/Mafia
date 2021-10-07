import React, { FormEvent } from 'react';
import { Fade, TextField } from '@mui/material';
import { GameStateInput } from '../JoinGame';

function getColour({ value, error, label }: GameStateInput) {
    if (!value.length) return 'primary';
    if (error) return 'error';
    if (label === 'Username') return 'success';
    return 'primary';
}

function UsernameInput({
    username,
    handleInput,
}: {
    username: GameStateInput;
    handleInput: (event: FormEvent<HTMLInputElement>) => void;
}) {
    const { value, error, label } = username;
    return (
        <Fade in>
            <TextField
                autoFocus
                color={getColour(username)}
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

export default UsernameInput;
