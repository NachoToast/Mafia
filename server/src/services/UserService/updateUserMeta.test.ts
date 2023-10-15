import { Request } from 'express';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { UserModel } from '../../types/Database';
import * as updateUser from './updateUser';
import { updateUserMeta } from './updateUserMeta';

describe.concurrent(updateUserMeta.name, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("calls to update the user's metadata", () => {
        const spy = vi.spyOn(updateUser, 'updateUser');

        const request = { ip: '123' } as Request;
        const userModel = {} as UserModel;

        updateUserMeta('1', userModel, request);

        expect(spy).toBeCalledTimes(1);

        expect(spy).toBeCalledWith('1', userModel, {
            ip: request.ip,
            lastActivity: new Date().toISOString(),
        });
    });
});
