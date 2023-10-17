import { FC, useContext, useEffect, useState } from 'react';
import { PostRootResponse } from '../../../shared/Responses';
import { ServerConnectionStatus, ServerContext } from '../contexts/Server';

const Console: FC = () => {
    const { serverState } = useContext(ServerContext);

    const [data, setData] = useState<PostRootResponse>();
    const [ping, setPing] = useState<number>(0);

    useEffect(() => {
        if (serverState.connectionStatus === ServerConnectionStatus.Connected) {
            setData(serverState.data);

            const ping =
                new Date(serverState.receivedAt).getTime() -
                new Date(serverState.sentAt).getTime();
            setPing(ping);
        }
    }, [
        serverState.connectionStatus,
        serverState.data,
        serverState.receivedAt,
        serverState.sentAt,
    ]);

    if (data === undefined) return <></>;

    return (
        <div
            key={0}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                color: '#373737',
                padding: '0.2em',
                fontSize: '20px',
            }}
            className="fade-in"
        >
            Ping {ping}ms <br />
            {data.numGames} Games
            <br />
            {data.numUsersActive}|{data.numUsersTotal} Users
            <br />
        </div>
    );
};

export default Console;
