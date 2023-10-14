import { User } from '../User';

/**
 * An object that contains user data, Discord OAuth data, and a JWT that can be
 * used in the authorisation header for making elevated requests to the API.
 */
export interface LoginOrSignupResponse {
    user: User;

    /**
     * Discord OAuth data.
     *
     * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response}
     */
    discordAuth: {
        access_token: string;
        token_type: string;
        expires_in: number;
        refresh_token: string;
        scope: string;
    };

    /**
     * Signed JWT to use in authorisation header
     * when making elevated requests to the API.
     */
    siteAuth: string;
}
