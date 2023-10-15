import { DiscordIDString } from '@shared';
import { Request } from 'express';
import { UserModel } from '../../types/Database';
import { updateUser } from './updateUser';

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
