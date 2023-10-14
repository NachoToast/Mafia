import { beforeAll, describe, expect, test } from 'vitest';
import { TestDatabase, createTestDatabase, mockUser } from '../../tests';
import { countUsers } from './countUsers';

describe(countUsers.name, () => {
    let testDatabase: TestDatabase;

    beforeAll(async () => {
        testDatabase = await createTestDatabase();

        return async () => {
            await testDatabase.teardown();
        };
    });

    test('counts the number of users', async () => {
        await testDatabase.userModel.insertMany([
            mockUser({ _id: '1' }),
            mockUser({ _id: '2' }),
            mockUser({ _id: '3' }),
        ]);

        const returnedCount = await countUsers(testDatabase.userModel);
        expect(returnedCount).toBe(3);
    });
});
