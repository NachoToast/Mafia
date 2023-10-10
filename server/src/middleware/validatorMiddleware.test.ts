import { middleware } from 'express-openapi-validator';
import { describe, expect, test, vi } from 'vitest';
import { mockConfig } from '../tests';
import { validatorMiddleware } from './validatorMiddleware';

vi.mock('express-openapi-validator', () => ({
    middleware: vi.fn(),
}));

const mockedMiddleware = vi.mocked(middleware);

describe.concurrent(validatorMiddleware.name, () => {
    test('invokes the underlying OpenAPI validator middleware', () => {
        validatorMiddleware(mockConfig());

        expect(mockedMiddleware).toBeCalledTimes(1);
    });
});
