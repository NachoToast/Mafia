import { Paper, Button, TextField, Stack, Divider, Fade } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import React, {
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
    FormEvent,
} from 'react';
import { Socket } from 'socket.io-client';
import ChatMessage, {
    ChatMessageInterface,
    ExtendedChatmessage,
} from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';

const ChatBox = ({ socket }: { socket: Socket }) => {
    const [messages, setMessages]: [
        ExtendedChatmessage[],
        Dispatch<SetStateAction<any>>,
    ] = useState([]);
    const [messageToSend, setMessageToSend]: [
        string,
        Dispatch<SetStateAction<string>>,
    ] = useState('');

    useEffect(() => {
        socket.on('emittedChatMessage', (message: ChatMessageInterface) => {
            const newMessage: ExtendedChatmessage = {
                author: message.author,
                content: message.content,
                props: message.props,
                key: uuidv4(),
            };

            setMessages([newMessage, ...messages.slice(0, 99)]);
        });
        return () => {
            socket.off('emittedChatMessage');
        };
    });

    function updateMessageToSend(event: FormEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement;
        setMessageToSend(target.value);
    }

    function sendMessage(e: FormEvent<HTMLButtonElement | HTMLFormElement>) {
        e.preventDefault();
        if (messageToSend.trim().length > 0) {
            socket.emit('chatMessage', messageToSend.slice(0, 128));
            setMessageToSend('');
        }
    }

    console.log('rendering chatbox!');

    return (
        <Paper
            style={{
                height: '100%',
                display: 'flex',
                flexFlow: 'column-reverse',
            }}
            elevation={24}
            square
        >
            <Paper elevation={4} style={{ padding: '10px 20px' }}>
                <form
                    onSubmit={sendMessage}
                    style={{
                        width: '100%',
                        // padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <TextField
                        style={{ flexGrow: 1 }}
                        autoFocus
                        onInput={updateMessageToSend}
                        value={messageToSend}
                        placeholder="Message"
                        variant="standard"
                    />
                    <Button onClick={sendMessage}>
                        <SendIcon />
                    </Button>
                    {/* <Button variant="contained" endIcon={<SendIcon />} onClick={sendMessage} /> */}
                </form>
            </Paper>
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
                <Divider flexItem />
                {messages.map((e) => (
                    <ChatMessage key={e.key} message={e} />
                ))}
            </Stack>
        </Paper>
    );
};

export default ChatBox;
