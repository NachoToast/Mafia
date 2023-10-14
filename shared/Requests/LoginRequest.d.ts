/** Request body for the login endpoint. */
export interface LoginRequest {
    /** OAuth2 authorisation code given from Discord. */
    code: string;

    redirect_uri: string;
}
