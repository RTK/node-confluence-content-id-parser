#!/usr/bin/env node

import {getCLIArgument, setupCLIDefaults} from '@ams/cli-toolkit';

import {createContentIds, LangMap} from '../src/create-content-ids';
import {generateFiles} from './../src/file-generator';
import {requestPage} from '../src/request';

setupCLIDefaults();

const confluenceBaseUri: string | null = getCLIArgument('confluenceBaseUri');
const confluencePageId: string | null = getCLIArgument('confluencePageId');

const confluenceUsername: string | null = getCLIArgument('confluenceUsername');
const confluenceUserToken: string | null = getCLIArgument('confluenceUserToken');

const recognitionPattern: RegExp = new RegExp(getCLIArgument('recognitionPattern') ?? '^Content-Id$', getCLIArgument('recognitionFlags') ?? 'i')

let outputDirectory: string | null = getCLIArgument('outputDirectory');

if (!confluenceBaseUri) {
    throw new Error(`Invalid source uri: "${confluenceBaseUri}"`);
}

if (!confluencePageId || isNaN(parseInt(confluencePageId, 10))) {
    throw new Error(`Invalid page id: "${confluencePageId}"`);
}

if (!confluenceUsername || !confluenceUserToken) {
    throw new Error(`Missing credentials`);
}

if (!outputDirectory) {
    outputDirectory = 'output';
}

requestPage(confluenceBaseUri, confluencePageId, confluenceUsername, confluenceUserToken)
    .then((html: string): readonly LangMap[] => {
        return createContentIds(recognitionPattern, html);
    })
    .then((langMap: readonly LangMap[]): void => {
        return generateFiles(outputDirectory!, langMap);
    })
    .catch((err) => {
        console.error(err);

        process.exit(1);
    });
