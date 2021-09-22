import { Fade, Typography } from '@material-ui/core';
import React from 'react';
import '@fontsource/roboto';
export interface Message {
    content: string;
}

export interface PlayerChatMessage extends Message {
    author: string;
    timestamp: string; // ISO string
}

const ChatMessage = ({ message }: { message: Message }) => {
    const { timestamp, author, content } = Message;
    return (
        <Fade in={true}>
            <Typography variant="body1">
                {timestamp} [{author}]: {content}
            </Typography>
        </Fade>
    );
};

export default ChatMessage;
