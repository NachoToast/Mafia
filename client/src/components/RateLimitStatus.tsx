import { FC, useContext, useEffect, useState } from 'react';
import { ServerConnectionStatus, ServerContext } from '../contexts/Server';
import { SettingsContext } from '../contexts/Settings';

/**
 * A component which displays the current rate
 * limit bypass status as a single span element.
 */
const RateLimitStatus: FC = () => {
    const { settings } = useContext(SettingsContext);
    const { serverState } = useContext(ServerContext);

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

    if (
        settings.rateLimitBypassToken === '' ||
        serverState.rateLimitBypassed === null
    ) {
        return (
            <span key={0} className="fade-in">
                No token specified.
            </span>
        );
    }

    if (serverState.connectionStatus === ServerConnectionStatus.Connecting) {
        return (
            <span key={1} className="fade-in">
                Checking{'.'.repeat(1 + (timeElapsed % 3))}
            </span>
        );
    }

    if (serverState.connectionStatus !== ServerConnectionStatus.Connected) {
        return (
            <span key={2} className="fade-in">
                Set a valid server URL first.
            </span>
        );
    }

    if (serverState.rateLimitBypassed) {
        return (
            <span
                key={3}
                className="fade-in"
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
                Token accepte
                <span
                    className="flicker-slow"
                    style={{ animationDelay: '0.5s' }}
                >
                    d
                </span>
                .
            </span>
        );
    }

    return (
        <span key={4} className="fade-in" style={{ color: 'red' }}>
            Invalid token.
        </span>
    );
};

export default RateLimitStatus;
