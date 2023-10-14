import { SiteErrorObject } from '@shared';

/** Generic error class that can be caught by middleware. */
export abstract class SiteError<T = undefined>
    extends Error
    implements SiteErrorObject<T>
{
    public abstract readonly statusCode: number;

    public readonly title: Capitalize<string>;

    public readonly description: string;

    public readonly additionalData: T;

    /**
     * @param {string} title The error described in a few words.
     * @param {string} description A sentence that explains how the error
     * occurred.
     * @param {T} additionalData Additional context to show the user.
     *
     * @example
     * throw new NotFoundError(
     *     'Failed to Fetch User',
     *     'A user with this ID does not exist in the database.',
     *     undefined,
     * );
     */
    public constructor(
        title: Capitalize<string>,
        description: string,
        additionalData: T,
    ) {
        super();
        this.title = title;
        this.description = description;
        this.additionalData = additionalData;
    }
}
