import { Fade, Typography, Modal, Button } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid gray',
    p: 4,
};

const DisconnectedModal = ({
    rerender: exitCallback,
}: {
    rerender: Function;
}) => {
    const [open, setOpen] = useState(true);
    const handleClose = (
        event: {},
        reason: 'backdropClick' | 'escapeKeyDown',
    ) => {
        if (reason !== 'backdropClick') {
            setOpen(false);
        }
    };

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
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
                            sx={{ mt: 2 }}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}
                        >
                            <Button
                                onClick={() => {
                                    handleClose({}, 'escapeKeyDown');
                                    exitCallback();
                                }}
                            >
                                Exit To Lobby
                            </Button>
                            <Button
                                onClick={() => handleClose({}, 'escapeKeyDown')}
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
