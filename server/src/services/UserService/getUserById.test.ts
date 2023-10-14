import { beforeAll, describe, expect, test } from 'vitest';
import { TestDatabase, createTestDatabase, mockUser } from '../../tests';
import { getUserById } from './getUserById';

describe(getUserById.name, () => {
    let testDatabase: TestDatabase;

    beforeAll(async () => {
        testDatabase = await createTestDatabase();

        return async () => {
            await testDatabase.teardown();
        };
    });

    test('gets the specified user', async () => {
        const user = mockUser({ _id: '2' });

        await testDatabase.userModel.insertMany([
            mockUser({ _id: '1' }),
            user,
            mockUser({ _id: '3' }),
        ]);

        const returnedUser = await getUserById('2', testDatabase.userModel);
        expect(returnedUser).toStrictEqual(user);
    });

    test("throws a NotFound error if the user doesn't exist", async () => {
        await expect(
            getUserById('dne', testDatabase.userModel),
        ).rejects.toThrowError();
    });
});
