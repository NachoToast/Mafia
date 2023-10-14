/** Request body for the login endpoint. */
export interface LoginRequest {
    code: string;

    redirect_uri: string;
}
