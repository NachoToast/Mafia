import {
    ChangeEvent,
    FC,
    FormEvent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import InternalLink from '../../components/Links/InternalLink';
import RateLimitStatus from '../../components/RateLimitStatus';
import ServerStatus from '../../components/ServerStatus';
import {
    Settings,
    SettingsContext,
    defaultSettings,
} from '../../contexts/Settings';
import './SettingsPage.css';

interface SettingsItemProps {
    title: string;
    description: string;

    property: keyof Settings;

    inputType: 'text' | 'password' | 'url' | 'number';

    index: number;
}

const SettingsItem: FC<SettingsItemProps> = (props) => {
    const { title, description, property, inputType } = props;

    const { settings, settingsControllers } = useContext(SettingsContext);

    const [newValue, setNewValue] = useState(settings[property]);

    const fadeInDelay = useMemo(() => `${50 * props.index}ms`, [props.index]);

    /** Whether the set value is equal to the default value. */
    const isDefault = useMemo(
        () => settings[property] === defaultSettings[property],
        [property, settings],
    );

    /** Whether the current input value is different from the set value. */
    const isDirtied = useMemo(
        () => newValue !== settings[property],
        [newValue, property, settings],
    );

    /** When the value changes, update the current input value to be it. */
    useEffect(() => {
        setNewValue(settings[property]);
    }, [property, settings]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (inputType !== 'number') {
                // Not a number, so no special checks needed.
                setNewValue(e.target.value);
            }

            const value = Number(e.target.value);
            if (Number.isInteger(value) && value > 0) {
                setNewValue(value);
            }
        },
        [inputType],
    );

    const handleReset = useCallback(() => {
        settingsControllers.resetValue(property);
    }, [property, settingsControllers]);

    const handleSubmit = useCallback(
        (e?: FormEvent) => {
            e?.preventDefault();

            settingsControllers.setValue(property, newValue);
        },
        [newValue, property, settingsControllers],
    );

    return (
        <form
            className="settings-item fade-in"
            style={{ animationDelay: fadeInDelay }}
            onSubmit={handleSubmit}
        >
            <label htmlFor={`mafia-settings-${property}`}>{title}</label>
            <span>{description}</span>
            <input
                id={`mafia-settings-${property}`}
                value={newValue}
                type={
                    inputType === 'url'
                        ? 'url'
                        : inputType === 'password'
                        ? 'password'
                        : 'text'
                }
                pattern={inputType === 'number' ? '[0-9]*' : undefined}
                onChange={handleChange}
            />
            {property === 'serverUrl' && (
                <details>
                    <summary>Check URL</summary>
                    <ServerStatus />
                </details>
            )}
            {property === 'rateLimitBypassToken' && (
                <details>
                    <summary>Check Token</summary>
                    <div style={{ padding: '1em' }}>
                        <RateLimitStatus />
                    </div>
                </details>
            )}
            <div className="button-area">
                <button
                    title="Save"
                    disabled={!isDirtied}
                    onClick={handleSubmit}
                    className="save"
                >
                    Save Changes
                </button>
                <button
                    title="Reset to default"
                    disabled={isDefault}
                    onClick={handleReset}
                >
                    Reset to Default
                </button>
            </div>
        </form>
    );
};

const SettingsPage: FC = () => {
    return (
        <>
            <h1>
                S<span className="flicker-fast">e</span>tt
                <span className="flicker-slow">in</span>gs
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 512 512"
                    className="spinning"
                    style={{
                        fill: '#ff5d5d',
                        opacity: '0.1',
                        position: 'absolute',
                    }}
                >
                    <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
                </svg>
            </h1>
            <InternalLink href="/">
                <button>Back to Main Menu</button>
            </InternalLink>
            <div id="settings-options">
                <SettingsItem
                    property="serverUrl"
                    title="Server URL"
                    description="Base endpoint for the mafia API, this is where all requests will be sent."
                    inputType="url"
                    index={0}
                />
                <SettingsItem
                    property="rateLimitBypassToken"
                    title="Rate Limit Bypass Token"
                    description="Token for bypassing rate limits, if you have one."
                    inputType="password"
                    index={1}
                />
                <SettingsItem
                    property="discordApplicationId"
                    title="Discord Application ID"
                    description="ID of the Discord developer application for the OAuth process."
                    inputType="text"
                    index={2}
                />
                <SettingsItem
                    property="redirectUri"
                    title="Redirect URI"
                    description="URI to go to after the OAuth process is complete, must exactly match one in the Discord developer portal."
                    inputType="url"
                    index={3}
                />
                <SettingsItem
                    property="minRefreshSeconds"
                    title="Min Refresh"
                    description="If your access token expires in this many seconds (or less), a refresh will not be attempted."
                    inputType="number"
                    index={4}
                />
                <SettingsItem
                    property="maxRefreshMinutes"
                    title="Max Refresh"
                    description="If your access token expires in this many minutes (or less), a refresh will be attempted."
                    inputType="number"
                    index={5}
                />
            </div>
        </>
    );
};

const SettingsWrapper: FC = () => (
    <>
        <Header />
        <main id="settings" className="flex-centered">
            <SettingsPage />
        </main>
        <Footer activePage="settings" />
    </>
);
export default SettingsWrapper;
