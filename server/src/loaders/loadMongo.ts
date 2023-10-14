import { User } from '@shared';
import { MongoClient } from 'mongodb';
import { Config } from '../types/Config';
import { UserModel } from '../types/Database';

/** Prepares a connection to a MongoDB database.*/
export async function loadMongo(
    config: Config,
): Promise<{ userModel: UserModel; mongoClient: MongoClient }> {
    const mongoClient = await new MongoClient(config.mongoURI).connect();

    const db = mongoClient.db(config.mongoDbName);

    const userModel = db.collection<User>('users');

    return { userModel, mongoClient };
}
