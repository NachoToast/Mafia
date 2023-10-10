import { verify } from 'jsonwebtoken';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { AuthError } from '../../errors';
import { mockConfig } from '../../tests';
import { validateSiteToken } from './validateSiteToken';

const jwt = vi.hoisted(() => ({
    JsonWebTokenError: class JsonWebTokenError extends Error {},
    TokenExpiredError: class TokenExpiredError extends Error {},
}));

vi.mock('jsonwebtoken', () => ({
    JsonWebTokenError: jwt.JsonWebTokenError,
    TokenExpiredError: jwt.TokenExpiredError,
    verify: vi.fn(),
}));

const mockedVerify = vi.mocked(verify);

describe.concurrent(validateSiteToken.name, () => {
    const config = mockConfig();

    afterEach(() => {
        mockedVerify.mockClear();
    });

    test('throws an AuthError if the token is undefined', () => {
        expect(() => validateSiteToken(undefined, config)).toThrowError(
            AuthError,
        );

        expect(mockedVerify).toBeCalledTimes(0);
    });

    test('throws an AuthError if a JsonWebTokenError is thrown internally', () => {
        mockedVerify.mockImplementationOnce(() => {
            throw new jwt.JsonWebTokenError();
        });

        try {
            validateSiteToken('', config);
            throw new Error('Expected validateSiteToken to throw');
        } catch (error) {
            if (!(error instanceof AuthError)) throw error;
            expect(error.title).toBe('Invalid Authorisation');
        }

        expect(mockedVerify).toBeCalledTimes(1);
    });

    test('throws an AuthError if a TokenExpiredError is thrown internally', () => {
        mockedVerify.mockImplementationOnce(() => {
            throw new jwt.TokenExpiredError();
        });

        try {
            validateSiteToken('', config);
            throw new Error('Expected validateSiteToken to throw');
        } catch (error) {
            if (!(error instanceof AuthError)) throw error;
            expect(error.title).toBe('Session Expired');
        }

        expect(mockedVerify).toBeCalledTimes(1);
    });

    test('throws an AuthError if verification throws an unknown error', () => {
        mockedVerify.mockImplementationOnce(() => {
            throw new Error();
        });

        try {
            validateSiteToken('', config);
            throw new Error('Expected validateSiteToken to throw');
        } catch (error) {
            if (!(error instanceof AuthError)) throw error;
            expect(error.title).toBe('Unknown Authorisation Error');
        }

        expect(mockedVerify).toBeCalledTimes(1);
    });

    test("throws an AuthError if the token payload isn't an object", () => {
        mockedVerify.mockReturnValueOnce('' as unknown as undefined);

        try {
            validateSiteToken('', config);
            throw new Error('Expected validateSiteToken to throw');
        } catch (error) {
            if (!(error instanceof AuthError)) throw error;
            expect(error.title).toBe('Invalid Token Payload Type');
        }

        expect(mockedVerify).toBeCalledTimes(1);
    });

    test('throws an AuthError if the token has no expiry date', () => {
        mockedVerify.mockReturnValueOnce({} as unknown as undefined);

        try {
            validateSiteToken('', config);
            throw new Error('Expected validateSiteToken to throw');
        } catch (error) {
            if (!(error instanceof AuthError)) throw error;
            expect(error.title).toBe('Invalid Token Expiry Date');
        }

        expect(mockedVerify).toBeCalledTimes(1);
    });

    test.each(['id', 'access_token', 'refresh_token'] as const)(
        'throws an AuthError if the token has a missing or incorrect %s',
        (field) => {
            type Payload = Record<string, string | number>;

            const firstResponse: Payload = { exp: 0 };
            const secondResponse: Payload = { exp: 0, [field]: 0 };

            switch (field) {
                case 'refresh_token':
                    firstResponse.access_token = '0';
                    secondResponse.access_token = '0';
                    firstResponse.id = '0';
                    secondResponse.id = '0';
                    break;
                case 'access_token':
                    firstResponse.id = '0';
                    secondResponse.id = '0';
                    break;
            }

            mockedVerify.mockReturnValueOnce(
                firstResponse as unknown as undefined,
            );
            mockedVerify.mockReturnValueOnce(
                secondResponse as unknown as undefined,
            );

            try {
                validateSiteToken('', config);
                throw new Error('Expected validateSiteToken to throw');
            } catch (error) {
                if (!(error instanceof AuthError)) throw error;
                expect(error.description).toContain(field);
            }

            try {
                validateSiteToken('', config);
                throw new Error('Expected validateSiteToken to throw');
            } catch (error) {
                if (!(error instanceof AuthError)) throw error;
                expect(error.description).toContain(field);
            }
        },
    );

    test('returns a SiteTokenPayload if the token is valid', () => {
        const payload = {
            id: '0',
            access_token: '0',
            refresh_token: '0',
        };

        mockedVerify.mockReturnValueOnce({
            exp: 0,
            ...payload,
        } as unknown as undefined);

        const result = validateSiteToken('', config);

        expect(result).toStrictEqual(payload);
    });
});
