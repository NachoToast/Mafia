import { Paper, Stack, Divider, Fade } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChatMessage, getChatMessages } from '../../../redux/slices/gameSlice';
import ChatMessageInterface from '../../../types/ChatMessage';
import mafiaSocket from '../../../utils/socket';
import ChatComposer from './ChatComposer';
import ChatMessage from './ChatMessage';

const ChatBox = () => {
    const dispatch = useDispatch();
    const messages = useSelector(getChatMessages);

    function newMessageHandler(message: ChatMessageInterface): void {
        dispatch(addChatMessage(message));
    }

    useEffect(() => {
        mafiaSocket.on('chatMessage', newMessageHandler);

        return () => {
            mafiaSocket.off('chatMessage', newMessageHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Paper
            style={{
                height: '100%',
                display: 'flex',
                flexFlow: 'column-reverse',
                boxShadow: 'none',
                paddingTop: '3px',
            }}
            elevation={24}
            square
        >
            <ChatComposer />
            <Stack
                style={{ overflowY: 'auto', padding: '10px 0 0px 0' }}
                spacing={0.75}
                flexDirection="column-reverse"
                divider={
                    <Fade in>
                        <Divider flexItem />
                    </Fade>
                }
            >
                <Divider flexItem style={{ visibility: 'hidden' }} />
                {messages.map((e) => (
                    <ChatMessage key={e.id} message={e} />
                ))}
            </Stack>
        </Paper>
    );
};

export default ChatBox;
