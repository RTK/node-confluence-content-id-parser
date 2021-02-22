import {LogLevel, writeLoggerOutput} from '@ams/cli-toolkit';

import * as fs from 'fs';
import * as path from 'path';

import type {LangMap} from './create-content-ids';

export function generateFiles(outputDirectory: string, langMap: readonly LangMap[]): void {
    writeLoggerOutput(LogLevel.Verbose, 'Generate translation files');

    if (fs.existsSync(outputDirectory)) {
        rmdir(outputDirectory);
    }

    fs.mkdirSync(outputDirectory);

    const mergedMap = new Map();

    for (const stringMap of langMap) {
        for (const [langCode, translationMap] of stringMap.entries()) {
            if (!mergedMap.has(langCode)) {
                mergedMap.set(langCode, new Map());
            }

            for (const [stringKey, stringValue] of translationMap.entries()) {
                mergedMap.get(langCode).set(stringKey, stringValue);
            }
        }
    }

    for (const [key, value] of mergedMap.entries()) {
        try {
            const filePath = path.join(outputDirectory, `${key}.json`);

            const obj: Record<string, string> = {};

            for (const [transCode, transValue] of value.entries()) {
                obj[transCode] = transValue;
            }

            fs.writeFileSync(filePath, JSON.stringify(obj));
        } catch (e) {
            console.error(e);

            throw new Error(`Could not write lang file for language "${key}"`);
        }
    }
}

function rmdir(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            rmdir(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    }

    fs.rmdirSync(dir);
}
