import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

const { exports: HT } = loadHintaTutka();

test('precision: iPhone cross-generation shields', () => {
    // iPhone 18 Pro must NEVER match iPhone 17
    const vkIphone18Pro = 'Apple iPhone 18 Pro 256 GB phone, wine red';
    const amzIphone17 = 'Apple iPhone 17 256 GB: 6.3 Inch Display';
    const amzIphone18 = 'Apple iPhone 18 256 GB';
    const amzIphone18ProMax = 'Apple iPhone 18 Pro Max 256 GB';

    const r17 = HT.evaluateSpecCompatibility(vkIphone18Pro, amzIphone17);
    assert.strictEqual(r17.hasHardConflict, true, 'iPhone 18 Pro MUST hard-conflict with iPhone 17');

    const r18Base = HT.evaluateSpecCompatibility(vkIphone18Pro, amzIphone18);
    assert.strictEqual(r18Base.hasHardConflict, true, 'iPhone 18 Pro MUST hard-conflict with base iPhone 18');

    const r18Max = HT.evaluateSpecCompatibility(vkIphone18Pro, amzIphone18ProMax);
    assert.strictEqual(r18Max.hasHardConflict, true, 'iPhone 18 Pro MUST hard-conflict with iPhone 18 Pro Max');

    // Same generation and tier with different color/SKU must be compatible
    const r18ProSame = HT.evaluateSpecCompatibility(
        vkIphone18Pro,
        'Apple iPhone 18 Pro 256GB jäätikkö - MJRT4QN/A'
    );
    assert.strictEqual(r18ProSame.hasHardConflict, false, 'Same model iPhone 18 Pro 256GB must be compatible across colors');
});

test('precision: Motherboard form-factor suffix shield (B850M vs B850)', () => {
    const targetB850M = 'ASUS TUF GAMING B850M-PLUS WIFI Motherboard';
    const candidateB850 = 'ASUS TUF GAMING B850-PLUS WIFI Motherboard';
    const candidateB850M = 'ASUS TUF GAMING B850M-PLUS';

    const rConflict = HT.evaluateSpecCompatibility(targetB850M, candidateB850);
    assert.strictEqual(
        rConflict.hasHardConflict,
        true,
        'B850M-PLUS (micro-ATX) MUST hard-conflict with standard B850-PLUS (ATX)'
    );

    const rMatch = HT.evaluateSpecCompatibility(targetB850M, candidateB850M);
    assert.strictEqual(
        rMatch.hasHardConflict,
        false,
        'B850M-PLUS MUST match valid B850M candidate'
    );
});

test('precision: GPU generation & tier variants (RTX 4070 vs Super vs Ti vs 5080)', () => {
    const target4070Super = 'ASUS Dual GeForce RTX 4070 Super 12GB';
    const candidate4070 = 'ASUS Dual GeForce RTX 4070 12GB';
    const candidate4070Ti = 'ASUS TUF GeForce RTX 4070 Ti 12GB';
    const candidate5080 = 'ASUS TUF GeForce RTX 5080 16GB';

    assert.strictEqual(
        HT.evaluateSpecCompatibility(target4070Super, candidate4070).hasHardConflict,
        true,
        'RTX 4070 Super MUST conflict with base RTX 4070'
    );
    assert.strictEqual(
        HT.evaluateSpecCompatibility(target4070Super, candidate4070Ti).hasHardConflict,
        true,
        'RTX 4070 Super MUST conflict with RTX 4070 Ti'
    );
    assert.strictEqual(
        HT.evaluateSpecCompatibility(target4070Super, candidate5080).hasHardConflict,
        true,
        'RTX 4070 Super MUST conflict with RTX 5080'
    );
});

test('precision: CPU architecture & generation variants (AMD Ryzen 7 7800X3D vs 9800X3D)', () => {
    const target7800X3D = 'AMD Ryzen 7 7800X3D Prosessori';
    const candidate9800X3D = 'AMD Ryzen 7 9800X3D Prosessori';
    const candidate7700X = 'AMD Ryzen 7 7700X Prosessori';

    assert.strictEqual(
        HT.evaluateSpecCompatibility(target7800X3D, candidate9800X3D).hasHardConflict,
        true,
        'Ryzen 7 7800X3D MUST hard-conflict with Ryzen 7 9800X3D'
    );
    assert.strictEqual(
        HT.evaluateSpecCompatibility(target7800X3D, candidate7700X).hasHardConflict,
        true,
        'Ryzen 7 7800X3D MUST hard-conflict with 7700X'
    );
});

test('precision: Storage capacity mismatch rejection', () => {
    const target256 = 'Apple iPhone 18 Pro 256 GB phone';
    const candidate128 = 'Apple iPhone 18 Pro 128 GB';
    const candidate512 = 'Apple iPhone 18 Pro 512 GB';
    const candidate1TB = 'Apple iPhone 18 Pro 1 TB';

    assert.strictEqual(
        HT.evaluateSpecCompatibility(target256, candidate128).hasHardConflict,
        true,
        '256GB MUST hard-conflict with 128GB'
    );
    assert.strictEqual(
        HT.evaluateSpecCompatibility(target256, candidate512).hasHardConflict,
        true,
        '256GB MUST hard-conflict with 512GB'
    );
    assert.strictEqual(
        HT.evaluateSpecCompatibility(target256, candidate1TB).hasHardConflict,
        true,
        '256GB MUST hard-conflict with 1TB'
    );
});

test('precision: extractConciseModelQuery strips retailer fluff while preserving critical tokens', () => {
    const testCases = [
        {
            input: 'Apple iPhone 18 Pro 256 GB phone, wine red',
            expectedParts: ['Apple', 'iPhone', '18', 'Pro', '256GB']
        },
        {
            input: 'Apple iPhone 18 Pro Max 256GB musta - MJXN4QN/A',
            expectedParts: ['Apple', 'iPhone', '18', 'Pro', 'Max', '256GB']
        },
        {
            input: 'Logitech G Pro X TKL LIGHTSPEED Gaming Keyboard - Tactile, musta',
            expectedParts: ['Logitech', 'Pro', 'TKL', 'LIGHTSPEED']
        },
        {
            input: 'ASUS TUF GAMING B850M-PLUS WIFI emolevy',
            expectedParts: ['ASUS', 'TUF', 'B850M-PLUS']
        }
    ];

    for (const { input, expectedParts } of testCases) {
        const concise = HT.extractConciseModelQuery(input);
        for (const part of expectedParts) {
            assert.ok(
                concise.toLowerCase().includes(part.toLowerCase()),
                `Concise query for "${input}" must preserve "${part}": got "${concise}"`
            );
        }
    }
});

test('precision: Amazon.de search parser rejects cross-generation & cross-tier cards', () => {
    // Simulated Amazon.de search HTML for iPhone 18 Pro where search engine returns iPhone 17 as first card
    const mockHtml = `
        <div data-asin="B0DE_IPHONE17" class="s-result-item">
            <h2><span>Apple</span></h2>
            <h2><a href="/dp/B0DE_IPHONE17"><span>Apple iPhone 17 256 GB: 6.3 Inch Display</span></a></h2>
            <div class="a-price"><span class="a-offscreen">1.043,02 €</span></div>
        </div>
    `;

    const parsed = HT.parseAmazonDeSearchHtml(
        mockHtml,
        'Apple iPhone 18 Pro 256GB',
        false,
        1509.00,
        'phone'
    );

    assert.strictEqual(
        parsed,
        null,
        'parseAmazonDeSearchHtml MUST discard an iPhone 17 card when searching for iPhone 18 Pro'
    );
});
