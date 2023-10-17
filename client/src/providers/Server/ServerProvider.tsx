import { PostRootResponse } from '@shared';
import {
    FC,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    IServerContext,
    ServerConnectionStatus,
    ServerContext,
    ServerControllers,
    ServerState,
} from '../../contexts/Server';
import { SettingsContext } from '../../contexts/Settings';
import {
    getRatelimitHeaders,
    handleFetchError,
    isAbortError,
    makeRateLimitHeaders,
    typedFetch,
} from '../../util';

const ServerContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [serverState, setServerState] = useState<ServerState>({
        connectionStatus: ServerConnectionStatus.Initial,
        data: null,
        rateLimitBypassed: null,
        sentAt: null,
        receivedAt: null,
    });

    const [lastController, setLastController] = useState<AbortController>();

    const { settings } = useContext(SettingsContext);

    const connect = useCallback<ServerControllers['connect']>(
        async (controller, assumeAlreadyConnected) => {
            const sentAt = new Date().toISOString();

            if (!assumeAlreadyConnected) {
                setServerState({
                    connectionStatus: ServerConnectionStatus.Connecting,
                    data: null,
                    rateLimitBypassed: null,
                    sentAt,
                    receivedAt: null,
                });
            }

            setLastController(controller);
            try {
                const { data, response } = await typedFetch<PostRootResponse>(
                    settings.serverUrl,
                    {
                        method: 'POST',
                        signal: controller?.signal,
                        headers: makeRateLimitHeaders(
                            settings.rateLimitBypassToken,
                        ),
                    },
                );

                setServerState({
                    connectionStatus: ServerConnectionStatus.Connected,
                    data,
                    rateLimitBypassed: getRatelimitHeaders(response).bypassed,
                    sentAt,
                    receivedAt: new Date().toISOString(),
                });
            } catch (error) {
                if (isAbortError(error)) return;

                setServerState({
                    connectionStatus: ServerConnectionStatus.Errored,
                    data: await handleFetchError(error),
                    rateLimitBypassed: null,
                    sentAt: null,
                    receivedAt: null,
                });
            }
        },
        [settings.rateLimitBypassToken, settings.serverUrl],
    );

    const reset = useCallback<ServerControllers['reset']>(() => {
        lastController?.abort();
        setServerState({
            connectionStatus: ServerConnectionStatus.Initial,
            data: null,
            rateLimitBypassed: null,
            sentAt: null,
            receivedAt: null,
        });
    }, [lastController]);

    useEffect(() => {
        const controller = new AbortController();

        void connect(controller);

        return () => {
            controller.abort();
        };
    }, [connect, settings.serverUrl]);

    const serverContextProvider = useMemo<IServerContext>(
        () => ({
            serverState,
            serverControllers: { connect, reset },
        }),
        [connect, reset, serverState],
    );

    return (
        <ServerContext.Provider value={serverContextProvider}>
            {children}
        </ServerContext.Provider>
    );
};

export default ServerContextProvider;
