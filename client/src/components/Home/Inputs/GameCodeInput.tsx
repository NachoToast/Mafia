import { TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import StoreState from '../../../redux/state';
import { FormEvent, useEffect } from 'react';
import { getGameCode, setGameCode, setGameCodeLabel } from '../../../redux/slices/basicInfoSlice';

const gameCodeValidator = new RegExp(/^[a-zA-Z]+$/);

const GameCodeInput = () => {
    const dispatch = useDispatch();
    const gameCode = useSelector(getGameCode);

    const gameCodeLabel = useSelector(
        (state: StoreState) => state.basicInfo.joinScreenData.gameCodeLabel,
    );

    function getColour() {
        if (!gameCode.length) return 'primary';
        if (gameCodeLabel) return 'error';
        return 'success';
    }

    function onInput(e: FormEvent<HTMLDivElement>) {
        e.preventDefault();
        const { value } = e.target as HTMLInputElement;
        validateGameCode(value);
    }

    function validateGameCode(gameCode: string) {
        if (!gameCode) {
            dispatch(setGameCodeLabel(undefined));
        } else if (!gameCodeValidator.test(gameCode)) {
            dispatch(setGameCodeLabel('Invalid Game Code'));
        } else if (gameCode.length < 3) {
            dispatch(setGameCodeLabel('Too Short'));
        } else if (gameCode.length > 5) {
            dispatch(setGameCodeLabel('Too Long'));
        } else {
            dispatch(setGameCodeLabel(undefined));
        }
        dispatch(setGameCode(gameCode));
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const urlGameCode = queryParams.get('game');
        if (urlGameCode) {
            dispatch(setGameCode(urlGameCode));
        }
        validateGameCode(urlGameCode || gameCode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const color = getColour();

    return (
        <TextField
            color={color}
            error={color !== 'success'}
            variant="outlined"
            label={gameCodeLabel || 'Game Code'}
            fullWidth
            margin="normal"
            value={gameCode}
            onInput={onInput}
        ></TextField>
    );
};

export default GameCodeInput;
