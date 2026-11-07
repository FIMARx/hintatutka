import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

const { exports: HT } = loadHintaTutka();

test('algorithms: computeRobustUsedStats calculates median and removes price extremes', () => {
    const items = [70, 75, 80, 85, 90, 95, 100].map(p => ({ price: p }));
    const stats = HT.computeRobustUsedStats(items);

    assert.ok(stats, 'Stats must be computed');
    assert.strictEqual(stats.medianPrice, 85);
    assert.strictEqual(stats.minPrice, 70);
    assert.strictEqual(stats.maxPrice, 100);
});

test('algorithms: evaluateItemFlipArbitrage calculates net profit, fees, and ROI', () => {
    const arb = HT.evaluateItemFlipArbitrage(60.00, 160.00, 130.00);

    assert.ok(arb, 'Arbitrage evaluation must return valid result');
    assert.strictEqual(arb.isFlipOpportunity, true);
    assert.ok(arb.netProfitEur >= 22);
    assert.ok(arb.roiPct >= 22);
    assert.strictEqual(arb.frictionEur, 8);
});

test('algorithms: getUpcomingFinnishSaleEvent accurately maps seasonal discount events', () => {
    // Test Black Friday detection (Mid November)
    const midNovDate = new Date(2026, 10, 15); // Month 10 is November in JS
    const bfEvent = HT.getUpcomingFinnishSaleEvent(midNovDate);

    assert.ok(bfEvent, 'Upcoming sale event must be detected');
    assert.strictEqual(bfEvent.id, 'black_friday');
    assert.strictEqual(bfEvent.month, 11);
    assert.ok(bfEvent.daysUntil > 0 && bfEvent.daysUntil <= 15);

    // Test Hullut Päivät Autumn (Late September)
    const lateSeptDate = new Date(2026, 8, 25); // Late September
    const hpEvent = HT.getUpcomingFinnishSaleEvent(lateSeptDate);
    assert.ok(hpEvent, 'Hullut Päivät event must be detected in autumn');
    assert.strictEqual(hpEvent.id, 'syksy_hp');
});
