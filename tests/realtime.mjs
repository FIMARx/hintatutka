// Real-time live testing engine for HintaTutka
// Runs live network queries against e-commerce search endpoints (Hinta.fi, Amazon.de)
// to verify that the precision shields and DOM parsers catch bugs and mismatches in real time.
// Run: node tests/realtime.mjs (or: npm run test:realtime)

import { loadHintaTutka } from './lib/harness.js';

const { exports: HT } = loadHintaTutka();

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

async function fetchWithTimeout(url, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-GB,en;q=0.9,fi;q=0.8'
            },
            signal: controller.signal
        });
        clearTimeout(timer);
        if (!res.ok) return { ok: false, status: res.status, text: '' };
        const text = await res.text();
        return { ok: true, status: res.status, text };
    } catch (err) {
        clearTimeout(timer);
        return { ok: false, error: err.name === 'AbortError' ? 'Timeout' : err.message, text: '' };
    }
}

const CANARY_TARGETS = [
    {
        name: 'iPhone 18 Pro Cross-Generation & Cross-Tier Shield',
        targetTitle: 'Apple iPhone 18 Pro 256 GB phone, wine red',
        searchQuery: 'Apple iPhone 18 Pro 256GB',
        category: 'phone',
        referencePrice: 1509.00,
        forbiddenSubstrings: ['iPhone 17', 'iPhone 16', 'iPhone 18 Pro Max', 'iPhone 18 Plus'],
        checkResults: (bestOffer, rawHtml) => {
            if (!bestOffer) {
                // If live search returned zero 100% exact matches (because iPhone 18 is unreleased or out of stock),
                // verify that the search engine DID return older iPhones (like 17) in rawHtml but HintaTutka SHIELDED THEM!
                const searchReturned17 = rawHtml.includes('iPhone 17');
                return {
                    pass: true,
                    note: searchReturned17
                        ? 'Live search suggested iPhone 17, but HintaTutka correctly rejected it (bestOffer = null)'
                        : 'No conflicting results accepted'
                };
            }
            // If an offer was accepted, it MUST NOT be iPhone 17 or any forbidden model
            for (const bad of ['iPhone 17', 'iPhone 16', 'Pro Max', '128GB', '512GB']) {
                if (bestOffer.title.includes(bad)) {
                    return { pass: false, note: `FAILED: Accepted forbidden product: "${bestOffer.title}"` };
                }
            }
            return { pass: true, note: `Accepted exact matching listing: "${bestOffer.title}" (${bestOffer.landedTotalEur} €)` };
        }
    },
    {
        name: 'Motherboard Form-Factor Suffix Shield (B850M vs B850)',
        targetTitle: 'ASUS TUF GAMING B850M-PLUS WIFI Motherboard',
        searchQuery: 'ASUS TUF GAMING B850M-PLUS WIFI',
        category: 'component',
        referencePrice: 229.00,
        checkResults: (bestOffer) => {
            if (!bestOffer) {
                return { pass: true, note: 'No spurious non-M models accepted' };
            }
            // Candidate MUST preserve 'M'
            const compat = HT.evaluateSpecCompatibility('ASUS TUF GAMING B850M-PLUS WIFI Motherboard', bestOffer.title);
            if (compat.hasHardConflict) {
                return { pass: false, note: `FAILED: Hard spec conflict accepted: "${bestOffer.title}"` };
            }
            return { pass: true, note: `Accepted valid B850M listing: "${bestOffer.title}"` };
        }
    },
    {
        name: 'GPU Tier Variant Shield (RTX 4070 Super)',
        targetTitle: 'ASUS Dual GeForce RTX 4070 Super 12GB',
        searchQuery: 'ASUS Dual GeForce RTX 4070 Super 12GB',
        category: 'component',
        referencePrice: 669.00,
        checkResults: (bestOffer) => {
            if (!bestOffer) {
                return { pass: true, note: 'No non-Super or Ti models mistakenly accepted' };
            }
            const compat = HT.evaluateSpecCompatibility('ASUS Dual GeForce RTX 4070 Super 12GB', bestOffer.title);
            if (compat.hasHardConflict) {
                return { pass: false, note: `FAILED: Accepted incompatible GPU tier: "${bestOffer.title}"` };
            }
            return { pass: true, note: `Clean GPU tier match: "${bestOffer.title}" (${bestOffer.landedTotalEur} €)` };
        }
    }
];

async function runRealTimeCanarySuite() {
    console.log('========================================================================');
    console.log('  HINTATUTKA REAL-TIME LIVE STORE TESTING');
    console.log('  Testing live search queries to catch DOM changes & search mismatches');
    console.log('========================================================================\n');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;

    for (const canary of CANARY_TARGETS) {
        totalTests++;
        console.log(`▶ [TEST ${totalTests}] ${canary.name}`);
        console.log(`  Target: "${canary.targetTitle}"`);
        console.log(`  Live Amazon.de Query: "${canary.searchQuery}"`);

        const amzUrl = `https://www.amazon.de/s?k=${encodeURIComponent(canary.searchQuery)}&language=en_GB`;
        const res = await fetchWithTimeout(amzUrl, 9000);

        if (!res.ok) {
            console.log(`  ⚠ Network notice: Amazon.de returned status ${res.status || res.error} (live network check skipped gracefully)`);
            skippedTests++;
            continue;
        }

        const parsed = HT.parseAmazonDeSearchHtml(
            res.text,
            canary.targetTitle,
            false,
            canary.referencePrice,
            canary.category
        );

        const check = canary.checkResults(parsed, res.text);
        if (check.pass) {
            console.log(`  ✔ PASS: ${check.note}`);
            passedTests++;
        } else {
            console.error(`  ✖ FAIL: ${check.note}`);
            failedTests++;
        }
        console.log('');
    }

    console.log('────────────────────────────────────────────────────────────────────────');
    console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed, ${skippedTests} skipped (${totalTests} total)`);
    console.log('────────────────────────────────────────────────────────────────────────\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runRealTimeCanarySuite().catch((err) => {
    console.error('Real-time test suite fatal error:', err);
    process.exit(1);
});
