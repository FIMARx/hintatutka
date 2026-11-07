import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

const { exports: HT } = loadHintaTutka();

test('parsers: parsePriceNumber parses Finnish and EU thousands formats accurately', () => {
    // Finnish comma decimal with regular space
    assert.strictEqual(HT.parsePriceNumber('1 509,00 €'), 1509.00);

    // Finnish comma decimal with non-breaking space (\u00a0) - seen in Prisma
    assert.strictEqual(HT.parsePriceNumber('1\u00a0659,00\u00a0€'), 1659.00);

    // Standard two-digit decimal
    assert.strictEqual(HT.parsePriceNumber('134,99 €'), 134.99);

    // German dot thousands with comma decimal - seen on Amazon.de
    assert.strictEqual(HT.parsePriceNumber('1.043,02 €'), 1043.02);

    // Pure number string
    assert.strictEqual(HT.parsePriceNumber('85'), 85.00);

    // Multi-thousands
    assert.strictEqual(HT.parsePriceNumber('2 499,00'), 2499.00);
});

test('parsers: strikethrough original prices and installment text are rejected', () => {
    const invalidPriceTextRx = /(?:^|\s)(?:ilman\s+alv|alv\s*0\s*%|veroton|excl\.?\s*vat|ex\.?\s*vat|exkl\.?\s*moms|er[iäa]ss[äa]|osamaksu\w*|luotto|palvelumaksu|toimitus\s+alkaen|vaihtohyvitys|kierr[äa]tysetu|liittym[äa]asiakkaille|säästä\s+\d)(?![a-zA-Z0-9äöåÄÖÅ])|\/\s*kk\b|\bkk\s|\bkk[\s-]er[äa]|\/\s*month\b/i;

    assert.ok(invalidPriceTextRx.test('39,00 €/kk'));
    assert.ok(invalidPriceTextRx.test('12,90 € / kk'));
    assert.ok(invalidPriceTextRx.test('4,99 €/month'));
    assert.ok(invalidPriceTextRx.test('erissä 29,90 €'));
    assert.ok(invalidPriceTextRx.test('alv 0 % 120,00 €'));
});

test('parsers: calculateFinnishLandedCost VAT adjustment (19% DE -> 25.5% FI)', () => {
    // Amazon.de base price 1043.02 € (with 19% DE VAT)
    // Net = 1043.02 / 1.19 = 876.487...
    // FI VAT (25.5%) = 876.487 * 1.255 = 1099.99 €
    // Amazon.de orders over 99 € have free shipping to Finland
    const landed = HT.calculateFinnishLandedCost(1043.02, 'general', false);

    assert.strictEqual(landed.deVatPct, 19);
    assert.strictEqual(landed.fiVatPct, 25.5);
    assert.strictEqual(landed.isFreeShipping, true);
    assert.strictEqual(landed.shippingEur, 0);
    assert.strictEqual(landed.landedTotalEur, 1099.99);
});

test('parsers: evaluateClubBenchmark flags illusory vs authentic club discounts', () => {
    // Scenario A: Authentic club discount
    // Club price is 149 €, normal price is 189 €, lowest non-club in open stores is 189 €
    const realClubOffer = { clubPrice: 149.00, normalPrice: 189.00, clubLabel: 'MyPOWER' };
    const authBench = HT.evaluateClubBenchmark(realClubOffer, 189.00, 'Verkkokauppa.com', 145.00);
    assert.ok(authBench);
    assert.strictEqual(authBench.tier, 'genuine');

    // Scenario B: Illusory club discount
    // Store advertises "Club price 189 € (reg. 229 €)", but open market has it at 179 € without membership
    const illusoryClubOffer = { clubPrice: 189.00, normalPrice: 229.00, clubLabel: 'Gigantti Klubi' };
    const illBench = HT.evaluateClubBenchmark(illusoryClubOffer, 179.00, 'Proshop', 160.00);
    assert.ok(illBench);
    assert.strictEqual(illBench.tier, 'fake');
    assert.ok(illBench.badge.includes('NÄENNÄISALE') || illBench.badge.includes('ILLUSORY'));
});
