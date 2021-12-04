import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Box, Button, Divider, Paper, Stack, Tooltip, Typography } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InfoIcon from '@mui/icons-material/Info';
import { Socket } from 'socket.io-client';
import { LinearProgress } from '@mui/material';
import colourGradient from '../../../helpers/colourGradient';

interface TimePeriodAndDuration {
    name: string;
    toolTip: string;
    maxDuration: number;
    day: number;
}

const UPDATE_INTERVAL = 300;

const GameInfo = ({ socket, exitCallback }: { socket: Socket; exitCallback: Function }) => {
    const [timePeriod, setTimePeriod]: [
        TimePeriodAndDuration,
        Dispatch<SetStateAction<TimePeriodAndDuration>>,
    ] = useState({
        name: 'Connecting',
        toolTip: 'Connecting to the Mafia Servers',
        maxDuration: -1,
    } as TimePeriodAndDuration);
    const [timeRemaining, setTimeRemaining] = useState(-1);

    const confirmLeaveGame = () => {
        const actuallyLeave = window.confirm('Do you really want to leave?');
        if (actuallyLeave) {
            socket.emit('intentionalDisconnect');
            exitCallback();
        }
    };

    useEffect(() => {
        socket.on('connect', () => {
            setTimePeriod({
                name: 'Loading',
                toolTip: 'Getting Data From Server',
                maxDuration: -1,
                day: -1,
            } as TimePeriodAndDuration);

            // setTimeout(() => {
            //     setTimePeriod({
            //         name: 'Pre-Game',
            //         toolTip: 'Waiting for host to start lobby',
            //         maxDuration: 10,
            //         day: -1,
            //     });
            //     setTimeRemaining(10);
            // }, 1000);
        });
        socket.on(
            'timePeriodUpdate',
            (
                {
                    name,
                    description,
                    durationSeconds,
                }: {
                    name: string;
                    description: string;
                    durationSeconds: number;
                },
                timeLeft: number,
                day: number,
            ) => {
                setTimePeriod({
                    name,
                    toolTip: description,
                    maxDuration: timeLeft,
                    day,
                });
                setTimeRemaining(durationSeconds);
            },
        );
        socket.on('disconnect', () => {
            setTimePeriod({
                name: `${timePeriod.name} (Disconnected)`,
                toolTip: 'Disconnected From The Server',
                maxDuration: -1,
            } as TimePeriodAndDuration);
        });
        return () => {
            socket.off('timePeriodUpdate');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, [socket, timePeriod.name]);

    // decrementing time
    useEffect(() => {
        const myInterval = setInterval(() => {
            if (timeRemaining > 0) {
                setTimeRemaining(timeRemaining - 1 * (UPDATE_INTERVAL / 1000));
            }
        }, UPDATE_INTERVAL);
        return () => {
            clearInterval(myInterval);
        };
    }, [timeRemaining]);

    const calculateProgressBar = (): [number, string] => {
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
    };

    const gamePeriodShower = (): JSX.Element => {
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
    };

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
