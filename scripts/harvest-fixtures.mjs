import fs from 'node:fs';
import path from 'node:path';

const FIXTURES_DIR = path.resolve('tests/fixtures/real');
fs.mkdirSync(FIXTURES_DIR, { recursive: true });

const TARGETS = [
    {
        name: 'jimms-ddr5-listing',
        type: 'listing',
        store: "Jimm's",
        host: 'www.jimms.fi',
        url: 'https://www.jimms.fi/fi/Product/List/000-1UL/komponentit--muistit--ddr5'
    },
    {
        name: 'jimms-vcolor-ram-standalone',
        type: 'standalone_component',
        store: "Jimm's",
        host: 'www.jimms.fi',
        url: 'https://www.jimms.fi/fi/Product/Show/218450/tmxsal1660830kwk/v-color-32gb-2-x-16gb-manta-xsky-rgb-ddr5-6000mhz-cl30-1-35v-musta'
    },
    {
        name: 'jimms-gtg-owl-5090-prebuilt',
        type: 'prebuilt_pc',
        store: "Jimm's",
        host: 'www.jimms.fi',
        url: 'https://www.jimms.fi/fi/Product/Show/217841/jimms-a-n-gtg-nxa90/jimm-s-gtg-owl-5090-pelitietokone'
    },
    {
        name: 'power-cpu-listing',
        type: 'listing',
        store: 'Power',
        host: 'www.power.fi',
        url: 'https://www.power.fi/c/1831/tietotekniikka/tietokonekomponentit/prosessorit/'
    },
    {
        name: 'multitronic-iphone-16-pro',
        type: 'phone',
        store: 'Multitronic',
        host: 'www.multitronic.fi',
        url: 'https://www.multitronic.fi/fi/products/3777418/apple-iphone-16-pro-128gb--mustatitaani'
    }
];

async function harvest() {
    console.log('Harvesting real production HTML fixtures into tests/fixtures/real/ ...');
    for (const t of TARGETS) {
        const dest = path.join(FIXTURES_DIR, `${t.name}.html`);
        try {
            console.log(`Fetching ${t.name} from ${t.url} ...`);
            const res = await fetch(t.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' }
            });
            if (!res.ok) {
                console.log(`  -> Failed with HTTP ${res.status}`);
                continue;
            }
            const html = await res.text();
            fs.writeFileSync(dest, html, 'utf8');
            console.log(`  -> Saved ${dest} (${html.length} bytes)`);
        } catch (e) {
            console.log(`  -> Error: ${e.message}`);
        }
    }
}

harvest();
