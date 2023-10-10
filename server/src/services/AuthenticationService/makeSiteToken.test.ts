import { sign } from 'jsonwebtoken';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { mockConfig, mockOAuthResult } from '../../tests';
import { makeSiteToken } from './makeSiteToken';

vi.mock('jsonwebtoken', () => ({
    sign: vi.fn(),
}));

const mockedSign = vi.mocked(sign);

describe.concurrent(makeSiteToken.name, () => {
    const oAuthResult = mockOAuthResult();
    const id = 'some id';
    const config = mockConfig();
    const siteToken = 'some site token';

    let returnedToken: string;

    beforeAll(() => {
        mockedSign.mockReturnValueOnce(siteToken as unknown as undefined);

        returnedToken = makeSiteToken(oAuthResult, id, config);
    });

    test('calls the JWT signing function', () => {
        expect(mockedSign).toHaveBeenCalledTimes(1);
        expect(mockedSign).toHaveBeenCalledWith(
            {
                id,
                access_token: oAuthResult.access_token,
                refresh_token: oAuthResult.refresh_token,
            },
            config.jwtSecret,
            { expiresIn: oAuthResult.expires_in },
        );
    });
    test('returns the site token', () => {
        expect(returnedToken).toBe(siteToken);
    });
});
