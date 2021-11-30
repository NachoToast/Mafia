import React from 'react';
import { Fade, Typography } from '@mui/material';

export interface MessageProps {
    color?: string;
    hideAuthor?: boolean;
}

export interface ChatMessageInterface {
    author: string; // player username or 'Server'
    content: string;
    props?: MessageProps;
}

export interface ExtendedChatmessage extends ChatMessageInterface {
    key: string;
}

const ChatMessage = ({ message }: { message: ExtendedChatmessage }) => {
    return (
        <Fade in={true} style={{ alignSelf: 'center' }}>
            <Typography
                variant="body1"
                color={message.props?.color || 'white'}
                style={{ wordWrap: 'break-word' }}
                width="95%"
            >
                {!message.props?.hideAuthor && `[${message.author}] `}
                {message.content}
            </Typography>
        </Fade>
    );
};

export default ChatMessage;
