import { MouseEvent, useEffect } from 'react';
import {
    Fade,
    Container,
    Stack,
    Typography,
    LinearProgress,
    CircularProgress,
} from '@mui/material';
import { STORAGE } from '../../constants/localStorageVariables';
import GameCodeInput from './Inputs/GameCodeInput';
import CreateGameButton from './Buttons/CreateGameButton';
import UsernameInput from './Inputs/UsernameInput';
import { useDispatch, useSelector } from 'react-redux';
import {
    getUsername,
    getGameCode,
    getJoinScreenData,
    getTokenExpired,
    setLoading,
    setSubtitle,
    setToken,
    getNumGames,
    getConnectedToServers,
    setConnectedToServers,
    setNumGames,
} from '../../redux/slices/basicInfoSlice';
import JoinGameButton from './Buttons/CustomButtonBase';
import { countGames, findGame } from '../../actions';

const COUNT_INTERVAL = 1000;

const MenuScreen = () => {
    const dispatch = useDispatch();
    const username = useSelector(getUsername);
    const tokenExpired = useSelector(getTokenExpired);
    const gameCode = useSelector(getGameCode);
    const numGames = useSelector(getNumGames);
    const connectedToServers = useSelector(getConnectedToServers);

    const { subtitle, subtitleColour, usernameLabel, gameCodeLabel, loading } =
        useSelector(getJoinScreenData);

    const usernameValid = !!username.length && !usernameLabel;
    const gameCodeValid = !!gameCode.length && !gameCodeLabel;

    async function joinGame(event: MouseEvent<Element> | KeyboardEvent): Promise<void> {
        event.preventDefault();
        dispatch(setLoading(true));

        const { status, data } = await findGame(username, gameCode);

        dispatch(setLoading(false));

        switch (status) {
            case 200:
                if (!connectedToServers) dispatch(setConnectedToServers(true));
                dispatch(setSubtitle({ subtitle: undefined, subtitleColour: undefined }));
                dispatch(setToken(data));
                break;
            case 404:
                dispatch(setConnectedToServers(false));
                break; // this can fall through but I can't seem to suppress the TS warning
            default:
                console.log(status, data);
                dispatch(setSubtitle({ subtitle: data, subtitleColour: 'lightcoral' }));
                break;
        }
    }

    // remove expired token (only local storage, not state) on page load
    useEffect(() => {
        if (tokenExpired) {
            localStorage.removeItem(STORAGE.hadExpiredTokenKeyName);
            dispatch(setToken(''));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function onEnter(e: KeyboardEvent): void {
        if (e.key === 'Enter' && usernameValid && gameCodeValid) {
            joinGame(e);
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', onEnter);

        return () => {
            window.removeEventListener('keydown', onEnter);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [usernameValid, gameCodeValid]);

    // game count getting
    useEffect(() => {
        const updateGameInterval = setInterval(async () => {
            const { status, data } = await countGames();

            switch (status) {
                case 200:
                    if (!connectedToServers) {
                        dispatch(setConnectedToServers(true));
                        if (subtitle === 'Failed to Connect to the Mafia Servers') {
                            dispatch(
                                setSubtitle({ subtitle: undefined, subtitleColour: undefined }),
                            );
                        }
                    }
                    dispatch(setNumGames(data as number));
                    break;
                case 404:
                    dispatch(setConnectedToServers(false));
                    break; // this can fall through but I can't seem to suppress the TS warning
                default:
                    console.log(status, data);
                    dispatch(setNumGames(-1));
                    dispatch(
                        setSubtitle({ subtitle: data as string, subtitleColour: 'lightcoral' }),
                    );
                    break;
            }
        }, COUNT_INTERVAL);
        return () => {
            clearInterval(updateGameInterval);
        };
    }, [dispatch, connectedToServers, subtitle]);

    return (
        <Container>
            <Stack spacing={3} marginTop={5}>
                <Typography variant="h2" align="center" letterSpacing={1}>
                    Mafia
                </Typography>
                <Typography
                    variant="body1"
                    align="center"
                    sx={{ color: tokenExpired ? 'lightcoral' : subtitleColour }}
                >
                    {tokenExpired ? 'Token Expired' : subtitle || 'By NachoToast'}
                </Typography>
                <UsernameInput />
                <Fade in={usernameValid}>
                    <span>
                        <GameCodeInput />
                    </span>
                </Fade>
                <Fade in={usernameValid && gameCodeValid && connectedToServers}>
                    <Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <JoinGameButton content={'Join Game'} onClick={joinGame} />
                            {numGames >= 0 && (
                                <Typography alignSelf="center">
                                    {numGames || 'No'} Active Game{numGames > 1 ? 's' : ''}
                                </Typography>
                            )}
                            <CreateGameButton />
                        </Stack>
                        <Fade in={loading}>
                            <LinearProgress style={{ marginTop: '20px' }} />
                        </Fade>
                    </Stack>
                </Fade>
            </Stack>
        </Container>
    );
};

export default MenuScreen;
