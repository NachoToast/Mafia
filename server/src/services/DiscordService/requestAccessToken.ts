import axios from 'axios';
import {
    OAuth2Routes,
    RESTPostOAuth2AccessTokenResult,
} from 'discord-api-types/v10';
import { SecondaryRequestError } from '../../errors';
import { Config } from '../../types/Config';
import { makeRequestBody } from './helpers/makeRequestBody';

/**
 * Makes a POST request to the Discord token URL,
 * used to upgrade an authorisation code into an access token.
 *
 * @throws Can throw a {@link SecondaryRequestError}.
 */
export async function requestAccessToken(
    code: string,
    redirectUri: string,
    config: Config,
): Promise<RESTPostOAuth2AccessTokenResult> {
    const body = makeRequestBody(config);
    body.set('code', code);
    body.set('redirect_uri', redirectUri);
    body.set('grant_type', 'authorization_code');

    try {
        const { data } = await axios.post<RESTPostOAuth2AccessTokenResult>(
            OAuth2Routes.tokenURL,
            body,
            { headers: { 'Accept-Encoding': 'application/json' } },
        );

        return data;
    } catch (error) {
        throw new SecondaryRequestError(
            'Login Failure',
            'Supplied code or redirect URI may be invalid.',
            error,
        );
    }
}
