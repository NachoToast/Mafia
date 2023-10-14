import { UserFlags } from '@shared';
import { beforeAll, describe, expect, test } from 'vitest';
import { NotFoundError } from '../../errors';
import { TestDatabase, createTestDatabase, mockUser } from '../../tests';
import { updateUser } from './updateUser';

describe(updateUser.name, () => {
    let testDatabase: TestDatabase;

    beforeAll(async () => {
        testDatabase = await createTestDatabase();

        return async () => {
            await testDatabase.teardown();
        };
    });

    test('updates and returns a user', async () => {
        await testDatabase.userModel.insertMany([
            mockUser({ _id: '1' }),
            mockUser({ _id: '2' }),
            mockUser({ _id: '3' }),
        ]);

        const returnedUser = await updateUser('2', testDatabase.userModel, {
            flags: UserFlags.SiteOwner,
            username: '6',
        });

        const updatedUser = await testDatabase.userModel.findOne({ _id: '2' });

        expect(updatedUser).toStrictEqual(returnedUser);
    });

    test("throws a NotFound error if the user doesn't exist", async () => {
        await expect(
            updateUser('dne', testDatabase.userModel, {
                username: '6',
            }),
        ).rejects.toThrowError(NotFoundError);
    });
});
