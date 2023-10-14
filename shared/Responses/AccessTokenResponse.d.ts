/**
 * Object returned by Discord OAuth token request and refresh endpoints.
 *
 * @see {@link https://discord.com/developers/docs/topics/oauth2#authorization-code-grant-access-token-response}
 */
export interface AccessTokenResponse {
    /** Token to send as authorisation to any elevated Discord endpoints. */
    access_token: string;

    /** Should only be `Bearer`. */
    token_type: string;

    /** How long, in seconds, until the returned access token expires. */
    expires_in: number;

    /** Token to send to the OAuth refresh endpoint to extend the session. */
    refresh_token: string;

    /** Should only be `identify`. */
    scope: string;
}
