import { afterEach, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from '../../errors';
import { mockConfig } from '../../tests';
import * as typedFetch from './helpers/typedFetch';
import { requestAccessToken } from './requestAccessToken';

describe.concurrent(requestAccessToken.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('gets a Discord user', async () => {
        const mockResponse = 'some Discord user';

        const spy = vi.spyOn(typedFetch, 'typedFetch').mockResolvedValueOnce({
            success: true,
            data: mockResponse,
            error: undefined,
        });

        const returnedResponse = await requestAccessToken(
            'code',
            'redirect_uri',
            mockConfig(),
        );

        expect(spy).toHaveBeenCalledTimes(1);

        expect(returnedResponse).toEqual(mockResponse);
    });

    test('throws a SecondaryRequestError if the code is invalid', async () => {
        const spy = vi.spyOn(typedFetch, 'typedFetch').mockResolvedValueOnce({
            success: false,
            data: undefined,
            error: new Response(),
        });

        await expect(
            requestAccessToken('code', 'redirect_uri', mockConfig()),
        ).rejects.toThrowError(SecondaryRequestError);

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
