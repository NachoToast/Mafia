import { Input, Typography, Fade, Grow, Container, TextField } from '@material-ui/core';
import React from 'react';
import '@fontsource/roboto';

const WelcomeScreen = () => {
    return (
        <Fade in={true}>
            <Grow in={true}>
                <Container>
                    <TextField variant="outlined" label="Enter Game Code" autoFocus={true} />
                </Container>
            </Grow>
        </Fade>
    );
};

export default WelcomeScreen;
