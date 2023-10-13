/** Generic error object returned by server. */
export interface SiteErrorObject<T = undefined> {
    title: Capitalize<string>;
    description: string;
    additionalData: T;
}
