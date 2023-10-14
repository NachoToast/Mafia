import { existsSync } from 'fs';
import { join } from 'path';
import apiSpec from '../src/openapi.json';
import { Colour, JSONValue } from '../src/types/Utility';

const pathToCheck = '/NachoToast/Mafia/blob/';

const stats = {
    skipped: 0,
    invalid: 0,
    external: 0,
    notMain: 0,
    mismatchedDescription: 0,
    dead: 0,
    ok: 0,
};

/**
 * Validates the the file pointed to by an
 * internally-linking URL actually exists.
 */
function checkURL(url: string, description: string): void {
    // Don't try parse URls with variables, e.g. http://localhost:{port}
    if (url.includes('{')) {
        stats.skipped += 1;
        return;
    }

    if (!URL.canParse(url)) {
        stats.invalid += 1;
        console.log(`Invalid URL: ${Colour.FgRed}${url}${Colour.Reset}`);
        return;
    }

    const parsedURL = new URL(url);

    // We can't validate URLs that link to external sites.
    if (!parsedURL.pathname.startsWith(pathToCheck)) {
        stats.external += 1;
        return;
    }

    let relativePath = parsedURL.pathname.slice(pathToCheck.length);

    if (!relativePath.startsWith('main/')) {
        stats.notMain += 1;
        console.log(
            `URL doesn't point to the main branch: ${Colour.FgRed}${url}${Colour.Reset}`,
        );
        return;
    }

    relativePath = relativePath.slice('main/'.length);

    if (relativePath !== description) {
        stats.mismatchedDescription += 1;
        console.log(
            `URL description doesn't match file path:\n\t${Colour.FgRed}${url}${
                Colour.Reset
            }\n\t${' '.repeat(url.length - relativePath.length)}${
                Colour.FgCyan
            }${description}${Colour.Reset}`,
        );
        return;
    }

    const absolutePath = join(__dirname, '../', '../', relativePath);

    if (!existsSync(absolutePath)) {
        stats.dead += 1;
        console.log(
            `URL points to a non-existent file:\n\t${Colour.FgRed}${url}${Colour.Reset}\n\t${Colour.FgCyan}${absolutePath}${Colour.Reset}`,
        );
        return;
    }

    stats.ok += 1;
}

function recursivelyCheckKeys(obj: JSONValue): void {
    if (typeof obj !== 'object' || obj === null) return;

    if (Array.isArray(obj)) {
        obj.forEach(recursivelyCheckKeys);
        return;
    }

    if (typeof obj.url === 'string' && typeof obj.description === 'string') {
        checkURL(obj.url, obj.description);
        return;
    }

    for (const key of Object.keys(obj)) {
        recursivelyCheckKeys(obj[key]);
    }
}

recursivelyCheckKeys(apiSpec as JSONValue);

const totalChecked = Object.values(stats).reduce((a, b) => a + b, 0);

console.log(
    `\nChecked ${Colour.Bright}${totalChecked}${Colour.Reset} URLs:\n${[
        `${stats.skipped} Skipped`,
        `${stats.invalid ? Colour.FgRed : Colour.FgGreen}${stats.invalid}${
            Colour.Reset
        } Invalid`,
        `${stats.external} External`,
        `${stats.notMain ? Colour.FgRed : Colour.FgGreen}${stats.notMain}${
            Colour.Reset
        } Not Main Branch`,
        `${stats.mismatchedDescription ? Colour.FgRed : Colour.FgGreen}${
            stats.mismatchedDescription
        }${Colour.Reset} Mismatched Description`,
        `${stats.dead ? Colour.FgRed : Colour.FgGreen}${stats.dead}${
            Colour.Reset
        } Dead Link`,
        `${Colour.FgGreen}${stats.ok}${Colour.Reset} OK`,
    ].join('\n')}`,
);

if (
    stats.invalid + stats.notMain + stats.mismatchedDescription + stats.dead >
    0
) {
    process.exit(1);
}
