import fs from 'node:fs';
import path from 'node:path';

const FIXTURES_DIR = path.resolve('tests/fixtures/real');
fs.mkdirSync(FIXTURES_DIR, { recursive: true });

const FIXTURES = [
    // -------------------------------------------------------------------------
    // 1. TELCO: Telia iPhone 16 Pro (Cash 1299 € vs Installment 36.08 €/kk)
    // -------------------------------------------------------------------------
    {
        name: 'telia-iphone-16-installment-trap.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head>
    <title>Apple iPhone 16 Pro 128 Gt mustatitaani - Telia kauppa</title>
    <meta name="description" content="Osta Apple iPhone 16 Pro 128 Gt mustatitaani Telialta.">
    <meta property="og:title" content="Apple iPhone 16 Pro 128 Gt mustatitaani">
    <meta property="og:price:amount" content="1299.00">
    <meta property="og:price:currency" content="EUR">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Apple iPhone 16 Pro 128 Gt mustatitaani",
        "sku": "9115783",
        "offers": {
            "@type": "Offer",
            "price": "1299.00",
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock"
        }
    }
    </script>
</head>
<body>
    <header class="telia-header"><nav class="menu"><a href="/kauppa/puhelimet">Puhelimet</a></nav></header>
    <main class="product-page">
        <h1 class="product-title">Apple iPhone 16 Pro 128 Gt mustatitaani</h1>
        <div class="pricing-container">
            <!-- Installment trap box (MUST BE REJECTED) -->
            <div class="installment-schedule" class="eramaksu">
                <span class="installment-rate">36,08 € / kk</span>
                <span class="installment-term">36 kk luottosopimus, luottohinta 1 299,00 €</span>
            </div>
            <!-- Primary cash price (MUST BE SELECTED) -->
            <div class="cash-price-wrapper">
                <span class="cash-label">Kertamaksu:</span>
                <span class="product-price" itemprop="price" content="1299.00">1 299,00 €</span>
                <span class="tax-info">sis. alv 25,5 %</span>
            </div>
        </div>
    </main>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 2. TELCO LISTING: Telia category listing page
    // -------------------------------------------------------------------------
    {
        name: 'telia-puhelimet-listing.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head><title>Puhelimet - Löydä uusi älypuhelin - Telia</title></head>
<body>
    <nav class="breadcrumb"><a href="/kauppa">Kauppa</a> &gt; <span>Puhelimet</span></nav>
    <aside class="sidebar-filters">
        <div class="filter-group"><h3>Valmistaja</h3><ul><li>Apple (45)</li><li>Samsung (62)</li><li>Google (18)</li></ul></div>
    </aside>
    <div class="product-grid">
        <div class="product-card"><h2>iPhone 16</h2><span class="price">999 €</span></div>
        <div class="product-card"><h2>Galaxy S25</h2><span class="price">899 €</span></div>
    </div>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 3. GROCERY: S-kaupat Juhla Mokka 500g (5.49 € + 10.98 €/kg)
    // -------------------------------------------------------------------------
    {
        name: 'skaupat-juhla-mokka-grocery.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head>
    <title>Paulig Juhla Mokka suodatinjauhatus 500g kahvi - S-kaupat ruoan verkkokauppa</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Paulig Juhla Mokka suodatinjauhatus 500g kahvi",
        "ean": "6411300000493",
        "offers": {
            "@type": "Offer",
            "price": "5.49",
            "priceCurrency": "EUR"
        }
    }
    </script>
</head>
<body>
    <main>
        <h1 data-test-id="product-name">Paulig Juhla Mokka suodatinjauhatus 500g kahvi</h1>
        <div class="price-container">
            <span class="unit-price comparison-price">10,98 € / kg</span>
            <span class="price product-price" itemprop="price" content="5.49">5,49 €</span>
        </div>
        <div class="product-details">
            <p>Perinteinen suomalainen vaaleapaahtoinen suodatinkahvi.</p>
        </div>
    </main>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 4. GROCERY LISTING: S-kaupat category listing
    // -------------------------------------------------------------------------
    {
        name: 'skaupat-kahvit-listing.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head><title>Kahvit ja teet - Valikoima - S-kaupat ruokakauppa</title></head>
<body>
    <h1>Kahvit</h1>
    <ul class="category-tree"><li>Suodatinkahvit</li><li>Paahtokahvit</li><li>Pavut</li></ul>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 5. FURNITURE: IKEA Billy Bookcase (89.- / 89,00 €)
    // -------------------------------------------------------------------------
    {
        name: 'ikea-billy-furniture.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head>
    <title>BILLY Kirjahylly, valkoinen, 80x28x202 cm - IKEA</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "BILLY Kirjahylly, valkoinen, 80x28x202 cm",
        "offers": {
            "@type": "Offer",
            "price": "89.00",
            "priceCurrency": "EUR"
        }
    }
    </script>
</head>
<body>
    <main>
        <h1 class="pip-header-section__title">BILLY</h1>
        <div class="pip-header-section__description">Kirjahylly, valkoinen, 80x28x202 cm</div>
        <div class="pip-price-package">
            <span class="pip-temp-price__sr-text">Hinta 89 euroa</span>
            <span class="pip-temp-price__integer">89</span><span class="pip-temp-price__separator">.-</span>
        </div>
    </main>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 6. FURNITURE LISTING: IKEA category listing
    // -------------------------------------------------------------------------
    {
        name: 'ikea-kirjahyllyt-listing.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head><title>Kirjahyllyt ja kirjahyllykokonaisuudet - IKEA</title></head>
<body>
    <h1>Kirjahyllyt</h1>
    <div class="plp-filter-bar"><span>Suodattimet</span></div>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 7. SPORTS & CLUB DEAL: XXL running shoes with XXL Reward price
    // -------------------------------------------------------------------------
    {
        name: 'xxl-running-shoes-club-deal.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head>
    <title>Asics Gel-Kayano 31 - Miesten juoksukengät - XXL</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Asics Gel-Kayano 31 miesten juoksukengät",
        "offers": {
            "@type": "Offer",
            "price": "149.00",
            "priceCurrency": "EUR"
        }
    }
    </script>
</head>
<body>
    <main>
        <h1 class="product-title">Asics Gel-Kayano 31 miesten juoksukengät</h1>
        <div class="price-box">
            <!-- Normal price strikethrough -->
            <span class="price--original strikethrough was-price">199,00 €</span>
            <!-- XXL Reward club member price -->
            <div class="club-price-badge">
                <span class="club-tag">XXL Reward -klubihinta:</span>
                <span class="product-price price" itemprop="price" content="149.00">149,00 €</span>
            </div>
        </div>
    </main>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 8. SPORTS LISTING: XXL category listing
    // -------------------------------------------------------------------------
    {
        name: 'xxl-juoksukengat-listing.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head><title>Miesten juoksukengät - XXL Verkkokauppa</title></head>
<body>
    <h1>Juoksukengät</h1>
    <ul class="facet-list"><li>Asics</li><li>Nike</li><li>Hoka</li></ul>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 9. DIY TOOLS: Motonet Makita drill
    // -------------------------------------------------------------------------
    {
        name: 'motonet-akkuporakone-diy.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head>
    <title>Makita DDF485Z akkuporakone 18V runko - Motonet Oy</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Makita DDF485Z akkuporakone 18V runko",
        "offers": {
            "@type": "Offer",
            "price": "119.00",
            "priceCurrency": "EUR"
        }
    }
    </script>
</head>
<body>
    <main>
        <h1>Makita DDF485Z akkuporakone 18V runko</h1>
        <div class="product-pricing">
            <span class="product-price" itemprop="price" content="119.00">119,00 €</span>
        </div>
    </main>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 10. DIY LISTING: Motonet category listing
    // -------------------------------------------------------------------------
    {
        name: 'motonet-tyokalut-listing.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head><title>Akkutyökalut - Työkalut - Motonet verkkokauppa</title></head>
<body>
    <h1>Akkutyökalut</h1>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 11. RECOMMERCE: Tori.fi Recommerce item
    // -------------------------------------------------------------------------
    {
        name: 'tori-recommerce-used-item.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head>
    <title>PlayStation 5 Digital Edition pelikonsoli, Helsinki - Tori.fi</title>
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "PlayStation 5 Digital Edition pelikonsoli",
        "offers": {
            "@type": "Offer",
            "price": "340.00",
            "priceCurrency": "EUR"
        }
    }
    </script>
</head>
<body>
    <main>
        <h1 class="item-title">PlayStation 5 Digital Edition pelikonsoli</h1>
        <div class="item-price">340 €</div>
        <div class="seller-info"><span>Helsinki, Kamppi</span></div>
    </main>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 12. RECOMMERCE LISTING: Tori.fi search results
    // -------------------------------------------------------------------------
    {
        name: 'tori-recommerce-search-listing.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head><title>Hakutulokset: playstation 5 - Tori.fi</title></head>
<body>
    <h1>Hakutulokset</h1>
</body>
</html>`
    },
    // -------------------------------------------------------------------------
    // 13. AUTOMOTIVE LISTING: Nettiauto listing
    // -------------------------------------------------------------------------
    {
        name: 'nettiauto-vaihtoautot-listing.html',
        content: `<!DOCTYPE html>
<html lang="fi">
<head><title>Vaihtoautot - 84 219 autoa myynnissä - Nettiauto</title></head>
<body>
    <h1>Vaihtoautot</h1>
    <div class="search-filters"><span>Merkki: Kaikki</span></div>
</body>
</html>`
    }
];

console.log(`Writing ${FIXTURES.length} archetype golden fixtures to tests/fixtures/real/ ...`);
for (const f of FIXTURES) {
    const dest = path.join(FIXTURES_DIR, f.name);
    fs.writeFileSync(dest, f.content, 'utf8');
    console.log(`  -> Wrote ${f.name} (${f.content.length} bytes)`);
}
