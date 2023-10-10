/**
 * These flags indicate special attributes about a particular user.
 *
 * Currently they cannot be assigned using the API, meaning you need to
 * edit the database directly if you want to use them.
 */
export enum UserFlags {
    None = 0,

    SiteOwner = 1 << 0,

    Developer = 1 << 1,
}
