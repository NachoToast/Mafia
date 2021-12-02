import { Paper, TextField, Button } from '@mui/material';
import React, { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';

export interface ChatComposerProps {
    sendMessage: (content: string) => void;
}

const ChatComposer = (props: ChatComposerProps) => {
    const [messageToSend, setMessageToSend]: [string, Dispatch<SetStateAction<string>>] =
        useState('');

    function updateMessageToSend(event: FormEvent<HTMLInputElement>) {
        const target = event.target as HTMLInputElement;
        setMessageToSend(target.value);
    }

    function sendMessage(event: FormEvent<HTMLButtonElement | HTMLFormElement>) {
        event.preventDefault();
        if (messageToSend.trim().length > 0) {
            props.sendMessage(messageToSend.slice(0, 128));
            setMessageToSend('');
        }
    }

    return (
        <Paper elevation={4} style={{ padding: '10px 20px' }}>
            <form
                onSubmit={sendMessage}
                style={{
                    width: '100%',
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
            </form>
        </Paper>
    );
};

export default ChatComposer;
