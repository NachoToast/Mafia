import {
    FC,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    ISettingsContext,
    Settings,
    SettingsContext,
    SettingsControllers,
    defaultSettings,
} from '../../contexts/Settings';
import { getLocalSettings, saveLocalSettings } from './SettingsHelpers';

const SettingsContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(getLocalSettings);

    // Save any settings changes to local storage.
    useEffect(() => {
        saveLocalSettings(settings);
    }, [settings]);

    const setValue = useCallback<SettingsControllers['setValue']>(
        (key, value) => {
            setSettings({ ...settings, [key]: value });
        },
        [settings],
    );

    const resetValue = useCallback<SettingsControllers['resetValue']>(
        (key) => {
            setSettings({ ...settings, [key]: defaultSettings[key] });
        },
        [settings],
    );

    const settingsContextProvider = useMemo<ISettingsContext>(
        () => ({ settings, settingsControllers: { setValue, resetValue } }),
        [resetValue, setValue, settings],
    );

    return (
        <SettingsContext.Provider value={settingsContextProvider}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContextProvider;
