import { afterEach, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from '../../errors';
import { mockConfig } from '../../tests';
import * as typedFetch from '../../util/typedFetch';
import { requestAccessToken } from './requestAccessToken';

describe.concurrent(requestAccessToken.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('gets a Discord user', async () => {
        const mockResponse = 'some Discord user';

        const spy = vi.spyOn(typedFetch, 'typedFetch').mockResolvedValueOnce({
            data: mockResponse,
            response: new Response(),
        });

        const returnedResponse = await requestAccessToken(
            'code',
            'redirect_uri',
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
            requestAccessToken('code', 'redirect_uri', mockConfig()),
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
            requestAccessToken('code', 'redirect_uri', mockConfig()),
        ).rejects.toThrowError();

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
