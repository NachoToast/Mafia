import axios from 'axios';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from '../../errors';
import { getDiscordUser } from './getDiscordUser';

describe(getDiscordUser.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('gets a Discord user', async () => {
        const mockResponse = 'some Discord user';

        const spy = vi
            .spyOn(axios, 'get')
            .mockResolvedValueOnce({ data: mockResponse });

        const returnedResponse = await getDiscordUser('some access token');

        expect(spy).toHaveBeenCalledTimes(1);

        expect(returnedResponse).toEqual(mockResponse);
    });

    test('throws a SecondaryRequestError if the token is invalid', async () => {
        const spy = vi.spyOn(axios, 'get').mockImplementationOnce(() => {
            throw new Error('some error');
        });

        await expect(getDiscordUser('some access token')).rejects.toThrowError(
            SecondaryRequestError,
        );

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
