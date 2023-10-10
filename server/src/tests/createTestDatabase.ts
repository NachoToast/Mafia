import { MongoMemoryServer } from 'mongodb-memory-server';
import { loadMongo } from '../loaders/loadMongo';
import { UserModel } from '../types/User';
import { mockConfig } from './mocks';

export interface TestDatabase {
    userModel: UserModel;
    teardown: () => Promise<void>;
}

export async function createTestDatabase(): Promise<TestDatabase> {
    const provider = await MongoMemoryServer.create();

    const mongoURI = provider.getUri();

    const { userModel, mongoClient } = await loadMongo(
        mockConfig({ mongoURI }),
    );

    const teardown = async (): Promise<void> => {
        await mongoClient.close();
        await provider.stop();
    };

    return { userModel, teardown };
}
