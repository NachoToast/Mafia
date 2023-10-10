import { User, UserModel } from '../../types/User';
import { DiscordIDString } from '../../types/Utility';

/** Creates a new user in the database. */
export async function createNewUser(
    _id: DiscordIDString,
    username: string,
    ip: string,
    userModel: UserModel,
): Promise<User> {
    const now = new Date().toISOString();

    const newUser: User = {
        _id,
        username,
        ip,
        registeredAt: now,
        lastActivity: now,
        flags: 0,
    };

    await userModel.insertOne(newUser);

    return newUser;
}
