import {LogLevel, setLoggerLevel} from '@ams/cli-toolkit';

import * as fs from 'fs';
import * as path from 'path';

import {generateFiles, rmdir} from './file-generator';

import type {LangMap} from '../create-content-ids/create-content-ids';

describe('file-generator', (): void => {
    setLoggerLevel(LogLevel.Silent);

    describe('generateFiles()', (): void => {
        const outDir: string = path.join(__dirname, 'out');

        afterEach((): void => {
            rmdir(outDir);
        });

        it('should create two files in the provided outputDirectory', (): void => {
            const langMap: LangMap = new Map();
            langMap.set('de', new Map([['t1', 'Hut']]));
            langMap.set('en', new Map([['t1', 'hat']]));

            generateFiles(outDir, [langMap]);

            expect(fs.existsSync(outDir)).toBeTruthy();

            const files: string[] = fs.readdirSync(outDir);

            expect(files.length).toBe(2);
            expect(files[0]).toBe('de.json');
            expect(files[1]).toBe('en.json');
        });

        it('should create the correct format', (): void => {
            const langMap: LangMap = new Map();
            langMap.set('de', new Map([['t1', 'Hut']]));

            generateFiles(outDir, [langMap]);

            const contents: string = fs.readFileSync(path.join(outDir, 'de.json'), 'utf8');

            expect(contents).toBe(JSON.stringify({
                t1: 'Hut'
            }));
        });

        it('should merge multiple langMaps to one output', (): void => {
            const langMap1: LangMap = new Map();
            langMap1.set('de', new Map([['t1', 'Hut']]));

            const langMap2: LangMap = new Map();
            langMap2.set('de', new Map([['t2', 'Hit']]));

            generateFiles(outDir, [langMap1, langMap2]);

            const contents: string = fs.readFileSync(path.join(outDir, 'de.json'), 'utf8');

            expect(contents).toBe(JSON.stringify({
                t1: 'Hut',
                t2: 'Hit'
            }));
        });
    });

    describe('rmdir()', (): void => {
        it('should remove provided directory', (): void => {
            const dir: string = path.join(__dirname, 'test');

            fs.mkdirSync(dir);
            expect(fs.existsSync(dir)).toBeTruthy();

            rmdir(dir);

            expect(fs.existsSync(dir)).toBeFalsy();
        });

        it('should remove files and folder contents alike', (): void => {
            const dir: string = path.join(__dirname, 'test');

            fs.mkdirSync(dir);
            fs.mkdirSync(path.join(dir, 'test'));
            fs.writeFileSync(path.join(dir, '23'), '123');
            fs.writeFileSync(path.join(dir, 'test', '23'), '123');
            expect(fs.existsSync(dir)).toBeTruthy();

            rmdir(dir);

            expect(fs.existsSync(dir)).toBeFalsy();
        });
    });
});
