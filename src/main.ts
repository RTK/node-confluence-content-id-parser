import {log, LogLevel} from '@ams/cli-toolkit/src/logger';

export function test(): void {
    log(LogLevel.Verbose, 'CLI template started');
}
