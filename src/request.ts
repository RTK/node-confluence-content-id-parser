import * as https from 'https';

export function requestPage(confluenceBaseUri: string, confluencePageId: string, confluenceUsername: string, confluenceUserToken: string): Promise<string> {
    const authorizationString = Buffer.from(confluenceUsername + ':' + confluenceUserToken).toString('base64');
    const url = `${confluenceBaseUri}/rest/api/content/${confluencePageId}?expand=body.view`;

    return new Promise((resolve) => {
        https.get(
            url,
            {
                headers: {
                    'Authorization': `Basic ${authorizationString}`
                }
            },
            (response: https.Response): void => {
                const chunks: string[] = [];

                if (response.statusCode !== 200) {
                    throw new Error(`Error while requesting url: "${url}" - "${response.statusCode}"`);
                }

                response.on('data', (data: string) => {
                    chunks.push(data);
                });

                response.on('end', () => {
                    const content = chunks.join('');

                    try {
                        resolve(JSON.parse(content).body.view.value);
                    } catch (e) {
                        throw new Error(`Could not parse page response.`);
                    }
                });
            }
        );
    });
}
