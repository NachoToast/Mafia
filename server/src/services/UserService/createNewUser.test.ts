import { beforeAll, describe, expect, test } from 'vitest';
import { TestDatabase, createTestDatabase } from '../../tests';
import { createNewUser } from './createNewUser';

describe.concurrent(createNewUser.name, () => {
    let testDatabase: TestDatabase;

    beforeAll(async () => {
        testDatabase = await createTestDatabase();

        return async () => {
            await testDatabase.teardown();
        };
    });

    test('creates and returns a new user', async () => {
        const returnedUser = await createNewUser(
            'new user',
            'new user',
            '',
            testDatabase.userModel,
        );

        const createdUser = await testDatabase.userModel.findOne({
            _id: 'new user',
        });

        expect(createdUser).toStrictEqual(returnedUser);
    });
});
