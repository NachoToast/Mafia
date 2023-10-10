import { isAxiosError } from 'axios';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { SecondaryRequestError } from './SecondaryRequestError';

vi.mock('axios', () => ({
    isAxiosError: vi.fn(),
}));

const mockedIsAxiosError = vi.mocked(isAxiosError);

describe.concurrent(SecondaryRequestError.name, () => {
    const responseA = { response: { status: 123, statusText: 'abc' } };
    const responseB = { status: 456, message: 'def' };

    let axiosErrorA: SecondaryRequestError;
    let axiosErrorB: SecondaryRequestError;
    let normalError: SecondaryRequestError;

    beforeAll(() => {
        mockedIsAxiosError
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(true)
            .mockReturnValueOnce(false);

        axiosErrorA = new SecondaryRequestError('', '', responseA);
        axiosErrorB = new SecondaryRequestError('', '', responseB);
        normalError = new SecondaryRequestError('', '', {});
    });

    test('calls isAxiosError in the constructor', () => {
        expect(mockedIsAxiosError).toBeCalledTimes(3);
    });

    test('handles a full Axios error', () => {
        expect(axiosErrorA.additionalData).toStrictEqual({
            statusCode: responseA.response.status,
            statusText: responseA.response.statusText,
        });
    });

    test('handles a partial Axios error', () => {
        expect(axiosErrorB.additionalData).toStrictEqual({
            statusCode: responseB.status,
            statusText: responseB.message,
        });
    });

    test('handles a non-Axios error', () => {
        expect(normalError.additionalData).toBeNull();
    });
});
