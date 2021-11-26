import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

// logger config
const GLOBAL_LOG_DIRECTORY = 'logs';
const DEFAULT_TIMESTAMP_OPTION = 'time';
const DEFAULT_OVERWRITE_OPTION = true;

type TIMESTAMP_OPTIONS = 'date' | 'time' | 'both' | 'none' | 'custom';

interface ExtendedError extends Error {
    erro: number;
    syscall: string;
    code: string;
    path: string;
}

export interface BaseLoggerParams {
    name?: string;
    overwrite?: boolean;
    path?: string | Logger;
    timestampFormat?: TIMESTAMP_OPTIONS;
    customTimestamp?: () => string;
}
export interface LoggerParams extends BaseLoggerParams {
    name: string;
}

try {
    mkdirSync(GLOBAL_LOG_DIRECTORY);
} catch (error) {
    if (!(error instanceof Error && (error as ExtendedError).code === 'EEXIST')) {
        console.log(error);
        process.exit();
    }
}

/** Logger instances are attached to ServerHub and Game classes, and assist in writing log files. */
class Logger {
    /** File path between root folder (`logs/`) and name (`filename.log`) */
    public basePath: string;

    /** Full filename of log file, e.g. `logs/foo/bar/filename.log` */
    private logFile: string;

    private timestamp: () => string;

    /**
     * @param {string} name of log file.
     * @param {string} overwrite Whether to overwrite existing log file or make a new one (`filename-1.log`).
     * @param {Logger | string} path Filepath for this log file to use.
     * @param {TIMESTAMP_OPTIONS} timestampFormat What timestamp format to use, defaults to time.
     * @param {TIMESTAMP_OPTIONS} customTimestamp If `timestampFormat` is 'custom', the function that generates a custom timestamp.
     * @example Logger({name: 'pog', path: parentLogger })
     */
    public constructor({
        path,
        overwrite = DEFAULT_OVERWRITE_OPTION,
        name,
        timestampFormat = DEFAULT_TIMESTAMP_OPTION,
        customTimestamp,
    }: LoggerParams) {
        this.basePath = Logger.getBasePath(path);
        this.logFile = `${GLOBAL_LOG_DIRECTORY}/${this.basePath}/${name}.log`;

        Logger.makeParentDirectories(this.basePath);

        let prevCount = 1;
        let currentFile = existsSync(this.logFile);
        while (!overwrite && currentFile) {
            this.logFile = `${GLOBAL_LOG_DIRECTORY}/${this.basePath}/${name}-${prevCount}.log`;
            currentFile = existsSync(this.logFile);
            prevCount++;
        }

        try {
            writeFileSync(this.logFile, '');
        } catch (error) {
            console.log(error);
            process.exit();
        }

        switch (timestampFormat) {
            case 'time':
                this.timestamp = () => `[${new Date().toLocaleTimeString()}] `;
                break;
            case 'date':
                this.timestamp = () => `[${new Date().toLocaleDateString()}] `;
                break;
            case 'both':
                this.timestamp = () => `[${new Date().toLocaleString()}] `;
                break;
            case 'custom':
                this.timestamp = customTimestamp ?? (() => `[NO TIMESTAMP SPECIFIED] `);
                break;
            case 'none':
                this.timestamp = () => '';
                break;
        }
    }

    private static getBasePath(path: string | Logger | undefined) {
        if (!path) return '';
        if (path instanceof Logger) return path.basePath;
        return path;
    }

    /** Handles creation of directories if the path has multiple nested folders. */
    private static makeParentDirectories(path: string) {
        const parentDirectories = path.split(/[/\\]/);
        let recursivePath = `${GLOBAL_LOG_DIRECTORY}/`;

        for (const folder of parentDirectories) {
            try {
                mkdirSync(`${recursivePath}${folder}`);
                recursivePath += `${folder}/`;
            } catch (error) {
                if (!(error instanceof Error && (error as ExtendedError).code === 'EEXIST')) {
                    console.log(error);
                    process.exit();
                } else {
                    recursivePath += `${folder}/`;
                    continue;
                }
            }
        }
    }

    public async log(message: any) {
        appendFileSync(this.logFile, `${this.timestamp()}${message}\n`, { encoding: 'utf-8' });
    }
}

export const globalLogger = new Logger({ name: 'global' });

export default Logger;
