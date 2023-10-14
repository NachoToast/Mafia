/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Response } from 'supertest';

export interface ResponseData {
    status: number;
    headerValue: string | undefined;
}

export function getResponseHeader(
    res: Response,
    header: string,
): string | undefined {
    const headerValue = res.headers[header];

    if (headerValue === undefined) return undefined;

    if (typeof headerValue !== 'string') {
        throw new Error(
            `expected response header ${header} to be a string (got ${typeof headerValue})`,
        );
    }

    return headerValue;
}

export function getResponseData(res: Response, header?: string): ResponseData {
    return {
        status: res.statusCode,
        headerValue:
            header === undefined ? undefined : getResponseHeader(res, header),
    };
}
