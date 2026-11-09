import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from './lib/harness.js';
import { assertValidBundleContract } from './lib/invariants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, 'fixtures/prebuilt');

test('fixtures: all real-world retail prebuilt PC snapshots pass strict invariant contracts', () => {
    const { exports: HT } = loadHintaTutka({ host: 'www.gigantti.fi' });

    const fixtureFiles = readdirSync(FIXTURES_DIR).filter(f => f.endsWith('.html'));
    assert.ok(fixtureFiles.length >= 4, `Must have at least 4 retail fixtures, found: ${fixtureFiles.length}`);

    for (const file of fixtureFiles) {
        const fullPath = join(FIXTURES_DIR, file);
        const html = readFileSync(fullPath, 'utf8');

        // Extract title from HTML
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : file;

        // Parse price
        const priceMatch = html.match(/([0-9\s]+(?:[.,][0-9]{2})?)\s*€/i);
        const currentPrice = priceMatch ? HT.parsePriceNumber(priceMatch[1]) : 1500.00;

        const info = { name: title, currentPrice };
        const bundleData = HT.detectAndExtractBundleData(info, null, currentPrice, html);

        // Assert that the prebuilt deconstruction satisfies all invariant quality rules
        assertValidBundleContract(bundleData, { fixtureName: file });

        // Ensure storage capacity exists and is clean
        const storageComp = bundleData.components.find(c => c.roleKey === 'storage');
        assert.ok(storageComp, `[${file}] Must contain storage drive`);
        assert.match(storageComp.cleanQuery, /\b\d+\s*(?:TB|GB)\b/i, `[${file}] Storage query must contain capacity`);

        // Ensure motherboard is clean without fluffy suffixes
        const moboComp = bundleData.components.find(c => c.roleKey === 'mobo');
        if (moboComp) {
            assert.ok(!/piirisarjaan/i.test(moboComp.cleanQuery), `[${file}] Motherboard query must not contain -piirisarjaan: ${moboComp.cleanQuery}`);
        }
    }
});
