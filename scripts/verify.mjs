// Master verification script for HintaTutka: `npm run verify`
// Runs all safety nets in order:
//   Guards & Hash Parity -> Precision Matrix -> DOM Parsers & VAT -> Algorithms -> Cache Isolation -> Real-Time Live Smoke Tests
// Options:
//   --quick   Run offline unit and precision tests only (skips live network requests)
//
// Patterned after DigiKaveri test architecture.

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const quick = args.has('--quick');
const isWin = process.platform === 'win32';
const npm = isWin ? 'npm.cmd' : 'npm';

const results = [];

function step(name, cmd, cmdArgs) {
    const t0 = Date.now();
    process.stdout.write(`\n▶ ${name}\n`);
    const r = spawnSync(cmd, cmdArgs, {
        cwd: root,
        stdio: 'inherit',
        shell: isWin
    });
    const secs = ((Date.now() - t0) / 1000).toFixed(2);
    const ok = r.status === 0;
    results.push({ name, ok, secs });
    if (!ok) {
        console.error(`\n✖ ${name} failed after ${secs}s. Fix it, then run "npm run verify" again.`);
        summary();
        process.exit(1);
    }
}

function summary() {
    console.log('\n────────────────────────────────────────────────────────────────────────');
    console.log('  HINTATUTKA VERIFICATION SUMMARY');
    console.log('────────────────────────────────────────────────────────────────────────');
    for (const r of results) {
        console.log(`  ${r.ok ? '✔ PASS' : '✖ FAIL'} ${r.name} (${r.secs}s)`);
    }
    console.log('────────────────────────────────────────────────────────────────────────\n');
}

console.log('========================================================================');
console.log(`  HINTATUTKA FULL TEST & VERIFICATION RUNNER ${quick ? '(QUICK MODE)' : '(FULL MODE)'}`);
console.log('========================================================================');

// Step 1: Guards & File Parity Tripwires
step('Guards, Byte-Parity & Version Sync', npm, ['run', 'test:guards']);

// Step 2: Component Quality & Hardware Invariants
step('Hardware Invariants & Quality Contracts', npm, ['run', 'test:invariants']);

// Step 3: Real-World Prebuilt PC Fixtures
step('Retail Prebuilt PC Fixture Snapshots', npm, ['run', 'test:fixtures']);

// Step 4: End-to-End Component Priceability Contracts
step('End-to-End Component Priceability Contracts', npm, ['run', 'test:priceability']);

// Step 5: Precision Matrix & Cross-Model Shields
step('Precision Matrix (iPhone, B850M, GPU, Storage)', npm, ['run', 'test:precision']);

// Step 6: DOM Price Parsers & Finnish VAT Landed Cost
step('DOM Price Parsers, Thousands & ALV Landed Cost', npm, ['run', 'test:parsers']);

// Step 7: Flip Arbitrage, Used Stats & Seasonal Forecast
step('Algorithms, Flip ROI & Seasonal Forecasting', npm, ['run', 'test:algorithms']);

// Step 8: Cache Isolation & Stale Eviction
step('Cache Namespace Isolation & Stale Purge', npm, ['run', 'test:cache']);

// Step 9: Real-time Live Store Canaries (skipped on --quick)
if (!quick) {
    step('Real-Time Live Store Query Verification', npm, ['run', 'test:realtime']);
} else {
    console.log('\nℹ Skipping real-time live network checks (--quick flag set)');
}

summary();
console.log('✔ All verification checks passed cleanly! Ready to ship.\n');
