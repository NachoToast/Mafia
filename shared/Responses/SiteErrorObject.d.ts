/** Generic error object returned by server. */
export interface SiteErrorObject<T = unknown> {
    /**
     * The error described in a few words.
     *
     * @example 'Failed to Fetch User'
     */
    title: Capitalize<string>;

    /**
     * A sentence that explains how the error occurred.
     *
     * @example 'A user with this ID does not exist in the database.'
     */
    description: string;

    /** Additional context to show the user. */
    additionalData: T;
}
