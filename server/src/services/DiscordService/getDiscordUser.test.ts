import { afterEach, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from '../../errors';
import * as typedFetch from '../../util/typedFetch';
import { getDiscordUser } from './getDiscordUser';

describe.concurrent(getDiscordUser.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('gets a Discord user', async () => {
        const mockResponse = 'some Discord user';

        const spy = vi.spyOn(typedFetch, 'typedFetch').mockResolvedValueOnce({
            data: mockResponse,
            response: new Response(),
        });

        const returnedResponse = await getDiscordUser('some access token');

        expect(spy).toHaveBeenCalledTimes(1);

        expect(returnedResponse).toEqual(mockResponse);
    });

    test('throws a SecondaryRequestError if a TypedFetchError is encountered', async () => {
        const spy = vi
            .spyOn(typedFetch, 'typedFetch')
            .mockImplementationOnce(() => {
                throw new typedFetch.TypedFetchError(new Response());
            });

        await expect(getDiscordUser('some access token')).rejects.toThrowError(
            SecondaryRequestError,
        );

        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('does not catch normal errors', async () => {
        const spy = vi
            .spyOn(typedFetch, 'typedFetch')
            .mockImplementationOnce(() => {
                throw new Error();
            });

        await expect(
            getDiscordUser('some access token'),
        ).rejects.toThrowError();

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
