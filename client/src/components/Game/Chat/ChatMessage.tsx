import React from 'react';
import { Fade, Typography } from '@mui/material';
import ChatMessageInterface from '../../../types/ChatMessage';

const ChatMessage = ({ message }: { message: ChatMessageInterface }) => {
    return (
        <Fade in style={{ alignSelf: 'center' }}>
            <Typography
                variant="body1"
                color={message.props?.color}
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
