import {LogLevel, writeLoggerOutput} from '@ams/cli-toolkit';

import * as jsdom from 'jsdom';

type StringMap = Map<string, string>;
export type LangMap = Map<string, StringMap>;

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
