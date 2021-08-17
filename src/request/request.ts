import {LogLevel, writeLoggerOutput} from '@rtk/node-ts-cli-toolkit';

import * as http from 'http';
import * as https from 'https';

/**
 * Performs an http(s) request to provided confluence instance using the
 * confluence REST Api.
 *
 * @see: https://developer.atlassian.com/server/confluence/confluence-server-rest-api/
 *
 * This functions returns a promise containing the page's HTML as string.
 *
 * @param confluenceBaseUri - The base url to your confluence instance, e.g. https://test.atlassian.net/wiki/home
 * @param confluencePageId - The page you want to get the html from (https://confluence.atlassian.com/confkb/how-to-get-confluence-page-id-648380445.html)
 * @param confluenceUsername - The confluence username used for authorization
 * @param confluenceUserToken - The confluence access token or password used for authorization
 */
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

/**
 * Takes the incoming message (response), concatenates the bytes and parses it
 * to json. Returns the body view value from confluence. Otherwise throws an
 * error.
 *
 * @param resolve
 * @param url
 */
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
