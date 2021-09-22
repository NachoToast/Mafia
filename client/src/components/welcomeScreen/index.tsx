import {
    Input,
    Typography,
    Fade,
    Grow,
    Container,
    Grid,
    TextField,
    InputLabel,
} from '@material-ui/core';
import React, { useState } from 'react';
import '@fontsource/roboto';

const CodeInput = ({ action }: { action: React.FormEventHandler }) => (
    <Fade in={true}>
        <TextField
            variant="outlined"
            label="Game Code"
            fullWidth={true}
            margin="normal"
            onInput={action}
        />
    </Fade>
);

const WelcomeScreen = () => {
    const [inputUsername, setInputUsername] = useState('');
    const [gameCode, setGameCode] = useState('');

    const [codeVisible, setCodeVisible] = useState(false);

    const updateUsername = (e: React.FormEvent<HTMLInputElement>) => {
        const { value } = e.target as HTMLInputElement;
        setInputUsername(value);

        if ({ value }.value.length > 1 && !codeVisible) {
            setCodeVisible(true);
        } else if ({ value }.value.length <= 1 && codeVisible) {
            setCodeVisible(false);
        }
    };

    const updateGameCode = (e: React.FormEvent<HTMLInputElement>) => {
        const { value } = e.target as HTMLInputElement;
        setGameCode(value);
    };

    return (
        <>
            <Fade in={true}>
                <TextField
                    variant="outlined"
                    label="Username"
                    fullWidth={true}
                    margin="normal"
                    onInput={updateUsername}
                />
            </Fade>
            {codeVisible ? <CodeInput action={updateGameCode} /> : null}
        </>
    );
};

export default WelcomeScreen;
