import { Settings, defaultSettings } from '../../contexts/Settings';
import { typedKeys } from '../../util';

const KEY_SETTINGS = 'WINTONOVERWATCH_MAFIA.Settings';

/**
 * Retrieves existing settings values (if they exist) from {@link localStorage}.
 *
 * If a value doesn't exist, the {@link defaultSettings default value}
 * is used as a fallback.
 */
export function getLocalSettings(): Settings {
    const existing = localStorage.getItem(KEY_SETTINGS);

    if (existing === null) return { ...defaultSettings };

    return {
        ...defaultSettings,
        ...(JSON.parse(existing) as Partial<Settings>),
    };
}

/**
 * Saves all the current settings values to {@link localStorage}.
 *
 * Values that are unchanged from their defaults are not saved.
 */
export function saveLocalSettings(settings: Settings): void {
    const output: Partial<Settings> = { ...settings };
    for (const key of typedKeys(settings)) {
        if (settings[key] === defaultSettings[key]) {
            output[key] = undefined;
        }
    }

    localStorage.setItem(KEY_SETTINGS, JSON.stringify(output));
}
