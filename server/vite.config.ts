import { configDefaults, defineConfig } from 'vitest/config';
import { join } from 'path';

export default defineConfig({
    test: {
        exclude: [
            ...configDefaults.exclude,
            '**/build/**',
            '**/tests/**',
            '**/scripts/**',
        ],
        coverage: {
            exclude: [
                ...(configDefaults.coverage.exclude ?? []),
                '**/build/**',
                '**/tests/**',
                '**/scripts/**',
            ],
        },
    },
    resolve: {
        alias: {
            '@shared': join(__dirname, '../', 'shared'),
        },
        extensions: [
            '.mjs',
            '.js',
            '.mts',
            '.ts',
            '.jsx',
            '.tsx',
            '.json',
            '.d.ts',
        ],
    },
});
