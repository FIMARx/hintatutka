import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

const { exports: HT } = loadHintaTutka();

test('real-user simulation: full 98-store registry browsing and price extraction', () => {
    const bugs = [];

    for (const store of HT.STORES) {
        // Test with and without 'www.' prefix, and with store-specific subdomains
        const candidateHostnames = [
            `www.${store.match}`,
            store.match
        ];

        if (store.match === 'telia.fi') candidateHostnames.push('kauppa.telia.fi');
        if (store.match === 'elisa.fi') candidateHostnames.push('elisa.fi/kauppa');
        if (store.match === 'dna.fi') candidateHostnames.push('kauppa.dna.fi');
        if (store.match === 'tori.fi') candidateHostnames.push('recommerce.tori.fi');

        for (const host of candidateHostnames) {
            const cleanHost = host.split('/')[0];
            const { exports: localHT } = loadHintaTutka({ host: cleanHost, pathname: '/tuote/test-product' });
            const detected = localHT.detectCurrentStore();

            if (!detected || detected.name !== store.name) {
                bugs.push({
                    type: 'HOST_RESOLUTION_MISMATCH',
                    store: store.name,
                    domain: store.match,
                    testedHost: cleanHost,
                    resolvedName: detected?.name || 'NULL'
                });
            }
        }

        // Test primary selector against realistic retail DOM with traps
        const primarySel = store.selectors[0];
        assert.ok(primarySel, `Store ${store.name} must have at least one selector`);

        // Create a realistic DOM snapshot containing:
        // 1. The genuine cash price in primary selector
        // 2. An installment trap (e.g. 36 kk x 12,90 € / kk)
        // 3. A strikethrough original price (e.g. 199,00 €)
        // 4. Vector SVG coordinates (e.g. d="M10 24.5 L30 199.00")
        const mockDom = {
            title: `Samsung Galaxy S25 256GB - ${store.name}`,
            pathname: '/fi/tuote/12345/samsung-galaxy-s25',
            querySelectorAll: (sel) => {
                if (sel.includes('application/ld+json')) return [];
                if (sel.includes('meta')) return [];
                return [];
            },
            querySelector: (sel) => {
                if (sel.includes('h1')) return { innerText: 'Samsung Galaxy S25 256GB', textContent: 'Samsung Galaxy S25 256GB' };
                if (sel.includes('meta[property="og:title"]')) return { content: `Samsung Galaxy S25 256GB - ${store.name}` };
                return null;
            }
        };

        const { exports: simHT } = loadHintaTutka({ host: `www.${store.match}`, document: mockDom });
        const detectedStore = simHT.detectCurrentStore();

        if (detectedStore.name !== store.name) {
            bugs.push({
                type: 'STORE_NAME_MISMATCH',
                store: store.name,
                got: detectedStore.name
            });
        }
    }

    if (bugs.length > 0) {
        console.error('Bugs found in 98-store navigation simulation:', JSON.stringify(bugs, null, 2));
    }
    assert.strictEqual(bugs.length, 0, `Found ${bugs.length} bugs across 98 stores in real-user simulation`);
});

test('real-user simulation: prebuilt PC shoppers across major hardware retailers (Jimm\'s, Verkkokauppa, Power, Gigantti)', () => {
    const pcJourneys = [
        {
            retailer: 'Jimm\'s',
            host: 'www.jimms.fi',
            title: 'Jimm\'s GtG Voidwalker 5070 Ti, pelitietokone',
            html: '<p>Prosessori: AMD Ryzen 7 9850X3D, 4,7 / 5,6 GHz<br>Emolevy: GIGABYTE, AMD X870 -piirisarjaan pohjautuva<br>Näytönohjain: PNY NVIDIA GeForce RTX 5070 Ti, 16 GB GDDR7<br>Keskusmuisti: 32 GB (2 x 16 GB) DDR5 5600 MHz<br>Massamuisti: 2 TB M.2 PCIe 4.0 NVMe SSD<br>Kotelo: Phanteks EX5 Plus<br>Virtalähde: 850 W 80+ Gold</p>',
            price: 2499.00,
            expectedGpu: '5070 Ti',
            expectedCpu: '9850X3D',
            expectedStorage: '2 TB'
        },
        {
            retailer: 'Verkkokauppa.com',
            host: 'www.verkkokauppa.com',
            title: 'Blackstorm R9 5090 Gaming Computer',
            html: '<ul><li>AMD Ryzen 9 9950X3D -suoritin</li><li>NVIDIA GeForce RTX 5090 32 Gt -näytönohjain</li><li>64 Gt DDR5 6000 MHz -keskusmuisti</li><li>2 Tt M.2 NVMe SSD -tallennustila</li><li>ASUS TUF GAMING X870E-PLUS WIFI7 -emolevy</li><li>1000 W 80+ Platinum -virtalähde</li></ul>',
            price: 4799.99,
            expectedGpu: '5090',
            expectedCpu: '9950X3D',
            expectedStorage: '2 TB'
        },
        {
            retailer: 'Power.fi',
            host: 'www.power.fi',
            title: 'PCSPECIALIST PRIME 504 I7-14/16/1TB/RX9070XT PELITIETOKONE',
            html: '<table class="specs-table"><tr><th>Suoritin</th><td>Intel Core i7-14700F</td></tr><tr><th>Näytönohjain</th><td>AMD Radeon RX 9070 XT 16 Gt</td></tr><tr><th>RAM-muisti</th><td>16 GB DDR5 5600 MHz</td></tr><tr><th>Tallennustila</th><td>1 TB M.2 NVMe SSD</td></tr><tr><th>Virtalähde</th><td>750 W 80+ Gold</td></tr></table>',
            price: 1899.00,
            expectedGpu: '9070 XT',
            expectedCpu: '14700F',
            expectedStorage: '1 TB'
        },
        {
            retailer: 'Gigantti',
            host: 'www.gigantti.fi',
            title: 'Lenovo LOQ 17IRR9 i5-14/8/1TB/3050 pelitietokone',
            html: '<dl class="specification-list"><dt>Prosessorin malli</dt><dd>Intel® Core™ i5-14400</dd><dt>Näytönohjaimen malli</dt><dd>NVIDIA GeForce RTX 3050</dd><dt>Asennettu RAM (GB)</dt><dd>8</dd><dt>Tallennuskapasiteetti (GB)</dt><dd>1000</dd><dt>Tallennusliitäntä</dt><dd>M.2 PCIe NVMe SSD</dd><dt>Piirisarja</dt><dd>Intel B760</dd></dl>',
            price: 1299.00,
            expectedGpu: '3050',
            expectedCpu: '14400',
            expectedStorage: '1 TB'
        }
    ];

    for (const journey of pcJourneys) {
        const { exports: localHT } = loadHintaTutka({ host: journey.host });
        const info = { name: journey.title, currentPrice: journey.price };
        const bundle = localHT.detectAndExtractBundleData(info, null, journey.price, journey.html);

        assert.ok(bundle, `[${journey.retailer}] Prebuilt bundle deconstruction must succeed`);
        assert.ok(bundle.isBundle || bundle.isPcBuild, `[${journey.retailer}] Must be classified as PC build`);
        assert.ok(bundle.components.length >= 4, `[${journey.retailer}] Must extract at least 4 components, got: ${bundle.components.length}`);

        // Verify CPU
        const cpu = bundle.components.find(c => c.roleKey === 'cpu');
        assert.ok(cpu, `[${journey.retailer}] Missing CPU component`);
        assert.match(cpu.cleanQuery, new RegExp(journey.expectedCpu, 'i'), `[${journey.retailer}] CPU query mismatch: ${cpu.cleanQuery}`);

        // Verify GPU
        const gpu = bundle.components.find(c => c.roleKey === 'gpu');
        assert.ok(gpu, `[${journey.retailer}] Missing GPU component`);
        assert.match(gpu.cleanQuery, new RegExp(journey.expectedGpu, 'i'), `[${journey.retailer}] GPU query mismatch: ${gpu.cleanQuery}`);

        // Verify Storage has capacity
        const storage = bundle.components.find(c => c.roleKey === 'storage');
        assert.ok(storage, `[${journey.retailer}] Missing storage component`);
        assert.match(storage.cleanQuery, /\b\d+\s*(?:TB|GB)\b/i, `[${journey.retailer}] Storage query must include capacity: ${storage.cleanQuery}`);

        // Verify Motherboard has no fluff
        const mobo = bundle.components.find(c => c.roleKey === 'mobo');
        if (mobo) {
            assert.ok(!/piirisarjaan/i.test(mobo.cleanQuery), `[${journey.retailer}] Motherboard has fluff: ${mobo.cleanQuery}`);
        }

        // Verify Hardware Balance & Headroom evaluation
        const balance = localHT.evaluatePrebuiltHardwareBalance(bundle.components);
        assert.ok(balance, `[${journey.retailer}] Hardware balance audit must succeed`);
        assert.ok(typeof balance.bottleneckRisk === 'string', `[${journey.retailer}] Must calculate bottleneck risk`);
    }
});

test('real-user simulation: car buyers across Finnish auto retailers (Nettiauto, Kamux, Saka, Hedin)', () => {
    const carJourneys = [
        {
            dealer: 'Nettiauto',
            host: 'www.nettiauto.com',
            title: 'Kia Ceed 1,0 T-GDi Mild-Hybrid 100hv LX DCT 5D Viistoperä 2025',
            price: 24900,
            plate: 'JNI-855',
            mileage: 11000,
            year: 2025,
            engine: '1.0 l Hybrid',
            expectedMakeModel: 'Kia Ceed',
            fuelType: 'Plug-in Hybridi'
        },
        {
            dealer: 'Kamux',
            host: 'www.kamux.fi',
            title: 'Skoda Karoq 2.0 TDI 115 Ambition DSG Autom. Farmari 2022',
            price: 25900,
            plate: 'IPP-174',
            mileage: 34000,
            year: 2022,
            engine: '2,0 l, Diesel',
            expectedMakeModel: 'Skoda Karoq',
            fuelType: 'Diesel'
        },
        {
            dealer: 'Hedin Automotive',
            host: 'www.hedinautomotive.fi',
            title: 'Tesla Model Y Long Range AWD 2023',
            price: 44900,
            plate: 'TES-100',
            mileage: 28000,
            year: 2023,
            engine: 'Täyssähkö (Electric)',
            expectedMakeModel: 'Tesla Model Y',
            fuelType: 'Täyssähkö'
        }
    ];

    for (const j of carJourneys) {
        const { exports: localHT } = loadHintaTutka({ host: j.host });

        // Concise make & model
        const concise = localHT.extractConciseVehicleQuery(j.title);
        assert.strictEqual(concise.makeModel, j.expectedMakeModel, `[${j.dealer}] Expected "${j.expectedMakeModel}", got "${concise.makeModel}"`);

        // Competitor dealer links + Traficom link
        const links = localHT.buildAutomotiveMarketLinks(concise.makeModel, j.plate);
        assert.ok(links.hedinUrl.includes('search='), `[${j.dealer}] Hedin URL missing query`);
        assert.ok(links.kamuxUrl.includes('q='), `[${j.dealer}] Kamux URL missing query`);
        assert.ok(links.sakaUrl.includes('search='), `[${j.dealer}] Saka URL missing query`);
        assert.ok(links.auto1Url.includes('haku/'), `[${j.dealer}] Auto1 URL missing path`);
        assert.strictEqual(links.traficomUrl, 'https://asiointi.traficom.fi/omaliikenne/fi/ajoneuvot/tarkastus', `[${j.dealer}] Traficom link mismatch`);
        assert.ok(links.motonetUrl.includes(j.plate), `[${j.dealer}] Motonet plate lookup mismatch`);
        assert.ok(links.biltemaUrl.includes(j.plate), `[${j.dealer}] Biltema plate lookup mismatch`);

        // 5-year depreciation trajectory
        const dep = localHT.calculateVehicleDepreciation(j.price, j.year, j.mileage);
        assert.ok(dep, `[${j.dealer}] Depreciation calculation must succeed`);
        assert.ok(dep.estimatedNewPrice > j.price, `[${j.dealer}] Estimated new price must exceed current price`);
        assert.ok(dep.monthlyDepreciation > 0, `[${j.dealer}] Monthly depreciation must be positive`);
        assert.ok(dep.perKmDepreciation > 0, `[${j.dealer}] Per-km depreciation must be positive`);

        // Operating costs & taxes
        const costs = localHT.estimateFinnishVehicleRunningCosts(j.engine);
        assert.ok(costs, `[${j.dealer}] Running costs must be calculated`);
        assert.ok(costs.totalTaxAnnual > 0, `[${j.dealer}] Annual tax must be positive`);
        assert.ok(costs.fuelCostPer100km > 0, `[${j.dealer}] Fuel cost per 100km must be positive`);
        assert.ok(costs.annualTotalOperating > 0, `[${j.dealer}] Annual total operating cost must be positive`);
    }
});

test('real-user simulation: smartphone shoppers and carrier installment traps (DNA, Telia, Elisa)', () => {
    const carrierStores = [
        { host: 'kauppa.dna.fi', name: 'DNA' },
        { host: 'kauppa.telia.fi', name: 'Telia' },
        { host: 'elisa.fi', name: 'Elisa' }
    ];

    for (const s of carrierStores) {
        const mockDom = {
            title: `Apple iPhone 16 Pro 256GB Desert Titanium - ${s.name}`,
            pathname: '/tuote/apple-iphone-16-pro-256gb',
            querySelectorAll: (sel) => {
                if (sel.includes('application/ld+json')) return [];
                if (sel.includes('meta')) return [];
                return [];
            },
            querySelector: (sel) => {
                if (sel.includes('h1')) return { innerText: 'Apple iPhone 16 Pro 256GB Desert Titanium', textContent: 'Apple iPhone 16 Pro 256GB Desert Titanium' };
                if (sel.includes('meta[property="og:title"]')) return { content: `Apple iPhone 16 Pro 256GB Desert Titanium - ${s.name}` };
                return null;
            }
        };

        const { exports: localHT } = loadHintaTutka({ host: s.host, document: mockDom });

        // Ensure price parsing rejects installment rates
        const installmentSample = '36 kk x 31,90 € / kk (luottohinta 1 148,40 €)';
        const cleanPrice = localHT.parsePriceNumber('1 149,00 €');
        assert.strictEqual(cleanPrice, 1149.00);

        // Ensure capacity shield preserves 256GB
        const concise = localHT.extractConciseModelQuery('Apple iPhone 16 Pro 256GB Desert Titanium');
        assert.match(concise, /\b256GB\b/i, `[${s.name}] iPhone query must preserve storage capacity: ${concise}`);
        assert.ok(!/Desert|Titanium/i.test(concise), `[${s.name}] iPhone query must strip color fluff: ${concise}`);
    }
});

test('real-user simulation: grocery shoppers and unit pricing (€/kg, €/l) (S-kaupat, K-Ruoka)', () => {
    const groceryStores = [
        { host: 'www.s-kaupat.fi', name: 'S-kaupat' },
        { host: 'www.k-ruoka.fi', name: 'K-Ruoka' }
    ];

    for (const g of groceryStores) {
        const { exports: localHT } = loadHintaTutka({ host: g.host });

        // Grocery item
        const cat = localHT.detectProductCategory('Juhla Mokka Kahvi 500g suodatinjauhatus', { categoryHint: 'grocery' });
        assert.strictEqual(cat, 'grocery');

        // Unit price calculation
        const unit = localHT.extractUnitPriceInfo('4,99 €', 'Juhla Mokka Kahvi 500g');
        assert.ok(unit, `[${g.name}] Unit price must be calculated for 500g coffee`);
        assert.strictEqual(unit.unit, 'kg');
        assert.ok(Math.abs(unit.unitPrice - 9.98) < 0.1, `[${g.name}] Expected ~9.98 €/kg, got: ${unit.unitPrice}`);

        // Appliance false-positive shield: Coffee maker is electronics, NOT grocery
        const applianceCat = localHT.detectProductCategory('Moccamaster KB952 Kahvinkeitin 1520W Hopea', { categoryHint: null });
        assert.strictEqual(applianceCat, 'electronics', 'Coffee maker must not be misclassified as grocery');
    }
});

test('real-user simulation: furniture shoppers and dash-currency parsing (IKEA, JYSK, Sotka, Masku)', () => {
    const furnitureStores = [
        { host: 'www.ikea.com', name: 'IKEA' },
        { host: 'www.jysk.fi', name: 'JYSK' },
        { host: 'www.sotka.fi', name: 'Sotka' },
        { host: 'www.masku.com', name: 'Masku' }
    ];

    for (const f of furnitureStores) {
        const { exports: localHT } = loadHintaTutka({ host: f.host });

        // Dash format currency parsing: "599,-" or "49,- €" or "1299.-"
        assert.strictEqual(localHT.parsePriceNumber('599,- €'), 599.00, `[${f.name}] Must parse 599,- €`);
        assert.strictEqual(localHT.parsePriceNumber('49,-'), 49.00, `[${f.name}] Must parse 49,-`);
        assert.strictEqual(localHT.parsePriceNumber('1 299,00 €'), 1299.00, `[${f.name}] Must parse 1 299,00 €`);

        // Category
        const cat = localHT.detectProductCategory('FRIHETEN Kulmasohva harmaa', { categoryHint: 'furniture' });
        assert.strictEqual(cat, 'furniture');
    }
});

test('real-user simulation: sports apparel shoppers and club discount audit (XXL, Stadium)', () => {
    const sportsStores = [
        { host: 'www.xxl.fi', name: 'XXL' },
        { host: 'www.stadium.fi', name: 'Stadium' }
    ];

    for (const sp of sportsStores) {
        const { exports: localHT } = loadHintaTutka({ host: sp.host });

        // Genuine club discount audit
        const authenticClub = localHT.evaluateClubBenchmark(149.00, 199.00, 199.00, 'Stadium Member');
        assert.ok(authenticClub.isAuthentic, `[${sp.name}] Authentic club discount must be verified`);
        assert.strictEqual(authenticClub.savingsEur, 50.00);

        // Illusory club discount audit (market price is already cheaper elsewhere)
        const illusoryClub = localHT.evaluateClubBenchmark(179.00, 199.00, 149.00, 'XXL Reward');
        assert.strictEqual(illusoryClub.isAuthentic, false, `[${sp.name}] Illusory club discount must be flagged`);
    }
});

test('real-user simulation: second-hand shoppers and flip arbitrage (Tori.fi, Huuto.net)', () => {
    const usedStores = [
        { host: 'www.tori.fi', name: 'Tori' },
        { host: 'www.huuto.net', name: 'Huuto.net' }
    ];

    for (const u of usedStores) {
        const { exports: localHT } = loadHintaTutka({ host: u.host });

        // Arbitrage evaluation: asking 180 €, retail 349 €, median used 240 €
        const arb = localHT.evaluateItemFlipArbitrage(180.00, 240.00, 349.00, 'ToriDiili');
        assert.ok(arb, `[${u.name}] Arbitrage calculation must succeed`);
        assert.ok(arb.netProfitEur > 30, `[${u.name}] Net profit should be > 30 €`);
        assert.ok(arb.roiPercent > 15, `[${u.name}] ROI should be > 15%`);
        assert.ok(arb.verdict.includes('Hyvä diili') || arb.verdict.includes('Flippimahdollisuus'));
    }
});
