type TypedFetchResponse<T = never> =
    | { success: true; data: T; error: undefined }
    | { success: false; data: undefined; error: Response };

/**
 * Helper function that makes a fetch request and
 * coerces the response into the expected type.
 *
 * @throws Can throw an error if fetching fails (e.g. a network error) or
 * if the response body cannot be parsed (e.g. invalid JSON).
 */
export async function typedFetch<T = never>(
    input: RequestInfo | URL,
    init: (RequestInit & { method: 'GET' | 'POST' }) | undefined,
    parseResponse: boolean = true,
): Promise<TypedFetchResponse<T>> {
    const response = await fetch(input, init);

    if (!response.ok) {
        return { success: false, data: undefined, error: response };
    }

    if (!parseResponse) {
        return { success: true, data: undefined as T, error: undefined };
    }

    const data = (await response.json()) as T;

    return { success: true, data, error: undefined };
}
