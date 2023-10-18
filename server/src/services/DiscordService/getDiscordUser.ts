import { APIUser, RouteBases } from 'discord-api-types/v10';
import { SecondaryRequestError } from '../../errors';
import { SiteTokenPayload } from '../../types/Auth';
import { TypedFetchError, typedFetch } from '../../util/typedFetch';

/**
 * Makes a GET request to the Discord `/users/@me` endpoint,
 * used to fetch user info from an access token.
 *
 * @throws Can throw a {@link SecondaryRequestError}.
 */
export async function getDiscordUser(
    accessToken: SiteTokenPayload['access_token'],
): Promise<APIUser> {
    try {
        const { data } = await typedFetch<APIUser>(
            `${RouteBases.api}/users/@me`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Accept-Encoding': 'application/json',
                },
            },
        );
        return data;
    } catch (error) {
        if (error instanceof TypedFetchError) {
            throw new SecondaryRequestError(
                'Failed to Fetch User Info',
                'Supplied access token may be invalid, or Discord account may be deleted.',
                error.response,
            );
        }
        throw error;
    }
}
