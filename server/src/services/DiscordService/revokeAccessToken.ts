import { OAuth2Routes } from 'discord-api-types/v10';
import { SecondaryRequestError } from '../../errors';
import { Config } from '../../types/Config';
import { TypedFetchError, typedFetch } from '../../util/typedFetch';
import { makeRequestBody } from './helpers/makeRequestBody';

/**
 * Makes a POST request to the Discord token revocation URL,
 * used to invalidate an access token.
 *
 * @throws Can throw a {@link SecondaryRequestError}.
 */
export async function revokeAccessToken(
    accessToken: string,
    config: Config,
): Promise<void> {
    const body = makeRequestBody(config);
    body.set('token', accessToken);

    try {
        const { data } = await typedFetch(
            OAuth2Routes.tokenRevocationURL,
            { method: 'POST', body },
            false,
        );

        return data;
    } catch (error) {
        if (error instanceof TypedFetchError) {
            throw new SecondaryRequestError(
                'Logout Failure',
                'Supplied access token may be invalid, or you may already be logged out.',
                error.response,
            );
        }
        throw error;
    }
}
