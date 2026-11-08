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

test('bundle: spec compatibility hard conflict prevents false single-motherboard match on multi-part bundle', () => {
    const { exports: HT } = loadHintaTutka();

    const bundleTitle = 'Asus TUF GAMING B850-PLUS WIFI + 9800X3D + 32GB DDR5 6000MHz -tuotepaketti';
    const singleMoboCandidate = 'Asus TUF GAMING B850-PLUS WIFI';

    const compat = HT.evaluateSpecCompatibility(bundleTitle, singleMoboCandidate);
    assert.strictEqual(compat.hasHardConflict, true, 'Bundle vs standalone single component must trigger hard conflict');

    const score = HT.scoreSearchCandidate({ name: singleMoboCandidate, price: 148.90 }, bundleTitle, 1139.00);
    assert.ok(score < 0, `Bundle vs single part score must be heavily penalized, got ${score}`);
});
