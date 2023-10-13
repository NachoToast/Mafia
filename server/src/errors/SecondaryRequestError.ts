import { isAxiosError } from 'axios';
import { UpstreamResponse } from '../../../shared/responseTypes';
import { SiteError } from './SiteError';

/**
 * Error thrown when an API call made by the server to another server fails.
 *
 * Has status code 502 (Bad Gateway), since the server is acting as a gateway
 * or proxy and received an invalid response from the upstream server.
 */
export class SecondaryRequestError extends SiteError<UpstreamResponse | null> {
    public readonly statusCode = 502;

    public constructor(
        title: Capitalize<string>,
        description: string,
        error: unknown,
    ) {
        let upstreamResponse: UpstreamResponse | null = null;

        if (isAxiosError(error)) {
            if (error.response !== undefined) {
                upstreamResponse = {
                    statusCode: error.response.status,
                    statusText: error.response.statusText,
                };
            } else if (error.status !== undefined) {
                upstreamResponse = {
                    statusCode: error.status,
                    statusText: error.message,
                };
            }
        }

        super(title, description, upstreamResponse);
    }
}
