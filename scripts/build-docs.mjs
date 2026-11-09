#!/usr/bin/env node
/**
 * HintaTutka — GitHub Pages Studio & Harvester Builder
 * Compiles the interactive web harvester and store directory from studio-template.html into docs/index.html.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from '../tests/lib/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const DOCS_DIR = join(ROOT_DIR, 'docs');

const { exports: HT } = loadHintaTutka();

const storesData = HT.STORES.map(s => ({
    name: s.name,
    match: s.match,
    category: s.categoryHint || (s.isUsedSite ? 'used' : (s.isRefurbishedSite ? 'refurbished' : 'electronics')),
    selectors: s.selectors
}));

let template = readFileSync(join(__dirname, 'studio-template.html'), 'utf8');

const replacements = {
    '__SCRIPT_VERSION__': HT.SCRIPT_VERSION,
    '__TOTAL_STORES__': String(storesData.length),
    '__COUNT_ALL__': String(storesData.length),
    '__COUNT_ELECTRONICS__': String(storesData.filter(s => s.category === 'electronics').length),
    '__COUNT_VEHICLES__': String(storesData.filter(s => s.category === 'vehicles').length),
    '__COUNT_GROCERY__': String(storesData.filter(s => s.category === 'grocery').length),
    '__COUNT_SPORTS__': String(storesData.filter(s => s.category === 'sports').length),
    '__COUNT_FURNITURE__': String(storesData.filter(s => s.category === 'furniture').length),
    '__COUNT_USED__': String(storesData.filter(s => s.category === 'used').length),
    '__COUNT_REFURBISHED__': String(storesData.filter(s => s.category === 'refurbished').length),
    '/* __REGISTERED_STORES_JSON__ */': JSON.stringify(storesData, null, 2)
};

for (const [key, val] of Object.entries(replacements)) {
    template = template.replaceAll(key, val);
}

writeFileSync(join(DOCS_DIR, 'index.html'), template, 'utf8');
console.log('✔ Successfully generated docs/index.html (GitHub Pages Studio & Harvester)');
console.log(`  File size: ${(template.length / 1024).toFixed(1)} KB`);
console.log(`  Stores embedded: ${storesData.length}`);
