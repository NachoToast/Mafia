import { DiscordIDString, User } from '@shared';
import { Request } from 'express';
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

/** Updates a users metadata in the background. */
export function updateUserMeta(
    id: DiscordIDString,
    userModel: UserModel,
    req: Request,
): void {
    updateUser(id, userModel, {
        ip: req.ip,
        lastActivity: new Date().toISOString(),
    }).catch(() => null);
}
