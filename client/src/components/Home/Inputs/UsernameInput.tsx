import { Fade, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StoreState from '../../../redux/state';
import { FormEvent, useEffect } from 'react';
import { getUsername, setUsername, setUsernameLabel } from '../../../redux/slices/basicInfoSlice';

const usernameValidator = new RegExp(/^[a-zA-Z0-9 ]+$/);

const UsernameInput = () => {
    const dispatch = useDispatch();
    const username = useSelector(getUsername);

    const usernameLabel = useSelector(
        (state: StoreState) => state.basicInfo.joinScreenData.usernameLabel,
    );

    function getColour(): 'primary' | 'error' | 'success' {
        if (!username.length) return 'primary';
        if (usernameLabel) return 'error';
        return 'success';
    }

    function onInput(event: FormEvent<HTMLDivElement>): void {
        event.preventDefault();
        const { value } = event.target as HTMLInputElement;
        validateUsername(value);
    }

    function validateUsername(username: string): void {
        if (!username) {
            dispatch(setUsernameLabel(undefined));
        } else if (!usernameValidator.test(username)) {
            dispatch(setUsernameLabel('Invalid'));
        } else if (username.length < 3) {
            dispatch(setUsernameLabel('Too Short'));
        } else if (username.length > 22) {
            dispatch(setUsernameLabel('Too Long'));
        } else {
            dispatch(setUsernameLabel(undefined));
        }
        dispatch(setUsername(username));
    }

    useEffect(() => {
        validateUsername(username);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const color = getColour();

    return (
        <Fade in>
            <TextField
                autoFocus={true}
                color={color}
                error={color !== 'success'}
                variant="outlined"
                label={usernameLabel || 'Username'}
                fullWidth
                margin="normal"
                value={username}
                onInput={onInput}
            ></TextField>
        </Fade>
    );
};

export default UsernameInput;
