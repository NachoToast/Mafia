import { describe, expect, test } from 'vitest';
import { CorsError } from './CorsError';

describe.concurrent(CorsError.name, () => {
    test('has the correct status code', () => {
        const error = new CorsError();

        expect(error.statusCode).toBe(400);
    });
});
