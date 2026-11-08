import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

test('bundle: classifyComponentRole categorizes all major PC hardware roles', () => {
    const { exports: HT } = loadHintaTutka();

    const cpu = HT.classifyComponentRole('AMD Ryzen 7 9800X3D, AM5, 4.7 GHz, 8-Core, WOF', 'Prosessori');
    assert.strictEqual(cpu.roleKey, 'cpu');
    assert.strictEqual(cpu.roleIcon, '⚡');

    const mobo = HT.classifyComponentRole('Asus TUF GAMING B850-PLUS WIFI, ATX-emolevy', 'Emolevy');
    assert.strictEqual(mobo.roleKey, 'mobo');
    assert.strictEqual(mobo.roleIcon, '🔲');

    const gpu = HT.classifyComponentRole('ASUS NVIDIA GeForce RTX 5090 TUF GAMING, 32 GB GDDR7', 'Näytönohjain');
    assert.strictEqual(gpu.roleKey, 'gpu');
    assert.strictEqual(gpu.roleIcon, '🎮');

    const ram = HT.classifyComponentRole('Patriot 32GB (2 x 16GB) Viper VENOM, DDR5 6000MHz, CL36', 'Keskusmuisti');
    assert.strictEqual(ram.roleKey, 'ram');
    assert.strictEqual(ram.roleIcon, '🧠');

    const ssd = HT.classifyComponentRole('4 TB M.2 PCIe 4.0 NVMe SSD', 'Massamuisti');
    assert.strictEqual(ssd.roleKey, 'storage');
    assert.strictEqual(ssd.roleIcon, '💾');

    const cooler = HT.classifyComponentRole('Noctua NL-LC1-42, 420 mm AIO-nestejäähdytys', 'Prosessorijäähdytys');
    assert.strictEqual(cooler.roleKey, 'cooler');
    assert.strictEqual(cooler.roleIcon, '❄️');

    const pcCase = HT.classifyComponentRole('Antec X Noctua FLUX PRO Noctua Edition', 'Kotelo');
    assert.strictEqual(pcCase.roleKey, 'case');
    assert.strictEqual(pcCase.roleIcon, '📦');

    const psu = HT.classifyComponentRole('1200 W 80+ Gold, PCIe 5.0 Ready', 'Virtalähde');
    assert.strictEqual(psu.roleKey, 'psu');
    assert.strictEqual(psu.roleIcon, '🔌');

    const os = HT.classifyComponentRole('Windows 11 Home', 'Käyttöjärjestelmä');
    assert.strictEqual(os.roleKey, 'os');
    assert.strictEqual(os.roleIcon, '🪟');
});

test('bundle: cleanComponentQuery extracts concise search query for Hinta.fi', () => {
    const { exports: HT } = loadHintaTutka();

    const qMobo = HT.cleanComponentQuery('Asus TUF GAMING B850-PLUS WIFI, ATX-emolevy', 'mobo');
    assert.strictEqual(qMobo, 'Asus TUF GAMING B850-PLUS WIFI');

    const qCpu = HT.cleanComponentQuery('AMD Ryzen 7 9800X3D, AM5, 4.7 GHz, 8-Core, WOF', 'cpu');
    assert.strictEqual(qCpu, 'AMD Ryzen 7 9800X3D');
});

test('bundle: detectAndExtractBundleData correctly deconstructs Jimm\'s hardware bundle', () => {
    const { exports: HT } = loadHintaTutka();

    const mockBundleHtml = `
        <div class="product-header">
            <h1>Asus TUF GAMING B850-PLUS WIFI + 9800X3D + 32GB DDR5 6000MHz -tuotepaketti</h1>
        </div>
        <div class="product-description">
            <p>Tuotteiden normaalihinta erikseen ostettuna 1188,80€</p>
            <h3>Tuotepaketti sisältää:</h3>
            <ul>
                <li><a href="/fi/Product/Show/208583/tuf-gaming-b850-plus-wifi/asus-tuf-gaming-b850-plus-wifi-atx-emolevy">Asus TUF GAMING B850-PLUS WIFI, ATX-emolevy</a></li>
                <li><a href="/fi/Product/Show/207359/100-100001084wof/amd-ryzen-7-9800x3d-am5-4-7-ghz-8-core-wof">AMD Ryzen 7 9800X3D, AM5, 4.7 GHz, 8-Core, WOF</a></li>
                <li><a href="/fi/Product/Show/218428/pvv532g600c36k/patriot-32gb-2-x-16gb-viper-venom-ddr5-6000mhz-cl36-1-35v-musta">Patriot 32GB (2 x 16GB) Viper VENOM, DDR5 6000MHz, CL36, 1.35V, musta</a></li>
            </ul>
        </div>
    `;

    const mockInfo = {
        name: 'Asus TUF GAMING B850-PLUS WIFI + 9800X3D + 32GB DDR5 6000MHz -tuotepaketti',
        currentPrice: 1139.00
    };

    const bundleData = HT.detectAndExtractBundleData(mockInfo, null, 1139.00, mockBundleHtml);
    assert.ok(bundleData, 'Bundle data should be detected');
    assert.strictEqual(bundleData.isBundle, true);
    assert.strictEqual(bundleData.officialStandaloneTotal, 1188.80);
    assert.strictEqual(bundleData.components.length, 3);
    assert.strictEqual(bundleData.components[0].roleKey, 'mobo');
    assert.strictEqual(bundleData.components[1].roleKey, 'cpu');
    assert.strictEqual(bundleData.components[2].roleKey, 'ram');
});

test('bundle: detectAndExtractBundleData correctly deconstructs Prebuilt PC specifications', () => {
    const { exports: HT } = loadHintaTutka();

    const mockPCHtml = `
        <h1>Jimm's GtG Owl 5090, pelitietokone</h1>
        <div class="product-description">
            <p>
                Prosessori: AMD Ryzen 9 9950X3D2, 4,3 / 5,6 GHz<br>
                Emolevy: ASUS TUF GAMING X870E-PLUS WIFI7<br>
                Näytönohjain: ASUS NVIDIA GeForce RTX 5090 TUF GAMING, 32 GB GDDR7<br>
                Keskusmuisti: 64 GB (2 x 32 GB) DDR5 5600 MHz<br>
                Massamuisti: 4 TB M.2 PCIe 4.0 NVMe SSD<br>
                Prosessorijäähdytys: Noctua NL-LC1-42, 420 mm AIO-nestejäähdytys<br>
                Kotelo: Antec X Noctua FLUX PRO Noctua Edition<br>
                Virtalähde: 1200 W 80+ Gold, PCIe 5.0 Ready<br>
                Käyttöjärjestelmä: Windows 11 Home
            </p>
        </div>
    `;

    const mockInfo = {
        name: "Jimm's GtG Owl 5090, pelitietokone",
        currentPrice: 10499.00
    };

    const pcData = HT.detectAndExtractBundleData(mockInfo, null, 10499.00, mockPCHtml);
    assert.ok(pcData, 'PC build should be detected');
    assert.strictEqual(pcData.isPcBuild, true);
    assert.strictEqual(pcData.components.length, 9);
    assert.strictEqual(pcData.components[0].roleKey, 'cpu');
    assert.strictEqual(pcData.components[1].roleKey, 'mobo');
    assert.strictEqual(pcData.components[2].roleKey, 'gpu');
    assert.strictEqual(pcData.components[3].roleKey, 'ram');
    assert.strictEqual(pcData.components[4].roleKey, 'storage');
});

test('bundle: evaluatePriceVerdict calculates bundle savings vs standalone parts sum', () => {
    const { exports: HT } = loadHintaTutka();

    const productInfo = {
        name: 'Asus TUF GAMING B850-PLUS WIFI + 9800X3D + 32GB DDR5 6000MHz -tuotepaketti',
        currentPrice: 1139.00,
        bundleData: {
            isBundle: true,
            isPcBuild: false,
            officialStandaloneTotal: 1188.80,
            components: [
                { roleKey: 'mobo', name: 'Asus TUF GAMING B850-PLUS WIFI' },
                { roleKey: 'cpu', name: 'AMD Ryzen 7 9800X3D' },
                { roleKey: 'ram', name: 'Patriot 32GB DDR5' }
            ]
        }
    };

    const verdict = HT.evaluatePriceVerdict(1139.00, null, 'fi', false, productInfo);
    assert.strictEqual(verdict.isBundleVerdict, true);
    assert.ok(verdict.diffEur < -49.0, `Expected savings ~ -49.80, got ${verdict.diffEur}`);
    assert.ok(verdict.theme.label.includes('TUOTEPAKETIN SÄÄSTÖ'), `Label must state savings, got ${verdict.theme.label}`);
});

test('bundle: evaluatePriceVerdict prefers market DIY total over single store price when DIY is cheaper', () => {
    const { exports: HT } = loadHintaTutka();

    const productInfo = {
        name: 'Asus TUF GAMING B850-PLUS WIFI + 9800X3D + 32GB DDR5 6000MHz -tuotepaketti',
        currentPrice: 1139.00,
        bundleData: {
            isBundle: true,
            isPcBuild: false,
            officialStandaloneTotal: 1188.80,
            marketDiyTotal: 1116.80, // Gigantti (148.90) + Multitronic (438.90) + Jimm's (529.00)
            components: [
                { roleKey: 'mobo', name: 'Asus TUF GAMING B850-PLUS WIFI', marketLowest: 148.90, cheapestStore: 'Gigantti', storePrice: 179.90 },
                { roleKey: 'cpu', name: 'AMD Ryzen 7 9800X3D', marketLowest: 438.90, cheapestStore: 'Multitronic', storePrice: 479.90 },
                { roleKey: 'ram', name: 'Patriot 32GB DDR5', marketLowest: 529.00, cheapestStore: "Jimm's", storePrice: 529.00 }
            ]
        }
    };

    const verdict = HT.evaluatePriceVerdict(1139.00, null, 'fi', false, productInfo);
    assert.strictEqual(verdict.isBundleVerdict, true);
    assert.strictEqual(verdict.isMarketDiy, true);
    assert.ok(verdict.diffEur > 20.0, `Expected DIY to be cheaper by ~22.20 €, got diffEur ${verdict.diffEur}`);
    assert.ok(verdict.theme.label.includes('ERIKSEEN HALVEMPI KILPAILIJOILTA'), `Verdict must state competitors cheaper: ${verdict.theme.label}`);
});

test('bundle: buildBundleBreakdownHtml renders 3-way financial comparison and competitor store tags', () => {
    const { exports: HT } = loadHintaTutka();

    const bundleData = {
        isBundle: true,
        isPcBuild: false,
        officialStandaloneTotal: 1188.80,
        marketDiyTotal: 1116.80,
        components: [
            {
                roleIcon: '🔲',
                roleLabel: 'Emolevy',
                name: 'Asus TUF GAMING B850-PLUS WIFI',
                cleanQuery: 'Asus TUF GAMING B850-PLUS WIFI',
                marketLowest: 148.90,
                cheapestStore: 'Gigantti',
                storePrice: 179.90,
                hintaUrl: 'https://hinta.fi/5077013/asus-tuf-gaming-b850-plus-wifi',
                url: 'https://www.jimms.fi/fi/Product/Show/208583'
            },
            {
                roleIcon: '⚡',
                roleLabel: 'Prosessori',
                name: 'AMD Ryzen 7 9800X3D',
                cleanQuery: 'AMD Ryzen 7 9800X3D',
                marketLowest: 438.90,
                cheapestStore: 'Multitronic',
                storePrice: 479.90,
                hintaUrl: 'https://hinta.fi/5047701/amd-ryzen-7-9800x3d',
                url: 'https://www.jimms.fi/fi/Product/Show/207359'
            }
        ]
    };

    const productInfo = {
        name: 'Asus TUF GAMING B850-PLUS WIFI + 9800X3D -tuotepaketti',
        currentPrice: 1139.00
    };

    const html = HT.buildBundleBreakdownHtml(bundleData, productInfo, {}, 'fi');
    assert.ok(html.includes('Halvin DIY (Hinta.fi)'), 'Must include Market DIY header');
    assert.ok(html.includes('Gigantti'), 'Must include cheapest competitor store Gigantti');
    assert.ok(html.includes('Multitronic'), 'Must include cheapest competitor store Multitronic');
    assert.ok(html.includes('148,90'), 'Must include Gigantti price');
    assert.ok(html.includes('438,90'), 'Must include Multitronic price');
});

test('bundle: spec compatibility hard conflict prevents false single-motherboard match on multi-part bundle', () => {
    const { exports: HT } = loadHintaTutka();

    const bundleTitle = 'Asus TUF GAMING B850-PLUS WIFI + 9800X3D + 32GB DDR5 6000MHz -tuotepaketti';
    const singleMoboCandidate = 'Asus TUF GAMING B850-PLUS WIFI';

    const compat = HT.evaluateSpecCompatibility(bundleTitle, singleMoboCandidate);
    assert.strictEqual(compat.hasHardConflict, true, 'Bundle vs standalone single component must trigger hard conflict');

    const score = HT.scoreSearchCandidate({ name: singleMoboCandidate, price: 148.90 }, bundleTitle, 1139.00);
    assert.ok(score < 0, `Bundle vs single part score must be heavily penalized, got ${score}`);
});

test('bundle: tab labels are compact to avoid horizontal overflow on 4-tab bundle view', () => {
    const { exports: HT } = loadHintaTutka();

    assert.strictEqual(HT.I18N.fi.tabHistory, 'Historia', 'Finnish tab label must be compact "Historia"');
    assert.strictEqual(HT.I18N.en.tabHistory, 'History', 'English tab label must be compact "History"');
    assert.ok(HT.I18N.fi.tabHistory.length <= 8, 'Tab label length must be <= 8 chars to fit 4-tab grid');
});

test('bundle: component price history charts render SVG plots, ATL stats and competitor tags', () => {
    const { exports: HT } = loadHintaTutka();

    const mockMoboHistory = {
        points: [
            { dateStr: '01/25', fullTitle: 'Tammikuu 2025', price: 279.90, rawLabel: '2025-01-01' },
            { dateStr: '11/26', fullTitle: 'Marraskuu 2026', price: 148.90, rawLabel: '2026-11-15' }
        ],
        atl: { price: 148.90, bestStore: 'Gigantti', dateStr: '11/2026' },
        minPrice: 148.90,
        maxPrice: 279.90
    };

    const chartHtml = HT.buildDualChartSectionHtml(
        mockMoboHistory,
        null,
        179.90,
        148.90,
        { color: '#34d399' },
        'fi',
        'new',
        'comp-0'
    );

    assert.ok(chartHtml.includes('id="ufhpc-chart-box-comp-0"'), 'Chart box must contain unique component prefix');
    assert.ok(chartHtml.includes('id="ufhpc-chart-svg-comp-0"'), 'SVG must have unique component prefix');
    assert.ok(chartHtml.includes('148,90'), 'Chart header must display latest price');
    assert.ok(chartHtml.includes('Gigantti'), 'ATL label must display cheapest store');
    assert.ok(chartHtml.includes('<polyline'), 'Must render SVG polyline for price curve');
    assert.ok(chartHtml.includes('<circle'), 'Must render ATL indicator circle');
});

test('bundle: RAM component matching scores correct kit over overpriced/mismatched listing', () => {
    const { exports: HT } = loadHintaTutka();

    const ramComponent = {
        name: 'Patriot 32GB (2 x 16GB) Viper VENOM, DDR5 6000MHz, CL36, 1.35V, musta',
        roleKey: 'ram',
        storePrice: 529.00,
        partNumber: 'PVVR532G600C36K'
    };

    // Query cleaning must preserve CL36
    const cleanQuery = HT.cleanComponentQuery(ramComponent.name, ramComponent.roleKey);
    assert.ok(cleanQuery.includes('CL36'), `RAM query must keep CAS latency CL36, got "${cleanQuery}"`);
    assert.ok(cleanQuery.includes('Viper VENOM'), `RAM query must contain Viper VENOM, got "${cleanQuery}"`);

    // Candidate 1: Genuine matching RAM kit (559.00 €)
    const cand1 = {
        name: 'Patriot Memory Viper Venom PVVR532G600C36K 32 GB, 2 x 16 GB, DDR5, ECC, 6000 MHz',
        lowestPrice: 559.00,
        price: 559.00
    };

    // Candidate 2: Overpriced variant from Proshop (651.52 €)
    const cand2 = {
        name: 'Patriot Memory Viper Venom RGB VV532G60C36AK 32 GB, 2 x 16 GB, DDR5, 6000 MHz',
        lowestPrice: 651.52,
        price: 651.52
    };

    const score1 = HT.scoreSearchCandidate(cand1, ramComponent.name, ramComponent.storePrice);
    const score2 = HT.scoreSearchCandidate(cand2, ramComponent.name, ramComponent.storePrice);

    assert.ok(score1 > score2, `Correct candidate (score: ${score1}) must outscore inflated candidate (score: ${score2})`);
    assert.ok(score1 > 100, `Score for matching candidate must be high (>100), got ${score1}`);
});

test('bundle: cleanComponentQuery extracts concise queries for all prebuilt PC components', () => {
    const { exports: HT } = loadHintaTutka();

    const psu = HT.cleanComponentQuery('1200 W 80+ Gold, PCIe 5.0 Ready', 'psu');
    assert.strictEqual(psu, '1200W 80+Gold');

    const storage = HT.cleanComponentQuery('4 TB M.2 PCIe 4.0 NVMe SSD', 'storage');
    assert.strictEqual(storage, '4TB M.2 NVMe SSD');

    const cooler = HT.cleanComponentQuery('Noctua NL-LC1-42, 420 mm AIO-nestejäähdytys', 'cooler');
    assert.strictEqual(cooler, 'Noctua NL-LC1-42');

    const pcCase = HT.cleanComponentQuery('Antec X Noctua FLUX PRO Noctua Edition', 'case');
    assert.strictEqual(pcCase, 'Antec FLUX PRO');

    const ram = HT.cleanComponentQuery('64 GB (2 x 32 GB) DDR5 5600 MHz', 'ram');
    assert.strictEqual(ram, '64GB DDR5 5600 MHz');

    const gpu = HT.cleanComponentQuery('ASUS NVIDIA GeForce RTX 5090 TUF GAMING, 32 GB GDDR7', 'gpu');
    assert.strictEqual(gpu, 'ASUS NVIDIA GeForce RTX 5090 TUF GAMING');
});

test('bundle: generic component specs match branded hardware without false hard conflicts', () => {
    const { exports: HT } = loadHintaTutka();

    const genericStorage = '4 TB M.2 PCIe 4.0 NVMe SSD';
    const brandedSsd = 'Samsung 990 PRO 4 TB M.2 NVMe SSD';
    const compatStorage = HT.evaluateSpecCompatibility(genericStorage, brandedSsd);
    assert.strictEqual(compatStorage.hasHardConflict, false, 'Generic 4TB SSD must match branded Samsung 990 PRO 4TB');

    const genericPsu = '1200 W 80+ Gold, PCIe 5.0 Ready';
    const brandedPsu = 'ASUS TUF GAMING 1200W Gold';
    const compatPsu = HT.evaluateSpecCompatibility(genericPsu, brandedPsu);
    assert.strictEqual(compatPsu.hasHardConflict, false, 'Generic 1200W PSU must match ASUS TUF 1200W Gold');

    // Confirm branded precision guards remain strict
    const iphoneGuard = HT.evaluateSpecCompatibility('Apple iPhone 18', 'Apple iPhone 18 Pro');
    assert.strictEqual(iphoneGuard.hasHardConflict, true, 'iPhone 18 vs Pro must remain a hard conflict');
});

test('bundle: PSU wattage and 80+ efficiency ratings score high for prebuilt PC PSU component', () => {
    const { exports: HT } = loadHintaTutka();

    const targetPsu = '1200 W 80+ Gold, PCIe 5.0 Ready';
    const candPsu = {
        name: 'ASUS TUF GAMING 1200W Gold',
        lowestPrice: 172.67,
        price: 172.67
    };

    const cleanQ = HT.cleanComponentQuery(targetPsu, 'psu');
    assert.strictEqual(cleanQ, '1200W 80+Gold');

    const score1 = HT.scoreSearchCandidate(candPsu, targetPsu, null);
    const score2 = HT.scoreSearchCandidate(candPsu, cleanQ, null);
    const maxScore = Math.max(score1, score2);

    assert.ok(maxScore >= 25, `PSU candidate score must be >= 25, got maxScore: ${maxScore} (score1: ${score1}, score2: ${score2})`);

    const compat = HT.evaluateSpecCompatibility(targetPsu, candPsu.name);
    assert.strictEqual(compat.hasHardConflict, false, 'PSU must not trigger hard conflict');
});

test('bundle: HTML entities are decoded in Strategy 2 specs', () => {
    const { exports: HT } = loadHintaTutka();

    const mockHtml = `
        <h1>Jimm's GtG Owl 5090, pelitietokone</h1>
        <div class="product-description">
            <p>
                J&auml;&auml;hdytys: Noctua NL-LC1-42, 420 mm AIO-nestej&auml;&auml;hdytys<br>
                Virtal&auml;hde: 1200 W 80+ Gold, PCIe 5.0 Ready<br>
                K&auml;ytt&ouml;j&auml;rjestelm&auml;: Windows 11 Home
            </p>
        </div>
    `;

    const info = { name: "Jimm's GtG Owl 5090, pelitietokone", currentPrice: 10499 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 10499, mockHtml);

    assert.ok(bundleData, 'Bundle data must be parsed');
    const cooler = bundleData.components.find(c => c.roleKey === 'cooler');
    assert.ok(cooler, 'Cooler component must be present');
    assert.strictEqual(cooler.name, 'Noctua NL-LC1-42, 420 mm AIO-nestejäähdytys');
    assert.strictEqual(cooler.cleanQuery, 'Noctua NL-LC1-42');

    const psu = bundleData.components.find(c => c.roleKey === 'psu');
    assert.ok(psu, 'PSU component must be present');
    assert.strictEqual(psu.name, '1200 W 80+ Gold, PCIe 5.0 Ready');
    assert.strictEqual(psu.cleanQuery, '1200W 80+Gold');
});
