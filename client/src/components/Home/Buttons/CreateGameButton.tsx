import { Tooltip } from '@mui/material';
import CustomButtonBase from './CustomButtonBase';

const CreateGameButton = () => {
    return (
        <Tooltip title="Coming Soon™" placement="top" arrow>
            <span>
                <CustomButtonBase style={{ pointerEvents: 'none' }} content={'Create Game'} />
            </span>
        </Tooltip>
    );
};

export default CreateGameButton;
