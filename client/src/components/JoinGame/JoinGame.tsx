import React from 'react';
import {
    Fade,
    TextField,
    Container,
    Stack,
    Tooltip,
    Typography,
    LinearProgress,
} from '@mui/material';
import GoButton from './GoButton/GoButton';
import { STORAGE } from '../../constants/localStorageVariables';

import findGame from '../../actions/findGame';

const usernameValidator = new RegExp(/^[a-zA-Z0-9 ]+$/);
// usernames should be between 2 and 22 (inclusive) characters long
const gameCodeValidator = new RegExp(/^[a-zA-Z]+$/);
// game codes should be between 3 and 5 (inclusive) characters long

type JoinGameState = {
    username: string;
    usernameLabel: string;
    usernameError: boolean;

    token?: string;

    gameCode: string;
    gameCodeLabel: string;
    gameCodeError: boolean;

    loading: boolean;
    subtitle: string;
    subtitleColour: string;
};

export class JoinGame extends React.Component<{}, JoinGameState> {
    public constructor(props: any) {
        super(props);
        this.state = {
            username: localStorage.getItem(STORAGE.usernameKeyName) || '',
            usernameLabel: 'Username',
            usernameError: false,
            token: localStorage.getItem(STORAGE.tokenKeyName) || undefined,
            gameCode: localStorage.getItem(STORAGE.gameCodeKeyName) || '',
            gameCodeLabel: 'Game Code',
            gameCodeError: false,
            loading: false,
            subtitle: '',
            subtitleColour: '',
            // TODO: move subtitle colour declarations to constants file
        };

        this.updateUsername = this.updateUsername.bind(this);
        this.updateCode = this.updateCode.bind(this);
        this.joinGame = this.joinGame.bind(this);
    }

    public componentDidMount() {
        this.validateUsername(this.state.username);
        this.validateGameCode(this.state.gameCode);
    }

    private validateUsername(username: string) {
        if (username.length < 1) {
            this.setState({ usernameLabel: 'Username', usernameError: false });
        } else if (!usernameValidator.test(username)) {
            this.setState({ usernameLabel: 'Invalid Username', usernameError: true });
        } else if (username.length < 3) {
            this.setState({ usernameLabel: 'Too Short', usernameError: false });
        } else if (username.length > 22) {
            this.setState({ usernameLabel: 'Too Long', usernameError: true });
        } else {
            this.setState({ usernameLabel: 'Username', usernameError: false });
        }
    }

    private validateGameCode(code: string) {
        if (code.length < 1) {
            this.setState({ gameCodeLabel: 'GameCode', gameCodeError: false });
        } else if (!gameCodeValidator.test(code)) {
            this.setState({ gameCodeLabel: 'Invalid Code', gameCodeError: true });
        } else if (code.length < 3) {
            this.setState({ gameCodeLabel: 'Too Short', gameCodeError: false });
        } else if (code.length > 5) {
            this.setState({ gameCodeLabel: 'Too Long', gameCodeError: true });
        } else {
            this.setState({ gameCodeLabel: 'Game Code', gameCodeError: false });
        }
    }

    private updateUsername(event: React.FormEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement;
        this.setState({ username: value });
        localStorage.setItem(STORAGE.usernameKeyName, value);

        this.validateUsername(value);
    }

    private updateCode(event: React.FormEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement;
        this.setState({ gameCode: value });
        localStorage.setItem(STORAGE.gameCodeKeyName, value);

        this.validateGameCode(value);
    }

    private async joinGame(event: React.MouseEvent<Element, MouseEvent>) {
        event.preventDefault();
        try {
            this.setState({ loading: true });
            console.log(this.state.loading);
            const { username, gameCode, token } = this.state;
            const response = await findGame({ username, gameCode, token });
            if (!response) {
                this.setState({ subtitle: `Failed to Connect to the Mafia Servers` });
                this.setState({ loading: false, subtitleColour: 'red' });
            } else if (response.status !== 202) {
                this.setState({ subtitle: response.data, subtitleColour: 'lightcoral' });
                this.setState({ loading: false });
            } else {
                console.log(response.data);
                this.setState({ subtitle: 'Joining Game', subtitleColour: 'aquamarine' });
            }
        } catch (error) {
            console.log(error);
            this.setState({ loading: false });
        }
    }

    private createGame(event: React.MouseEvent<Element, MouseEvent>) {
        event.preventDefault();
        // ...
    }

    public render() {
        return (
            <Container>
                <Stack spacing={3} marginTop={5}>
                    <Typography variant="h2" align="center" letterSpacing={1}>
                        Mafia
                    </Typography>
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{ fontStyle: 'italic', color: this.state.subtitleColour || 'white' }}
                    >
                        {this.state.subtitle || 'By NachoToast'}
                    </Typography>
                    <Fade in>
                        <TextField
                            autoFocus
                            color={
                                !this.state.username.length
                                    ? `primary`
                                    : this.state.usernameError
                                    ? `error`
                                    : this.state.usernameLabel === 'Username'
                                    ? `success`
                                    : `primary`
                            }
                            error={this.state.usernameError}
                            variant="outlined"
                            label={this.state.usernameLabel}
                            fullWidth
                            margin="normal"
                            onInput={this.updateUsername}
                            value={this.state.username}
                        />
                    </Fade>
                    <Fade
                        in={this.state.usernameLabel === 'Username' && !!this.state.username.length}
                    >
                        <TextField
                            color={
                                !this.state.gameCode.length
                                    ? `primary`
                                    : this.state.gameCodeError
                                    ? `error`
                                    : this.state.gameCodeLabel === 'Game Code'
                                    ? `success`
                                    : `primary`
                            }
                            error={this.state.gameCodeError}
                            variant="outlined"
                            label={this.state.gameCodeLabel}
                            fullWidth
                            margin="normal"
                            onInput={this.updateCode}
                            value={this.state.gameCode}
                        />
                    </Fade>
                    <Fade
                        in={
                            this.state.usernameLabel === 'Username' &&
                            this.state.gameCodeLabel === 'Game Code' &&
                            !!this.state.username.length &&
                            !!this.state.gameCode.length
                        }
                    >
                        <Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <GoButton onClick={this.joinGame}>Join Game</GoButton>
                                <Tooltip title="Coming Soon™" placement="top" arrow>
                                    <span>
                                        <GoButton
                                            style={{ pointerEvents: 'none' }}
                                            onClick={this.createGame}
                                        >
                                            Create Game
                                        </GoButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                            <Fade in={this.state.loading}>
                                <LinearProgress style={{ marginTop: '10px' }} />
                            </Fade>
                        </Stack>
                    </Fade>
                </Stack>
            </Container>
        );
    }
}

export default JoinGame;
