import { UserModel } from '../../types/Database';

/** Returns the total number of users in the database. */
export async function countUsers(userModel: UserModel): Promise<number> {
    return await userModel.countDocuments();
}
