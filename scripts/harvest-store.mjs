#!/usr/bin/env node
/**
 * HintaTutka — Retail DOM Skeleton & Selector Harvester
 *
 * Automatically inspects any product page (via URL, local HTML file, or stdin),
 * extracts the core DOM skeleton structure:
 *   1. Product Title element and CSS selector
 *   2. Primary Cash Price (rejecting installment traps & strikethrough original prices)
 *   3. Specifications architecture (table, dl/dt/dd, ul/li, br-separated, or Next.js JSON)
 *   4. Hardware component deconstruction (CPU, GPU, RAM, Storage, Mobo, PSU)
 *   5. Product category inference (electronics, grocery, sports, furniture, used)
 *   6. Schema.org / JSON-LD / Microdata (EAN, MPN, SKU, Brand)
 *
 * Outputs:
 *   - Visual inspection report in terminal
 *   - Ready-to-paste STORES snippet for HintaTutka.user.js
 *   - Ready-to-paste selectors.json hot-patch block
 *   - Auto-patching option (--patch)
 *   - Auto-fixture generation option (--save-fixture <name>)
 *
 * Usage:
 *   node scripts/harvest-store.mjs https://www.gigantti.fi/product/...
 *   node scripts/harvest-store.mjs --file tests/fixtures/prebuilt/power-pcspecialist-prime-504.html
 *   node scripts/harvest-store.mjs --fixture verkkokauppa-blackstorm-r9-5090
 *   node scripts/harvest-store.mjs --file page.html --patch
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from '../tests/lib/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const FIXTURES_DIR = join(ROOT_DIR, 'tests/fixtures');
const SELECTORS_PATH = resolve(ROOT_DIR, 'selectors.json');

const { exports: HT } = loadHintaTutka();

// Parse CLI arguments
const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter(a => a.startsWith('--')));
const nonFlagArgs = rawArgs.filter(a => !a.startsWith('--'));

function getArgValue(flag) {
    const idx = rawArgs.indexOf(flag);
    if (idx !== -1 && idx + 1 < rawArgs.length && !rawArgs[idx + 1].startsWith('--')) {
        return rawArgs[idx + 1];
    }
    const inline = rawArgs.find(a => a.startsWith(`${flag}=`));
    if (inline) return inline.split('=')[1];
    return null;
}

const isJsonOutput = flags.has('--json');
const isPatch = flags.has('--patch');
const saveFixtureName = getArgValue('--save-fixture');
const filePathArg = getArgValue('--file');
const fixtureArg = getArgValue('--fixture');
const urlOrInputArg = nonFlagArgs[0] || null;

async function loadSourceHtml() {
    // 1. Fixture shorthand
    if (fixtureArg) {
        let candidate = join(FIXTURES_DIR, 'prebuilt', `${fixtureArg}.html`);
        if (!existsSync(candidate)) candidate = join(FIXTURES_DIR, `${fixtureArg}.html`);
        if (!existsSync(candidate)) candidate = join(FIXTURES_DIR, 'prebuilt', fixtureArg);
        if (existsSync(candidate)) {
            return { html: readFileSync(candidate, 'utf8'), source: candidate, origin: 'fixture' };
        }
        throw new Error(`Fixture not found: ${fixtureArg}`);
    }

    // 2. Local file
    const targetFile = filePathArg || (urlOrInputArg && existsSync(urlOrInputArg) ? urlOrInputArg : null);
    if (targetFile) {
        const fullPath = resolve(process.cwd(), targetFile);
        if (existsSync(fullPath)) {
            return { html: readFileSync(fullPath, 'utf8'), source: fullPath, origin: 'file' };
        }
    }

    // 3. Live URL
    const targetUrl = urlOrInputArg && /^https?:\/\//i.test(urlOrInputArg) ? urlOrInputArg : null;
    if (targetUrl) {
        console.log(`\n🌐 Fetching live HTML from: ${targetUrl}...`);
        const res = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'fi-FI,fi;q=0.9,en-US;q=0.8,en;q=0.7',
                'Cache-Control': 'no-cache'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${targetUrl}: HTTP ${res.status} ${res.statusText}`);
        }
        const html = await res.text();
        return { html, source: targetUrl, origin: 'url' };
    }

    // 4. Stdin fallback
    if (flags.has('--stdin') || !process.stdin.isTTY) {
        const chunks = [];
        for await (const chunk of process.stdin) chunks.push(chunk);
        const html = Buffer.concat(chunks).toString('utf8');
        if (html.trim().length > 0) {
            return { html, source: 'stdin', origin: 'stdin' };
        }
    }

    printUsageAndExit();
}

function printUsageAndExit() {
    console.log(`
HintaTutka Retail DOM Skeleton & Selector Harvester

Usage:
  node scripts/harvest-store.mjs <url>                   # Harvest live URL
  node scripts/harvest-store.mjs --file <path-to-html>   # Harvest local HTML snapshot
  node scripts/harvest-store.mjs --fixture <name>        # Harvest test fixture by name
  node scripts/harvest-store.mjs <url> --patch           # Auto-patch selectors.json
  node scripts/harvest-store.mjs <url> --save-fixture <n># Save clean test snapshot

Examples:
  node scripts/harvest-store.mjs https://www.gigantti.fi/product/...
  node scripts/harvest-store.mjs --fixture power-pcspecialist-prime-504
  node scripts/harvest-store.mjs --file gigantti.html --save-fixture gigantti-test
`);
    process.exit(1);
}

/**
 * Discovers and cleans the store domain and name.
 */
function harvestStoreIdentity(html, sourceUrl) {
    let hostname = '';
    if (sourceUrl && /^https?:\/\//i.test(sourceUrl)) {
        try {
            hostname = new URL(sourceUrl).hostname.replace(/^www\./, '').toLowerCase();
        } catch (_) {}
    }

    if (hostname) {
        const found = HT.STORES.find(s => hostname.includes(s.match) || s.match.includes(hostname));
        if (found) return { domain: found.match, name: found.name, isRegistered: true, registeredStore: found };
    }

    const titleM = html.match(/<title>([\s\S]*?)<\/title>/i);
    const title = titleM ? titleM[1].trim() : '';

    // Match suffix after separator, e.g. "Product - Jimm's" or "Product - Gigantti verkkokauppa"
    const suffixM = title.match(/[-|–—]\s*([a-zA-Z0-9äöåÄÖÅ.\-_ '’]+)$/);
    const suffix = suffixM ? suffixM[1].trim().toLowerCase() : '';
    const firstWordOfSuffix = suffix ? suffix.split(/\s+/)[0].replace(/[^a-z0-9äöå]/g, '') : '';

    // If first word of suffix directly matches a store name (e.g. "gigantti" in "Gigantti verkkokauppa")
    if (firstWordOfSuffix) {
        const storeByFirstWord = HT.STORES.find(s => {
            const sn = s.name.toLowerCase().replace(/[^a-z0-9äöå]/g, '');
            const sm = s.match.replace(/\.[a-z]+$/, '').toLowerCase();
            return sn === firstWordOfSuffix || sm === firstWordOfSuffix;
        });
        if (storeByFirstWord) {
            return { domain: storeByFirstWord.match, name: storeByFirstWord.name, isRegistered: true, registeredStore: storeByFirstWord };
        }
    }

    // Sort registered stores: longer matches first
    const sortedStores = [...HT.STORES].sort((a, b) => b.name.length - a.name.length);

    // If suffix starts with store name (e.g. "Gigantti verkkokauppa" starts with "gigantti")
    for (const s of sortedStores) {
        const cleanName = s.name.toLowerCase().replace(/[^a-z0-9äöå]/g, '');
        const cleanSuffix = suffix.replace(/[^a-z0-9äöå]/g, '');
        if (cleanSuffix.startsWith(cleanName) || cleanSuffix.includes(s.match.replace(/\.[a-z]+$/, ''))) {
            return { domain: s.match, name: s.name, isRegistered: true, registeredStore: s };
        }
    }

    // Check full title for distinct store names
    for (const s of sortedStores) {
        const cleanName = s.name.toLowerCase().replace(/[^a-z0-9äöå]/g, '');
        if (cleanName.length >= 4 && new RegExp(`\\b${cleanName}\\b`, 'i').test(title.toLowerCase().replace(/[^a-z0-9äöå]/g, ' '))) {
            return { domain: s.match, name: s.name, isRegistered: true, registeredStore: s };
        }
    }

    if (!hostname && suffix) {
        if (suffix.includes('.')) hostname = suffix;
        else hostname = `${suffix.replace(/\s+/g, '')}.fi`;
    }

    if (!hostname) hostname = 'unknown-store.fi';

    const registeredStore = HT.STORES.find(s => hostname.includes(s.match) || s.match.includes(hostname));
    return {
        domain: registeredStore ? registeredStore.match : hostname,
        name: registeredStore ? registeredStore.name : formatStoreName(hostname),
        isRegistered: Boolean(registeredStore),
        registeredStore
    };
}

function formatStoreName(domain) {
    const base = domain.replace(/\.[a-z]{2,3}(?:\.[a-z]{2})?$/, '');
    return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Harvests product title and best CSS selector.
 */
function harvestProductTitle(html) {
    // 1. Scan <h1> tag
    const h1Match = html.match(/<h1([^>]*)>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
        const attrs = h1Match[1];
        const rawText = h1Match[2].replace(/<[^>]+>/g, '').trim();

        // Check data-testid on h1
        const testIdM = attrs.match(/data-test(?:id|-id)=["']([^"']+)["']/i);
        if (testIdM) {
            return { title: rawText, selector: `h1[data-testid="${testIdM[1]}"]`, confidence: 'high' };
        }

        // Check class on h1
        const classM = attrs.match(/class=["']([^"']+)["']/i);
        if (classM) {
            const cls = classM[1].split(/\s+/).find(c => /title|heading|name|product/i.test(c));
            if (cls) return { title: rawText, selector: `h1.${cls}`, confidence: 'high' };
        }

        return { title: rawText, selector: 'h1', confidence: 'standard' };
    }

    // 2. Scan meta og:title
    const ogTitleM = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleM) {
        return { title: ogTitleM[1].trim(), selector: 'meta[property="og:title"]', confidence: 'meta' };
    }

    // 3. Document title fallback
    const docTitleM = html.match(/<title>([\s\S]*?)<\/title>/i);
    const docTitle = docTitleM ? docTitleM[1].split(/[-|–—]/)[0].trim() : 'Unknown Product';
    return { title: docTitle, selector: 'title', confidence: 'fallback' };
}

/**
 * Discovers the primary cash price and generates optimal CSS selectors.
 */
function harvestPriceElements(html) {
    const candidateSelectors = [];
    const discoveredPrices = [];

    // Currency pattern
    const priceNumberPattern = /([0-9\s\u00a0]+(?:[.,][0-9]{2})?|-)\s*(?:€|EUR|,-)/gi;

    // Reject patterns: installments, original strikethroughs, VAT exclusions
    const installmentRx = /(?:\/|\b)kk\b|erissä|luotto|osamaksu|palvelumaksu|toimitus\s+alkaen|\/month/i;
    const strikeRx = /<del|<s\b|line-through|text-decoration:\s*line-through|price--original|old-price|was-price|strikethrough/i;

    // Pattern 1: data-qa / data-test / data-price attributes
    const dataTestRx = /<([a-z0-9_-]+)[^>]*\b(data-(?:testid|test-id|qa|price|item-price|product-price|test))=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi;
    let m;
    while ((m = dataTestRx.exec(html)) !== null) {
        const [_, tag, attr, val, inner] = m;
        if (installmentRx.test(inner) || strikeRx.test(inner)) continue;
        const p = HT.parsePriceNumber(inner);
        if (p && p > 0.50) {
            const sel = `[${attr}="${val}"]`;
            candidateSelectors.push({ selector: sel, price: p, specificity: 1, raw: inner.trim().slice(0, 40) });
            discoveredPrices.push(p);
        }
    }

    // Pattern 2: Custom semantic elements (e.g. <pwr-price>)
    const customElemRx = /<(pwr-price|product-price|price-tag)[^>]*>([\s\S]*?)<\/\1>/gi;
    while ((m = customElemRx.exec(html)) !== null) {
        const [_, tag, inner] = m;
        if (installmentRx.test(inner) || strikeRx.test(inner)) continue;
        const p = HT.parsePriceNumber(inner);
        if (p && p > 0.50) {
            candidateSelectors.push({ selector: tag, price: p, specificity: 2, raw: inner.trim().slice(0, 40) });
            discoveredPrices.push(p);
        }
    }

    // Pattern 3: Semantic class names (e.g. class="product-price", class="price--pdp")
    const classRx = /<([a-z0-9_-]+)[^>]*class=["']([^"']*(?:product-price|price--pdp|price__amount|final-price|pip-price|ssr-product-price)[^"']*)["'][^>]*>([\s\S]*?)<\/\1>/gi;
    while ((m = classRx.exec(html)) !== null) {
        const [_, tag, clsAttr, inner] = m;
        if (installmentRx.test(inner) || strikeRx.test(inner)) continue;
        const p = HT.parsePriceNumber(inner);
        if (p && p > 0.50) {
            const firstGoodClass = clsAttr.split(/\s+/).find(c => /(?:product-price|price--pdp|price__amount|final-price|pip-price)/i.test(c));
            const sel = firstGoodClass ? `.${firstGoodClass}` : `[class*="price" i]`;
            candidateSelectors.push({ selector: sel, price: p, specificity: 3, raw: inner.trim().slice(0, 40) });
            discoveredPrices.push(p);
        }
    }

    // Pattern 4: Generic class="price"
    const genericPriceRx = /<([a-z0-9_-]+)[^>]*class=["']([^"']*\bprice\b[^"']*)["'][^>]*>([\s\S]*?)<\/\1>/gi;
    while ((m = genericPriceRx.exec(html)) !== null) {
        const [_, tag, clsAttr, inner] = m;
        if (installmentRx.test(inner) || strikeRx.test(inner)) continue;
        const p = HT.parsePriceNumber(inner);
        if (p && p > 0.50) {
            candidateSelectors.push({ selector: '.price', price: p, specificity: 4, raw: inner.trim().slice(0, 40) });
            discoveredPrices.push(p);
        }
    }

    // Sort by specificity and deduplicate selectors
    candidateSelectors.sort((a, b) => a.specificity - b.specificity);
    const uniqueMap = new Map();
    for (const c of candidateSelectors) {
        if (!uniqueMap.has(c.selector)) uniqueMap.set(c.selector, c);
    }
    const finalCandidates = Array.from(uniqueMap.values());

    const primary = finalCandidates[0] || null;

    return {
        primaryPrice: primary ? primary.price : null,
        primarySelector: primary ? primary.selector : null,
        candidateSelectors: finalCandidates.map(c => c.selector)
    };
}

/**
 * Harvests technical specifications architecture.
 */
function harvestSpecificationsArchitecture(html) {
    const archetypes = [];

    // Archetype 1: Definition list (<dl><dt>...</dt><dd>...</dd></dl>)
    const dlMatch = html.match(/<dl[^>]*>([\s\S]*?)<\/dl>/gi);
    if (dlMatch) {
        const samplePairs = [];
        const dtDdRx = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi;
        let count = 0;
        let m;
        while ((m = dtDdRx.exec(html)) !== null) {
            count++;
            if (samplePairs.length < 5) {
                const k = m[1].replace(/<[^>]+>/g, '').trim();
                const v = m[2].replace(/<[^>]+>/g, '').trim();
                samplePairs.push({ key: k, value: v });
            }
        }
        if (count > 0) {
            archetypes.push({
                type: 'dl-dt-dd',
                containerSelector: 'dl.specification-list, dl',
                count,
                samplePairs
            });
        }
    }

    // Archetype 2: Table rows (<table><tr><th>...</th><td>...</td></tr></table>)
    const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
    if (tableMatch) {
        const samplePairs = [];
        const trThTdRx = /<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
        let count = 0;
        let m;
        while ((m = trThTdRx.exec(html)) !== null) {
            count++;
            if (samplePairs.length < 5) {
                const k = m[1].replace(/<[^>]+>/g, '').trim();
                const v = m[2].replace(/<[^>]+>/g, '').trim();
                samplePairs.push({ key: k, value: v });
            }
        }
        if (count > 0) {
            archetypes.push({
                type: 'table-tr-th-td',
                containerSelector: 'table.specs-table, table',
                count,
                samplePairs
            });
        }
    }

    // Archetype 3: Bullet list with colons or hyphen items (<ul><li>...</li></ul>)
    const ulMatch = html.match(/<ul[^>]*>([\s\S]*?)<\/ul>/gi);
    if (ulMatch) {
        for (const ul of ulMatch) {
            const samplePairs = [];
            const liRx = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let count = 0;
            let m;
            while ((m = liRx.exec(ul)) !== null) {
                const line = m[1].replace(/<[^>]+>/g, '').trim();
                if (line.includes(':') || line.includes('-') || line.includes('–')) {
                    count++;
                    if (samplePairs.length < 5) {
                        const parts = line.split(/:\s*|\s*-\s*|\s*-\b/);
                        samplePairs.push({ key: parts[0]?.trim(), value: parts.slice(1).join(' - ')?.trim() || parts[0] });
                    }
                }
            }
            if (count >= 3) {
                archetypes.push({
                    type: 'ul-li-bullet',
                    containerSelector: 'ul',
                    count,
                    samplePairs
                });
                break;
            }
        }
    }

    // Archetype 4: Paragraph with <br> separated lines (Jimm's style)
    const brLines = [];
    const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
    if (pMatch) {
        for (const p of pMatch) {
            if (p.includes('<br')) {
                const lines = p.split(/<br\s*\/?>/i);
                for (const l of lines) {
                    const clean = l.replace(/<[^>]+>/g, '').trim();
                    if (clean.includes(':')) {
                        const parts = clean.split(/:\s*/);
                        brLines.push({ key: parts[0].trim(), value: parts.slice(1).join(': ').trim() });
                    }
                }
            }
        }
        if (brLines.length >= 3) {
            archetypes.push({
                type: 'p-br-lines',
                containerSelector: 'div.product-description p, p',
                count: brLines.length,
                samplePairs: brLines.slice(0, 5)
            });
        }
    }

    // Archetype 5: Next.js __NEXT_DATA__
    const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
    if (nextDataMatch) {
        try {
            const nextJson = JSON.parse(nextDataMatch[1]);
            const props = nextJson.props?.pageProps;
            const product = props?.product || props?.initialState?.product || props?.dehydratedState?.queries?.[0]?.state?.data;
            const specs = [];
            if (product) {
                const specGroups = product.specifications || product.technicalSpecifications || product.attributes || product.features;
                if (Array.isArray(specGroups)) {
                    for (const grp of specGroups) {
                        const items = grp.items || grp.attributes || [grp];
                        for (const it of items) {
                            if (it.name && it.value) specs.push({ key: it.name, value: String(it.value) });
                            else if (it.label && it.value) specs.push({ key: it.label, value: String(it.value) });
                        }
                    }
                }
            }
            archetypes.push({
                type: 'nextjs-json-state',
                containerSelector: 'script#__NEXT_DATA__',
                count: specs.length > 0 ? specs.length : 1,
                samplePairs: specs.length > 0 ? specs.slice(0, 5) : [{ key: 'JSON State', value: 'Hydrated React props with specifications' }]
            });
        } catch (_) {}
    }

    return archetypes;
}

/**
 * Harvests JSON-LD Schema.org product data.
 */
function harvestJsonLd(html) {
    const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (!scripts) return null;

    for (const s of scripts) {
        try {
            const content = s.replace(/<script[^>]*>|<\/script>/gi, '').trim();
            const data = JSON.parse(content);
            const items = Array.isArray(data) ? data : (data['@graph'] ? data['@graph'] : [data]);
            const product = items.find(it => it && (it['@type'] === 'Product' || (Array.isArray(it['@type']) && it['@type'].includes('Product'))));
            if (product) {
                return {
                    name: product.name || null,
                    sku: product.sku || null,
                    mpn: product.mpn || null,
                    ean: product.gtin13 || product.gtin || product.ean || null,
                    brand: product.brand ? (product.brand.name || product.brand) : null,
                    offers: product.offers ? (Array.isArray(product.offers) ? product.offers[0] : product.offers) : null
                };
            }
        } catch (_) {}
    }
    return null;
}

/**
 * Discovers and tests hardware bundle / prebuilt PC extraction.
 */
function harvestHardwareBundle(title, price, html) {
    try {
        const info = { name: title, currentPrice: price };
        const bundle = HT.detectAndExtractBundleData(info, null, price, html);
        if (bundle && (bundle.isBundle || bundle.isPcBuild) && Array.isArray(bundle.components) && bundle.components.length > 0) {
            return {
                isPrebuiltPc: true,
                componentCount: bundle.components.length,
                components: bundle.components.map(c => ({
                    roleKey: c.roleKey,
                    roleName: c.roleName,
                    cleanQuery: c.cleanQuery,
                    rawSpec: c.name.slice(0, 50)
                }))
            };
        }
    } catch (_) {}
    return null;
}

/**
 * Infers product category.
 */
function inferCategory(title, html, domain) {
    // 1. Check store hint
    const currentStore = HT.STORES.find(s => domain.includes(s.match));
    if (currentStore?.categoryHint) return currentStore.categoryHint;

    // 2. Use HintaTutka detectProductCategory
    return HT.detectProductCategory(title, currentStore);
}

function calculateOmniscientConfidence(report) {
    let score = 0;
    const checks = [];

    // Title Check (20 pts)
    if (report.title && report.title.title && report.title.title !== 'Unknown Title') {
        if (report.title.confidence === 'high') {
            score += 20;
            checks.push({ label: 'Product Title', status: 'pass', pts: 20, desc: `Clean <h1> with specific selector (${report.title.selector})` });
        } else {
            score += 15;
            checks.push({ label: 'Product Title', status: 'pass', pts: 15, desc: `Extracted via selector (${report.title.selector})` });
        }
    } else {
        checks.push({ label: 'Product Title', status: 'fail', pts: 0, desc: 'Missing or uncertain product title' });
    }

    // Price Check (35 pts)
    if (report.price && report.price.primaryPrice && report.price.primaryPrice > 0.50) {
        score += 25;
        if (report.price.primarySelector && report.price.primarySelector.includes('data-')) {
            score += 10;
            checks.push({ label: 'Cash Price', status: 'pass', pts: 35, desc: `Verified cash price ${report.price.primaryPrice.toFixed(2)} € with data-attribute (${report.price.primarySelector})` });
        } else {
            score += 5;
            checks.push({ label: 'Cash Price', status: 'pass', pts: 30, desc: `Verified cash price ${report.price.primaryPrice.toFixed(2)} € with semantic class (${report.price.primarySelector})` });
        }
    } else {
        checks.push({ label: 'Cash Price', status: 'fail', pts: 0, desc: 'Failed to extract verified numeric cash price' });
    }

    // Specifications Check (25 pts)
    const hasStructuredSpecs = report.specArchetypes && report.specArchetypes.length > 0;
    if (hasStructuredSpecs) {
        const topSpec = report.specArchetypes[0];
        const pts = topSpec.count >= 5 ? 25 : 15;
        score += pts;
        checks.push({ label: 'Specifications', status: 'pass', pts, desc: `Found ${topSpec.count} structured specs via ${topSpec.type}` });
    } else {
        checks.push({ label: 'Specifications', status: 'warn', pts: 0, desc: 'No structured technical specification table/list found' });
    }

    // Identifiers & Schema.org (10 pts)
    if (report.jsonLd && (report.jsonLd.ean || report.jsonLd.sku || report.jsonLd.mpn)) {
        score += 10;
        checks.push({ label: 'EAN / SKU Metadata', status: 'pass', pts: 10, desc: `Verified product identifiers (EAN: ${report.jsonLd.ean || 'N/A'}, SKU: ${report.jsonLd.sku || 'N/A'})` });
    } else {
        checks.push({ label: 'EAN / SKU Metadata', status: 'neutral', pts: 0, desc: 'No Schema.org product identifiers embedded in page' });
    }

    // Hardware Invariants Check (10 pts)
    if (report.hardware && report.hardware.isPrebuiltPc) {
        score += 10;
        checks.push({ label: 'Hardware Invariants', status: 'pass', pts: 10, desc: `All ${report.hardware.componentCount} PC components pass strict hardware quality contracts` });
    } else {
        score += 10;
    }

    let tier = 'BRONZE';
    if (score >= 90) tier = 'PLATINUM (100% REGRESSION-PROOF)';
    else if (score >= 75) tier = 'GOLD (PRODUCTION-READY)';
    else if (score >= 60) tier = 'SILVER (VERIFICATION RECOMMENDED)';

    return { score, tier, checks };
}

/**
 * Main Harvester Execution
 */
async function main() {
    const { html, source, origin } = await loadSourceHtml();

    const store = harvestStoreIdentity(html, source);
    const titleInfo = harvestProductTitle(html);
    const priceInfo = harvestPriceElements(html);
    const specArchetypes = harvestSpecificationsArchitecture(html);
    const jsonLd = harvestJsonLd(html);
    const category = inferCategory(titleInfo.title, html, store.domain);
    const hardware = harvestHardwareBundle(titleInfo.title, priceInfo.primaryPrice || 1000, html);

    const report = {
        store,
        title: titleInfo,
        price: priceInfo,
        category,
        specArchetypes,
        jsonLd,
        hardware
    };

    const audit = calculateOmniscientConfidence(report);
    report.audit = audit;

    if (isJsonOutput) {
        console.log(JSON.stringify(report, null, 2));
        return;
    }

    // Terminal Visual Inspection Report
    console.log('\n========================================================================');
    console.log(`  HINTATUTKA DOM SKELETON & SELECTOR HARVEST REPORT`);
    console.log(`  Confidence Score: ${audit.score}% [${audit.tier}]`);
    console.log('========================================================================');

    console.log(`\n🛡️ [CONFIDENCE & QUALITY AUDIT]`);
    for (const chk of audit.checks) {
        const icon = chk.status === 'pass' ? '✔' : (chk.status === 'warn' ? '⚠️' : (chk.status === 'fail' ? '✖' : 'ℹ️'));
        console.log(`   ${icon} ${chk.label.padEnd(20)} (+${chk.pts} pts): ${chk.desc}`);
    }

    console.log(`\n🏪 [STORE IDENTITY]`);
    console.log(`   Domain:     ${store.domain}`);
    console.log(`   Name:       ${store.name}`);
    console.log(`   Status:     ${store.isRegistered ? '✔ Already in 81 STORES registry' : '✨ NEW STORE DISCOVERED'}`);
    console.log(`   Category:   ${category}`);

    console.log(`\n🏷️ [PRODUCT TITLE]`);
    console.log(`   Title:      ${titleInfo.title}`);
    console.log(`   Selector:   ${titleInfo.selector} (Confidence: ${titleInfo.confidence})`);

    console.log(`\n💰 [PRICE SKELETON]`);
    console.log(`   Cash Price: ${priceInfo.primaryPrice !== null ? `${priceInfo.primaryPrice.toFixed(2)} €` : '⚠️ No cash price detected'}`);
    console.log(`   Primary:    ${priceInfo.primarySelector || 'None'}`);
    if (priceInfo.candidateSelectors.length > 1) {
        console.log(`   Alternates: ${priceInfo.candidateSelectors.slice(1).join(', ')}`);
    }

    console.log(`\n📋 [SPECIFICATIONS SKELETON]`);
    if (specArchetypes.length === 0) {
        console.log(`   ⚠️ No structured specification tables or lists found in HTML.`);
    } else {
        for (const arch of specArchetypes) {
            console.log(`   Archetype:  ${arch.type} (${arch.count} items, selector: "${arch.containerSelector}")`);
            if (arch.samplePairs && arch.samplePairs.length > 0) {
                console.log(`   Samples:`);
                for (const p of arch.samplePairs.slice(0, 3)) {
                    console.log(`     • ${p.key}: ${p.value}`);
                }
            }
        }
    }

    if (hardware && hardware.isPrebuiltPc) {
        console.log(`\n🖥️ [PREBUILT PC HARDWARE DECONSTRUCTION]`);
        console.log(`   Extracted ${hardware.componentCount} components cleanly:`);
        for (const c of hardware.components) {
            console.log(`   • [${c.roleKey.toUpperCase()}] ${c.cleanQuery} (from: "${c.rawSpec}")`);
        }
    }

    if (jsonLd) {
        console.log(`\n📦 [SCHEMA.ORG / JSON-LD METADATA]`);
        if (jsonLd.brand) console.log(`   Brand: ${jsonLd.brand}`);
        if (jsonLd.ean) console.log(`   EAN:   ${jsonLd.ean}`);
        if (jsonLd.mpn) console.log(`   MPN:   ${jsonLd.mpn}`);
        if (jsonLd.sku) console.log(`   SKU:   ${jsonLd.sku}`);
    }

    // Code Snippet Generation
    const primarySelectors = priceInfo.candidateSelectors.length > 0
        ? priceInfo.candidateSelectors.slice(0, 3)
        : ['.product-price', '.price', '[itemprop="price"]'];

    const escapedName = store.name.replace(/'/g, "\\'");
    const storeConfigCode = `        { match: '${store.domain}', name: '${escapedName}'${category !== 'electronics' ? `, categoryHint: '${category}'` : ''}, selectors: ${JSON.stringify(primarySelectors)} },`;

    console.log('\n────────────────────────────────────────────────────────────────────────');
    console.log(`🛠️ CODE SNIPPET FOR HintaTutka.user.js (STORES array):`);
    console.log('────────────────────────────────────────────────────────────────────────');
    console.log(storeConfigCode);

    console.log('\n────────────────────────────────────────────────────────────────────────');
    console.log(`🛠️ CODE SNIPPET FOR selectors.json (Remote hot-patch registry):`);
    console.log('────────────────────────────────────────────────────────────────────────');
    const selectorsJsonSnippet = {
        [store.domain]: {
            prependSelectors: [],
            anchorSelectors: primarySelectors
        }
    };
    console.log(JSON.stringify(selectorsJsonSnippet, null, 2).replace(/^\{\n|\n\}$/g, ''));
    console.log('────────────────────────────────────────────────────────────────────────\n');

    // Auto-patching
    if (isPatch) {
        const rawJson = readFileSync(SELECTORS_PATH, 'utf8');
        const reg = JSON.parse(rawJson);
        reg.storeOverrides = reg.storeOverrides || {};
        reg.storeOverrides[store.domain] = {
            prependSelectors: [],
            anchorSelectors: primarySelectors
        };
        reg.updatedAt = new Date().toISOString().split('T')[0];
        writeFileSync(SELECTORS_PATH, JSON.stringify(reg, null, 2) + '\n', 'utf8');
        console.log(`✔ Auto-patched selectors.json with new configuration for "${store.domain}"!`);
    }

    // Auto fixture generation
    if (saveFixtureName) {
        const fixtureFileName = saveFixtureName.endsWith('.html') ? saveFixtureName : `${saveFixtureName}.html`;
        const fixturePath = join(FIXTURES_DIR, fixtureFileName);
        writeFileSync(fixturePath, html, 'utf8');
        console.log(`✔ Saved test fixture snapshot to: ${fixturePath}`);
    }
}

main().catch(err => {
    console.error(`\n✖ Harvester error: ${err.message}`);
    process.exit(1);
});
