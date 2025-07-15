// import {promisify} from "util";
// import fs from "fs";
//
// export async function downloadFromURL(url: string) {
//     const resp = await fetch(url)
//     return resp.arrayBuffer()
// }
// export async function downloadAndSaveFromURL(url: string, path: string) {
//     const writeFile = promisify(fs.writeFile);
//     await writeFile(path, Buffer.from(await downloadFromURL(url)));
// }

import fs from 'fs';
import fetch from 'node-fetch';
import 'colorts/lib/string';

export async function downloadAndSaveFromURL<T extends Record<string, any>>(
    url: string,
    path: string,
    options?: T,
) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    const filename = url.split('/')[url.split('/').length - 1];
    const customName = options?.customName ?? filename;

    const fileStream = fs.createWriteStream(path);
    const totalBytes = Number(response.headers.get('content-length')) || 0;
    let downloadedBytes = 0;

    const spinnerIcons = ['-', '\\', '|', '/'];
    let spinnerIndex = 0;
    const spinnerInterval = setInterval(() => {
        let message: string;
        if (totalBytes > 0) {
            const progressPercent = (
                (downloadedBytes / totalBytes) *
                100
            ).toFixed(2);
            message =
                `[${spinnerIcons[spinnerIndex++ % spinnerIcons.length]}] Downloading ` +
                `${customName} `.magenta +
                `(${progressPercent}%)`.yellow;
        } else {
            message =
                `[${spinnerIcons[spinnerIndex++ % spinnerIcons.length]}] Downloading ` +
                `${customName} `.magenta +
                `(${downloadedBytes} bytes)`.yellow;
        }
        process.stdout.write(`\r${message}`);
    }, 120);

    response.body?.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length;
    });
    response.body?.pipe(fileStream);
    await new Promise<void>((resolve, reject) => {
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
        response.body?.on('error', reject);
    });

    clearInterval(spinnerInterval);
    // if (options?.printResult) {
    //     process.stdout.write(
    //         '\rSuccessfully downloaded: '.green + `${customName}\n`.yellow,
    //     );
    // }
}
