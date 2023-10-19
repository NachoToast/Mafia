import { DiscordIDString, User, UserFlags } from '@shared';
import { UserModel } from '../../types/Database';

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
        flags: UserFlags.None,
    };

    await userModel.insertOne(newUser);

    return newUser;
}
