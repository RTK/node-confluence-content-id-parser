import * as fs from 'fs';
import * as path from 'path';

import {LogLevel, writeLoggerOutput} from '@rtk/node-ts-cli-toolkit';

import type {LangMap} from '../create-content-ids/create-content-ids';

/**
 * Generates the output files based on the provided langMap.
 *
 * Clears the outpurDirectory at first.
 * Then proceeds to iterate each language and create a json file of its
 * mappings.
 *
 * @param outputDirectory - Directory path where the files will be created.
 * @param langMap - Language to String map (see create-content-ids for more info).
 */
export function generateFiles(
    outputDirectory: string,
    langMap: readonly LangMap[]
): void {
    writeLoggerOutput(LogLevel.Verbose, 'Generate translation files');

    if (fs.existsSync(outputDirectory)) {
        rmdir(outputDirectory);
    }

    fs.mkdirSync(outputDirectory);

    const mergedMap: Map<string, Map<string, string>> = new Map();

    for (const stringMap of langMap) {
        for (const [langCode, translationMap] of stringMap.entries()) {
            if (!mergedMap.has(langCode)) {
                mergedMap.set(langCode, new Map<string, string>());
            }

            for (const [stringKey, stringValue] of translationMap.entries()) {
                mergedMap.get(langCode)!.set(stringKey, stringValue);
            }
        }
    }

    for (const [key, value] of mergedMap.entries()) {
        try {
            const filePath: string = path.join(outputDirectory, `${key}.json`);

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

/**
 * Removes provided directory (path) and all of its contents recursively.
 *
 * @param dir - Path to directory which will be removed
 */
export function rmdir(dir: string): void {
    const fileList: readonly string[] = fs.readdirSync(dir);

    for (const file of fileList) {
        const filePath: string = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            rmdir(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    }

    fs.rmdirSync(dir);
}
