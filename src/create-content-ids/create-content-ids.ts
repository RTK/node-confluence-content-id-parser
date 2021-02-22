import {LogLevel, writeLoggerOutput} from '@ams/cli-toolkit';

import * as jsdom from 'jsdom';

/**
 * String map, maps a content id to a translational expression.
 */
type StringMap = Map<string, string>;

/**
 * Language map, maps a language to a StringMap.
 */
export type LangMap = Map<string, StringMap>;

/**
 * Creates the content id language-mapping from the confluence html.
 *
 * It looks for each table matching the recognitionPattern in its first header
 * column and generates a LangMap from it.
 *
 * @example
 * recognitionPattern: ^Content-Id$
 *
 * |Content-Id|en|de|
 * |t1|hat|Hut|
 *
 * Creates a map using "en" and "de" as keys, where as each key references
 * a string map where the content id ("t1") references the languages translation
 * such as "hat" or "Hut" depending on the language.
 *
 * @param recognitionPattern
 * @param html
 */
export function createContentIds(recognitionPattern: RegExp, html: string): readonly LangMap[] {
    writeLoggerOutput(LogLevel.Verbose, 'Creating content ids from confluence page');

    const dom = new jsdom.JSDOM(html);

    const tableCollection: NodeListOf<HTMLTableElement> = dom.window.document.querySelectorAll('table');

    if (tableCollection.length > 0) {
        const results = [];

        for (let tableIndex = 0; tableIndex < tableCollection.length; tableIndex++) {
            const trCollection: NodeListOf<HTMLTableRowElement> = tableCollection.item(tableIndex).querySelectorAll('tr');

            if (trCollection?.length > 1 && trCollection.item(0).querySelectorAll('th').length > 0) {
                const headlines: NodeListOf<HTMLTableHeaderCellElement> = trCollection.item(0).querySelectorAll('th');

                const langMap: LangMap = new Map<string, Map<string, string>>();

                if (recognitionPattern.test(headlines.item(0).textContent ?? '')) {
                    const languages: string[] = [];

                    for (let headlineIndex = 1; headlineIndex < headlines.length; headlineIndex++) {
                        const langCode: string | null = headlines.item(headlineIndex).textContent;

                        if (langCode) {
                            langMap.set(langCode, new Map());

                            languages.push(langCode);
                        }
                    }

                    for (let rowIndex = 1; rowIndex < trCollection.length; rowIndex++) {
                        const tdCollection: NodeListOf<HTMLTableCellElement> = trCollection.item(rowIndex).querySelectorAll('td');

                        const key: string | null = tdCollection.item(0).textContent;

                        if (key) {
                            for (let tdIndex = 1; tdIndex < tdCollection.length; tdIndex++) {
                                const langIndex = languages[tdIndex - 1];
                                const translation: string | null = tdCollection.item(tdIndex).textContent;

                                if (langIndex && langMap.has(langIndex)) {
                                    langMap.get(langIndex)!.set(key, translation ?? '');
                                }
                            }
                        }
                    }

                    results.push(langMap);
                }
            }
        }

        return results;
    }

    throw new Error(`Could not create string mapping`);
}
