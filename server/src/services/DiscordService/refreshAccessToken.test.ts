import { afterEach, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from '../../errors';
import { mockConfig } from '../../tests';
import * as typedFetch from './helpers/typedFetch';
import { refreshAccessToken } from './refreshAccessToken';

describe.concurrent(refreshAccessToken.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('refreshes an access token', async () => {
        const mockResponse = 'some Discord user';

        const spy = vi.spyOn(typedFetch, 'typedFetch').mockResolvedValueOnce({
            success: true,
            data: mockResponse,
            error: undefined,
        });

        const returnedResponse = await refreshAccessToken(
            'some access token',
            mockConfig(),
        );

        expect(spy).toHaveBeenCalledTimes(1);

        expect(returnedResponse).toEqual(mockResponse);
    });

    test('throws a SecondaryRequestError if the token is invalid', async () => {
        const spy = vi.spyOn(typedFetch, 'typedFetch').mockResolvedValueOnce({
            success: false,
            data: undefined,
            error: new Response(),
        });

        await expect(
            refreshAccessToken('some access token', mockConfig()),
        ).rejects.toThrowError(SecondaryRequestError);

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
