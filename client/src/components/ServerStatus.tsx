import { CSSProperties, FC, useContext, useEffect, useState } from 'react';
import { ServerConnectionStatus, ServerContext } from '../contexts/Server';

const spanStyle: CSSProperties = {
    color: 'gray',
};

const marginTop: CSSProperties = {
    marginTop: '1.25em',
};

const takingTooLongThreshold = 5;

/**
 * A component which displays the current server connection status, along with
 * buttons to retry or cancel the connection attempt and relevant error info.
 */
const ServerStatus: FC = () => {
    const { serverState, serverControllers } = useContext(ServerContext);

    const [timeElapsed, setTimeElapsed] = useState(0);

    /**
     * Increment the time elapsed every second
     * when the connection status is 'Connecting'
     */
    useEffect(() => {
        if (
            serverState.connectionStatus !== ServerConnectionStatus.Connecting
        ) {
            return;
        }

        const interval = setInterval(() => {
            setTimeElapsed((timeElapsed) => timeElapsed + 1);
        }, 1000);

        return () => {
            clearInterval(interval);
            setTimeElapsed(0);
        };
    }, [serverState.connectionStatus]);

    if (serverState.connectionStatus === ServerConnectionStatus.Connected) {
        return (
            <div key={0} className="flex-centered fade-in">
                <h2
                    style={{
                        color: '#fffdfd',
                        textShadow: `1px 0 4px #ff5d5d,
                            2px 0 4px #ff5d5d,
                            3px 0 4px #ff5d5d,
                            2px 0 3px #d61616,
                            2px 3px 15px #d61616,
                            2px 0 15px,
                            5px 0 125px,
                            20px 0 200px #d61616,
                            40px 0 200px #d61616`,
                    }}
                >
                    <span className="flicker-slow">C</span>onnected
                </h2>
                <span style={spanStyle}>
                    Successfully connected to the server.
                </span>
                <button
                    style={marginTop}
                    onClick={() => {
                        serverControllers.reset();
                    }}
                >
                    Disconnect
                </button>
            </div>
        );
    }

    if (serverState.connectionStatus === ServerConnectionStatus.Connecting) {
        return (
            <div key={1} className="flex-centered fade-in">
                <h2>
                    Connecting To Server
                    {'.'.repeat(1 + (timeElapsed % 3))}
                </h2>
                <span
                    className="fade-in"
                    style={{
                        ...spanStyle,
                        animationDelay: `${takingTooLongThreshold}s`,
                    }}
                >
                    {timeElapsed}s
                </span>
                <button
                    className="fade-in"
                    style={{
                        ...marginTop,
                        animationDelay: `${takingTooLongThreshold + 0.2}s`,
                    }}
                    onClick={() => {
                        serverControllers.reset();
                    }}
                >
                    Cancel
                </button>
            </div>
        );
    }

    if (serverState.connectionStatus === ServerConnectionStatus.Initial) {
        return (
            <div key={2} className="flex-centered fade-in">
                <h2>Not Connected</h2>
                <span style={spanStyle}>
                    Haven't tried reaching the server yet.
                </span>
                <button
                    style={marginTop}
                    onClick={() => void serverControllers.connect()}
                >
                    Connect
                </button>
            </div>
        );
    }

    const { title, description, additionalData } = serverState.data;

    return (
        <div key={3} className="flex-centered fade-in">
            <h2 style={{ color: 'red' }}>{title}</h2>
            <span style={spanStyle}>{description}</span>
            {!!additionalData && (
                <pre className="error-data" style={marginTop}>
                    {JSON.stringify(additionalData, undefined, 4)}
                </pre>
            )}
            <button
                style={marginTop}
                onClick={() => void serverControllers.connect()}
            >
                Retry
            </button>
        </div>
    );
};

export default ServerStatus;
