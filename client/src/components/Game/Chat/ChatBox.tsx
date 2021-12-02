import { Paper, Stack, Divider, Fade } from '@mui/material';
import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Socket } from 'socket.io-client';
import ChatMessage, { ChatMessageInterface, ExtendedChatmessage } from './ChatMessage';
import { v4 as uuid } from 'uuid';
import ChatComposer from './ChatComposer';

const ChatBox = ({ socket }: { socket: Socket }) => {
    const [messages, setMessages]: [ExtendedChatmessage[], Dispatch<SetStateAction<any>>] =
        useState([]);

    useEffect(() => {
        socket.on('emittedChatMessage', (message: ChatMessageInterface) => {
            const newMessage: ExtendedChatmessage = {
                author: message.author,
                content: message.content,
                props: message.props,
                key: uuid(),
            };

            setMessages([newMessage, ...messages.slice(0, 99)]);
        });
        return () => {
            socket.off('emittedChatMessage');
        };
    });

    return (
        <Paper
            style={{
                height: '100%',
                display: 'flex',
                flexFlow: 'column-reverse',
                boxShadow: 'none',
                paddingTop: '3px',
            }}
            elevation={24}
            square
        >
            <ChatComposer sendMessage={(content) => socket.emit('chatMessage', content)} />
            <Stack
                style={{ overflowY: 'auto', padding: '10px 0 0px 0' }}
                spacing={0.75}
                flexDirection="column-reverse"
                divider={
                    <Fade in>
                        <Divider flexItem />
                    </Fade>
                }
            >
                <Divider flexItem style={{ visibility: 'hidden' }} />
                {messages.map((e) => (
                    <ChatMessage key={e.key} message={e} />
                ))}
            </Stack>
        </Paper>
    );
};

export default ChatBox;
