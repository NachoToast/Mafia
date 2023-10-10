import axios from 'axios';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from '../../errors';
import { mockConfig } from '../../tests';
import { refreshAccessToken } from './refreshAccessToken';

describe(refreshAccessToken.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('refreshes an access token', async () => {
        const mockResponse = 'some Discord user';

        const spy = vi
            .spyOn(axios, 'post')
            .mockResolvedValueOnce({ data: mockResponse });

        const returnedResponse = await refreshAccessToken(
            'some access token',
            mockConfig(),
        );

        expect(spy).toHaveBeenCalledTimes(1);

        expect(returnedResponse).toEqual(mockResponse);
    });

    test('throws a SecondaryRequestError if the token is invalid', async () => {
        const spy = vi.spyOn(axios, 'post').mockImplementationOnce(() => {
            throw new Error('some error');
        });

        await expect(
            refreshAccessToken('some access token', mockConfig()),
        ).rejects.toThrowError(SecondaryRequestError);

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
