import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { Typography, Button, Paper, Divider, Input } from '@material-ui/core';
import ChatBox from './components/chat/ChatBox';
// import WelcomeScreen from './components/welcomeScreen';
import moment from 'moment';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

export const socket: Socket = io('ntgc.ddns.net:3001');

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [allMessages, setAllMessages]: [string[], any] = useState([]);
    const [messageToSend, setMessageToSend] = useState('');
    const [messagesRecorded, setMessagesRecorded] = useState(allMessages.length);
    const [username, setUsername] = useState('');

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('systemMessage', (message: string) => {
            setAllMessages([...allMessages.slice(-99), message]);
        });

        socket.on('playerMessage', (message: string, author: string) => {
            const newMessage = `[${author}] ${message}`;
            setAllMessages([...allMessages.slice(-99), newMessage]);
        });

        // socket.on('newMessage', (data: { timestamp: string; author: string; content: string }) => {
        //     const newMessage = `[${data.author}] ${data.content} ${moment().format()}`;
        //     setAllMessages([...allMessages.slice(-99), newMessage]);
        //     setMessagesRecorded(messagesRecorded + 1);
        // });

        socket.on('connect_error', (err) => {
            console.log(err.message);
        });

        socket.on('newUser', (username: string) => {
            const newMessage = `${username} joined the game`;
            setAllMessages([...allMessages.slice(-99), newMessage]);
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
        let usernameToSendMessageBy = username;
        if (!username.length) {
            const newUsername = prompt('Please enter your name:') ?? '';
            if (!newUsername.length) {
                alert('Invalid username.');
                return;
            } else {
                socket.emit('registerUser', newUsername);
                setUsername(newUsername);
                usernameToSendMessageBy = newUsername;
            }
        }
        if (messageToSend.length > 0) {
            socket.emit('sendMessage', messageToSend.slice(0, 128), usernameToSendMessageBy);
            setMessageToSend('');
        }
    };
    return (
        <div className="App">
            <header className="App-header">
                <Paper style={{ padding: '20px', borderRadius: '15px' }} elevation={6}>
                    <Typography gutterBottom variant="h6">
                        Connected: {'' + isConnected}
                    </Typography>
                    <Divider style={{ margin: '20px 0' }} />
                    <ChatBox messages={allMessages} />
                    <Divider style={{ margin: '20px 0' }} />
                    <form onSubmit={sendMessage}>
                        {/* <input type="text" onInput={updateMessage} value={messageToSend} /> */}
                        <Input placeholder="Message" onInput={updateMessage} value={messageToSend} />
                        <Button onClick={sendMessage}>Submit</Button>
                    </form>
                </Paper>
            </header>
        </div>
    );
}

export default App;
