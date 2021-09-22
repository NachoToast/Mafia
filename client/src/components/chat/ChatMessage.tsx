import { Fade, Typography } from '@material-ui/core';
import React from 'react';
import '@fontsource/roboto';

const ChatMessage = ({ message }: { message: string }) => {
    return (
        <Fade in={true}>
            <Typography variant="body1">{message}</Typography>
        </Fade>
    );
};

export default ChatMessage;
