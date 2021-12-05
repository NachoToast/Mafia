import { Fade, Typography, Modal, Button } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSubtitle, setToken } from '../../../redux/slices/basicInfoSlice';
import { clearGameData } from '../../../redux/slices/gameSlice';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid gray',
    p: 4,
};

const DisconnectedModal = () => {
    const dispatch = useDispatch();

    const [open, setOpen] = useState(true);

    function handleClose(
        action: 'exitToLobby' | 'justClose',
        closeType: 'backdropClick' | 'escapeKeyDown' | 'buttonPress',
    ): void {
        if (closeType === 'backdropClick') return;
        setOpen(false);
        if (action === 'exitToLobby') {
            dispatch(setSubtitle({ subtitle: undefined, subtitleColour: undefined }));
            dispatch(clearGameData(undefined));
            dispatch(setToken(''));
        }
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={(_, type) => handleClose('justClose', type)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                closeAfterTransition
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <Typography
                            id="modal-modal-title"
                            variant="h6"
                            component="h2"
                            textAlign="center"
                        >
                            Disconnected
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Lost Connection to the Mafia Servers
                        </Typography>
                        <Box
                            sx={{ mt: 2, mb: -2 }}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}
                        >
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleClose('exitToLobby', 'buttonPress');
                                }}
                            >
                                Exit To Lobby
                            </Button>
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleClose('justClose', 'buttonPress');
                                }}
                            >
                                Close
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
};

export default DisconnectedModal;
