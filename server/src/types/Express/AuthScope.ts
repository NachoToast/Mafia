/**
 * Defines the level of authorisation needed by an endpoint provider.
 *
 * Endpoints are scoped so that logic like getting and validating an auth token
 * and/or fetching a user from the database can be shared.
 */
export enum AuthScope {
    /** No authorisation header needed. */
    None,

    /**
     * Authorisation header is needed, but the user associated with the token
     * doesn't ever need to be fetched.
     *
     * - Will throw an `AuthError` if the token is invalid.
     */
    TokenOnly,

    /**
     * Authorisation header isn't needed, but if supplied then a user will be
     * fetched.
     *
     * - Will throw an `AuthError` if the token is invalid.
     * - Will throw a `NotFoundError` if the user associated with the provided
     * token no longer exists in the database.
     */
    OptionalUser,

    /**
     * An authorisation token associated with an existing user is needed.
     *
     * - Will throw an `AuthError`if the token is invalid.
     * - Will throw a `NotFoundError` if the user associated with the provided
     * token no longer exists in the database.
     */
    User,
}
