import React from 'react';
import {
    Box,
    Button,
    Card,
    Divider,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import InfoIcon from '@mui/icons-material/Info';

const GameInfo = () => {
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
                <Typography
                    variant="h5"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                    gutterBottom
                >
                    Info
                </Typography>
                <Divider flexItem />
                <div style={{ flexGrow: 1 }}></div>
                {/* <Typography
                    variant="h5"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    Game info
                </Typography>
                <Divider flexItem style={{ margin: '10px 0 5px 0' }} />
                <Stack
                    spacing={0.75}
                    divider={<Divider flexItem />}
                    style={{ overflowY: 'auto', maxHeight: '80%' }}
                >
                    pog pog pogu
                </Stack> */}
                <Stack direction="row" style={{ width: '100%' }}>
                    <Tooltip arrow title="Leave Game">
                        <Button
                            style={{
                                flexGrow: 1,
                            }}
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
