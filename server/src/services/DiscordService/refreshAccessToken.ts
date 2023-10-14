import {
    OAuth2Routes,
    RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10';
import { SecondaryRequestError } from '../../errors';
import { Config } from '../../types/Config';
import { makeRequestBody } from './helpers/makeRequestBody';
import { typedFetch } from './helpers/typedFetch';

/**
 * Makes a POST request to the Discord token refresh URL,
 * used to delay the expiration of an OAuth access token.
 *
 * @throws Can throw a {@link SecondaryRequestError}.
 */
export async function refreshAccessToken(
    refreshToken: string,
    config: Config,
): Promise<RESTPostOAuth2AccessTokenResult> {
    const body = makeRequestBody(config);
    body.set('refresh_token', refreshToken);
    body.set('grant_type', 'refresh_token');

    const { success, data, error } =
        await typedFetch<RESTPostOAuth2AccessTokenResult>(
            OAuth2Routes.tokenURL,
            {
                method: 'POST',
                body,
                headers: {
                    'Accept-Encoding': 'application/json',
                },
            },
        );

    if (!success) {
        throw new SecondaryRequestError(
            'Refresh Failure',
            'Supplied refresh token may be invalid.',
            error,
        );
    }

    return data;
}
