import fs from 'fs';

export function generateDirectory(directoryPath: string) {
    if (!fs.existsSync(directoryPath)) fs.mkdirSync(directoryPath);
}
