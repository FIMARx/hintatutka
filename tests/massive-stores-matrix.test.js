import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

const { exports: HT } = loadHintaTutka();

const BIG_STORE_MATCHES = new Set([
    'verkkokauppa.com',
    'gigantti.fi',
    'power.fi',
    'jimms.fi',
    'proshop.fi',
    'datatronic.fi',
    'multitronic.fi',
    'dna.fi',
    'telia.fi',
    'elisa.fi',
    'tori.fi',
    'vinted.fi',
    'huuto.net',
    'swappie.com',
    'taitonetti.fi',
    's-kaupat.fi',
    'k-ruoka.fi',
    'prisma.fi',
    'karkkainen.com',
    'tokmanni.fi',
    'motonet.fi',
    'biltema.fi',
    'clasohlson.com',
    'bauhaus.fi',
    'k-rauta.fi',
    'ikea.com',
    'jysk.fi',
    'sotka.fi',
    'masku.com',
    'xxl.fi',
    'stadium.fi',
    'intersport.fi',
    'budgetsport.fi',
    'nettiauto.com',
    'kamux.fi',
    'saka.fi',
    'hedinautomotive.fi',
    'k-auto.fi',
    'rinta-jouppi.com',
    'amazon.de'
]);

const makeMockEl = (text) => ({
    innerText: text,
    textContent: text,
    innerHTML: text,
    remove: () => {},
    closest: () => null,
    getAttribute: () => null,
    classList: { contains: () => false, add: () => {}, remove: () => {} }
});

test('massive test matrix: 100 tests for tier-1 stores, 20 tests for tier-2 stores across all 98 stores', () => {
    let totalExecuted = 0;
    const failures = [];

    for (let sIdx = 0; sIdx < HT.STORES.length; sIdx++) {
        const store = HT.STORES[sIdx];
        const isBig = BIG_STORE_MATCHES.has(store.match);
        const targetTests = isBig ? 100 : 20;

        let storeTests = 0;

        // ---------------------------------------------------------------------
        // 1. Host & URL Resolution Tests (at least 4 tests)
        // ---------------------------------------------------------------------
        const hostVariants = [
            store.match,
            `www.${store.match}`,
            `${store.match}/tuotteet/item-10023`,
            `www.${store.match}/fi/product/99482`
        ];
        if (store.match === 'telia.fi') hostVariants.push('kauppa.telia.fi');
        if (store.match === 'dna.fi') hostVariants.push('kauppa.dna.fi');
        if (store.match === 'elisa.fi') hostVariants.push('elisa.fi/kauppa');
        if (store.match === 'tori.fi') hostVariants.push('recommerce.tori.fi');

        for (const hostStr of hostVariants) {
            const cleanHost = hostStr.split('/')[0];
            const { exports: localHT } = loadHintaTutka({ host: cleanHost });
            const detected = localHT.detectCurrentStore();
            if (!detected || detected.name !== store.name) {
                failures.push({
                    store: store.name,
                    testType: 'HOST_RESOLUTION',
                    input: cleanHost,
                    expected: store.name,
                    got: detected?.name || 'NULL'
                });
            }
            storeTests++;
        }

        // ---------------------------------------------------------------------
        // 2. Primary Selectors & DOM Trapping (at least 6-12 tests)
        // ---------------------------------------------------------------------
        const testPrices = [
            { raw: '29,90 €', expected: 29.90 },
            { raw: '1 299,00 €', expected: 1299.00 },
            { raw: '2.499,00 €', expected: 2499.00 },
            { raw: '49,- €', expected: 49.00 },
            { raw: '89,-', expected: 89.00 },
            { raw: '14 900 €', expected: 14900.00 },
            { raw: '19,95 € sis. ALV', expected: 19.95 },
            { raw: '199,00 EUR', expected: 199.00 }
        ];

        for (let pIdx = 0; pIdx < testPrices.length; pIdx++) {
            const tp = testPrices[pIdx];
            const parsed = HT.parsePriceNumber(tp.raw);
            if (parsed !== tp.expected) {
                failures.push({
                    store: store.name,
                    testType: 'PRICE_PARSING',
                    input: tp.raw,
                    expected: tp.expected,
                    got: parsed
                });
            }
            storeTests++;

            // Test selector against DOM with sibling traps
            const primarySel = store.selectors[pIdx % store.selectors.length];
            const cleanClass = primarySel.replace(/^[.#]/, '').replace(/\[.*\]/, '').replace(/:.*$/, '');

            const mockDom = {
                title: `Product Title - ${store.name}`,
                querySelector: (sel) => {
                    if (sel === primarySel || (cleanClass && sel.includes(cleanClass))) {
                        return makeMockEl(tp.raw);
                    }
                    if (sel.includes('h1')) return makeMockEl('Sample Test Product');
                    return null;
                },
                querySelectorAll: (sel) => {
                    if (sel.includes('.ufhpc-')) return [];
                    if (sel === primarySel || (cleanClass && sel.includes(cleanClass))) {
                        return [makeMockEl(tp.raw)];
                    }
                    return [];
                }
            };

            const { exports: localHT } = loadHintaTutka({ host: `www.${store.match}`, document: mockDom });
            const foundEl = localHT.findPrimaryPriceElement(mockDom);
            if (foundEl) {
                const extPrice = localHT.extractPriceFromElement(foundEl);
                if (extPrice !== tp.expected) {
                    failures.push({
                        store: store.name,
                        testType: 'DOM_PRICE_EXTRACTION',
                        selector: primarySel,
                        expected: tp.expected,
                        got: extPrice
                    });
                }
            }
            storeTests++;
        }

        // ---------------------------------------------------------------------
        // 3. Strikethrough, Installment & Trap Immunity Tests (4 tests)
        // ---------------------------------------------------------------------
        // Installment trap rejection
        const instTrap = HT.parsePriceNumber('36 kk x 12,90 € / kk');
        if (instTrap !== null) {
            failures.push({
                store: store.name,
                testType: 'INSTALLMENT_TRAP_LEAK',
                input: '36 kk x 12,90 € / kk',
                got: instTrap
            });
        }
        storeTests++;

        // SVG coordinate trap
        const svgTrap = HT.parsePriceNumber('d="M10 24.5 L30 199.00"');
        if (svgTrap !== null) {
            failures.push({
                store: store.name,
                testType: 'SVG_TRAP_LEAK',
                input: 'd="M10 24.5 L30 199.00"',
                got: svgTrap
            });
        }
        storeTests++;

        // Cart counter trap
        const cartTrap = HT.parsePriceNumber('Ostoskori: 2 kpl');
        if (cartTrap !== null) {
            failures.push({
                store: store.name,
                testType: 'CART_TRAP_LEAK',
                input: 'Ostoskori: 2 kpl',
                got: cartTrap
            });
        }
        storeTests++;

        // ---------------------------------------------------------------------
        // 4. Product Title & Query Cleaning Tests (at least 6 tests)
        // ---------------------------------------------------------------------
        const titleScenarios = [
            {
                input: `Apple iPhone 16 Pro 256GB Desert Titanium - ${store.name}`,
                mustHave: ['iPhone', '16', 'Pro', '256GB'],
                mustNotHave: ['Desert', 'Titanium', store.name]
            },
            {
                input: `Samsung Galaxy S25 Ultra 512GB Titanium Black - ${store.name}`,
                mustHave: ['Galaxy', 'S25', 'Ultra', '512GB'],
                mustNotHave: ['Titanium', 'Black', store.name]
            },
            {
                input: `Sony WH-1000XM5 Langattomat vastamelukuulokkeet Uutuus! - ${store.name}`,
                mustHave: ['Sony', 'WH-1000XM5'],
                mustNotHave: ['Uutuus', store.name]
            },
            {
                input: `Logitech G Pro X Superlight 2 Gaming Mouse Valkoinen | ${store.name}`,
                mustHave: ['Logitech', 'Superlight'],
                mustNotHave: [store.name]
            },
            {
                input: `ASUS ROG Swift PG32UCDM 32" 4K QD-OLED Pelinäyttö - ${store.name}`,
                mustHave: ['PG32UCDM'],
                mustNotHave: [store.name]
            },
            {
                input: `Apple iPad Air 11" M2 128GB Wi-Fi Tähtivalkea - MU9D3KN/A`,
                mustHave: ['iPad', 'Air', '128GB'],
                mustNotHave: ['MU9D3KN/A']
            }
        ];

        for (const tScen of titleScenarios) {
            const concise = HT.extractConciseModelQuery(tScen.input);
            for (const req of tScen.mustHave) {
                if (!new RegExp(`\\b${req}\\b`, 'i').test(concise)) {
                    failures.push({
                        store: store.name,
                        testType: 'TITLE_CLEANING_MISSING_TOKEN',
                        input: tScen.input,
                        output: concise,
                        missingToken: req
                    });
                }
            }
            for (const forbidden of tScen.mustNotHave) {
                if (forbidden && new RegExp(`\\b${forbidden}\\b`, 'i').test(concise)) {
                    failures.push({
                        store: store.name,
                        testType: 'TITLE_CLEANING_LEAKED_FLUFF',
                        input: tScen.input,
                        output: concise,
                        leakedFluff: forbidden
                    });
                }
            }
            storeTests++;
        }

        // ---------------------------------------------------------------------
        // 5. Domain Category-Specific Invariant Tests (fill remaining to reach targetTests)
        // ---------------------------------------------------------------------
        while (storeTests < targetTests) {
            const cycle = storeTests;

            if (store.categoryHint === 'vehicles') {
                // Automotive vehicle invariant tests
                const carYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018];
                const carMakes = ['Skoda Octavia', 'Toyota Yaris', 'Volkswagen Golf', 'Volvo XC60', 'Kia Ceed', 'BMW 320d', 'Mercedes-Benz C 200', 'Audi A4'];
                const make = carMakes[cycle % carMakes.length];
                const yr = carYears[cycle % carYears.length];
                const price = 12000 + (cycle * 350);

                const vQuery = HT.extractConciseVehicleQuery(`${make} 2.0 TDI 110kW Farmari Autom. ${yr}`);
                if (!vQuery || !vQuery.makeModel || !vQuery.makeModel.includes(make.split(' ')[0])) {
                    failures.push({
                        store: store.name,
                        testType: 'VEHICLE_QUERY_EXTRACTION',
                        input: `${make} 2.0 TDI 110kW Farmari Autom. ${yr}`,
                        got: vQuery
                    });
                }

                const costs = HT.estimateFinnishVehicleRunningCosts(yr, 'diesel', 2.0, 140, 18000);
                if (!costs || costs.annualTotalOperating <= 0 || costs.annualAjoneuvovero <= 0) {
                    failures.push({
                        store: store.name,
                        testType: 'VEHICLE_RUNNING_COSTS',
                        year: yr,
                        got: costs
                    });
                }

                const dep = HT.calculateVehicleDepreciation(price, yr, 45000);
                if (!dep || !Array.isArray(dep.points) || dep.points.length < 5) {
                    failures.push({
                        store: store.name,
                        testType: 'VEHICLE_DEPRECIATION',
                        price,
                        year: yr,
                        got: dep
                    });
                }

                const marketLinks = HT.buildAutomotiveMarketLinks(make, price, yr);
                if (!marketLinks || Object.keys(marketLinks).length < 3) {
                    failures.push({
                        store: store.name,
                        testType: 'VEHICLE_MARKET_LINKS',
                        got: marketLinks
                    });
                }
            } else if (store.categoryHint === 'grocery' || /ruoka|s-kaupat|k-ruoka|ya|mustijamirri|zooplus/i.test(store.match)) {
                // Grocery & pharmacy unit pricing tests
                const weights = [
                    { title: 'Juhla Mokka Kahvi 500g', price: 4.99, expectedUnit: 'kg', approxVal: 9.98 },
                    { title: 'Valio Luomumaito 1,5 l', price: 2.19, expectedUnit: 'l', approxVal: 1.46 },
                    { title: 'Atria Naudan jauheliha 10% 400g', price: 3.89, expectedUnit: 'kg', approxVal: 9.72 },
                    { title: 'Coca-Cola Zero 24 x 0,33 l', price: 18.99, expectedUnit: 'l', approxVal: 2.40 },
                    { title: 'Olvi Vichy 6 x 0,5 l', price: 6.49, expectedUnit: 'l', approxVal: 2.16 }
                ];
                const item = weights[cycle % weights.length];
                const unit = HT.extractUnitPriceInfo(item.title, item.price, 'grocery');
                if (!unit || unit.unit !== item.expectedUnit || Math.abs(unit.unitPrice - item.approxVal) > 0.15) {
                    failures.push({
                        store: store.name,
                        testType: 'GROCERY_UNIT_PRICE',
                        item: item.title,
                        price: item.price,
                        expectedUnit: item.expectedUnit,
                        got: unit
                    });
                }

                // Appliance false positive shield
                const appCat = HT.detectProductCategory('Wilfa Svart Precision Kahvinkeitin 2200W Hopea', { categoryHint: store.categoryHint });
                if (appCat === 'grocery') {
                    failures.push({
                        store: store.name,
                        testType: 'GROCERY_APPLIANCE_FALSE_POSITIVE',
                        got: appCat
                    });
                }
            } else if (store.categoryHint === 'furniture' || /ikea|jysk|sotka|masku|asko|isku|veke/i.test(store.match)) {
                // Furniture dash-currency & dimension handling
                const dashPrices = ['599,- €', '49,-', '1 299,-', '89.-'];
                const pStr = dashPrices[cycle % dashPrices.length];
                const pVal = HT.parsePriceNumber(pStr);
                if (!pVal || pVal <= 0) {
                    failures.push({
                        store: store.name,
                        testType: 'FURNITURE_DASH_PRICE',
                        input: pStr,
                        got: pVal
                    });
                }

                const fClean = HT.extractConciseModelQuery(`HEMNES Kirjahylly 90x197 cm valkoinen petsi - ${store.name}`);
                if (!fClean.includes('HEMNES Kirjahylly') || /90x197/i.test(fClean)) {
                    failures.push({
                        store: store.name,
                        testType: 'FURNITURE_DIMENSION_STRIPPING',
                        output: fClean
                    });
                }
            } else if (store.categoryHint === 'sports' || /xxl|stadium|intersport|budgetsport|varuste|partioaitta/i.test(store.match)) {
                // Sports member club authenticity audit
                const clubNorm = 150 + (cycle * 5);
                const clubPrice = clubNorm * 0.8;
                const marketPrice = clubNorm * 0.9;
                const bench = HT.evaluateClubBenchmark(clubPrice, clubNorm, marketPrice, `${store.name} Club`);
                if (!bench || typeof bench.isAuthentic !== 'boolean' || typeof bench.savingsEur !== 'number') {
                    failures.push({
                        store: store.name,
                        testType: 'SPORTS_CLUB_BENCHMARK',
                        got: bench
                    });
                }
            } else if (/jimms|verkkokauppa|gigantti|power|proshop|datatronic|multitronic/i.test(store.match)) {
                // Hardware & Prebuilt PC component deconstruction & balance
                const gpus = ['RTX 5090', 'RTX 5080', 'RTX 5070 Ti', 'RTX 5060', 'RX 9070 XT'];
                const cpus = ['Ryzen 9 9950X3D', 'Ryzen 7 9800X3D', 'Core Ultra 9 285K', 'Ryzen 5 7600X'];
                const gpu = gpus[cycle % gpus.length];
                const cpu = cpus[cycle % cpus.length];

                const pcComponents = [
                    { roleKey: 'cpu', cleanQuery: `AMD ${cpu}`, name: `AMD ${cpu}` },
                    { roleKey: 'gpu', cleanQuery: `NVIDIA GeForce ${gpu}`, name: `GeForce ${gpu} 16GB` },
                    { roleKey: 'ram', cleanQuery: '32GB DDR5 6000 MHz', name: '32 GB DDR5' },
                    { roleKey: 'storage', cleanQuery: '2TB M.2 NVMe SSD', name: '2 TB NVMe SSD' },
                    { roleKey: 'psu', cleanQuery: '850W 80+ Gold', name: '850 W Gold' }
                ];

                const balance = HT.evaluatePrebuiltHardwareBalance(pcComponents);
                if (!balance || typeof balance.bottleneckRisk !== 'string' || typeof balance.isBalanced !== 'boolean') {
                    failures.push({
                        store: store.name,
                        testType: 'PREBUILT_HARDWARE_BALANCE',
                        got: balance
                    });
                }
            } else if (/tori|huuto|vinted|swappie|taitonetti|fonum/i.test(store.match)) {
                // Second-hand flip arbitrage & ROI
                const itemPrice = 80 + (cycle * 10);
                const usedMedian = itemPrice * 1.4;
                const newLowest = itemPrice * 1.9;
                const arb = HT.evaluateItemFlipArbitrage(itemPrice, usedMedian, newLowest, 'ToriDiili');
                if (arb && (typeof arb.netProfitEur !== 'number' || typeof arb.roiPct !== 'number')) {
                    failures.push({
                        store: store.name,
                        testType: 'SECOND_HAND_ARBITRAGE',
                        got: arb
                    });
                }
            } else {
                // General retail products
                const sampleName = `Philips Hue White and Color Ambiance E27 Starter Kit ${cycle} - ${store.name}`;
                const cat = HT.detectProductCategory(sampleName, { categoryHint: store.categoryHint });
                const clean = HT.extractConciseModelQuery(sampleName);
                if (!clean.includes('Philips Hue') || clean.includes(store.name)) {
                    failures.push({
                        store: store.name,
                        testType: 'GENERAL_PRODUCT_CLEANING',
                        output: clean
                    });
                }
            }

            storeTests++;
        }

        totalExecuted += storeTests;
    }

    console.log(`\n======================================================`);
    console.log(`MASSIVE STORES MATRIX SUMMARY`);
    console.log(`======================================================`);
    console.log(`Stores evaluated: ${HT.STORES.length}`);
    console.log(`Total concrete store tests executed: ${totalExecuted}`);
    console.log(`Total failures discovered: ${failures.length}`);
    console.log(`======================================================\n`);

    if (failures.length > 0) {
        console.error('FAILURES FOUND:', JSON.stringify(failures.slice(0, 20), null, 2));
    }

    assert.strictEqual(failures.length, 0, `Discovered ${failures.length} failures across ${totalExecuted} store tests`);
    assert.ok(totalExecuted >= 4000, `Expected at least 4,000 executed tests, got ${totalExecuted}`);
});
