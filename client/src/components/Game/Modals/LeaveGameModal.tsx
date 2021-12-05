import { Fade, Typography, Modal, Button } from '@mui/material';
import { Box } from '@mui/system';
import { useDispatch } from 'react-redux';
import { setToken } from '../../../redux/slices/basicInfoSlice';
import { clearGameData, setWantsToLeave } from '../../../redux/slices/gameSlice';
import mafiaSocket from '../../../utils/socket';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid gray',
    p: 4,
};

const LeaveGameModal = () => {
    const dispatch = useDispatch();

    function cancelLeave(): void {
        dispatch(setWantsToLeave(false));
    }

    function confirmLeave(): void {
        dispatch(setWantsToLeave(false));
        dispatch(clearGameData(undefined));
        mafiaSocket.disconnect(true);
        dispatch(setToken(''));
    }

    return (
        <div>
            <Modal
                open={true}
                onClose={cancelLeave}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                closeAfterTransition
            >
                <Fade in>
                    <Box sx={style}>
                        <Typography
                            id="modal-modal-title"
                            variant="h6"
                            component="h2"
                            textAlign="center"
                        >
                            Leaving Game
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Are you sure you want to leave?
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
                                color="error"
                                onClick={(event) => {
                                    event.preventDefault();
                                    confirmLeave();
                                }}
                            >
                                Confirm
                            </Button>
                            <Button
                                onClick={(event) => {
                                    event.preventDefault();
                                    cancelLeave();
                                }}
                                color="success"
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
};

export default LeaveGameModal;
