import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

function createMockHintaResponse(query) {
    const q = query.toLowerCase();

    if (q.includes('ssd') || q.includes('nvme') || q.includes('1tb')) {
        return `
            <table class="hv-prt">
                <tbody>
                    <tr class="hv-prt-tr" data-id="3422001" data-price="59,90 €" data-price-total="59,90 €">
                        <td class="hv-prt-td">
                            <a href="/3422001/pny-cs1030" class="hv-prt_product-a">
                                <strong class="hv--name">PNY CS1030</strong>
                                <div class="hv--features">M.2, 1000 GB NVMe PCIe, 3D NAND</div>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    if (q.includes('b760') || q.includes('b650') || q.includes('x870')) {
        const chipset = q.match(/\b(b760|b650|x870)\b/i)?.[0]?.toUpperCase() || 'B760';
        return `
            <table class="hv-prt">
                <tbody>
                    <tr class="hv-prt-tr" data-id="3917340" data-price="112,90 €" data-price-total="112,90 €">
                        <td class="hv-prt-td">
                            <a href="/3917340/asus-prime-${chipset.toLowerCase()}-plus-d4" class="hv-prt_product-a">
                                <strong class="hv--name">ASUS PRIME ${chipset}-PLUS D4</strong>
                                <div class="hv--features">LGA 1700, ATX, Intel ${chipset}, DDR4-SDRAM</div>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    if (q.includes('ryzen') || q.includes('core') || q.includes('i5-') || q.includes('i7-')) {
        return `
            <table class="hv-prt">
                <tbody>
                    <tr class="hv-prt-tr" data-id="207359" data-price="219,00 €" data-price-total="219,00 €">
                        <td class="hv-prt-td">
                            <a href="/207359/processor" class="hv-prt_product-a">
                                <strong class="hv--name">${query}</strong>
                                <div class="hv--features">Processor CPU Box</div>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    if (q.includes('rtx') || q.includes('rx') || q.includes('geforce') || q.includes('radeon')) {
        return `
            <table class="hv-prt">
                <tbody>
                    <tr class="hv-prt-tr" data-id="405101" data-price="349,00 €" data-price-total="349,00 €">
                        <td class="hv-prt-td">
                            <a href="/405101/graphics" class="hv-prt_product-a">
                                <strong class="hv--name">${query}</strong>
                                <div class="hv--features">Graphics Card GPU</div>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    if (q.includes('ram') || q.includes('ddr5') || q.includes('ddr4') || q.includes('gb')) {
        return `
            <table class="hv-prt">
                <tbody>
                    <tr class="hv-prt-tr" data-id="508200" data-price="79,90 €" data-price-total="79,90 €">
                        <td class="hv-prt-td">
                            <a href="/508200/ram-kit" class="hv-prt_product-a">
                                <strong class="hv--name">${query}</strong>
                                <div class="hv--features">Memory Kit RAM DDR5</div>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    if (q.includes('w') || q.includes('virtalähde') || q.includes('gold') || q.includes('platinum')) {
        return `
            <table class="hv-prt">
                <tbody>
                    <tr class="hv-prt-tr" data-id="609100" data-price="89,90 €" data-price-total="89,90 €">
                        <td class="hv-prt-td">
                            <a href="/609100/psu" class="hv-prt_product-a">
                                <strong class="hv--name">${query}</strong>
                                <div class="hv--features">Power Supply 80+ Gold</div>
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    return '<div class="no-results">Ei tuloksia</div>';
}

test('priceability: enrichBundleComponentPrices successfully prices all prebuilt components including generic storage and mobo', async () => {
    const { exports: HT } = loadHintaTutka({
        gmFetchHandler: (req) => {
            const parsedUrl = new URL(req.url);
            const q = parsedUrl.searchParams.get('q') || '';
            const html = createMockHintaResponse(q);
            setTimeout(() => {
                if (req.onload) {
                    req.onload({
                        status: 200,
                        finalUrl: req.url,
                        responseText: html
                    });
                }
            }, 1);
            return { abort: () => {} };
        }
    });

    const bundleData = {
        isPcBuild: true,
        components: [
            { roleKey: 'cpu', name: 'Intel Core i5-14400', cleanQuery: 'Intel Core i5-14400' },
            { roleKey: 'gpu', name: 'NVIDIA GeForce RTX 3050', cleanQuery: 'NVIDIA GeForce RTX 3050' },
            { roleKey: 'ram', name: '8 GB DDR5', cleanQuery: '8GB RAM' },
            { roleKey: 'storage', name: '1TB M.2 PCIe NVMe SSD', cleanQuery: '1TB M.2 NVMe SSD' },
            { roleKey: 'mobo', name: 'Intel B760', cleanQuery: 'Intel B760' },
            { roleKey: 'psu', name: '500 W 80+ Gold', cleanQuery: '500W 80+ Gold' }
        ]
    };

    await HT.enrichBundleComponentPrices(bundleData);

    for (const comp of bundleData.components) {
        assert.ok(
            comp.marketLowest && comp.marketLowest > 0,
            `Component "${comp.name}" (${comp.roleKey}) must have marketLowest price > 0, got: ${comp.marketLowest}`
        );
        assert.ok(
            comp.hintaUrl && comp.hintaUrl.startsWith('https://hinta.fi'),
            `Component "${comp.name}" must have valid hintaUrl, got: ${comp.hintaUrl}`
        );
    }

    assert.ok(bundleData.marketDiyTotal && bundleData.marketDiyTotal > 300, `DIY total must be computed, got: ${bundleData.marketDiyTotal}`);
});
