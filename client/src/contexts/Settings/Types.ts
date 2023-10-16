export interface Settings {
    serverUrl: string;

    rateLimitBypassToken: string;

    discordApplicationId: string;

    redirectUri: string;

    minRefreshSeconds: number;

    maxRefreshMinutes: number;
}

export interface SettingsControllers {
    setValue<T extends keyof Settings>(key: T, value: Settings[T]): void;

    resetValue<T extends keyof Settings>(key: T): void;
}

export interface ISettingsContext {
    settings: Settings;

    settingsControllers: SettingsControllers;
}
