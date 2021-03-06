#!/usr/bin/env node
import {
    getCLIArgument,
    LogLevel,
    setupCLIDefaults,
    writeLoggerOutput
} from '@rtk/node-ts-cli-toolkit';

import {
    createContentIds,
    LangMap
} from '../src/create-content-ids/create-content-ids';
import {generateFiles} from '../src/file-generator/file-generator';
import {requestPage} from '../src/request/request';

setupCLIDefaults();

const confluenceBaseUri: string | null = getCLIArgument('confluenceBaseUri');
const confluencePageId: string | null = getCLIArgument('confluencePageId');

const confluenceUsername: string | null = getCLIArgument('confluenceUsername');
const confluenceUserToken: string | null = getCLIArgument(
    'confluenceUserToken'
);

const recognitionPattern: RegExp = new RegExp(
    getCLIArgument('recognitionPattern') ?? '^Content-Id$',
    getCLIArgument('recognitionFlags') ?? 'i'
);

let outputDirectory: string | null = getCLIArgument('outputDirectory');

let identifierColumn: number = getCLIArgument('identifierColumn') ?? 0;
let startingColumn: number = getCLIArgument('startingColumn') ?? 1;

let trimContent: boolean = getCLIArgument('trimContent') !== 'false';

if (!confluenceBaseUri) {
    writeLoggerOutput(
        LogLevel.Error,
        `Invalid source uri: "${confluenceBaseUri}"`
    );
    process.exit(1);
}

if (!confluencePageId || isNaN(parseInt(confluencePageId, 10))) {
    writeLoggerOutput(LogLevel.Error, `Invalid page id: "${confluencePageId}"`);
    process.exit(2);
}

if (!confluenceUserToken) {
    writeLoggerOutput(
        LogLevel.Error,
        `Missing credentials, supply either username+password or personal access token`
    );
    process.exit(3);
}

if (!outputDirectory) {
    outputDirectory = 'output';
}

requestPage(
    confluenceBaseUri,
    confluencePageId,
    confluenceUsername,
    confluenceUserToken
)
    .then((html: string): readonly LangMap[] => {
        return createContentIds(
            recognitionPattern,
            trimContent,
            identifierColumn,
            startingColumn,
            html
        );
    })
    .then((langMap: readonly LangMap[]): void => {
        return generateFiles(outputDirectory!, langMap);
    })
    .catch((error: Error | any): void => {
        writeLoggerOutput(LogLevel.Error, 'An unexpected error occurred');
        writeLoggerOutput(LogLevel.Verbose, JSON.stringify(error));

        process.exit(9);
    });
