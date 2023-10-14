import { ISOString } from '../Utility';

export interface PostRootResponse {
    /** Commit hash of current server version. */
    commit: string;
    startedAt: ISOString;
    receivedRequest: ISOString;
    sentResponse: ISOString;
    numUsersTotal: number;
    numUsersActive: number;
    numGames: number;
}
