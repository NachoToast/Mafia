import { useEffect } from 'react';
import { Box, Button, Divider, Paper, Stack, Tooltip, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InfoIcon from '@mui/icons-material/Info';
import { LinearProgress } from '@mui/material';
import colourGradient from '../../../utils/colourGradient';
import mafiaSocket from '../../../utils/socket';
import { useDispatch, useSelector } from 'react-redux';
import {
    getTimePeriod,
    getTimeRemaining,
    setTimePeriod,
    setTimeRemaining,
    setWantsToLeave,
} from '../../../redux/slices/gameSlice';
import TimePeriod from '../../../types/TimePeriod';

const UPDATE_INTERVAL = 300;

const GameInfo = () => {
    const dispatch = useDispatch();

    const timePeriod = useSelector(getTimePeriod);
    const timeRemaining = useSelector(getTimeRemaining);

    function confirmLeaveGame(): void {
        dispatch(setWantsToLeave(true));
    }

    function timePeriodHandler(timePeriod: TimePeriod): void {
        dispatch(setTimePeriod(timePeriod));
    }

    function timeRemainingHandler(time: number): void {
        dispatch(setTimeRemaining(time));
    }

    useEffect(() => {
        mafiaSocket.on('timePeriodUpdate', timePeriodHandler);
        mafiaSocket.on('timeRemainingUpdate', timeRemainingHandler);

        return () => {
            mafiaSocket.off('timePeriodUpdate', timePeriodHandler);
            mafiaSocket.off('timeRemainingUpdate', timeRemainingHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // decrementing time
    useEffect(() => {
        const decrementTimeInterval = setInterval(() => {
            if (timeRemaining > 0) {
                dispatch(setTimeRemaining(timeRemaining - 1 * (UPDATE_INTERVAL / 1000)));
            }
        }, UPDATE_INTERVAL);
        return () => {
            clearInterval(decrementTimeInterval);
        };
    }, [dispatch, timeRemaining]);

    function calculateProgressBar(): [number, string] {
        const percent = Math.ceil((100 * timeRemaining) / timePeriod.maxDuration);
        const { red, green, blue } = colourGradient(
            0,
            timePeriod.maxDuration,
            timePeriod.maxDuration - timeRemaining,
            { red: 144, green: 238, blue: 144 },
            { red: 255, green: 214, blue: 0 },
            { red: 240, green: 128, blue: 128 },
        );
        return [Math.min(100 - percent, 100), `rgb(${red}, ${green}, ${blue})`];
    }

    function gamePeriodShower(): JSX.Element {
        switch (timePeriod.name) {
            case 'Connecting':
                return <LinearProgress style={{ width: '100%' }} />;
            case 'Loading':
                return <LinearProgress style={{ width: '100%' }} />;
            default:
                const [value, color] = calculateProgressBar();
                if (timePeriod.maxDuration > 0) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress variant="determinate" value={value} />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                                <Typography variant="body2" color={color}>
                                    {Math.ceil(timeRemaining)}s
                                </Typography>
                            </Box>
                        </Box>
                    );
                } else {
                    return (
                        <LinearProgress
                            variant="determinate"
                            value={100}
                            style={{ width: '100%' }}
                        />
                    );
                }
        }
    }

    return (
        <Paper
            elevation={24}
            square
            style={{
                boxShadow: 'none',
                flexGrow: 1,
                display: 'flex',
                padding: '3px',
            }}
        >
            <Paper
                style={{
                    boxShadow: 'none',
                    height: '100%',
                    width: '100%',
                    padding: '5px',
                    display: 'flex',
                    flexFlow: 'column nowrap',
                }}
                square
                elevation={4}
            >
                <Tooltip title={timePeriod.toolTip}>
                    <Typography
                        variant="h5"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                        gutterBottom
                    >
                        {timePeriod.day > 0 && `Day ${timePeriod.day} - `}
                        {timePeriod.name}
                    </Typography>
                </Tooltip>
                {gamePeriodShower()}
                <Divider flexItem />
                <div style={{ flexGrow: 1 }}></div>
                <Stack direction="row" style={{ width: '100%' }}>
                    <Tooltip arrow title="Leave Game">
                        <Button
                            style={{
                                flexGrow: 1,
                            }}
                            onClick={confirmLeaveGame}
                        >
                            <ExitToAppIcon color="action" />
                        </Button>
                    </Tooltip>
                    <Tooltip arrow title="Settings">
                        <Button style={{ flexGrow: 1 }}>
                            <SettingsIcon color="action" />
                        </Button>
                    </Tooltip>
                    <Tooltip arrow title="Lobby Info">
                        <Button style={{ flexGrow: 1 }}>
                            <InfoIcon color="action" />
                        </Button>
                    </Tooltip>
                </Stack>
            </Paper>
        </Paper>
    );
};

export default GameInfo;
