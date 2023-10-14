import { User, UserFlags } from '@shared';
import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { defaultConfig } from '../constants';
import { Config } from '../types/Config';

export const mockConfig = (config?: Partial<Config>): Config => ({
    ...defaultConfig,
    mongoURI: '',
    ...config,
});

export const mockUser = (user?: Partial<User>): User => ({
    _id: user?._id ?? 'mockedUser._id',
    username: user?.username ?? 'mockedUser.username',
    ip: user?.ip ?? 'mockedUser.ip',
    registeredAt: user?.registeredAt ?? new Date().toISOString(),
    lastActivity: user?.lastActivity ?? new Date().toISOString(),
    flags: user?.flags ?? UserFlags.None,
});

export const mockOAuthResult = (
    result?: Partial<RESTPostOAuth2AccessTokenResult>,
): RESTPostOAuth2AccessTokenResult => ({
    access_token: result?.access_token ?? 'mockedOAuthResult.access_token',
    expires_in: result?.expires_in ?? 0,
    refresh_token: result?.refresh_token ?? 'mockedOAuthResult.refresh_token',
    scope: result?.scope ?? 'mockedOAuthResult.scope',
    token_type: result?.token_type ?? 'mockedOAuthResult.token_type',
});
