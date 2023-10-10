/** Generic error object returned by server. */
export interface SiteErrorObject<T = undefined> {
    title: string;
    description: string;
    additionalData: T;
}
