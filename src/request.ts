import {LogLevel, writeLoggerOutput} from '@ams/cli-toolkit';

import * as http from 'http';
import * as https from 'https';

export async function requestPage(
    confluenceBaseUri: string,
    confluencePageId: string,
    confluenceUsername: string,
    confluenceUserToken: string
): Promise<string> {
    writeLoggerOutput(LogLevel.Verbose, 'Request confluence page via API');

    const authorizationString = Buffer.from(
        confluenceUsername + ':' + confluenceUserToken
    ).toString('base64');
    const url = `${confluenceBaseUri}/rest/api/content/${confluencePageId}?expand=body.view`;

    const options: http.RequestOptions = {
        headers: {
            Authorization: `Basic ${authorizationString}`
        }
    };

    return new Promise((resolve: (html: string) => void): void => {
        if (url.startsWith('https://')) {
            writeLoggerOutput(LogLevel.Verbose, 'Using https for request');
            https.get(url, options, onReceive(resolve, url));
        } else {
            writeLoggerOutput(LogLevel.Verbose, 'Using http for request');
            http.get(url, options, onReceive(resolve, url));
        }
    });
}

function onReceive(
    resolve: (html: string) => void,
    url: string
): (response: http.IncomingMessage) => void {
    return (response: http.IncomingMessage): void => {
        const chunks: string[] = [];

        if (response.statusCode !== 200) {
            throw new Error(
                `Error while requesting url: "${url}" - "${response.statusCode}"`
            );
        }

        response.on('data', (data: string): void => {
            chunks.push(data);
        });

        response.on('end', (): void => {
            const content = chunks.join('');

            try {
                resolve(JSON.parse(content).body.view.value);
            } catch (e) {
                throw new Error(`Could not parse page response.`);
            }
        });
    };
}
