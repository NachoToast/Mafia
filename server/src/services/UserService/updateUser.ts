import { NotFoundError } from '../../errors';
import { UserModel, User } from '../../types/User';
import { DiscordIDString } from '../../types/Utility';

/**
 * Updates a user in the database.
 *
 * Throws a {@link NotFoundError} if the user does not exist.
 */
export async function updateUser(
    _id: DiscordIDString,
    userModel: UserModel,
    data: Partial<User>,
): Promise<User> {
    const updatedUser = await userModel.findOneAndUpdate(
        { _id },
        { $set: data },
        { returnDocument: 'after' },
    );

    if (updatedUser === null) throw new NotFoundError(_id);

    return updatedUser;
}
