import { DiscordIDString, User } from '@shared';
import { NotFoundError } from '../../errors';
import { UserModel } from '../../types/Database';

/**
 * Updates a user in the database.
 *
 * @throws Throws a {@link NotFoundError} if the user does not exist.
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
