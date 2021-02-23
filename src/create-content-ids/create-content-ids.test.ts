import {LogLevel, setLoggerLevel} from '@ams/cli-toolkit';

import {describe, expect} from '@jest/globals';

import {createContentIds, LangMap} from './create-content-ids';

describe('create-content-ids', (): void => {
    setLoggerLevel(LogLevel.Silent);

    describe('createContentIds()', (): void => {
        const dom: string = `
            <table>
                <tr>
                    <th>Content-Ids</th>
                    <th>de</th>
                    <th>en</th>
                </tr>
                <tr>
                    <td>t1</td>
                    <td>Hut</td>
                    <td>hat</td>
                </tr>
            </table>
        `;

        it('should create a langMap list containing the languages en and de', (): void => {
            const result: readonly LangMap[] = createContentIds(
                /^Content-Ids$/,
                dom
            );

            expect(result.length).toBe(1);
            expect(result[0].has('de')).toBeTruthy();
            expect(result[0].has('en')).toBeTruthy();

            expect(result[0].get('de')!.has('t1')).toBeTruthy();
            expect(result[0].get('en')!.has('t1')).toBeTruthy();

            expect(result[0].get('de')!.get('t1')).toBe('Hut');
            expect(result[0].get('en')!.get('t1')).toBe('hat');
        });

        it('should create list with two entries since two tables are provided', (): void => {
            const result: readonly LangMap[] = createContentIds(
                /^Content-Ids$/,
                dom + dom
            );

            expect(result.length).toBe(2);
        });

        it('should create a list without entries since the recognition pattern does not match', (): void => {
            const result: readonly LangMap[] = createContentIds(
                /^Content-Id$/,
                dom
            );

            expect(result.length).toBe(0);
        });
    });
});
