import { describe, expect, test } from 'vitest';
import { SecondaryRequestError } from './SecondaryRequestError';

describe.concurrent(SecondaryRequestError.name, () => {
    test('has the correct status code', () => {
        const error = new SecondaryRequestError('', '', {
            status: 123,
            statusText: 'abc',
        } as Response);

        expect(error.statusCode).toBe(502);
    });
});
