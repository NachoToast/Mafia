import { MouseEvent, useEffect } from 'react';
import { Fade, Container, Stack, Typography, LinearProgress } from '@mui/material';
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
} from '../../redux/slices/basicInfoSlice';
import CustomButtonBase from './Buttons/CustomButtonBase';
import { findGame } from '../../actions';

const MenuScreen = () => {
    const dispatch = useDispatch();
    const username = useSelector(getUsername);
    const tokenExpired = useSelector(getTokenExpired);
    const gameCode = useSelector(getGameCode);

    const { subtitle, subtitleColour, usernameLabel, gameCodeLabel, loading } =
        useSelector(getJoinScreenData);

    const usernameValid = !!username.length && !usernameLabel;
    const gameCodeValid = !!gameCode.length && !gameCodeLabel;

    async function joinGame(event: MouseEvent<Element> | KeyboardEvent): Promise<void> {
        event.preventDefault();
        dispatch(setLoading(true));

        const { status, data } = await findGame(username, gameCode);
        dispatch(setLoading(false));
        if (status === 200) {
            dispatch(setSubtitle({ subtitle: undefined, subtitleColour: undefined }));
            dispatch(setToken(data));
        } else {
            dispatch(setSubtitle({ subtitle: data, subtitleColour: 'lightcoral' }));
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
                <Fade in={usernameValid && gameCodeValid}>
                    <Stack>
                        <Stack direction="row" justifyContent="space-between">
                            <CustomButtonBase content={'Join Game'} onClick={joinGame} />
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
