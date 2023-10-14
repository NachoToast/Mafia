import { DiscordIDString } from '@shared';
import { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import { sign } from 'jsonwebtoken';
import { SiteTokenPayload } from '../../types/Auth';
import { Config } from '../../types/Config';

/** Creates a signed JWT that can be used in authorisation headers. */
export function makeSiteToken(
    discordAuth: RESTPostOAuth2AccessTokenResult,
    id: DiscordIDString,
    config: Config,
): string {
    const { access_token, refresh_token, expires_in } = discordAuth;

    const payload: SiteTokenPayload = { id, access_token, refresh_token };

    return sign(payload, config.jwtSecret, { expiresIn: expires_in });
}
