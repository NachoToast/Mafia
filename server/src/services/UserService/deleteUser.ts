import { DiscordIDString, User } from '@shared';
import { NotFoundError } from '../../errors';
import { UserModel } from '../../types/Database';

/**
 * Deletes a user in the database.
 *
 * @throws Throws a {@link NotFoundError} if the user does not exist.
 */
export async function deleteUser(
    _id: DiscordIDString,
    userModel: UserModel,
): Promise<User> {
    const deletedUser = await userModel.findOneAndDelete({ _id });

    if (deletedUser === null) throw new NotFoundError(_id);

    return deletedUser;
}
