import {LogLevel, writeLoggerOutput} from '@rtk/node-ts-cli-toolkit';

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
 * ```
 * recognitionPattern: ^Content-Id$
 *
 * |Content-Id|en|de|
 * |t1|hat|Hut|
 *`
 * Creates a map using "en" and "de" as keys, where as each key references
 * a string map where the content id ("t1") references the languages translation
 * such as "hat" or "Hut" depending on the language.
 *```
 *
 * When providing the `trimContent` argument, the contents of each cell get any
 * whitespaces trimmed (preceding and subsequent whitespaces).
 *
 * @example
 * ```
 * trimContent: true
 *
 * |Content-Id|en|de|
 * |t1| hat |  Hut   |
 *
 * Results in the mapping
 * {
 *  "en": {
 *      "t1": "hat"
 *  },
 *  "de": {
 *      "t1": "Hut"
 *  }
 * }
 * ```
 *
 * By setting the `identifierColumnIndex` argument you can choose at which
 * column index the content-id resides.
 *
 * @example
 * ```
 * identifierColumnIndex: 1
 *
 * |Description|Content-Id|en|
 * |something to wear|t1|hat|
 * ```
 *
 * The `startingColumnIndex` argument indicates at which column the translation
 * strings are placed.
 *
 * @example
 * ```
 * startingColumnIndex: 2
 * |Content-Id|Description|en|
 * |t1|something to wear|hat|
 * ```
 *
 * @param recognitionPattern
 * @param trimContent
 * @param identifierColumnIndex
 * @param startingColumnIndex
 * @param html
 */
export function createContentIds(
    recognitionPattern: RegExp,
    trimContent: boolean,
    identifierColumnIndex: number,
    startingColumnIndex: number,
    html: string
): readonly LangMap[] {
    writeLoggerOutput(
        LogLevel.Verbose,
        'Creating content ids from confluence page'
    );

    const dom: jsdom.JSDOM = new jsdom.JSDOM(html);

    const tableCollection: NodeListOf<HTMLTableElement> = dom.window.document.querySelectorAll(
        'table'
    );

    if (tableCollection.length > 0) {
        const resultList: LangMap[] = [];

        for (
            let tableIndex = 0;
            tableIndex < tableCollection.length;
            tableIndex++
        ) {
            const trCollection: NodeListOf<HTMLTableRowElement> = tableCollection
                .item(tableIndex)
                .querySelectorAll('tr');

            if (
                trCollection?.length > 1 &&
                trCollection.item(0).querySelectorAll('th').length > 0
            ) {
                const headlines: NodeListOf<HTMLTableCellElement> = trCollection
                    .item(0)
                    .querySelectorAll('th');

                const langMap: LangMap = new Map<string, Map<string, string>>();

                if (
                    recognitionPattern.test(headlines.item(0).textContent ?? '')
                ) {
                    const languageList: string[] = [];

                    for (
                        let headlineIndex = startingColumnIndex;
                        headlineIndex < headlines.length;
                        headlineIndex++
                    ) {
                        const langCode: string | null = headlines.item(
                            headlineIndex
                        ).textContent;

                        if (langCode) {
                            langMap.set(langCode, new Map());

                            languageList.push(langCode);

                            writeLoggerOutput(
                                LogLevel.Verbose,
                                `Detected language ${langCode}`
                            );
                        }
                    }

                    for (
                        let rowIndex = 1;
                        rowIndex < trCollection.length;
                        rowIndex++
                    ) {
                        const tdCollection: NodeListOf<HTMLTableCellElement> = trCollection
                            .item(rowIndex)
                            .querySelectorAll('td');

                        let key: string | null = tdCollection.item(
                            identifierColumnIndex
                        ).textContent;

                        if (trimContent && key) {
                            key = key.trim();
                        }

                        if (key) {
                            for (
                                let tdIndex = startingColumnIndex;
                                tdIndex < tdCollection.length;
                                tdIndex++
                            ) {
                                const langIndex =
                                    languageList[tdIndex - startingColumnIndex];

                                // Fallback to key for easy identification of missing translations
                                let translation: string | null =
                                    tdCollection.item(tdIndex).textContent ||
                                    key;

                                if (trimContent && translation) {
                                    translation = translation.trim();
                                }

                                if (langIndex && langMap.has(langIndex)) {
                                    langMap
                                        .get(langIndex)!
                                        .set(key, translation ?? '');
                                }
                            }
                        }
                    }

                    resultList.push(langMap);
                } else {
                    writeLoggerOutput(
                        LogLevel.Warn,
                        'No matches for recognition pattern'
                    );
                }
            }
        }

        return resultList;
    }

    throw new Error(`Could not create string mapping`);
}
