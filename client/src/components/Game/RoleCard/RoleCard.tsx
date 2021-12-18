import { Divider, Paper, Stack, Typography } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleInfo, setRoleInfo } from '../../../redux/slices/gameSlice';
import { RoleCardInfo } from '../../../types/Player';
import mafiaSocket from '../../../utils/socket';

const RoleCard = () => {
    console.log('re rendering role card');
    const dispatch = useDispatch();
    const { name, description, alignmentPrimary, attackPower, defencePower } =
        useSelector(getRoleInfo);

    const updateRoleInfo = useCallback(
        (newInfo: RoleCardInfo) => {
            dispatch(setRoleInfo(newInfo));
        },
        [dispatch],
    );

    useEffect(() => {
        mafiaSocket.on('roleInfo', updateRoleInfo);
        return () => {
            mafiaSocket.off('roleInfo', updateRoleInfo);
        };
    }, [updateRoleInfo]);

    return (
        <Paper
            elevation={24}
            square
            style={{ boxShadow: 'none', flexGrow: 1, display: 'flex', padding: '3px' }}
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
                <Typography align="center" variant="h4" gutterBottom={!alignmentPrimary}>
                    {name}
                </Typography>
                {alignmentPrimary && (
                    <Typography align="center" variant="subtitle1" gutterBottom>
                        {alignmentPrimary || 'No Alignment'}
                    </Typography>
                )}
                <Typography variant="body1">{description}</Typography>
                <Stack
                    direction="row"
                    justifyContent="space-around"
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    {attackPower && (
                        <Typography variant="body1">Attack Power: {attackPower}</Typography>
                    )}
                    {defencePower && (
                        <Typography variant="body1">Defence Power: {defencePower}</Typography>
                    )}
                </Stack>
            </Paper>
        </Paper>
    );
};

export default RoleCard;
