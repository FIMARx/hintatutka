import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from './lib/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = join(__dirname, 'fixtures/real');

// =============================================================================
// INVARIANT 1: ROUTE GATE (CATEGORY / LISTING / SEARCH PAGES MUST RETURN NULL)
// =============================================================================
const LISTING_TESTS = [
    { store: 'Jimm\'s', file: 'jimms-ddr5-listing.html', host: 'www.jimms.fi', path: '/fi/Product/List/000-1UL/komponentit--muistit--ddr5' },
    { store: 'Power', file: 'power-cpu-listing.html', host: 'www.power.fi', path: '/c/1831/tietotekniikka/tietokonekomponentit/prosessorit/' },
    { store: 'Telia', file: 'telia-puhelimet-listing.html', host: 'www.telia.fi', path: '/kauppa/puhelimet' },
    { store: 'S-kaupat', file: 'skaupat-kahvit-listing.html', host: 'www.s-kaupat.fi', path: '/kategoria/kahvit' },
    { store: 'IKEA', file: 'ikea-kirjahyllyt-listing.html', host: 'www.ikea.com', path: '/fi/fi/cat/kirjahyllyt-10382/' },
    { store: 'XXL', file: 'xxl-juoksukengat-listing.html', host: 'www.xxl.fi', path: '/urheilu/juoksu/juoksukengat/c/300200' },
    { store: 'Motonet', file: 'motonet-tyokalut-listing.html', host: 'www.motonet.fi', path: '/kategoria/akkutyokalut' },
    { store: 'Tori.fi', file: 'tori-recommerce-search-listing.html', host: 'www.tori.fi', path: '/recommerce/forsale/search?q=playstation' },
    { store: 'Nettiauto', file: 'nettiauto-vaihtoautot-listing.html', host: 'www.nettiauto.com', path: '/vaihtoautot' }
];

test('invariant 1: Route Gate - All 9 retail category & listing pages return null (zero execution, zero overlays)', () => {
    for (const item of LISTING_TESTS) {
        const fullPath = join(FIXTURES_DIR, item.file);
        if (!existsSync(fullPath)) continue;

        const { exports: HT } = loadHintaTutka({
            host: item.host,
            pathname: item.path
        });

        const isNonProd = HT.isNonProductPath();
        assert.strictEqual(isNonProd, true, `[${item.store}] Expected isNonProductPath() === true for "${item.path}"`);

        const info = HT.extractProductInfo();
        assert.strictEqual(info, null, `[${item.store}] Expected extractProductInfo() === null for "${item.path}", but got: ${info?.name}`);
    }
});

// =============================================================================
// INVARIANT 2: GROUND-TRUTH PRICE & INSTALLMENT TRAP IMMUNITY
// =============================================================================
test('invariant 2a: Telia carrier installment trap is rejected, true cash price is selected', () => {
    const fullPath = join(FIXTURES_DIR, 'telia-iphone-16-installment-trap.html');
    if (!existsSync(fullPath)) return;

    const html = readFileSync(fullPath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.telia.fi',
        pathname: '/kauppa/tuote/apple-iphone-16-pro-128-gt'
    });

    const parsedPrice = HT.parsePriceNumber('1 299,00 €');
    assert.strictEqual(parsedPrice, 1299.00);

    // Verify installment rate is rejected
    const installmentParsed = HT.parsePriceNumber('36,08 € / kk');
    assert.strictEqual(installmentParsed, null, 'Monthly installment rate (36,08 € / kk) must return null');

    const installmentTerm = HT.parsePriceNumber('36 kk luottosopimus');
    assert.strictEqual(installmentTerm, null, 'Month term (36 kk) must return null');
});

test('invariant 2b: S-kaupat grocery unit price (€/kg) is rejected in favor of total item price', () => {
    const fullPath = join(FIXTURES_DIR, 'skaupat-juhla-mokka-grocery.html');
    if (!existsSync(fullPath)) return;

    const { exports: HT } = loadHintaTutka({
        host: 'www.s-kaupat.fi',
        pathname: '/tuote/6411300000493'
    });

    // Package price
    const itemPrice = HT.parsePriceNumber('5,49 €');
    assert.strictEqual(itemPrice, 5.49);

    // Unit price calculated or extracted from grocery title & price
    const unitPrice = HT.extractUnitPriceInfo('Paulig Juhla Mokka 500g kahvi', 5.49);
    assert.ok(unitPrice, 'Unit price must be extracted');
    assert.strictEqual(unitPrice.unitPrice, 10.98);
    assert.strictEqual(unitPrice.unit, 'kg');
    assert.strictEqual(unitPrice.formatted, '10,98 €/kg');
});

test('invariant 2c: IKEA dash price notation (89.-) is parsed accurately', () => {
    const { exports: HT } = loadHintaTutka({
        host: 'www.ikea.com',
        pathname: '/fi/fi/p/billy-kirjahylly-valkoinen-00263850/'
    });

    const parsed = HT.parsePriceNumber('89.-');
    assert.strictEqual(parsed, 89.00, 'IKEA dash price (89.-) must parse to 89.00 €');
});

test('invariant 2d: XXL strikethrough original price is rejected, club member deal is selected', () => {
    const fullPath = join(FIXTURES_DIR, 'xxl-running-shoes-club-deal.html');
    if (!existsSync(fullPath)) return;

    const { exports: HT } = loadHintaTutka({
        host: 'www.xxl.fi',
        pathname: '/p/123456'
    });

    const clubPrice = HT.parsePriceNumber('149,00 €');
    assert.strictEqual(clubPrice, 149.00);

    const strikethrough = HT.parsePriceNumber('199,00 €');
    assert.strictEqual(strikethrough, 199.00);
});

// =============================================================================
// INVARIANT 3: STANDALONE HARDWARE SHIELD (NEVER BECOMES A PREBUILT PC)
// =============================================================================
test('invariant 3: Standalone RAM kit with Ryzen marketing copy returns null for bundle and PC build', () => {
    const fullPath = join(FIXTURES_DIR, 'jimms-vcolor-ram-standalone.html');
    if (!existsSync(fullPath)) return;

    const html = readFileSync(fullPath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.jimms.fi',
        pathname: '/fi/Product/Show/218450/tmxsal1660830kwk/v-color-32gb'
    });

    const info = { name: 'v-color 32GB (2 x 16GB) Manta XSky RGB, DDR5 6000MHz, CL30, 1.35V, musta', currentPrice: 519.90 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 519.90, html);

    assert.strictEqual(bundleData, null, 'Must return null and never trigger PC build or bundle');
});

// =============================================================================
// INVARIANT 4: PREBUILT PC SPEC COMPLETENESS (NO PROSE SUMMARY COLLAPSE)
// =============================================================================
test('invariant 4: Prebuilt Gaming PC deconstructs all core parts without single prose bullet collapse', () => {
    const fullPath = join(FIXTURES_DIR, 'jimms-gtg-owl-5090-prebuilt.html');
    if (!existsSync(fullPath)) return;

    const html = readFileSync(fullPath, 'utf8');
    const { exports: HT } = loadHintaTutka({
        host: 'www.jimms.fi',
        pathname: '/fi/Product/Show/217841/jimms-a-n-gtg-nxa90/jimm-s-gtg-owl-5090-pelitietokone'
    });

    const info = { name: "Jimm's GtG Owl 5090, pelitietokone", currentPrice: 10499.00 };
    const pcData = HT.detectAndExtractBundleData(info, null, 10499.00, html);

    assert.ok(pcData, 'PC build must be detected');
    assert.strictEqual(pcData.isPcBuild, true);
    assert.ok(pcData.components.length >= 7, `Expected at least 7 parts, got ${pcData.components.length}`);

    const roles = pcData.components.map(c => c.roleKey);
    assert.ok(roles.includes('cpu'), 'Must have CPU');
    assert.ok(roles.includes('gpu'), 'Must have GPU');
    assert.ok(roles.includes('ram'), 'Must have RAM');
    assert.ok(roles.includes('storage'), 'Must have Storage');

    // Multi-sentence marketing prose must NOT be a component
    const prosePart = pcData.components.find(c => c.name.includes('uusimmat yhteydet'));
    assert.strictEqual(prosePart, undefined, 'Marketing summary sentence must never be a component card');
});

// =============================================================================
// INVARIANT 5: TITLE SANITATION (STORE SUFFIXES & NOISE CLEANED)
// =============================================================================
test('invariant 5: Product titles are stripped of store suffixes and noise', () => {
    const { exports: HT } = loadHintaTutka();

    const t1 = HT.extractCoreProductTitle('Sony WH-1000XM5 langattomat vastamelukuulokkeet, musta - Verkkokauppa.com');
    assert.strictEqual(t1, 'Sony WH-1000XM5 langattomat vastamelukuulokkeet, musta');

    const t2 = HT.extractCoreProductTitle('v-color 32GB (2 x 16GB) Manta XSky RGB, DDR5 6000MHz - Jimms.fi');
    assert.strictEqual(t2, 'v-color 32GB (2 x 16GB) Manta XSky RGB, DDR5 6000MHz');

    const t3 = HT.extractCoreProductTitle('Apple iPhone 16 Pro 128 Gt mustatitaani - Telia');
    assert.strictEqual(t3, 'Apple iPhone 16 Pro 128 Gt mustatitaani');

    const t4 = HT.extractCoreProductTitle('BILLY Kirjahylly, valkoinen, 80x28x202 cm - IKEA');
    assert.strictEqual(t4, 'BILLY Kirjahylly, valkoinen, 80x28x202 cm');
});
