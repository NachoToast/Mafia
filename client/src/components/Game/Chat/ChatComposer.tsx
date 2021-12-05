import { Paper, TextField, Button } from '@mui/material';
import { FormEvent, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import mafiaSocket from '../../../utils/socket';

const ChatComposer = () => {
    const [messageToSend, setMessageToSend] = useState('');

    function updateMessageToSend(event: FormEvent<HTMLInputElement>): void {
        event.preventDefault();
        const target = event.target as HTMLInputElement;
        setMessageToSend(target.value);
    }

    function sendMessage(event: FormEvent<HTMLButtonElement | HTMLFormElement>): void {
        event.preventDefault();
        if (messageToSend.trim().length > 0) {
            mafiaSocket.sendChatMessage(messageToSend.slice(0, 128));
            setMessageToSend('');
        }
    }

    return (
        <Paper
            elevation={4}
            style={{ padding: '10px 20px', marginBottom: '2px', boxShadow: 'none' }}
        >
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
