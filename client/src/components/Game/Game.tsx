import { Grid, Stack } from '@mui/material';
import React, { Component } from 'react';
import io, { Socket } from 'socket.io-client';
import { STORAGE } from '../../constants/localStorageVariables';
import ChatBox from './Chat/ChatBox';
import GameInfo from './GameInfo/GameInfo';
import PlayerList from './PlayerList/PlayerList';
import RoleCard from './RoleCard/RoleCard';
import RoleList from './RoleList/RoleList';

interface GameState {
    connected: boolean;
    authenticated: boolean;
}

interface GameProps {
    gameCode: string;
    username: string;
    token: string;
}

class Game extends Component<GameProps> {
    public state: GameState = {
        connected: false,
        authenticated: true,
    };

    private socket: Socket;
    private gameCode: string;
    private username: string;
    private token: string;

    public constructor(props: GameProps) {
        super(props);
        this.gameCode = props.gameCode || localStorage.getItem(STORAGE.gameCodeKeyName) || '';
        this.username = props.username || localStorage.getItem(STORAGE.usernameKeyName) || '';
        this.token = props.token || localStorage.getItem(STORAGE.tokenKeyName) || '';

        this.socket = io(`ntgc.ddns.net:3001`, {
            path: `/${this.gameCode}`,
            autoConnect: false,
        });

        console.log(this.gameCode, this.username, this.token);
    }

    public componentDidMount() {
        this.socket.on('connect', () => this.setState({ connected: true } as GameState));
        this.socket.on('disconnect', () => {
            this.setState({ connected: false } as GameState);
            console.log('disconnectwd');
        });

        this.socket.on('unregistered', () => {
            this.setState({ authenticated: false } as GameState);
            console.log('unauythetnictyu');
        });
        this.socket.on('giveToken', () => {
            this.socket.emit('heresToken', {
                token: this.token,
                gameCode: this.gameCode,
                username: this.username,
            });
            console.log('emitting deets');
        });

        this.socket.connect();
    }

    public render() {
        // if (!this.state.authenticated) return <div>Not authenticated :P</div>;
        console.log(`${Date.now()} Rendering Game`);
        return (
            <Grid container>
                <Grid item xs={3}>
                    <Stack style={{ height: '100vh' }}>
                        <RoleCard />
                        <RoleList />
                        <GameInfo />
                    </Stack>
                </Grid>
                <Grid item xs={6} style={{ height: '100vh' }}>
                    <ChatBox />
                </Grid>
                <Grid item xs={3}>
                    <PlayerList />
                </Grid>
            </Grid>
        );
    }
}

export default Game;
