import { User } from '../User';
import { AccessTokenResponse } from './AccessTokenResponse';

/**
 * An object that contains user data, Discord OAuth data, and a JWT that can be
 * used in the authorisation header for making elevated requests to the API.
 */
export interface LoginOrSignupResponse {
    user: User;

    discordAuth: AccessTokenResponse;

    /**
     * Signed JWT to use in authorisation header
     * when making elevated requests to the API.
     */
    siteAuth: string;
}
