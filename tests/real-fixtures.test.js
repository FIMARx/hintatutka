import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from './lib/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, 'fixtures/real');

test('real-fixtures: Jimm\'s live category listing HTML (/Product/List/) completely rejects product extraction', () => {
    const fixturePath = join(FIXTURES_DIR, 'jimms-ddr5-listing.html');
    if (!existsSync(fixturePath)) return;

    const html = readFileSync(fixturePath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.jimms.fi',
        pathname: '/fi/Product/List/000-1UL/komponentit--muistit--ddr5'
    });

    const info = HT.extractProductInfo();
    assert.strictEqual(info, null, 'Jimm\'s category listing page must return null from extractProductInfo');
});

test('real-fixtures: Jimm\'s live standalone RAM kit HTML never triggers false-positive PC build or bundle', () => {
    const fixturePath = join(FIXTURES_DIR, 'jimms-vcolor-ram-standalone.html');
    if (!existsSync(fixturePath)) return;

    const html = readFileSync(fixturePath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.jimms.fi',
        pathname: '/fi/Product/Show/218450/tmxsal1660830kwk/v-color-32gb'
    });

    const info = {
        name: 'v-color 32GB (2 x 16GB) Manta XSky RGB, DDR5 6000MHz, CL30, 1.35V, musta',
        currentPrice: 519.90
    };

    const bundleData = HT.detectAndExtractBundleData(info, null, 519.90, html);
    assert.strictEqual(bundleData, null, 'Standalone RAM kit must return null and never trigger bundle or PC build');
});

test('real-fixtures: Jimm\'s live GtG Owl 5090 prebuilt PC HTML deconstructs all hardware components without prose bullets', () => {
    const fixturePath = join(FIXTURES_DIR, 'jimms-gtg-owl-5090-prebuilt.html');
    if (!existsSync(fixturePath)) return;

    const html = readFileSync(fixturePath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.jimms.fi',
        pathname: '/fi/Product/Show/217841/jimms-a-n-gtg-nxa90/jimm-s-gtg-owl-5090-pelitietokone'
    });

    const info = {
        name: "Jimm's GtG Owl 5090, pelitietokone",
        currentPrice: 10499.00
    };

    const bundleData = HT.detectAndExtractBundleData(info, null, 10499.00, html);
    assert.ok(bundleData, 'Prebuilt PC must be detected');
    assert.strictEqual(bundleData.isPcBuild, true);
    assert.ok(bundleData.components.length >= 7, `Expected at least 7 components, got ${bundleData.components.length}`);

    // Verify key roles
    const roles = bundleData.components.map(c => c.roleKey);
    assert.ok(roles.includes('cpu'), 'Must contain CPU');
    assert.ok(roles.includes('gpu'), 'Must contain GPU');
    assert.ok(roles.includes('ram'), 'Must contain RAM');
    assert.ok(roles.includes('storage'), 'Must contain Storage');
    assert.ok(roles.includes('mobo'), 'Must contain Motherboard');
    assert.ok(roles.includes('psu'), 'Must contain PSU');

    // Reject false single-item summary prose
    const falseRam = bundleData.components.find(c => c.name.includes('uusimmat yhteydet'));
    assert.strictEqual(falseRam, undefined, 'Marketing summary sentence must never be treated as a component card');
});

test('real-fixtures: Power.fi live category listing HTML (/c/1831/...) completely rejects product extraction', () => {
    const fixturePath = join(FIXTURES_DIR, 'power-cpu-listing.html');
    if (!existsSync(fixturePath)) return;

    const html = readFileSync(fixturePath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.power.fi',
        pathname: '/c/1831/tietotekniikka/tietokonekomponentit/prosessorit/'
    });

    const info = HT.extractProductInfo();
    assert.strictEqual(info, null, 'Power category listing page must return null from extractProductInfo');
});

test('real-fixtures: Multitronic live product HTML extracts clean title and valid price', () => {
    const fixturePath = join(FIXTURES_DIR, 'multitronic-iphone-16-pro.html');
    if (!existsSync(fixturePath)) return;

    const html = readFileSync(fixturePath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.multitronic.fi',
        pathname: '/fi/products/3777418/spare-part'
    });

    // Check title extraction and model code query
    const rawTitleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(rawTitleMatch, 'Must find <h1> in Multitronic HTML');
    const rawTitle = rawTitleMatch[1].replace(/<[^>]+>/g, '').trim();

    const cleanTitle = HT.extractCoreProductTitle(rawTitle);
    assert.ok(cleanTitle.length >= 3, `Clean title must have valid length: ${cleanTitle}`);

    const modelQuery = HT.extractConciseModelQuery(cleanTitle);
    assert.ok(modelQuery.length >= 3, `Model query must have valid length: ${modelQuery}`);
});
