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

test('algorithms: calculateHoltWintersForecast detects seasonal dips and price trajectory', () => {
    // 8 quarters of prices demonstrating seasonal Q4 retail discount dips
    const prices = [199, 195, 199, 169, 198, 194, 197, 165];
    const hw = HT.calculateHoltWintersForecast(prices, 4);

    assert.ok(hw, 'Holt-Winters forecast must be computed');
    assert.ok(Number.isFinite(hw.baselineLevel) && hw.baselineLevel > 150, 'Baseline level must be realistic');
    assert.ok(Array.isArray(hw.seasonalIndices) && hw.seasonalIndices.length === 4, 'Must return 4 seasonal factors');
    // Q4 (index 3) should have seasonal factor < 1.0 reflecting retail discount
    assert.ok(hw.seasonalIndices[3] < 1.0, 'Q4 seasonal factor should be below 1.0 due to sale dip');
    assert.ok(Number.isFinite(hw.forecastedPrice), 'Forecasted price must be finite');
    assert.ok(['falling', 'rising', 'stable'].includes(hw.trendDir), 'Valid trend direction');
});

test('algorithms: computePredictivePriceAnalytics integrates Holt-Winters with holiday calendar', () => {
    const history = {
        points: [
            { date: '2026-01-01', price: 199.00 },
            { date: '2026-04-01', price: 195.00 },
            { date: '2026-07-01', price: 199.00 },
            { date: '2026-10-01', price: 169.00 },
            { date: '2026-11-01', price: 165.00 }
        ]
    };
    const analytics = HT.computePredictivePriceAnalytics(history, 165.00, 'fi', new Date(2026, 10, 15));
    assert.ok(analytics, 'Analytics must be calculated');
    assert.ok(analytics.saleEvent, 'Must detect upcoming sale');
    assert.ok(typeof analytics.trendLabel === 'string', 'Must provide localized trend label');
    assert.ok(analytics.atlPrice === 165.00, 'All-time low must match minimum');
});
