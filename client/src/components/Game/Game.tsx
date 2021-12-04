import { Grid, Stack } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGameCode, getToken, getUsername, setSubtitle } from '../../redux/slices/basicInfoSlice';
import {
    clearGameData,
    getConnected,
    getWantsToLeave,
    getWasConnected,
    setConnected,
} from '../../redux/slices/gameSlice';
import mafiaSocket from '../../utils/socket';
import ChatBox from './Chat/ChatBox';
import GameInfo from './GameInfo/GameInfo';
import DisconnectedModal from './Modals/DisconnectedModal';
import RoleCard from './RoleCard/RoleCard';
import RoleList from './RoleList/RoleList';
import PlayerList from './PlayerList/PlayerList';
import LeaveGameModal from './Modals/LeaveGameModal';

const Game = () => {
    const dispatch = useDispatch();

    const gameCode = useSelector(getGameCode);
    const username = useSelector(getUsername);
    const token = useSelector(getToken);

    const connected = useSelector(getConnected);
    const wasConnected = useSelector(getWasConnected);

    const wantsToLeave = useSelector(getWantsToLeave);

    function unregisteredHandler(): void {
        dispatch(setSubtitle({ subtitle: 'Unauthenticated', subtitleColour: 'lightcoral' }));
    }

    function connectedHandler(): void {
        dispatch(setConnected(true));
    }

    function disconnectedHandler(): void {
        dispatch(setConnected(false));
    }

    useEffect(() => {
        if (!mafiaSocket.connected) {
            mafiaSocket.connect(gameCode, token, username);
            mafiaSocket.on('connected', connectedHandler);
            mafiaSocket.on('unregistered', unregisteredHandler);
            mafiaSocket.on('disconnected', disconnectedHandler);
        }

        return () => {
            mafiaSocket.off('disconnected', disconnectedHandler);
            mafiaSocket.off('unregistered', unregisteredHandler);
            mafiaSocket.off('connected', connectedHandler);
            mafiaSocket.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, gameCode, token, username]);

    return (
        <>
            {wantsToLeave && <LeaveGameModal />}
            {!connected && wasConnected && <DisconnectedModal />}
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
        </>
    );
};

export default Game;
