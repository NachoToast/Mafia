import { User } from '../User';

/** Request body for a PATCH request to the `/me` endpoint. */
export type PatchMeRequest = Partial<Pick<User, 'username'>>;
