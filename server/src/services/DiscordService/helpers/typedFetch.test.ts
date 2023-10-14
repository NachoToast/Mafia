import { afterEach, describe, expect, test, vi } from 'vitest';
import { typedFetch } from './typedFetch';

vi.stubGlobal('fetch', vi.fn());

describe.concurrent(typedFetch.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('returns a parsed response body for 200 level responses', async () => {
        const response = { a: 1, b: 'hi', c: true };

        const spy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(new Response(JSON.stringify(response)));

        const result = await typedFetch('', { method: 'GET' });

        expect(spy).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual({
            success: true,
            data: response,
            error: undefined,
        });
    });

    test('returns a response instance for non-200 level responses', async () => {
        const response = new Response(undefined, { status: 400 });

        const spy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(response);

        const result = await typedFetch('', { method: 'GET' });

        expect(spy).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual({
            success: false,
            data: undefined,
            error: response,
        });
    });

    test('returns undefined on success when parseResponse is false', async () => {
        const response = 'some response';

        const spy = vi
            .spyOn(globalThis, 'fetch')
            .mockResolvedValueOnce(new Response(response));

        const result = await typedFetch('', { method: 'POST' }, false);

        expect(spy).toHaveBeenCalledTimes(1);

        expect(result).toStrictEqual({
            success: true,
            data: undefined,
            error: undefined,
        });
    });
});
