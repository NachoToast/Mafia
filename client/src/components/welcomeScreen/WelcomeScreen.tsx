import { Input, Typography, Fade, Grow, Container } from '@material-ui/core';
import React from 'react';
import '@fontsource/roboto';

const WelcomeScreen = () => {
    return (
        <Fade in={true}>
            <Grow in={true}>
                <Container>
                    <Typography align="center" variant="h4">
                        Enter Username:
                    </Typography>
                    <Input autoFocus={true} />
                    <Typography align="center" variant="h4">
                        Enter Game Code:
                    </Typography>
                    <Input />
                </Container>
            </Grow>
        </Fade>
    );
};

export default WelcomeScreen;
