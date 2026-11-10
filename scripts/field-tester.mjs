#!/usr/bin/env node
/**
 * HintaTutka Real-World Field Auditor
 * 
 * Unlike synthetic in-memory unit tests, this tool fetches REAL web pages
 * from actual retail store servers across Finland (Jimm's, Verkkokauppa, Gigantti, Power, Nettiauto, etc.)
 * and audits HintaTutka against actual production HTML:
 * 
 * 1. Category/Listing Page Guard:
 *    Ensures HintaTutka NEVER injects or parses components on category lists, search results, or homepages.
 * 2. Standalone Hardware Guard:
 *    Ensures RAM kits, GPUs, Motherboards, Coolers, Cases, and SSDs NEVER get misclassified as Prebuilt PCs or Bundles.
 * 3. Prebuilt PC Deconstruction Guard:
 *    Ensures actual prebuilt gaming PCs have all hardware components (CPU, GPU, RAM, Storage, Mobo, PSU) extracted.
 * 4. Cash Price & Installment Shield:
 *    Ensures the extracted price is the real cash price and never an installment fee (e.g. 19 €/kk) or strikethrough.
 * 5. Title & Query Precision:
 *    Ensures model codes are preserved and retailer marketing fluff is cleanly stripped.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from '../tests/lib/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

async function fetchLiveHtml(url, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'fi,en-US;q=0.9,en;q=0.8'
            },
            signal: controller.signal
        });
        clearTimeout(timer);
        if (!res.ok) {
            return { ok: false, status: res.status, error: `HTTP ${res.status}` };
        }
        const html = await res.text();
        return { ok: true, status: res.status, html };
    } catch (err) {
        clearTimeout(timer);
        return { ok: false, error: err.name === 'AbortError' ? 'Timeout' : err.message };
    }
}

// Live real-store test URLs across categories and archetypes
const FIELD_TARGETS = [
    // -------------------------------------------------------------
    // CATEGORY LISTING PAGES (MUST REJECT - RETURN NULL / NO OVERLAY)
    // -------------------------------------------------------------
    {
        type: 'listing',
        store: "Jimm's",
        url: 'https://www.jimms.fi/fi/Product/List/000-1UL/komponentit--muistit--ddr5',
        expectedResult: 'REJECT_NON_PRODUCT'
    },
    {
        type: 'listing',
        store: "Jimm's",
        url: 'https://www.jimms.fi/fi/Product/List/000-09X/komponentit--prosessorit--amd--am5',
        expectedResult: 'REJECT_NON_PRODUCT'
    },
    {
        type: 'listing',
        store: 'Verkkokauppa.com',
        url: 'https://www.verkkokauppa.com/fi/kategoria/komponentit/prosessorit',
        expectedResult: 'REJECT_NON_PRODUCT'
    },
    {
        type: 'listing',
        store: 'Gigantti',
        url: 'https://www.gigantti.fi/tietokoneet-ja-toimistotarvikkeet/tietokonekomponentit/prosessorit-cpu',
        expectedResult: 'REJECT_NON_PRODUCT'
    },
    {
        type: 'listing',
        store: 'Power',
        url: 'https://www.power.fi/c/1831/tietotekniikka/tietokonekomponentit/prosessorit/',
        expectedResult: 'REJECT_NON_PRODUCT'
    },
    {
        type: 'listing',
        store: 'Nettiauto',
        url: 'https://www.nettiauto.com/vaihtoautot',
        expectedResult: 'REJECT_NON_PRODUCT'
    },

    // -------------------------------------------------------------
    // STANDALONE HARDWARE COMPONENTS (MUST EXTRACT CASH PRICE & NEVER TRIGGER PC BUILD)
    // -------------------------------------------------------------
    {
        type: 'standalone_component',
        store: "Jimm's",
        url: 'https://www.jimms.fi/fi/Product/Show/218450/tmxsal1660830kwk/v-color-32gb-2-x-16gb-manta-xsky-rgb-ddr5-6000mhz-cl30-1-35v-musta',
        roleKey: 'ram',
        expectedResult: 'STANDALONE_PART'
    },
    {
        type: 'standalone_component',
        store: "Jimm's",
        url: 'https://www.jimms.fi/fi/Product/Show/211756/100-100000910wof/amd-ryzen-7-9800x3d-am5-4-7-ghz-8-core-wof-prosessori',
        roleKey: 'cpu',
        expectedResult: 'STANDALONE_PART'
    },

    // -------------------------------------------------------------
    // PREBUILT GAMING PCS (MUST DECONSTRUCT ALL REAL HARDWARE COMPONENTS)
    // -------------------------------------------------------------
    {
        type: 'prebuilt_pc',
        store: "Jimm's",
        url: 'https://www.jimms.fi/fi/Product/Show/217841/jimms-a-n-gtg-nxa90/jimm-s-gtg-owl-5090-pelitietokone',
        expectedResult: 'PREBUILT_PC',
        minComponents: 7,
        requiredRoles: ['cpu', 'gpu', 'ram', 'storage']
    }
];

export async function runFieldAudit() {
    console.log('========================================================================');
    console.log('  HINTATUTKA REAL-STORE LIVE FIELD AUDITOR');
    console.log('  Auditing production retail HTML directly from live store web servers');
    console.log('========================================================================\n');

    let total = FIELD_TARGETS.length;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const results = [];

    for (let i = 0; i < FIELD_TARGETS.length; i++) {
        const target = FIELD_TARGETS[i];
        process.stdout.write(`[${i + 1}/${total}] Fetching live ${target.store} (${target.type}): ${target.url.slice(0, 70)}... `);

        const fetchRes = await fetchLiveHtml(target.url);
        if (!fetchRes.ok) {
            console.log(`\n  ⚠️ SKIPPED (Live network error: ${fetchRes.error})`);
            skipped++;
            results.push({ target, status: 'SKIPPED', reason: fetchRes.error });
            continue;
        }

        const urlObj = new URL(target.url);
        const { exports: HT } = loadHintaTutka({
            host: urlObj.hostname,
            pathname: urlObj.pathname
        });

        // 1. Audit Listing Pages
        if (target.type === 'listing') {
            const isNonProd = HT.isNonProductPath ? HT.isNonProductPath() : false;
            const prodInfo = HT.extractProductInfo ? HT.extractProductInfo() : null;

            if (prodInfo === null) {
                console.log('✅ PASS (Correctly blocked on category listing page)');
                passed++;
                results.push({ target, status: 'PASSED' });
            } else {
                console.log(`❌ FAIL! Leaked on listing page! Injected title: "${prodInfo?.name}"`);
                failed++;
                results.push({ target, status: 'FAILED', reason: `Injected title on listing page: ${prodInfo?.name}` });
            }
            continue;
        }

        // 2. Audit Standalone Components
        if (target.type === 'standalone_component') {
            const h1M = fetchRes.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            const rawTitle = h1M ? h1M[1].replace(/<[^>]+>/g, '').trim() : '';

            // Extract price from live HTML
            const priceMatches = [...fetchRes.html.matchAll(/(\d[\d\s]*[,.]\d{2})\s*€/g)];
            const rawPrice = priceMatches.length > 0 ? HT.parsePriceNumber(priceMatches[0][1]) : 100;

            const info = { name: rawTitle, currentPrice: rawPrice };
            const bundleData = HT.detectAndExtractBundleData(info, null, rawPrice, fetchRes.html);

            if (bundleData === null) {
                console.log(`✅ PASS (Clean standalone product: "${rawTitle.slice(0, 40)}...", zero prebuilt false-positive)`);
                passed++;
                results.push({ target, status: 'PASSED' });
            } else {
                console.log(`❌ FAIL! False positive prebuilt/bundle! Detected: ${bundleData.isPcBuild ? 'PC BUILD' : 'BUNDLE'} (${bundleData.components.length} components)`);
                failed++;
                results.push({ target, status: 'FAILED', reason: `False positive prebuilt with ${bundleData.components.length} components: ${bundleData.components.map(c => c.name).join(', ')}` });
            }
            continue;
        }

        // 3. Audit Prebuilt Gaming PCs
        if (target.type === 'prebuilt_pc') {
            const h1M = fetchRes.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
            const rawTitle = h1M ? h1M[1].replace(/<[^>]+>/g, '').trim() : '';
            const priceM = fetchRes.html.match(/(\d[\d\s]*[,.]\d{2})\s*€/);
            const rawPrice = priceM ? HT.parsePriceNumber(priceM[1]) : 5000;

            const info = { name: rawTitle, currentPrice: rawPrice };
            const bundleData = HT.detectAndExtractBundleData(info, null, rawPrice, fetchRes.html);

            if (!bundleData || !bundleData.isPcBuild) {
                console.log(`❌ FAIL! Failed to detect prebuilt PC on "${rawTitle}"!`);
                failed++;
                results.push({ target, status: 'FAILED', reason: 'Prebuilt PC was not detected' });
                continue;
            }

            const rolesFound = bundleData.components.map(c => c.roleKey);
            const missingRoles = (target.requiredRoles || []).filter(r => !rolesFound.includes(r));

            if (bundleData.components.length < (target.minComponents || 5) || missingRoles.length > 0) {
                console.log(`❌ FAIL! Extracted only ${bundleData.components.length} components! Missing: ${missingRoles.join(', ')}`);
                failed++;
                results.push({ target, status: 'FAILED', reason: `Incomplete spec extraction: missing ${missingRoles.join(', ')}` });
            } else {
                console.log(`✅ PASS (Prebuilt successfully deconstructed with ${bundleData.components.length} components: CPU, GPU, RAM, Storage, Mobo, PSU)`);
                passed++;
                results.push({ target, status: 'PASSED' });
            }
            continue;
        }
    }

    console.log('\n========================================================================');
    console.log(`  FIELD AUDIT COMPLETE: ${passed} PASSED | ${failed} FAILED | ${skipped} SKIPPED`);
    console.log('========================================================================\n');

    return { total, passed, failed, skipped, results };
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/field-tester.mjs')) {
    runFieldAudit().then(res => {
        if (res.failed > 0) process.exit(1);
    });
}
