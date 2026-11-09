import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');
const USERSCRIPT_PATH = join(ROOT_DIR, 'HintaTutka.user.js');

const RAW_CODE = readFileSync(USERSCRIPT_PATH, 'utf8');

const EXPORT_HOOK = `
globalThis.__HT_TEST_EXPORTS__ = {
    SCRIPT_VERSION,
    CONFIG,
    STORES,
    CACHE_PREFIX,
    parsePriceNumber,
    extractPriceFromElement,
    extractCoreProductTitle,
    extractStructuredSpecs,
    evaluateSpecCompatibility,
    extractConciseModelQuery,
    extractMeaningfulTokens,
    extractModelCodes,
    doesItemMatchQueryWords,
    doesToriHeadingMatchQuery,
    scoreSearchCandidate,
    isSameExactProduct,
    calculateFinnishLandedCost,
    parseAmazonDeSearchHtml,
    parseHintaProductDoc,
    findPrimaryPriceElement,
    findBestPriceAnchor,
    extractProductInfo,
    computeRobustUsedStats,
    evaluateItemFlipArbitrage,
    findBestFlipArbitrageListing,
    evaluateClubBenchmark,
    FINNISH_SEASONAL_SALE_EVENTS,
    getUpcomingFinnishSaleEvent,
    calculateHoltWintersForecast,
    computePredictivePriceAnalytics,
    getCached,
    setCached,
    purgeLegacyCaches,
    fetchPrismaDirectOffers,
    fetchAmazonDeCrossBorder,
    classifyComponentRole,
    cleanComponentQuery,
    detectAndExtractBundleData,
    enrichBundleComponentPrices,
    buildBundleBreakdownHtml,
    evaluatePriceVerdict,
    fetchProductHistory,
    buildDualChartSectionHtml,
    detectCurrentStore,
    detectProductCategory,
    extractUnitPriceInfo,
    evaluatePrebuiltHardwareBalance,
    extractConciseVehicleQuery,
    buildAutomotiveMarketLinks,
    calculateVehicleDepreciation,
    detectAndExtractVehicleData,
    buildVehicleDepreciationChartHtml,
    I18N
};
`;

const HOOKED_CODE = RAW_CODE.replace(
    /setInterval\(handlePotentialSpaNavigation,\s*1000\);\s*\}\)\(\);/,
    `${EXPORT_HOOK}\nsetInterval(handlePotentialSpaNavigation, 1000);\n})();`
);

export function loadHintaTutka(opts = {}) {
    const mockHost = opts.host || 'www.verkkokauppa.com';
    const mockPathname = opts.pathname || '/fi/tuote/1074188/test';
    const storageStore = new Map(Object.entries(opts.initialStorage || {}));

    const mockStorage = {
        getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
        setItem: (k, v) => { storageStore.set(k, String(v)); },
        removeItem: (k) => { storageStore.delete(k); },
        clear: () => { storageStore.clear(); },
        get length() { return storageStore.size; },
        key: (idx) => Array.from(storageStore.keys())[idx] || null,
        _map: storageStore
    };

    const sandbox = {
        console,
        setTimeout,
        clearTimeout,
        setInterval: () => 1,
        clearInterval: () => {},
        URL,
        TextDecoder,
        Uint8Array,
        Buffer,
        atob: (b64) => Buffer.from(b64, 'base64').toString('binary'),
        btoa: (str) => Buffer.from(str, 'binary').toString('base64'),
        NodeFilter: { SHOW_ELEMENT: 1 },
        localStorage: mockStorage,
        sessionStorage: mockStorage,
        GM_getValue: (k, defVal) => (storageStore.has(k) ? storageStore.get(k) : defVal),
        GM_setValue: (k, v) => { storageStore.set(k, v); },
        GM_deleteValue: (k) => { storageStore.delete(k); },
        GM_listValues: () => Array.from(storageStore.keys()),
        GM_registerMenuCommand: () => {},
        GM_xmlhttpRequest: (req) => {
            if (typeof opts.gmFetchHandler === 'function') {
                return opts.gmFetchHandler(req);
            }
            // Default: simulate network or return empty
            setTimeout(() => {
                if (req.onload) {
                    req.onload({
                        status: 200,
                        finalUrl: req.url,
                        responseText: opts.mockResponseText || ''
                    });
                }
            }, 1);
            return { abort: () => {} };
        },
        DOMParser: class {
            parseFromString(html) {
                const rawHtml = String(html || '');
                const titleM = rawHtml.match(/<title>([\s\S]*?)<\/title>/i);
                const h1M = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
                return {
                    title: titleM ? titleM[1].trim() : '',
                    querySelector: (sel) => {
                        if (sel.includes('h1') && h1M) return { textContent: h1M[1].replace(/<[^>]+>/g, '').trim() };
                        return null;
                    },
                    querySelectorAll: (sel) => {
                        if (sel.includes('tr.hv-prt-tr') || sel.includes('hv-prt-tr')) {
                            const trMatches = [...rawHtml.matchAll(/<tr[^>]*class="[^"]*hv-prt-tr[^"]*"([\s\S]*?)<\/tr>/gi)];
                            return trMatches.map((m) => {
                                const trFull = m[0];
                                const trInner = m[1];
                                const getAttr = (name) => {
                                    const am = trFull.match(new RegExp(`${name}="([^"]*)"`, 'i'));
                                    return am ? am[1] : null;
                                };
                                return {
                                    getAttribute: getAttr,
                                    querySelector: (subSel) => {
                                        if (subSel.includes('hv-prt_product-a') || subSel.includes('product-a')) {
                                            const linkM = trInner.match(/<a[^>]*href="([^"]+)"[^>]*class="[^"]*hv-prt_product-a[^"]*"/i) ||
                                                          trInner.match(/<a[^>]*class="[^"]*hv-prt_product-a[^"]*"[^>]*href="([^"]+)"/i);
                                            return linkM ? { getAttribute: (attr) => attr === 'href' ? linkM[1] : null } : null;
                                        }
                                        if (subSel.includes('.hv--name')) {
                                            const nm = trInner.match(/<strong[^>]*class="[^"]*hv--name[^"]*"[^>]*>([\s\S]*?)<\/strong>/i);
                                            return nm ? { textContent: nm[1].replace(/<[^>]+>/g, '').trim() } : null;
                                        }
                                        if (subSel.includes('.hv--features')) {
                                            const fm = trInner.match(/<div[^>]*class="[^"]*hv--features[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
                                            return fm ? { textContent: fm[1].replace(/<[^>]+>/g, '').trim() } : null;
                                        }
                                        return null;
                                    }
                                };
                            });
                        }
                        return [];
                    }
                };
            }
        },
        MutationObserver: class { observe() {} disconnect() {} },
        ResizeObserver: class { observe() {} disconnect() {} },
        navigator: { language: 'fi-FI', clipboard: { writeText: async () => {} } },
        history: { pushState: () => {}, replaceState: () => {} },
        addEventListener: () => {},
        removeEventListener: () => {},
        location: {
            get hostname() { return mockHost; },
            get pathname() { return mockPathname; },
            get href() { return `https://${mockHost}${mockPathname}`; }
        },
        document: {
            hidden: true,
            visibilityState: 'hidden',
            readyState: 'complete',
            title: opts.pageTitle || 'HintaTutka Test',
            body: { appendChild: () => {}, children: [], innerText: '', textContent: '', innerHTML: '', querySelectorAll: () => [] },
            documentElement: {},
            getElementById: () => null,
            getElementsByTagName: () => [],
            createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
            addEventListener: () => {},
            removeEventListener: () => {},
            querySelector: (sel) => (opts.document && typeof opts.document.querySelector === 'function' ? opts.document.querySelector(sel) : null),
            querySelectorAll: (sel) => (opts.document && typeof opts.document.querySelectorAll === 'function' ? opts.document.querySelectorAll(sel) : []),
            createTreeWalker: () => ({ currentNode: null, nextNode: () => null }),
            ...(opts.document || {})
        },
        window: null,
        fetch: globalThis.fetch
    };

    sandbox.window = sandbox;
    sandbox.window.getComputedStyle = () => ({ display: 'block', visibility: 'visible', textDecorationLine: 'none', fontSize: '16px' });
    sandbox.globalThis = sandbox;

    vm.runInNewContext(HOOKED_CODE, sandbox);

    if (!sandbox.__HT_TEST_EXPORTS__) {
        throw new Error('Failed to attach __HT_TEST_EXPORTS__ hook to HintaTutka runtime');
    }

    return {
        exports: sandbox.__HT_TEST_EXPORTS__,
        sandbox,
        storage: mockStorage
    };
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tests/lib/harness.js')) {
    const { exports } = loadHintaTutka();
    console.log('Harness initialized successfully, SCRIPT_VERSION:', exports.SCRIPT_VERSION);
}

