import {
    OAuth2Routes,
    RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10';
import { SecondaryRequestError } from '../../errors';
import { Config } from '../../types/Config';
import { TypedFetchError, typedFetch } from '../../util/typedFetch';
import { makeRequestBody } from './helpers/makeRequestBody';

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

    try {
        const { data } = await typedFetch<RESTPostOAuth2AccessTokenResult>(
            OAuth2Routes.tokenURL,
            {
                method: 'POST',
                body,
                headers: {
                    'Accept-Encoding': 'application/json',
                },
            },
        );
        return data;
    } catch (error) {
        if (error instanceof TypedFetchError) {
            throw new SecondaryRequestError(
                'Refresh Failure',
                'Supplied refresh token may be invalid.',
                error.response,
            );
        }
        throw error;
    }
}
