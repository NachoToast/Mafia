import { SiteErrorObject } from '../../../shared/Responses';
import { TypedFetchError } from '.';

function isSiteError(responseBody: unknown): responseBody is SiteErrorObject {
    return (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'title' in responseBody &&
        'description' in responseBody &&
        typeof responseBody.title === 'string' &&
        typeof responseBody.description === 'string'
    );
}

export function isAbortError(error: unknown): error is DOMException {
    return error instanceof DOMException && error.name === 'AbortError';
}

export interface RateLimitHeaders {
    limit: number;
    remaining: number;
    resetsIn: number;
    windowSize: number;
    bypassed: boolean | null;
}

export function getRatelimitHeaders(response: Response): RateLimitHeaders {
    const bypassHeader = response.headers.get('ratelimit-bypassed');

    return {
        limit: Number(response.headers.get('ratelimit-limit')),
        remaining: Number(response.headers.get('ratelimit-remaining')),
        resetsIn: Number(response.headers.get('ratelimit-reset')),
        windowSize: Number(response.headers.get('retry-after')),
        bypassed: bypassHeader !== null ? bypassHeader === 'true' : null,
    };
}

/**
 * Handles errors thrown or returned by fetch requests.
 *
 * Should not be used to handle AbortExceptions,
 * see {@link isAbortError} instead.
 */
export async function handleFetchError(
    error: unknown,
): Promise<SiteErrorObject> {
    if (error instanceof TypedFetchError) {
        const { response } = error;

        // Rate limited.
        if (response.status === 429) {
            const additionalData = getRatelimitHeaders(response);

            return {
                title: 'Rate Limited',
                description: `You are making too many requests, please wait ${additionalData.resetsIn} seconds before retrying.`,
                additionalData,
            };
        }

        // Site error object.
        try {
            const responseData: unknown = await response.json();

            if (isSiteError(responseData)) {
                return responseData;
            }

            // Parseable as JSON, but not a SiteErrorObject somehow.
            return {
                title: `Error ${response.status} - ${response.statusText}` as Capitalize<string>,
                description: 'An unknown (but parseable) error occurred.',
                additionalData: responseData,
            };
        } catch {
            return {
                title: `Error ${response.status} - ${response.statusText}` as Capitalize<string>,
                description: 'An unknown error occurred.',
                additionalData: error,
            };
        }
    }

    if (isAbortError(error)) {
        console.warn(
            'handleErrorResponse should not be used to detect abort errors! Use isAbortError instead.',
        );
        return {
            title: 'Aborted',
            description: 'A request made earlier was aborted.',
            additionalData: null,
        };
    }

    console.error(error);

    if (error instanceof Error) {
        if (error.message === 'Failed to fetch') {
            return {
                title: 'Unable to Connect to Server',
                description: navigator.onLine
                    ? 'Your internet seems fine so the server might be down :P'
                    : 'Failed to make a request to the server, your internet may be down.',
                additionalData: {
                    name: error.name,
                    message: error.message,
                },
            };
        }

        return {
            title: 'Unknown Error',
            description: error.name,
            additionalData: error.message,
        };
    }

    return {
        title: 'Unknown Error',
        description: 'An unknown error occurred.',
        additionalData: error,
    };
}
