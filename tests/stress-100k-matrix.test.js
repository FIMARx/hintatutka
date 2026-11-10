import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run100kProductTests } from '../scripts/stress-100k-runner.mjs';

test('stress 100k matrix: validates 100,000 concrete products across all 98 stores with 0 failures', async () => {
    const res = await run100kProductTests();

    assert.strictEqual(res.totalTested, 100000, `Expected exactly 100,000 tested products, got ${res.totalTested}`);
    assert.strictEqual(res.storeReports.length, 98, `Expected all 98 stores covered, got ${res.storeReports.length}`);
    assert.strictEqual(res.failures.length, 0, `Expected 0 failures across 100,000 products, discovered: ${JSON.stringify(res.failures.slice(0, 10))}`);
    assert.ok(res.durationMs < 60000, `100,000 items should complete well within 60s, took ${res.durationMs}ms`);
});
