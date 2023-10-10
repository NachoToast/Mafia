import {
    JsonWebTokenError,
    JwtPayload,
    TokenExpiredError,
    verify,
} from 'jsonwebtoken';
import { AuthError } from '../../errors';
import { SiteTokenPayload } from '../../types/Auth';
import { Config } from '../../types/Config';

/**
 * Validates the site token supplied in the authorisation header.
 *
 * @throws Can throw a {@link AuthError} if the token is not supplied or
 * invalid.
 */
export function validateSiteToken(
    token: string | undefined,
    config: Config,
): SiteTokenPayload {
    if (token === undefined) {
        throw new AuthError(
            'Missing Authorisation',
            "A token was not provided in the 'authorization' header.",
        );
    }

    let payload: string | JwtPayload;

    try {
        payload = verify(token.slice('Bearer '.length), config.jwtSecret);
    } catch (error) {
        if (error instanceof JsonWebTokenError) {
            // see https://www.npmjs.com/package/jsonwebtoken > JsonWebTokenError
            throw new AuthError(
                'Invalid Authorisation',
                `Unable to verify your site token (${error.message}).`,
            );
        }
        if (error instanceof TokenExpiredError) {
            throw new AuthError(
                'Session Expired',
                'Site token has expired, you need to log back in.',
            );
        }

        throw new AuthError(
            'Unknown Authorisation Error',
            'An unexpected error occurred.',
        );
    }

    // All the below checks are never likely to be true
    // since we only sign our JWTs with valid payloads.

    if (typeof payload === 'string') {
        throw new AuthError(
            'Invalid Token Payload Type',
            'Got a string, but expected an object.',
        );
    }

    if (payload.exp === undefined) {
        throw new AuthError(
            'Invalid Token Expiry Date',
            'Missing expiry date.',
        );
    }

    if (payload.id === undefined || typeof payload.id !== 'string') {
        throw new AuthError(
            'Invalid Token Payload Shape',
            `Missing 'id' (expected string, got ${typeof payload.id}).`,
        );
    }

    if (
        payload.access_token === undefined ||
        typeof payload.access_token !== 'string'
    ) {
        throw new AuthError(
            'Invalid Token Payload Shape',
            `Missing 'access_token' (expected string, got ${typeof payload.access_token}).`,
        );
    }

    if (
        payload.refresh_token === undefined ||
        typeof payload.refresh_token !== 'string'
    ) {
        throw new AuthError(
            'Invalid Token Payload Shape',
            `Missing 'refresh_token' (expected string, got ${typeof payload.refresh_token}).`,
        );
    }

    return {
        id: payload.id,
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
    };
}
