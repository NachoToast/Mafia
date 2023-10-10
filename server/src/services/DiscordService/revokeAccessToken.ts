import axios from 'axios';
import { OAuth2Routes } from 'discord-api-types/v10';
import { SecondaryRequestError } from '../../errors';
import { Config } from '../../types/Config';
import { makeRequestBody } from './helpers';

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
        await axios.post(OAuth2Routes.tokenRevocationURL, body);
    } catch (error) {
        throw new SecondaryRequestError(
            'Logout Failure',
            'Supplied access token may be invalid, or you may already be logged out.',
            error,
        );
    }
}
