import React, { Component, FormEvent, MouseEvent } from 'react';
import { Fade, Container, Stack, Typography, LinearProgress } from '@mui/material';
import JoinGameButton from './Buttons/JoinGame';
import { STORAGE } from '../../constants/localStorageVariables';

import GameCodeInput from './Inputs/GameCode';
import CreateGameButton from './Buttons/CreateGame';
import UsernameInput from './Inputs/Username';
import { countGames, findGame } from '../../actions';

export const usernameValidator = new RegExp(/^[a-zA-Z0-9 ]+$/);
// usernames should be between 2 and 22 (inclusive) characters long
const gameCodeValidator = new RegExp(/^[a-zA-Z]+$/);
// game codes should be between 3 and 5 (inclusive) characters long

interface JoinGameProps {
    render: Function;
}

export interface GameStateInput {
    value: string;
    label: string;
    error: boolean;
}

type SubTitleColour = 'lightcoral' | 'aquamarine' | 'white';

interface JoinGameState {
    username: GameStateInput;
    gameCode: GameStateInput;
    loading: boolean;
    subtitle: string;
    subtitleColour: SubTitleColour;
    numGames: number;
}

export class JoinGame extends Component<JoinGameProps> {
    private static Subtitle(text: string, color: SubTitleColour) {
        return (
            <Typography variant="body1" align="center" sx={{ fontStyle: 'italic', color }}>
                {text}
            </Typography>
        );
    }

    public state: JoinGameState = {
        username: {
            value: localStorage.getItem(STORAGE.usernameKeyName) || '',
            label: 'Username',
            error: false,
        },
        gameCode: {
            value: localStorage.getItem(STORAGE.gameCodeKeyName) || '',
            label: 'Game Code',
            error: false,
        },
        subtitle: 'By NachoToast',
        subtitleColour: 'white',
        loading: false,
        numGames: 0,
    };

    private enterEvent(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.buttonsAreVisible()) {
            this.joinGame(event);
        }
    }

    public constructor(props: JoinGameProps) {
        super(props);

        this.updateUsername = this.updateUsername.bind(this);
        this.validateUsername = this.validateUsername.bind(this);

        this.updateGameCode = this.updateGameCode.bind(this);
        this.validateGameCode = this.validateGameCode.bind(this);

        this.getGameCount = this.getGameCount.bind(this);
        this.joinGame = this.joinGame.bind(this);

        this.enterEvent = this.enterEvent.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    public componentDidMount() {
        this.validateUsername(this.state.username.value);
        this.validateGameCode(this.state.gameCode.value);
        this.getGameCount();

        window.addEventListener('keydown', this.enterEvent);

        if (!!localStorage.getItem(STORAGE.hadExpiredTokenKeyName)) {
            this.setState({ subtitle: 'Token Expired' });
            this.setState({ subtitleColour: 'lightcoral' });
            localStorage.removeItem(STORAGE.hadExpiredTokenKeyName);
        }

        setInterval(this.getGameCount, 10000);
    }

    private updateUsername(event: FormEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement;
        localStorage.setItem(STORAGE.usernameKeyName, value);
        this.validateUsername(value);
    }

    private validateUsername(username: string) {
        let error: boolean, label: string;
        if (username.length < 1) {
            error = false;
            label = 'Username';
        } else if (!usernameValidator.test(username)) {
            error = true;
            label = 'Invalid Username';
        } else if (username.length < 3) {
            error = false;
            label = 'Too Short';
        } else if (username.length > 22) {
            error = true;
            label = 'Too Long';
        } else {
            error = false;
            label = 'Username';
        }
        const newUsernameState: GameStateInput = { value: username, error, label };
        this.setState({ username: newUsernameState } as JoinGameState);
    }

    private updateGameCode(event: FormEvent<HTMLInputElement>) {
        const { value } = event.target as HTMLInputElement;
        localStorage.setItem(STORAGE.gameCodeKeyName, value);
        this.validateGameCode(value);
    }

    private validateGameCode(gameCode: string) {
        let error: boolean, label: string;
        if (gameCode.length < 1) {
            error = false;
            label = 'Game Code';
        } else if (!gameCodeValidator.test(gameCode)) {
            error = true;
            label = 'Invalid Code';
        } else if (gameCode.length < 3) {
            error = false;
            label = 'Too Short';
        } else if (gameCode.length > 5) {
            error = true;
            label = 'Too Long';
        } else {
            error = false;
            label = 'Game Code';
        }
        const newGameCodeState: GameStateInput = { value: gameCode, error, label };
        this.setState({ gameCode: newGameCodeState } as JoinGameState);
    }

    private async getGameCount() {
        const numGames = await countGames();
        if (numGames !== this.state.numGames) {
            this.setState({ numGames } as JoinGameState);
        }
    }

    private async joinGame(event: MouseEvent<Element> | KeyboardEvent) {
        event.preventDefault();
        this.setState({ loading: true } as JoinGameState);
        let subtitle = 'By NachoToast';
        let subtitleColour: SubTitleColour = 'white';
        let renderAgain = true;
        const response = await findGame(this.state.username.value, this.state.gameCode.value);
        if (response.status === 202) {
            subtitle = 'Joining Game';
            subtitleColour = 'aquamarine';
            renderAgain = false;
            window.removeEventListener('keydown', this.enterEvent);
            this.props.render(response.data);
        } else if (response.status === 200) {
            subtitle = response.data;
            subtitleColour = 'lightcoral';
        } else {
            subtitle = `Received Unknown Response Code: ${response.status} - ${
                response.data || 'Unknown'
            }`;
        }
        if (renderAgain)
            this.setState({ loading: false, subtitle, subtitleColour } as JoinGameState);
    }

    private createGame(event: MouseEvent<Element>) {
        event.preventDefault();
        console.log('creating game!');
    }

    private buttonsAreVisible() {
        return (
            this.state.username.label === 'Username' &&
            this.state.gameCode.label === 'Game Code' &&
            !!this.state.username.value.length &&
            !!this.state.gameCode.value.length
        );
    }

    public render() {
        return (
            <Container>
                <Stack spacing={3} marginTop={5}>
                    <Typography variant="h2" align="center" letterSpacing={1}>
                        Mafia
                    </Typography>
                    {JoinGame.Subtitle(this.state.subtitle, this.state.subtitleColour)}
                    <UsernameInput
                        username={this.state.username}
                        handleInput={this.updateUsername}
                    />
                    <GameCodeInput
                        gameCode={this.state.gameCode}
                        username={this.state.username}
                        handleInput={this.updateGameCode}
                    />
                    <Fade in={this.buttonsAreVisible()}>
                        <Stack>
                            <Stack direction="row" justifyContent="space-between">
                                <JoinGameButton onClick={this.joinGame}>Join Game</JoinGameButton>
                                <Typography alignSelf="center">
                                    {this.state.numGames} Active Games
                                </Typography>
                                <CreateGameButton handleClick={this.createGame} />
                            </Stack>
                            <Fade in={this.state.loading}>
                                <LinearProgress style={{ marginTop: '20px' }} />
                            </Fade>
                        </Stack>
                    </Fade>
                </Stack>
            </Container>
        );
    }
}
export default JoinGame;
