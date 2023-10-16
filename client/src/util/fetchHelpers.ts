import { Settings } from '../contexts/Settings';

/** Catchable error class thrown by {@link typedFetch}. */
export class TypedFetchError extends Error {
    public readonly response: Response;

    public constructor(response: Response) {
        super(`${response.statusText} (${response.status})`);

        this.response = response;
    }
}

/** Adds the 'ratelimit-bypass-token' header to a request object if needed. */
export function makeRateLimitHeaders(
    token: Settings['rateLimitBypassToken'],
): Headers {
    const headers = new Headers();

    if (token !== '') {
        headers.set('ratelimit-bypass-token', token);
    }

    return headers;
}

/**
 * Helper function that makes a fetch request and
 * coerces the response into the expected type.
 *
 * @throws Can throw a {@link TypedFetchError} if the HTTP response code
 * received is not ok (see), alongside normal errors.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/fetch MDN reference}
 */
export async function typedFetch<T = never>(
    input: RequestInfo | URL,
    init: (RequestInit & { method: 'GET' | 'POST' }) | undefined,
    parseResponse: boolean = true,
): Promise<{ data: T; response: Response }> {
    const response = await fetch(input, init);

    if (!response.ok) {
        throw new TypedFetchError(response);
    }

    if (!parseResponse) {
        return { data: null as T, response };
    }

    const data = (await response.json()) as T;

    return { data, response };
}
