import { Grid, Stack } from '@mui/material';
import React, { Component } from 'react';
import io, { Socket } from 'socket.io-client';
import { STORAGE } from '../../constants/localStorageVariables';
import ChatBox from './Chat/ChatBox';
import DisconnectedModal from './Modals/DisconnectedModal';
import GameInfo from './GameInfo/GameInfo';
import PlayerList from './PlayerList/PlayerList';
import RoleCard from './RoleCard/RoleCard';
import RoleList from './RoleList/RoleList';

import { serverEndpoint, serverPort } from '../../constants/endpoints';

interface GameState {
    connected: boolean;
    authenticated: boolean;
}

interface GameProps {
    gameCode: string;
    username: string;
    token: string;
    returnCallback: Function;
}

class Game extends Component<GameProps> {
    private returnCallback: Function;

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
        this.returnCallback = props.returnCallback;
        this.gameCode =
            props.gameCode ||
            localStorage.getItem(STORAGE.gameCodeKeyName) ||
            '';
        this.username =
            props.username ||
            localStorage.getItem(STORAGE.usernameKeyName) ||
            '';
        this.token =
            props.token || localStorage.getItem(STORAGE.tokenKeyName) || '';

        this.socket = io(`${serverEndpoint}:${serverPort}`, {
            path: `/${this.gameCode}`,
            autoConnect: false,
        });

        console.log(this.gameCode, this.username, this.token);
    }

    public componentDidMount() {
        this.socket.on('connect', () =>
            this.setState({ connected: true } as GameState),
        );
        this.socket.on('disconnect', () => {
            this.setState({ connected: false } as GameState);
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
            <>
                {!this.state.connected && (
                    <DisconnectedModal rerender={() => this.returnCallback()} />
                )}
                <Grid container>
                    <Grid item xs={3}>
                        <Stack style={{ height: '100vh' }}>
                            <RoleCard />
                            <RoleList />
                            <GameInfo
                                exitCallback={() => this.returnCallback()}
                                socket={this.socket}
                            />
                        </Stack>
                    </Grid>
                    <Grid item xs={6} style={{ height: '100vh' }}>
                        <ChatBox socket={this.socket} />
                    </Grid>
                    <Grid item xs={3}>
                        <PlayerList socket={this.socket} />
                    </Grid>
                </Grid>
            </>
        );
    }
}

export default Game;
