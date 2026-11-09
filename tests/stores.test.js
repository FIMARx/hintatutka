import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from './lib/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

const { exports: HT } = loadHintaTutka();

test('stores matrix: STORES contains all 86 supported stores with unique configs', () => {
    assert.strictEqual(
        HT.STORES.length,
        86,
        `Expected exactly 86 stores in STORES registry, found ${HT.STORES.length}`
    );

    const matchesSeen = new Set();
    const namesSeen = new Set();

    for (const store of HT.STORES) {
        assert.ok(store.name && typeof store.name === 'string', `Store missing name: ${JSON.stringify(store)}`);
        assert.ok(store.match && typeof store.match === 'string', `Store ${store.name} missing match string`);
        assert.ok(store.match.length >= 3, `Store ${store.name} match string "${store.match}" too short`);

        // Check uniqueness
        assert.ok(!matchesSeen.has(store.match), `Duplicate store match detected: "${store.match}"`);
        assert.ok(!namesSeen.has(store.name), `Duplicate store name detected: "${store.name}"`);
        matchesSeen.add(store.match);
        namesSeen.add(store.name);

        // Check selectors
        assert.ok(Array.isArray(store.selectors), `Store ${store.name} selectors must be an array`);
        assert.ok(store.selectors.length > 0, `Store ${store.name} selectors array cannot be empty`);

        // Category hint validity if present
        if (store.categoryHint) {
            const validHints = new Set(['sports', 'grocery', 'furniture', 'vehicles']);
            assert.ok(
                validHints.has(store.categoryHint),
                `Store ${store.name} has invalid categoryHint "${store.categoryHint}". Valid hints: ${[...validHints].join(', ')}`
            );
        }
    }
});

function validateCssSelectorSyntax(sel, storeName) {
    assert.ok(typeof sel === 'string' && sel.trim().length > 0, `Empty selector in store "${storeName}"`);
    const s = sel.trim();

    // Check balanced brackets
    let bracketDepth = 0;
    let inQuote = null;
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuote) {
            if (c === inQuote && s[i - 1] !== '\\') inQuote = null;
        } else if (c === '"' || c === "'") {
            inQuote = c;
        } else if (c === '[') {
            bracketDepth++;
        } else if (c === ']') {
            bracketDepth--;
            assert.ok(bracketDepth >= 0, `Unmatched closing bracket in selector "${sel}" in store "${storeName}"`);
        }
    }
    assert.strictEqual(inQuote, null, `Unclosed quote in selector "${sel}" in store "${storeName}"`);
    assert.strictEqual(bracketDepth, 0, `Unclosed bracket in selector "${sel}" in store "${storeName}"`);

    // Cannot end with trailing combinator or separator
    assert.ok(!/[>+~,\s]$/.test(s), `Trailing combinator or whitespace in selector "${sel}" in store "${storeName}"`);
}

test('stores matrix: every CSS selector across all 81 stores has valid syntax', () => {
    let totalSelectorsChecked = 0;

    for (const store of HT.STORES) {
        for (const sel of store.selectors) {
            totalSelectorsChecked++;
            validateCssSelectorSyntax(sel, store.name);
        }
    }

    assert.ok(
        totalSelectorsChecked >= 150,
        `Expected at least 150 compiled selectors across 81 stores, checked ${totalSelectorsChecked}`
    );
});

test('stores matrix: selectors.json hot-patch file integrity and store mapping', () => {
    const selectorsPath = resolve(ROOT_DIR, 'selectors.json');
    const raw = readFileSync(selectorsPath, 'utf8');
    const json = JSON.parse(raw);

    assert.strictEqual(json.schemaVersion, 1);
    assert.ok(json.storeOverrides && typeof json.storeOverrides === 'object');

    const knownStoreMatches = new Set(HT.STORES.map(s => s.match));

    for (const [storeDomain, override] of Object.entries(json.storeOverrides)) {
        assert.ok(
            knownStoreMatches.has(storeDomain),
            `selectors.json overrides unknown store domain "${storeDomain}" not present in STORES`
        );
        assert.ok(Array.isArray(override.anchorSelectors), `Override for ${storeDomain} missing anchorSelectors`);

        for (const sel of override.anchorSelectors) {
            validateCssSelectorSyntax(sel, `selectors.json [${storeDomain}]`);
        }
    }
});

test('stores matrix: detectCurrentStore accurately matches every one of the 81 store hostnames', () => {
    for (const store of HT.STORES) {
        const testHostname = `www.${store.match}`;
        const { exports: localHT } = loadHintaTutka({ host: testHostname });
        const detected = localHT.detectCurrentStore();

        assert.strictEqual(
            detected.name,
            store.name,
            `Expected hostname "${testHostname}" to resolve to store "${store.name}", got "${detected.name}"`
        );
    }
});

test('stores matrix: all major category archetypes are represented in the 86-store registry', () => {
    const counts = {
        used: 0,
        refurbished: 0,
        grocery: 0,
        sports: 0,
        furniture: 0,
        vehicles: 0,
        retailTech: 0
    };

    for (const store of HT.STORES) {
        if (store.isUsedSite) counts.used++;
        else if (store.isRefurbishedSite) counts.refurbished++;
        else if (store.categoryHint === 'grocery') counts.grocery++;
        else if (store.categoryHint === 'sports') counts.sports++;
        else if (store.categoryHint === 'furniture') counts.furniture++;
        else if (store.categoryHint === 'vehicles') counts.vehicles++;
        else counts.retailTech++;
    }

    assert.strictEqual(counts.used, 3, 'Used sites (Tori, Vinted, Huuto)');
    assert.strictEqual(counts.refurbished, 3, 'Refurbished sites (Swappie, Taitonetti, Fonum)');
    assert.strictEqual(counts.grocery, 8, 'Grocery / Consumables (S-kaupat, K-Ruoka, Fiksuruoka, etc.)');
    assert.strictEqual(counts.sports, 8, 'Sports / Apparel (XXL, Intersport, Stadium, Budget Sport, etc.)');
    assert.strictEqual(counts.furniture, 8, 'Furniture (IKEA, JYSK, Masku, Asko, Sotka, etc.)');
    assert.strictEqual(counts.vehicles, 5, 'Vehicles / Automotive (Nettiauto, Kamux, Saka, Rinta-Jouppi, Autotie)');
    assert.strictEqual(counts.retailTech, 51, 'Electronics / Tech / Department retail');
});
