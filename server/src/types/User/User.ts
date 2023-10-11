import { DiscordIDString, ISOString } from '../../../../shared/types';
import { UserFlags } from './UserFlags';

export interface User {
    /**
     * This is underscored to show that it is
     * used as a document index in MongoDB.
     */
    _id: DiscordIDString;

    /** Username of the user, defaults to their Discord username. */
    username: string;

    ip: string;

    registeredAt: ISOString;

    lastActivity: ISOString;

    flags: UserFlags;
}
