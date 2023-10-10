import axios from 'axios';
import { APIUser, RouteBases } from 'discord-api-types/v10';
import { SecondaryRequestError } from '../../errors';
import { SiteTokenPayload } from '../../types/Auth';

/**
 * Makes a GET request to the Discord users/@me endpoint,
 * used to fetch user info from an access token.
 *
 * @throws Can throw a {@link SecondaryRequestError}.
 */
export async function getDiscordUser(
    accessToken: SiteTokenPayload['access_token'],
): Promise<APIUser> {
    try {
        const { data } = await axios.get<APIUser>(
            `${RouteBases.api}/users/@me`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Accept-Encoding': 'application/json',
                },
            },
        );

        return data;
    } catch (error) {
        throw new SecondaryRequestError(
            'Failed to Fetch User Info',
            'Supplied access token may be invalid, or Discord account may be deleted.',
            error,
        );
    }
}
