import { afterEach, describe, expect, test, vi } from 'vitest';
import { TypedFetchError, typedFetch } from './typedFetch';

vi.stubGlobal('fetch', vi.fn());

describe.concurrent(typedFetch.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('returns a parsed response body for 200 level responses', async () => {
        const data = { a: 1, b: 'hi', c: true };
        const response = new Response(JSON.stringify(data));

        const spy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(response);

        const result = await typedFetch('', { method: 'GET' });

        expect(spy).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual({ data, response });
    });

    test('throws a TypedFetchError for non-200 level responses', async () => {
        const response = new Response(undefined, { status: 400 });

        const spy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(response);

        await expect(typedFetch('', { method: 'GET' })).rejects.toThrowError(
            TypedFetchError,
        );

        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('returns null on success when parseResponse is false', async () => {
        const response = new Response('some response');

        const spy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(response);

        const result = await typedFetch('', { method: 'POST' }, false);

        expect(spy).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual({ data: null, response });
    });
});
