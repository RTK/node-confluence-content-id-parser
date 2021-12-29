import {LogLevel, setLoggerLevel} from '@rtk/node-ts-cli-toolkit';

import {describe, expect} from '@jest/globals';

import * as http from 'http';

import {requestPage} from './request';

describe('request', (): void => {
    setLoggerLevel(LogLevel.Silent);

    describe('requestPage()', (): void => {
        const hostname = '0.0.0.0';
        const port = 65535;
        const baseUrl = `http://${hostname}:${port}`;
        const html = '<div>test</div>';

        let authorizationHeader: string | null = null;
        let url: string | null = null;

        let server: http.Server = http.createServer(
            (
                request: http.IncomingMessage,
                response: http.ServerResponse
            ): void => {
                authorizationHeader = request.headers?.authorization ?? null;
                url = request.url ?? null;

                response.write(
                    JSON.stringify({
                        body: {
                            view: {
                                value: html
                            }
                        }
                    })
                );

                response.end();
            }
        );

        server.listen(port, hostname);

        beforeEach((): void => {
            authorizationHeader = null;
            url = null;
        });

        afterAll((): void => {
            server.close();
        });

        it('should request the server with the correct url and authorization header', async (): Promise<void> => {
            const pageId = '12345';
            const username = 'mrTest';
            const token = 'tokken';

            await requestPage(baseUrl, pageId, username, token);

            expect(url).not.toBeNull();
            expect(url).toBe(`/rest/api/content/${pageId}?expand=body.view`);

            expect(authorizationHeader).not.toBeNull();
            expect(authorizationHeader).toBe(
                'Basic ' +
                    Buffer.from(username + ':' + token).toString('base64')
            );
        });

        it('should request the server with the correct url and authorization header', async (): Promise<void> => {
            const pageId = '12345';
            const token = 'tokken';

            await requestPage(baseUrl, pageId, null, token);

            expect(url).not.toBeNull();
            expect(url).toBe(`/rest/api/content/${pageId}?expand=body.view`);

            expect(authorizationHeader).not.toBeNull();
            expect(authorizationHeader).toBe('Bearer tokken');
        });

        it('should return the pages html', (): void => {
            const pageId = '12345';
            const username = 'mrTest';
            const token = 'tokken';

            expect(requestPage(baseUrl, pageId, username, token)).resolves.toBe(
                html
            );
        });
    });
});
