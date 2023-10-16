import { ISettingsContext, Settings, SettingsControllers } from './Types';

function inferServerUrl(): string {
    if (window.location.hostname === 'mafia.wintonoverwatch.com') {
        return 'https://maf.wintonoverwatch.com';
    }

    const existingUrl = new URL(window.location.toString());
    existingUrl.port = '5000';

    return existingUrl.origin;
}

function inferApplicationId(): string {
    if (window.location.hostname === 'mafia.wintonoverwatch.com') {
        return '1161285214501355633';
    }

    return '1160841912480190534';
}

export const defaultSettings: Settings = {
    serverUrl: inferServerUrl(),
    rateLimitBypassToken: '',
    discordApplicationId: inferApplicationId(),
    redirectUri: `${window.location.origin}/login`,
    minRefreshSeconds: 30,
    maxRefreshMinutes: 3 * 24 * 60,
};

export const defaultSettingsControllers: SettingsControllers = {
    setValue: function (): void {
        throw new Error('Function not implemented.');
    },

    resetValue: function (): void {
        throw new Error('Function not implemented.');
    },
};

export const defaultSettingsContext: ISettingsContext = {
    settings: defaultSettings,

    settingsControllers: defaultSettingsControllers,
};
