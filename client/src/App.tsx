import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { Typography, Button, Paper, Divider, Input } from '@material-ui/core';
import ChatBox from './components/chat/ChatBox';
import WelcomeScreen from './components/welcomeScreen';

const socket: Socket = io('ntgc.ddns.net:3001');

interface Message {
    content: string;
    author: string;
    timestamp: string;
    key?: number;
}

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);

    const [allMessages, setAllMessages]: [Message[], any] = useState([]);

    const [messageToSend, setMessageToSend] = useState('');

    const [messagesRecorded, setMessagesRecorded] = useState(allMessages.length);

    const [clientsConnected, setClientsConnected] = useState(0);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });
        socket.on('disconnect', () => {
            setIsConnected(false);
        });
        socket.on('newMessage', (data: Message) => {
            const newMessage: Message = {
                content: data.content,
                author: data.author,
                timestamp: new Date(data.timestamp).toLocaleTimeString(),
                key: messagesRecorded,
            };
            setAllMessages([...allMessages.slice(-99), newMessage]);
            setMessagesRecorded(messagesRecorded + 1);
        });
        socket.on('clientNumberUpdate', (numClients) => {
            setClientsConnected(numClients);
        });
        socket.on('connect_error', (err) => {
            console.log(err.message);
        });
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('newMessage');
            socket.off('clientNumberUpdate');
            socket.off('connect_error');
        };
    });

    const updateMessage = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setMessageToSend(target.value);
    };

    const sendMessage = (e: React.FormEvent<HTMLButtonElement | HTMLFormElement>) => {
        e.preventDefault();
        if (messageToSend.length > 0) {
            socket.emit('sendMessage', messageToSend.slice(0, 128));
            setMessageToSend('');
        }
    };
    return (
        <div className="App">
            <header className="App-header">
                {isAuthenticated ? (
                    <Paper style={{ padding: '20px', borderRadius: '15px' }} elevation={6}>
                        <Typography gutterBottom variant="h6">
                            Connected: {'' + isConnected} ({clientsConnected})
                        </Typography>
                        <Divider style={{ margin: '20px 0' }} />
                        <ChatBox messages={allMessages} socketId={socket.id} />
                        <Divider style={{ margin: '20px 0' }} />
                        <form onSubmit={sendMessage}>
                            {/* <input type="text" onInput={updateMessage} value={messageToSend} /> */}
                            <Input placeholder="Message" onInput={updateMessage} value={messageToSend} />
                            <Button onClick={sendMessage}>Submit</Button>
                        </form>
                    </Paper>
                ) : (
                    <WelcomeScreen />
                )}
            </header>
        </div>
    );
}

export default App;
