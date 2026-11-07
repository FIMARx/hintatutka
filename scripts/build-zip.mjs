// Packages extension-mv3 into HintaTutka-MV3-Extension.zip
// Cross-platform: works on Windows, Linux, and macOS without extra dependencies.

import { execSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, rmSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const extDir = join(root, 'extension-mv3');
const zipOut = join(root, 'HintaTutka-MV3-Extension.zip');

console.log('Packaging Manifest V3 Extension ZIP...');

if (existsSync(zipOut)) {
    rmSync(zipOut);
}

if (process.platform === 'win32') {
    // PowerShell Compress-Archive
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${extDir}/*' -DestinationPath '${zipOut}' -Force"`, {
        cwd: root,
        stdio: 'inherit'
    });
} else {
    // Linux/macOS zip
    execSync(`cd "${extDir}" && zip -r "${zipOut}" . -x "*.DS_Store"`, {
        stdio: 'inherit'
    });
}

console.log(`✔ Extension packaged successfully: ${zipOut}`);
