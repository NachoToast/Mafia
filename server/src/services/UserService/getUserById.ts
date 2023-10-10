import { NotFoundError } from '../../errors';
import { UserModel, User } from '../../types/User';
import { DiscordIDString } from '../../types/Utility';

/**
 * Fetches a user by their Discord ID.
 *
 * Throws a {@link NotFoundError} if the user does not exist.
 */
export async function getUserById(
    _id: DiscordIDString,
    userModel: UserModel,
): Promise<User> {
    const user = await userModel.findOne({ _id });

    if (user === null) throw new NotFoundError(_id);

    return user;
}
