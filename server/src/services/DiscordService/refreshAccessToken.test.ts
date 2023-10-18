import { afterEach, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from '../../errors';
import { mockConfig } from '../../tests';
import * as typedFetch from '../../util/typedFetch';
import { refreshAccessToken } from './refreshAccessToken';

describe.concurrent(refreshAccessToken.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('refreshes an access token', async () => {
        const mockResponse = 'some Discord user';

        const spy = vi.spyOn(typedFetch, 'typedFetch').mockResolvedValueOnce({
            data: mockResponse,
            response: new Response(),
        });

        const returnedResponse = await refreshAccessToken(
            'some access token',
            mockConfig(),
        );

        expect(spy).toHaveBeenCalledTimes(1);

        expect(returnedResponse).toEqual(mockResponse);
    });

    test('throws a SecondaryRequestError if a TypedFetchError is encountered', async () => {
        const spy = vi
            .spyOn(typedFetch, 'typedFetch')
            .mockImplementationOnce(() => {
                throw new typedFetch.TypedFetchError(new Response());
            });

        await expect(
            refreshAccessToken('some access token', mockConfig()),
        ).rejects.toThrowError(SecondaryRequestError);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('does not catch normal errors', async () => {
        const spy = vi
            .spyOn(typedFetch, 'typedFetch')
            .mockImplementationOnce(() => {
                throw new Error();
            });

        await expect(
            refreshAccessToken('some access token', mockConfig()),
        ).rejects.toThrowError();

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
