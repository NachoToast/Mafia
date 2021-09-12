import { Fade, Typography } from '@material-ui/core';
import React from 'react';
import '@fontsource/roboto';

export interface Message {
    content: string;
    author: string;
    timestamp: string; // ISO string
}

const ChatMessage = ({ message, socketId }: { message: Message; socketId: string }) => {
    const { timestamp, author, content } = message;
    return (
        <Fade in={true}>
            <Typography variant="body1">
                {timestamp} [{author === socketId ? 'You' : 'Someone Else'}]: {content}
            </Typography>
        </Fade>
    );
};

export default ChatMessage;
