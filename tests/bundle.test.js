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
    assert.strictEqual(psu, '1200W 80+ Gold');

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
    assert.strictEqual(cleanQ, '1200W 80+ Gold');

    const score1 = HT.scoreSearchCandidate(candPsu, targetPsu, null);
    const score2 = HT.scoreSearchCandidate(candPsu, cleanQ, null);
    const maxScore = Math.max(score1, score2);

    assert.ok(maxScore >= 25, `PSU candidate score must be >= 25, got maxScore: ${maxScore} (score1: ${score1}, score2: ${score2})`);

    const compat = HT.evaluateSpecCompatibility(targetPsu, candPsu.name);
    assert.strictEqual(compat.hasHardConflict, false, 'PSU must not trigger hard conflict');

    const mismatchCompat = HT.evaluateSpecCompatibility(targetPsu, 'Corsair RM750e 750W 80+ Gold');
    assert.strictEqual(mismatchCompat.hasHardConflict, true, '750W PSU must trigger hard conflict against 1200W spec');
});

test('bundle: generic SSD storage specs match branded drives without overlap penalty', () => {
    const { exports: HT } = loadHintaTutka();

    const targetSsd = '4 TB M.2 PCIe 4.0 NVMe SSD';
    const candSsd = {
        name: 'Crucial P310 4000 GB',
        lowestPrice: 460.9,
        price: 460.9
    };

    const cleanQ = HT.cleanComponentQuery(targetSsd, 'storage');
    assert.strictEqual(cleanQ, '4TB M.2 NVMe SSD');

    const score1 = HT.scoreSearchCandidate(candSsd, targetSsd, null);
    const score2 = HT.scoreSearchCandidate(candSsd, cleanQ, null);
    const maxScore = Math.max(score1, score2);

    assert.ok(maxScore >= 40, `Generic SSD candidate score must be >= 40, got maxScore: ${maxScore} (score1: ${score1}, score2: ${score2})`);

    const compat = HT.evaluateSpecCompatibility(targetSsd, candSsd.name);
    assert.strictEqual(compat.hasHardConflict, false, 'Matching 4TB SSD must not trigger hard conflict');

    const mismatchCompat = HT.evaluateSpecCompatibility(targetSsd, 'Crucial P310 2000 GB');
    assert.strictEqual(mismatchCompat.hasHardConflict, true, '2TB SSD must trigger hard conflict against 4TB target');
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
    assert.strictEqual(psu.cleanQuery, '1200W 80+ Gold');
});

test('bundle: Verkkokauppa.com Blackstorm PC components extracted from bullet list with Finnish units', () => {
    const { exports: HT } = loadHintaTutka();

    const mockHtml = `
        <h1>Blackstorm Gaming 4070 Ti Super pelitietokone</h1>
        <div class="product-description">
            <ul>
                <li>Prosessori: AMD Ryzen 7 7800X3D, 4.2 / 5.0 GHz</li>
                <li>Emolevy: ASUS TUF GAMING B650-PLUS WIFI</li>
                <li>Näytönohjain: ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16 Gt</li>
                <li>Keskusmuisti: Kingston FURY Beast DDR5 6000 MHz CL36 32 Gt (2 x 16 Gt)</li>
                <li>Massamuisti: Kingston KC3000 2 Tt M.2 PCIe 4.0 NVMe SSD</li>
                <li>Prosessorijäähdytys: DeepCool LS720 SE -nestejäähdytys</li>
                <li>Kotelo: Lian Li LANCOOL 216</li>
                <li>Virtalähde: Corsair RM850x (2021) 850 W</li>
            </ul>
        </div>
    `;

    const info = { name: 'Blackstorm Gaming 4070 Ti Super pelitietokone', currentPrice: 2499.00 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 2499.00, mockHtml);

    assert.ok(bundleData, 'PC build must be detected on Verkkokauppa');
    assert.strictEqual(bundleData.isPcBuild, true);
    assert.strictEqual(bundleData.components.length, 8);

    const cpu = bundleData.components.find(c => c.roleKey === 'cpu');
    assert.strictEqual(cpu.cleanQuery, 'AMD Ryzen 7 7800X3D');

    const mobo = bundleData.components.find(c => c.roleKey === 'mobo');
    assert.strictEqual(mobo.cleanQuery, 'ASUS TUF GAMING B650-PLUS WIFI');

    const gpu = bundleData.components.find(c => c.roleKey === 'gpu');
    assert.strictEqual(gpu.cleanQuery, 'ASUS TUF Gaming GeForce RTX 4070 Ti SUPER');

    const ram = bundleData.components.find(c => c.roleKey === 'ram');
    assert.ok(ram.cleanQuery.includes('Kingston') && ram.cleanQuery.includes('32GB'));

    const ssd = bundleData.components.find(c => c.roleKey === 'storage');
    assert.ok(ssd.cleanQuery.includes('2TB') && ssd.cleanQuery.includes('SSD'));

    const psu = bundleData.components.find(c => c.roleKey === 'psu');
    assert.strictEqual(psu.cleanQuery, 'Corsair 850W');
});

test('bundle: Gigantti definition list (dl/dt/dd) PC specifications extracted with inflected keys', () => {
    const { exports: HT } = loadHintaTutka();

    const mockHtml = `
        <h1>Acer Predator Orion 3000 pelipöytäkone (i7/32/1TB/4070S)</h1>
        <dl class="specification-list">
            <dt class="specification-list__label">Prosessorin malli</dt>
            <dd class="specification-list__value">Intel Core i7-14700F</dd>
            <dt class="specification-list__label">Näytönohjaimen malli</dt>
            <dd class="specification-list__value">NVIDIA GeForce RTX 4070 Super</dd>
            <dt class="specification-list__label">Keskusmuisti (RAM)</dt>
            <dd class="specification-list__value">32 GB DDR5</dd>
            <dt class="specification-list__label">Tallennustilan koko</dt>
            <dd class="specification-list__value">1000 GB SSD</dd>
            <dt class="specification-list__label">Virtalähde (watt)</dt>
            <dd class="specification-list__value">750 W</dd>
        </dl>
    `;

    const info = { name: 'Acer Predator Orion 3000 pelipöytäkone (i7/32/1TB/4070S)', currentPrice: 1799.00 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 1799.00, mockHtml);

    assert.ok(bundleData, 'Prebuilt PC specifications must be detected from Gigantti dl/dt/dd');
    assert.strictEqual(bundleData.isPcBuild, true);
    assert.strictEqual(bundleData.components.length, 5);

    const cpu = bundleData.components.find(c => c.roleKey === 'cpu');
    assert.strictEqual(cpu.cleanQuery, 'Intel Core i7-14700F');

    const gpu = bundleData.components.find(c => c.roleKey === 'gpu');
    assert.strictEqual(gpu.cleanQuery, 'NVIDIA GeForce RTX 4070 Super');

    const ram = bundleData.components.find(c => c.roleKey === 'ram');
    assert.strictEqual(ram.cleanQuery, '32GB DDR5 RAM');

    const ssd = bundleData.components.find(c => c.roleKey === 'storage');
    assert.strictEqual(ssd.cleanQuery, '1TB SSD');

    const psu = bundleData.components.find(c => c.roleKey === 'psu');
    assert.strictEqual(psu.cleanQuery, '750W');
});

test('bundle: Power.fi table rows (tr/th/td) PC specifications extracted without colons', () => {
    const { exports: HT } = loadHintaTutka();

    const mockHtml = `
        <h1>CEPTER ALPHA GAMING DESKTOP</h1>
        <table>
            <tbody>
                <tr><th>Prosessori</th><td>Intel® Core™ i5-14400F</td></tr>
                <tr><th>Näytönohjain</th><td>NVIDIA® GeForce RTX™ 4060 Ti 8 Gt</td></tr>
                <tr><th>Keskusmuisti</th><td>16 Gt DDR5</td></tr>
                <tr><th>Tallennustila</th><td>1 Tt M.2 NVMe SSD</td></tr>
                <tr><th>Virtalähde</th><td>650 W</td></tr>
            </tbody>
        </table>
    `;

    const info = { name: 'CEPTER ALPHA GAMING DESKTOP', currentPrice: 1299.00 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 1299.00, mockHtml);

    assert.ok(bundleData, 'Prebuilt PC specifications must be detected from Power.fi table');
    assert.strictEqual(bundleData.isPcBuild, true);
    assert.strictEqual(bundleData.components.length, 5);

    const cpu = bundleData.components.find(c => c.roleKey === 'cpu');
    assert.strictEqual(cpu.cleanQuery, 'Intel Core i5-14400F');

    const gpu = bundleData.components.find(c => c.roleKey === 'gpu');
    assert.ok(gpu.cleanQuery.includes('RTX 4060 Ti'));

    const ram = bundleData.components.find(c => c.roleKey === 'ram');
    assert.strictEqual(ram.cleanQuery, '16GB DDR5 RAM');

    const ssd = bundleData.components.find(c => c.roleKey === 'storage');
    assert.strictEqual(ssd.cleanQuery, '1TB M.2 NVMe SSD');

    const psu = bundleData.components.find(c => c.roleKey === 'psu');
    assert.strictEqual(psu.cleanQuery, '650W');
});

test('bundle: cleanComponentQuery and classifyComponentRole handle Finnish units (Gt, Tt) and clean trademark symbols', () => {
    const { exports: HT } = loadHintaTutka();

    // Trademark symbol stripping
    const cleanCpu = HT.cleanComponentQuery('Intel® Core™ i7-14700F -prosessori', 'cpu');
    assert.strictEqual(cleanCpu, 'Intel Core i7-14700F');

    // Finnish RAM unit (Gt)
    const cleanRam = HT.cleanComponentQuery('32 Gt DDR5', 'ram');
    assert.strictEqual(cleanRam, '32GB DDR5 RAM');

    // Finnish Storage unit (1 Tt -> 1TB, 1000 Gt -> 1TB)
    const cleanSsd1 = HT.cleanComponentQuery('1 Tt M.2 NVMe SSD', 'storage');
    assert.strictEqual(cleanSsd1, '1TB M.2 NVMe SSD');

    const cleanSsd2 = HT.cleanComponentQuery('1000 GB SSD', 'storage');
    assert.strictEqual(cleanSsd2, '1TB SSD');

    // Inflected Finnish keys in classifyComponentRole
    const rCpu = HT.classifyComponentRole('Intel Core i7 14700F', 'Prosessorin malli');
    assert.strictEqual(rCpu.roleKey, 'cpu');

    const rGpu = HT.classifyComponentRole('RTX 4070 Super', 'Näytönohjaimen malli');
    assert.strictEqual(rGpu.roleKey, 'gpu');

    const rRam = HT.classifyComponentRole('32 GB', 'Keskusmuisti (RAM)');
    assert.strictEqual(rRam.roleKey, 'ram');

    const rStorage = HT.classifyComponentRole('1000 GB', 'Tallennustilan koko');
    assert.strictEqual(rStorage.roleKey, 'storage');

    const rPsu = HT.classifyComponentRole('750 W', 'Virtalähde (watt)');
    assert.strictEqual(rPsu.roleKey, 'psu');
});

test('bundle: cleanComponentQuery cleans motherboard chipset fluff (-piirisarjaan pohjautuva)', () => {
    const { exports: HT } = loadHintaTutka();

    // ASUS AMD B650
    const qAsusB650 = HT.cleanComponentQuery('ASUS, AMD B650 -piirisarjaan pohjautuva', 'mobo');
    assert.strictEqual(qAsusB650, 'ASUS AMD B650');

    // GIGABYTE AMD X870
    const qGbX870 = HT.cleanComponentQuery('GIGABYTE, AMD X870 -piirisarjaan pohjautuva', 'mobo');
    assert.strictEqual(qGbX870, 'GIGABYTE AMD X870');

    // MSI Intel B760
    const qMsiB760 = HT.cleanComponentQuery('MSI, Intel B760 -piirisarjaan pohjautuva', 'mobo');
    assert.strictEqual(qMsiB760, 'MSI Intel B760');

    // Full model preservation
    const qFull = HT.cleanComponentQuery('ASUS TUF GAMING X870E-PLUS WIFI7', 'mobo');
    assert.strictEqual(qFull, 'ASUS TUF GAMING X870E-PLUS WIFI7');
});

test('bundle: cleanComponentQuery cleans cooler model and strips Finnish AIO suffixes', () => {
    const { exports: HT } = loadHintaTutka();

    // Phanteks Glacier One
    const qPhanteks = HT.cleanComponentQuery('Phanteks Glacier One 360S25-SE, 360 mm AIO-nestejäähdytys', 'cooler');
    assert.strictEqual(qPhanteks, 'Phanteks Glacier One 360S25-SE');

    // Thermalright Peerless Assassin
    const qThermalright = HT.cleanComponentQuery('Thermalright Peerless Assassin 120 SE', 'cooler');
    assert.strictEqual(qThermalright, 'Thermalright Peerless Assassin 120 SE');

    // Noctua AIO
    const qNoctua = HT.cleanComponentQuery('Noctua NL-LC1-42, 420 mm AIO-nestejäähdytys', 'cooler');
    assert.strictEqual(qNoctua, 'Noctua NL-LC1-42');

    // DeepCool
    const qDeepCool = HT.cleanComponentQuery('DeepCool LS720 SE -nestejäähdytys', 'cooler');
    assert.strictEqual(qDeepCool, 'DeepCool LS720 SE');
});

test('bundle: Nexus 5070 and Voidwalker 5070 Ti prebuilts extract all components cleanly', () => {
    const { exports: HT } = loadHintaTutka();

    const mockNexusHtml = `
        <h1>Jimm's GtG Nexus 5070, pelitietokone</h1>
        <div class="product-description">
            <p>
                Prosessori: AMD Ryzen 5 9600X, 3,9 / 5,4 GHz<br>
                Emolevy: ASUS, AMD B650 -piirisarjaan pohjautuva<br>
                Näytönohjain: ASUS NVIDIA GeForce RTX 5070, 12 GB GDDR7<br>
                Keskusmuisti: 32 GB (2 x 16 GB) DDR5 4800 MHz<br>
                Massamuisti: 1 TB M.2 PCIe 4.0 NVMe SSD<br>
                Prosessorijäähdytys: Thermalright Peerless Assassin 120 SE<br>
                Kotelo: APNX C1-R, musta<br>
                Virtalähde: 750 W 80+ Gold, PCIe 5.0 Ready<br>
                Käyttöjärjestelmä: Windows 11 Home
            </p>
        </div>
    `;

    const nexusInfo = { name: "Jimm's GtG Nexus 5070, pelitietokone", currentPrice: 2299.00 };
    const nexusData = HT.detectAndExtractBundleData(nexusInfo, null, 2299.00, mockNexusHtml);

    assert.ok(nexusData, 'Nexus 5070 PC build must be detected');
    assert.strictEqual(nexusData.components.length, 9);

    const mobo = nexusData.components.find(c => c.roleKey === 'mobo');
    assert.strictEqual(mobo.cleanQuery, 'ASUS AMD B650');

    const cooler = nexusData.components.find(c => c.roleKey === 'cooler');
    assert.strictEqual(cooler.cleanQuery, 'Thermalright Peerless Assassin 120 SE');

    const mockVoidwalkerHtml = `
        <h1>Jimm's GtG Voidwalker 5070 Ti, pelitietokone</h1>
        <div class="product-description">
            <p>
                Prosessori: AMD Ryzen 7 9800X3D<br>
                Emolevy: GIGABYTE, AMD X870 -piirisarjaan pohjautuva<br>
                Näytönohjain: GIGABYTE NVIDIA GeForce RTX 5070 Ti<br>
                Prosessorijäähdytys: Phanteks Glacier One 360S25-SE, 360 mm AIO-nestejäähdytys<br>
                Massamuisti: 2 TB M.2 PCIe 4.0 NVMe SSD
            </p>
        </div>
    `;

    const voidInfo = { name: "Jimm's GtG Voidwalker 5070 Ti, pelitietokone", currentPrice: 3199.00 };
    const voidData = HT.detectAndExtractBundleData(voidInfo, null, 3199.00, mockVoidwalkerHtml);

    assert.ok(voidData, 'Voidwalker PC build must be detected');
    assert.strictEqual(voidData.components.length, 5);

    const voidMobo = voidData.components.find(c => c.roleKey === 'mobo');
    assert.strictEqual(voidMobo.cleanQuery, 'GIGABYTE AMD X870');

    const voidCooler = voidData.components.find(c => c.roleKey === 'cooler');
    assert.strictEqual(voidCooler.cleanQuery, 'Phanteks Glacier One 360S25-SE');
});

test('bundle: Jimm\'s GtG PCs with single <p> containing <br> and nav menu items do not squash components or false match \'Osa 6\'', () => {
    const { exports: HT } = loadHintaTutka();

    const mockHtml = `
        <header>
            <nav>
                <ul>
                    <li><a href="/fi/Pages/Oppaat/abc-6">Osa 6: Pelitietokone vai perustietokone?</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <h1>Jimm's GtG Voidwalker 5070 Ti, pelitietokone</h1>
            <h2>Pelitietokoneen tekniset tiedot</h2>
            <p><strong>Prosessori</strong>: AMD Ryzen 7 9850X3D, 4,7 / 5,6 GHz<br><strong>Emolevy</strong>: GIGABYTE, AMD X870 -piirisarjaan pohjautuva<br><strong>N&auml;yt&ouml;nohjain</strong>: PNY NVIDIA GeForce RTX 5070 Ti, 16 GB GDDR7<br><strong>Keskusmuisti</strong>: 32 GB (2 x 16 GB) DDR5 5600 MHz<br><strong>Massamuisti</strong>: 2 TB M.2 PCIe 4.0 NVMe SSD<br><strong>Prosessorij&auml;&auml;hdytys</strong>: Phanteks Glacier One 360S25-SE, 360 mm AIO-nestej&auml;&auml;hdytys<br><strong>Kotelo</strong>: Phanteks EX5 Plus<br><strong>Virtal&auml;hde</strong>: 850 W 80+ Gold, PCIe 5.0 Ready<br><strong>K&auml;ytt&ouml;j&auml;rjestelm&auml;</strong>: Windows 11 Home<br><strong>Muuta</strong>: Wi-Fi &amp; Bluetooth<br><strong>Kokoonpanotakuu</strong>: 3 vuotta<br><strong>Tuotekoodi</strong>: JIMMS-A-N-GTG-OBF-57T3</p>
        </main>
    `;

    const mockDoc = {
        title: "Jimm's GtG Voidwalker 5070 Ti, pelitietokone",
        body: { innerHTML: mockHtml, textContent: mockHtml.replace(/<[^>]+>/g, ' ') },
        querySelector: (sel) => {
            if (sel === 'main' || sel === 'body') return { innerHTML: mockHtml, innerText: mockHtml.replace(/<[^>]+>/g, ' ') };
            return null;
        },
        querySelectorAll: (sel) => {
            if (sel === 'tr' || sel === 'dt') return [];
            return [];
        }
    };

    const info = { name: "Jimm's GtG Voidwalker 5070 Ti, pelitietokone", currentPrice: 3199.00 };
    const bundleData = HT.detectAndExtractBundleData(info, mockDoc, 3199.00, mockHtml);

    assert.ok(bundleData, 'PC build must be detected');
    assert.strictEqual(bundleData.isPcBuild, true);
    assert.strictEqual(bundleData.components.length, 9, 'Must extract exactly 9 hardware components');

    // Ensure 'Osa 6' did NOT match as OS
    const os = bundleData.components.find(c => c.roleKey === 'os');
    assert.ok(os, 'OS component must be present');
    assert.strictEqual(os.name, 'Windows 11 Home', 'OS must be Windows 11 Home, not guide link');

    // Ensure CPU is NOT squashed with the rest of the components
    const cpu = bundleData.components.find(c => c.roleKey === 'cpu');
    assert.strictEqual(cpu.name, 'AMD Ryzen 7 9850X3D, 4,7 / 5,6 GHz');
    assert.strictEqual(cpu.cleanQuery, 'AMD Ryzen 7 9850X3D');

    // Ensure Mobo is cleaned of chipset fluff
    const mobo = bundleData.components.find(c => c.roleKey === 'mobo');
    assert.strictEqual(mobo.name, 'GIGABYTE, AMD X870 -piirisarjaan pohjautuva');
    assert.strictEqual(mobo.cleanQuery, 'GIGABYTE AMD X870');

    // Ensure Cooler is cleaned of AIO fluff
    const cooler = bundleData.components.find(c => c.roleKey === 'cooler');
    assert.strictEqual(cooler.name, 'Phanteks Glacier One 360S25-SE, 360 mm AIO-nestejäähdytys');
    assert.strictEqual(cooler.cleanQuery, 'Phanteks Glacier One 360S25-SE');
});

test('bundle: Verkkokauppa.com Blackstorm R9 5090 prebuilt deconstructed with 9 components', () => {
    const { exports: HT } = loadHintaTutka({ host: 'www.verkkokauppa.com' });

    const mockVkHtml = `
        <title>Blackstorm R9 5090 Gaming Computer – Verkkokauppa.com</title>
        <script id="__NEXT_DATA__">
        {"props":{"pageProps":{"product":{"name":"Blackstorm R9 5090 Gaming Computer","description":"\\u003Ch3\\u003EFeatures\\u003C/h3\\u003E\\u003Cul\\u003E\\u003Cli\\u003EProcessor: AMD Ryzen 9 9950X3D\\u003C/li\\u003E\\u003Cli\\u003EGraphics card: ASUS TUF Gaming GeForce RTX 5090 OC, 32 GB GDDR7\\u003C/li\\u003E\\u003Cli\\u003EMemory: 32 GB Kingston DDR5 6000 MT/s CL30\\u003C/li\\u003E\\u003Cli\\u003ESSD: Kingston NV3 PCIe 4.0 NVMe 2 TB\\u003C/li\\u003E\\u003Cli\\u003ECase: A31 Plus TG ARGB Black\\u003C/li\\u003E\\u003Cli\\u003ECooling: ASUS PRIME LC 360 ARGB\\u003C/li\\u003E\\u003Cli\\u003EMotherboard: ASUS X870 MAX GAMING WIFI7 (4 × DDR5, multiple M.2 slots, WiFi 7)\\u003C/li\\u003E\\u003Cli\\u003EPower supply: ASUS TUF Gaming 1000W Gold\\u003C/li\\u003E\\u003Cli\\u003EOperating system: Windows 11 Pro 64-bit (FI)\\u003C/li\\u003E\\u003Cli\\u003EWireless and wired networks: WiFi 7, Ethernet\\u003C/li\\u003E\\u003Cli\\u003EStorage: M.2 slots (PCIe 4.0), SATA III\\u003C/li\\u003E\\u003C/ul\\u003E"}}}}
        </script>
    `;

    const info = { name: 'Blackstorm R9 5090 Gaming Computer', currentPrice: 5999.00 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 5999.00, mockVkHtml);

    assert.ok(bundleData, 'Blackstorm PC build must be detected');
    assert.strictEqual(bundleData.isPcBuild, true);
    assert.strictEqual(bundleData.components.length, 9, 'Must extract all 9 hardware components without expansion slots');

    const cpu = bundleData.components.find(c => c.roleKey === 'cpu');
    assert.strictEqual(cpu.cleanQuery, 'AMD Ryzen 9 9950X3D');

    const gpu = bundleData.components.find(c => c.roleKey === 'gpu');
    assert.strictEqual(gpu.cleanQuery, 'ASUS TUF Gaming GeForce RTX 5090 OC');

    const ram = bundleData.components.find(c => c.roleKey === 'ram');
    assert.strictEqual(ram.cleanQuery, 'Kingston 32GB DDR5 RAM');

    const ssd = bundleData.components.find(c => c.roleKey === 'storage');
    assert.strictEqual(ssd.cleanQuery, 'Kingston 2TB NVMe SSD');

    const mobo = bundleData.components.find(c => c.roleKey === 'mobo');
    assert.strictEqual(mobo.cleanQuery, 'ASUS X870 MAX GAMING WIFI7');

    const cooler = bundleData.components.find(c => c.roleKey === 'cooler');
    assert.strictEqual(cooler.cleanQuery, 'ASUS PRIME LC 360 ARGB');

    const psu = bundleData.components.find(c => c.roleKey === 'psu');
    assert.strictEqual(psu.cleanQuery, 'ASUS 1000W Gold');

    const os = bundleData.components.find(c => c.roleKey === 'os');
    assert.strictEqual(os.cleanQuery, 'Windows 11 Pro');
});

test('bundle: Verkkokauppa.com HP OMEN Gaming Desktop deconstructed from bullet list without colons', () => {
    const { exports: HT } = loadHintaTutka({ host: 'www.verkkokauppa.com' });

    const mockOmenHtml = `
        <title>HP OMEN 16L TG03-0006 Gaming Desktop Computer – Verkkokauppa.com</title>
        <h3>Features</h3>
        <ul>
            <li>AMD Ryzen™ 5 8400F processor (4.7 GHz boost)</li>
            <li>NVIDIA GeForce RTX 5060 graphics card (8 GB GDDR7)</li>
            <li>16 GB DDR5-5200 memory</li>
            <li>1 TB PCIe Gen4 NVMe M.2 SSD</li>
            <li>Windows 11 Home operating system</li>
            <li>500W 80 PLUS Platinum power supply</li>
            <li>Motherboard chipset: AMD B650</li>
            <li>Memory clock speed: 5200 MHz</li>
            <li>SSD interface: PCI Express 4.0, NVMe</li>
        </ul>
    `;

    const info = { name: 'HP OMEN 16L TG03-0006 Gaming Desktop Computer', currentPrice: 1199.00 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 1199.00, mockOmenHtml);

    assert.ok(bundleData, 'HP OMEN PC build must be detected');
    assert.strictEqual(bundleData.isPcBuild, true);
    assert.strictEqual(bundleData.components.length, 7, 'Must extract core components and reject speed/interface sub-specs');

    const cpu = bundleData.components.find(c => c.roleKey === 'cpu');
    assert.strictEqual(cpu.cleanQuery, 'AMD Ryzen 5 8400F');

    const gpu = bundleData.components.find(c => c.roleKey === 'gpu');
    assert.strictEqual(gpu.cleanQuery, 'NVIDIA GeForce RTX 5060');

    const ram = bundleData.components.find(c => c.roleKey === 'ram');
    assert.strictEqual(ram.cleanQuery, '16GB DDR5 RAM');

    const ssd = bundleData.components.find(c => c.roleKey === 'storage');
    assert.strictEqual(ssd.cleanQuery, '1TB M.2 NVMe SSD');

    const psu = bundleData.components.find(c => c.roleKey === 'psu');
    assert.strictEqual(psu.cleanQuery, '500W Platinum');

    const mobo = bundleData.components.find(c => c.roleKey === 'mobo');
    assert.strictEqual(mobo.cleanQuery, 'AMD B650');
});

test('bundle: Verkkokauppa.com PC Cases (Blackstorm Artemis) reject false-positive bundle or PC build detection', () => {
    const { exports: HT } = loadHintaTutka({ host: 'www.verkkokauppa.com' });

    const mockCaseHtml = `
        <title>Blackstorm Artemis FT1B ATX case with a panoramic window, black – Verkkokauppa.com</title>
        <h3>Features</h3>
        <ul>
            <li>Case type: Dual Chamber ATX Mid-Tower</li>
            <li>Motherboard support: ATX, Micro-ATX, Mini-ITX</li>
            <li>Power supply support: ATX</li>
            <li>Maximum CPU cooler height: 160 mm</li>
            <li>Maximum graphics card length: 445 mm</li>
            <li>Dimensions: 420 x 285 x 380 mm</li>
        </ul>
    `;

    const info = { name: 'Blackstorm Artemis FT1B ATX case with a panoramic window, black', currentPrice: 89.99 };
    const bundleData = HT.detectAndExtractBundleData(info, null, 89.99, mockCaseHtml);

    assert.strictEqual(bundleData, null, 'Standalone PC case must return null and not trigger bundle or PC build detection');
});

test("bundle: Jimm's hardware product metadata extraction (EAN, MPN, SKU, Brand, Price)", () => {
    const metaMap = {
        'meta[property="product:ean"], meta[name="ean"], meta[property="og:ean"]': { content: '0730143315289', getAttribute: () => '0730143315289' },
        'meta[property="product:mfr_part_no"], meta[name="mpn"], meta[property="product:mpn"]': { content: '100-100001084WOF', getAttribute: () => '100-100001084WOF' },
        'meta[property="product:brand"], meta[property="og:brand"], meta[name="brand"]': { content: 'AMD', getAttribute: () => 'AMD' },
        'meta[property="product:price:currency"], meta[property="og:price:currency"]': { content: 'EUR', getAttribute: () => 'EUR' },
        'meta[property="product:price:amount"], meta[property="og:price:amount"], [itemprop="price"][content]': { content: '429.90', getAttribute: () => '429.90' },
        'meta[itemprop="sku"], [itemprop="sku"]': { content: '207359', getAttribute: () => '207359' },
        'h1[data-testid="object-title"], h1': { innerText: 'AMD Ryzen 7 9800X3D, AM5, 4.7 GHz, 8-Core, WOF', textContent: 'AMD Ryzen 7 9800X3D, AM5, 4.7 GHz, 8-Core, WOF' }
    };

    const mockDoc = {
        querySelector: (sel) => {
            for (const [key, val] of Object.entries(metaMap)) {
                if (key.includes(sel) || sel.includes(key) || (sel.includes('h1') && key.includes('h1')) || (sel.includes('product:brand') && key.includes('brand')) || (sel.includes('product:price:amount') && key.includes('amount')) || (sel.includes('sku') && key.includes('sku')) || (sel.includes('product:ean') && key.includes('ean')) || (sel.includes('product:mfr_part_no') && key.includes('mfr_part_no'))) {
                    return val;
                }
            }
            return null;
        },
        querySelectorAll: (sel) => {
            if (sel.includes('ld+json')) return [];
            if (sel.includes('script:not([src])')) return [];
            return [];
        }
    };

    const { exports: HT } = loadHintaTutka({
        host: 'www.jimms.fi',
        pathname: '/fi/Product/Show/207359/100-100001084wof/amd-ryzen-7-9800x3d-am5-4-7-ghz-8-core-wof',
        document: mockDoc
    });

    const info = HT.extractProductInfo();
    assert.ok(info, 'Product info must be extracted on Jimm\'s');
    assert.strictEqual(info.brand, 'AMD');
    assert.strictEqual(info.sku, '207359');
    assert.strictEqual(info.mpn, '100-100001084WOF');
    assert.strictEqual(info.ean, '0730143315289');
    assert.strictEqual(info.schemaPrice, 429.90);
});

test("bundle: Jimm's price element selection excludes strikethrough original prices and anchors cleanly", () => {
    const origPriceEl = {
        isConnected: true,
        classList: { contains: () => false },
        innerText: '549,00 €',
        textContent: '549,00 €',
        getBoundingClientRect: () => ({ width: 80, height: 20 }),
        closest: (sel) => {
            if (sel.includes('price__amount--original') || sel.includes('--original')) return true;
            return null;
        }
    };

    const offersDiv = {
        tagName: 'DIV',
        isConnected: true,
        parentElement: { tagName: 'DIV', parentElement: null }
    };

    const pdpSpan = {
        tagName: 'SPAN',
        isConnected: true,
        parentElement: offersDiv,
        closest: (sel) => (sel.includes('.price--pdp') ? pdpSpan : null)
    };

    const salePriceEl = {
        isConnected: true,
        classList: { contains: () => false },
        innerText: '429,90 €',
        textContent: '429,90 €',
        getBoundingClientRect: () => ({ width: 100, height: 25 }),
        parentElement: pdpSpan,
        closest: (sel) => {
            if (sel.includes('price__amount--original') || sel.includes('--original')) return null;
            if (sel.includes('.price--pdp')) return pdpSpan;
            if (sel.includes('[itemprop="offers"]')) return offersDiv;
            return null;
        }
    };

    const mockDoc = {
        querySelector: () => null,
        querySelectorAll: (sel) => {
            if (sel.includes('.price--pdp') || sel.includes('.price__amount')) {
                return [origPriceEl, salePriceEl];
            }
            return [];
        }
    };

    const { exports: HT } = loadHintaTutka({
        host: 'www.jimms.fi',
        pathname: '/fi/Product/Show/207359/test',
        document: mockDoc
    });

    const priceDom = HT.findPrimaryPriceElement(429.90);
    assert.ok(priceDom, 'Price element must be found');
    assert.strictEqual(priceDom.price, 429.90, 'Sale price 429.90 must be selected over 549.00');

    const anchor = HT.findBestPriceAnchor(priceDom.element);
    assert.strictEqual(anchor, pdpSpan, 'Anchor must resolve to .price--pdp');
});
