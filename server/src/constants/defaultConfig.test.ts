import * as child_process from 'child_process';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getCommit } from './defaultConfig';

vi.mock('child_process');

describe.concurrent(getCommit.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('returns the commit hash', () => {
        const spy = vi
            .spyOn(child_process, 'execSync')
            .mockReturnValueOnce('some commit hash');

        const commitHash = getCommit();

        expect(spy).toHaveBeenCalledTimes(1);

        expect(commitHash).toEqual('some commit hash');
    });

    test('returns an unknown commit hash on error', () => {
        const spy = vi
            .spyOn(child_process, 'execSync')
            .mockImplementationOnce(() => {
                throw new Error();
            });

        const commitHash = getCommit();

        expect(spy).toHaveBeenCalledTimes(1);

        expect(commitHash).toEqual('unknown');
    });
});
