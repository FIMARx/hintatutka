import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

const { exports: HT } = loadHintaTutka();

test('categories: mobiles & telecom carrier installment pricing traps are rejected', () => {
    // Telecom operators (Telia, Elisa, DNA) heavily feature 36-month installment prices:
    // "Alkaen 33,31 €/kk" or "39,00 € / kk (36 kk luotto)"
    // HintaTutka MUST reject installment strings so it never compares a 33 €/kk monthly fee against a 1 200 € cash price!
    const installmentStrings = [
        '33,31 €/kk',
        '39,00 € / kk',
        '45,90 €/month',
        'Erissä 29,90 €/kk',
        '12 kk koroton osamaksu 89,00 €',
        'Alkaen 19,95 € / kk',
        'Luottöhinta 24 kk erissä'
    ];

    const invalidPriceRx = /(?:^|\s)(?:ilman\s+alv|alv\s*0\s*%|veroton|excl\.?\s*vat|ex\.?\s*vat|exkl\.?\s*moms|er[iäa]ss[äa]|osamaksu\w*|luotto|palvelumaksu|toimitus\s+alkaen|vaihtohyvitys|kierr[äa]tysetu|liittym[äa]asiakkaille|säästä\s+\d)(?![a-zA-Z0-9äöåÄÖÅ])|\/\s*kk\b|\bkk\s|\bkk[\s-]er[äa]|\/\s*month\b/i;

    for (const s of installmentStrings) {
        assert.ok(
            invalidPriceRx.test(s),
            `Failed to flag mobile carrier installment text as invalid: "${s}"`
        );
    }

    // Cash prices must parse cleanly
    assert.strictEqual(HT.parsePriceNumber('1 199,00 €'), 1199.00);
    assert.strictEqual(HT.parsePriceNumber('1299,00 €'), 1299.00);
    assert.strictEqual(HT.parsePriceNumber('849 €'), 849.00);
});

test('categories: mobile phone capacity extraction and SKU precision', () => {
    // iPhone 16 Pro variations
    const q128 = HT.extractConciseModelQuery('Apple iPhone 16 Pro 128 Gt mustatitaani');
    const q256 = HT.extractConciseModelQuery('Apple iPhone 16 Pro 256 Gt aavikkotitaani');
    const q512 = HT.extractConciseModelQuery('Apple iPhone 16 Pro 512GB Natural Titanium');
    const q1tb = HT.extractConciseModelQuery('Apple iPhone 16 Pro 1 Tt valkoinen titaani');

    assert.ok(q128.includes('128GB') || q128.includes('128'));
    assert.ok(q256.includes('256GB') || q256.includes('256'));
    assert.ok(q512.includes('512GB') || q512.includes('512'));
    assert.ok(q1tb.includes('1TB') || q1tb.includes('1000GB') || q1tb.includes('1Tt'));

    // Cross-capacity shields: 128GB and 256GB models must have hard conflict
    const comp = HT.evaluateSpecCompatibility('Apple iPhone 16 Pro 128GB', 'Apple iPhone 16 Pro 256GB');
    assert.strictEqual(comp.hasHardConflict, true, '128GB and 256GB models must hard conflict');
});

test('categories: grocery unit price calculation (€/kg and €/l)', () => {
    // Standard weight in grams: 400 g at 3.99 € -> 9.98 €/kg
    const u1 = HT.extractUnitPriceInfo('Atria Naudan jauheliha 10% 400g', 3.99, 'grocery');
    assert.ok(u1, 'Expected unitPriceInfo for 400g meat');
    assert.strictEqual(Math.round(u1.unitPrice * 100) / 100, 9.98);
    assert.ok(u1.formatted.includes('kg'));

    // Multi-pack weight: 2 x 500 g at 8.00 € -> 8.00 €/kg
    const u2 = HT.extractUnitPriceInfo('Juhla Mokka Kahvi 2 x 500g', 8.00, 'grocery');
    assert.ok(u2, 'Expected unitPriceInfo for 2 x 500g coffee');
    assert.strictEqual(Math.round(u2.unitPrice * 100) / 100, 8.00);

    // Liquid volume: 1,5 l at 2.19 € -> 1.46 €/l
    const u3 = HT.extractUnitPriceInfo('Valio Luomumaito 1,5 l', 2.19, 'grocery');
    assert.ok(u3, 'Expected unitPriceInfo for 1.5 l milk');
    assert.strictEqual(Math.round(u3.unitPrice * 100) / 100, 1.46);
    assert.ok(u3.formatted.includes('/l'));
});

test('categories: appliance false-positive shield prevents grocery misclassification', () => {
    // Critical contract: "Washing machine 8kg" or "Airfryer 5.5l" has a weight/volume in title,
    // but MUST NEVER be classified as grocery or output a €/kg unit price!
    const washingMachine = 'LG Series 9 Pyykinpesukone 8 kg höyrytoiminnolla';
    const airfryer = 'Philips Airfryer XXL 5,5 litraa HD9285';
    const freezer = 'Bosch Pakastinkaappi 242 l NoFrost';

    const cat1 = HT.detectProductCategory(washingMachine);
    const cat2 = HT.detectProductCategory(airfryer);
    const cat3 = HT.detectProductCategory(freezer);

    assert.notStrictEqual(cat1, 'grocery', 'Washing machine must not be classified as grocery');
    assert.notStrictEqual(cat2, 'grocery', 'Airfryer must not be classified as grocery');
    assert.notStrictEqual(cat3, 'grocery', 'Freezer must not be classified as grocery');

    // Unit price extractor must return null for non-grocery
    assert.strictEqual(HT.extractUnitPriceInfo(washingMachine, 599.00, cat1), null);
    assert.strictEqual(HT.extractUnitPriceInfo(airfryer, 149.00, cat2), null);
    assert.strictEqual(HT.extractUnitPriceInfo(freezer, 699.00, cat3), null);
});

test('categories: sports stores and member club pricing evaluation', () => {
    // Sports store detection
    const sportsStores = ['xxl.fi', 'intersport.fi', 'budgetsport.fi', 'stadium.fi'];
    for (const domain of sportsStores) {
        const { exports: localHT } = loadHintaTutka({ host: `www.${domain}` });
        const store = localHT.detectCurrentStore();
        const cat = localHT.detectProductCategory('Haglöfs Astral Gore-Tex Takki', store);
        assert.strictEqual(cat, 'sports', `Store ${domain} should resolve category to sports`);
    }

    // Authentic member discount: Intersport Club price 129 € vs open market 169 €
    const realClub = { clubPrice: 129.00, normalPrice: 179.00, clubLabel: 'Intersport Club' };
    const authVerdict = HT.evaluateClubBenchmark(realClub, 169.00, 'XXL', 125.00);
    assert.strictEqual(authVerdict.tier, 'genuine');

    // Illusory member discount: Member price 179 € (reg. 199 €), but competitor sells open at 159 €
    const illusoryClub = { clubPrice: 179.00, normalPrice: 199.00, clubLabel: 'Stadium Member' };
    const fakeVerdict = HT.evaluateClubBenchmark(illusoryClub, 159.00, 'Budget Sport', 150.00);
    assert.strictEqual(fakeVerdict.tier, 'fake');
});

test('categories: furniture stores and dash-format currency parsing', () => {
    // Furniture store detection
    const furnitureStores = ['ikea.com', 'jysk.fi', 'masku.com', 'asko.fi', 'sotka.fi'];
    for (const domain of furnitureStores) {
        const { exports: localHT } = loadHintaTutka({ host: `www.${domain}` });
        const store = localHT.detectCurrentStore();
        const cat = localHT.detectProductCategory('MALM Työpöytä 140x65 cm', store);
        assert.strictEqual(cat, 'furniture', `Store ${domain} should resolve category to furniture`);
    }

    // IKEA dash format "149,-" or "299,-"
    assert.strictEqual(HT.parsePriceNumber('149,-'), 149.00);
    assert.strictEqual(HT.parsePriceNumber('1 299,-'), 1299.00);
    assert.strictEqual(HT.parsePriceNumber('49,50,-'), 49.50);
});

test('categories: used & classifieds stores parsing and median ROI evaluation', () => {
    const usedStores = ['tori.fi', 'huuto.net', 'vinted.fi'];
    for (const domain of usedStores) {
        const { exports: localHT } = loadHintaTutka({ host: `www.${domain}` });
        const store = localHT.detectCurrentStore();
        assert.strictEqual(store.isUsedSite, true, `Store ${domain} must be tagged as isUsedSite: true`);
    }

    // Used listings price filtering and median calculation
    const sampleListings = [
        { price: 200, title: 'RTX 3070 hyväkuntoinen' },
        { price: 210, title: 'RTX 3070 toimiva' },
        { price: 220, title: 'RTX 3070 paketti tallessa' },
        { price: 230, title: 'RTX 3070 siisti' },
        { price: 900, title: 'RTX 3070 scalper / outo hinta' } // extreme outlier
    ];
    const stats = HT.computeRobustUsedStats(sampleListings);
    assert.ok(stats.medianPrice >= 210 && stats.medianPrice <= 225, `Expected medianPrice ~215-220, got ${stats.medianPrice}`);
    assert.strictEqual(stats.minPrice, 200);
    assert.strictEqual(stats.maxPrice, 230); // 900 was filtered out by Tukey fence!

    // Flip arbitrage ROI calculation
    const arb = HT.evaluateItemFlipArbitrage(60.00, 160.00, 130.00);
    assert.strictEqual(arb.isFlipOpportunity, true, 'Buying at 60 € with 160 € market price is a flip opportunity');
    assert.ok(arb.netProfitEur >= 22, `Expected profit >= 22 €, got ${arb.netProfitEur}`);
});
