import {LogLevel, writeLoggerOutput} from '@ams/cli-toolkit';

export function test(): void {
    writeLoggerOutput(LogLevel.Verbose, 'CLI template started');
}
