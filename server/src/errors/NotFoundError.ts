import { DiscordIDString } from '../../../shared/types';
import { SiteError } from './SiteError';

/**
 * Error thrown when a user does not exist in the database.
 *
 * Has status code 404 (Not Found), since the user has requested a resource
 * that does not exist.
 */
export class NotFoundError extends SiteError<DiscordIDString> {
    public readonly statusCode = 404;

    public constructor(id: DiscordIDString) {
        super(
            'User Not Found',
            'A user with this ID does not exist in the database.',
            id,
        );
    }
}
