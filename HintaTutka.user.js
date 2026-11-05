// ==UserScript==
// @name         HintaTutka
// @namespace    https://github.com/FIMARx/hintatutka
// @version      6.4
// @description  Suomen älykkäin hintatutka: Elektroniikka, huonekalut, ruoka & Tori.fi — hintakäyrät, yksikköhinnat (€/kg, €/l), klubitarjoukset & suora Prisma/K-Rauta/Puuilo/Motonet/Tokmanni-haku 57 sivustolla
// @author       FIMARx
// @homepageURL  https://github.com/FIMARx/hintatutka
// @supportURL   https://github.com/FIMARx/hintatutka/issues
// @downloadURL  https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js
// @updateURL    https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js
// @match        https://*.hinta.fi/*
// @match        https://hinta.fi/*
// @match        https://*.verkkokauppa.com/*
// @match        https://*.gigantti.fi/*
// @match        https://*.power.fi/*
// @match        https://*.proshop.fi/*
// @match        https://*.jimms.fi/*
// @match        https://*.datatronic.fi/*
// @match        https://*.multitronic.fi/*
// @match        https://*.tietokonekauppa.fi/*
// @match        https://*.data-systems.fi/*
// @match        https://*.komponenttikauppa.fi/*
// @match        https://*.cruzbroker.fi/*
// @match        https://*.maxgaming.fi/*
// @match        https://*.vpd.fi/*
// @match        https://*.puolenkuunpelit.com/*
// @match        https://*.veikonkone.fi/*
// @match        https://*.euronics.fi/*
// @match        https://*.karkkainen.com/*
// @match        https://*.prisma.fi/*
// @match        https://*.telia.fi/*
// @match        https://*.elisa.fi/*
// @match        https://*.dna.fi/*
// @match        https://*.hobbyhall.fi/*
// @match        https://*.bigbox.fi/*
// @match        https://*.kasuplan.fi/*
// @match        https://*.mikromafia.fi/*
// @match        https://*.terastore.fi/*
// @match        https://*.digidreamer.fi/*
// @match        https://*.csmegastore.com/*
// @match        https://*.e-ville.com/*
// @match        https://*.satshop.fi/*
// @match        https://*.dustinhome.fi/*
// @match        https://*.dustin.fi/*
// @match        https://*.amazon.de/*
// @match        https://*.tori.fi/*
// @match        https://*.s-kaupat.fi/*
// @match        https://*.k-ruoka.fi/*
// @match        https://*.fiksuruoka.fi/*
// @match        https://*.matsmart.fi/*
// @match        https://*.ruohonjuuri.fi/*
// @match        https://*.tokmanni.fi/*
// @match        https://*.puuilo.fi/*
// @match        https://*.ikea.com/*
// @match        https://*.jysk.fi/*
// @match        https://*.sotka.fi/*
// @match        https://*.asko.fi/*
// @match        https://*.masku.com/*
// @match        https://*.isku.fi/*
// @match        https://*.veke.fi/*
// @match        https://*.finnishdesignshop.fi/*
// @match        https://*.k-rauta.fi/*
// @match        https://*.bauhaus.fi/*
// @match        https://*.motonet.fi/*
// @match        https://*.biltema.fi/*
// @match        https://*.clasohlson.com/*
// @match        https://*.jula.fi/*
// @match        https://*.rusta.com/*
// @match        https://*.stockmann.com/*
// @connect      hinta.fi
// @connect      www.tori.fi
// @connect      tori.fi
// @connect      www.prisma.fi
// @connect      prisma.fi
// @connect      www.k-rauta.fi
// @connect      k-rauta.fi
// @connect      www.motonet.fi
// @connect      motonet.fi
// @connect      www.puuilo.fi
// @connect      puuilo.fi
// @connect      hh40esw4ph-dsn.algolia.net
// @connect      eucs11.ksearchnet.com
// @connect      sik.search.blue.cdtapps.com
// @connect      ruohonjuuri.fi
// @connect      www.ruohonjuuri.fi
// @connect      raw.githubusercontent.com
// @connect      api.github.com
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // CONFIGURATION & THRESHOLDS
    // =========================================================================
    const SCRIPT_VERSION = '6.4';
    const GITHUB_RAW_SCRIPT_URL = 'https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js';
    const GITHUB_API_CONTENTS_URL = 'https://api.github.com/repos/FIMARx/hintatutka/contents/HintaTutka.user.js';
    const GITHUB_REPO_URL = 'https://github.com/FIMARx/hintatutka';

    const CONFIG = {
        cheapMaxPct: 2.5,
        cheapMaxEur: 3.0,
        okMaxPct: 8.5,
        usedCheapDiscountPct: 18.0,
        usedOkDiscountPct: 5.0,
        cacheTtlMs: 15 * 60 * 1000,
        updateCheckTtlMs: 60 * 1000,
        storageKeyUpdateCheck: 'ufhpc_github_update_v64',
        storageKeyCollapsed: 'ufhpc_sidebar_collapsed_v55',
        storageKeyExpanded: 'ufhpc_sidebar_expanded_v55',
        storageKeyLang: 'ufhpc_sidebar_lang_v55',
        storageKeyTopPct: 'ufhpc_sidebar_top_pct_v55',
        storageKeyIncShip: 'ufhpc_filter_ship_v55',
        storageKeyInStock: 'ufhpc_filter_stock_v55',
        storageKeyToriDiili: 'ufhpc_filter_toridiili_v55',
        storageKeyChartTab: 'ufhpc_chart_tab_v55',
        maxStoresShown: 6,
        maxToriShown: 4
    };

    // =========================================================================
    // SUPPORTED STORES REGISTRY (57 SITES: TECH, GROCERIES, FURNITURE, DIY & TORI)
    // =========================================================================
    const STORES = [
        { match: 'tori.fi', name: 'Tori.fi (Käytetty)', isUsedSite: true, selectors: ['main .h2', '[data-testid="object-title"] ~ div .h2', 'div.h2'] },
        { match: 'hinta.fi', name: 'Hinta.fi', selectors: ['.hv-price-min', '[itemprop="lowPrice"]', '[itemprop="price"]'] },
        { match: 'verkkokauppa.com', name: 'Verkkokauppa.com', selectors: ['[data-price="current"]', 'ins[data-price]', '[class*="Price-sc"] ins', '[class*="ProductPrice"] [data-price]'] },
        { match: 'gigantti.fi', name: 'Gigantti', selectors: ['[data-testid="price-container"] span', '[class*="price-box"] [class*="price"]', '.product-price-container'] },
        { match: 'power.fi', name: 'Power', selectors: ['pwr-price [class*="price"]', 'pwr-price', '.product-price'] },
        { match: 'proshop.fi', name: 'Proshop', selectors: ['#site-product-price .site-currency-attention', '.site-currency-attention'] },
        { match: 'jimms.fi', name: "Jimm's", selectors: ['.price__amount', '.product-box-price [itemprop="price"]', '[itemprop="price"]'] },
        { match: 'datatronic.fi', name: 'Datatronic', selectors: ['.current-price span[itemprop="price"]', '.current-price .price', '.product-price'] },
        { match: 'multitronic.fi', name: 'Multitronic', selectors: ['#product-price', '.price-box .price', '[itemprop="price"]'] },
        { match: 'tietokonekauppa.fi', name: 'Tietokonekauppa.fi', selectors: ['.product-price', '[itemprop="price"]', '.price-new'] },
        { match: 'data-systems.fi', name: 'Data-Systems', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'komponenttikauppa.fi', name: 'Komponenttikauppa.fi', selectors: ['.price-item--regular', '.product__price', '.price'] },
        { match: 'cruzbroker.fi', name: 'Cruzbroker', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'maxgaming.fi', name: 'MaxGaming', selectors: ['.Prisrea', '.Prisord', '[itemprop="price"]', '.product-price'] },
        { match: 'vpd.fi', name: 'VPD Pelikauppa', selectors: ['.product-info-main .price', '.price-box .price', '[itemprop="price"]'] },
        { match: 'puolenkuunpelit.com', name: 'Puolenkuun Pelit', selectors: ['.productSpecialPrice', '#productPrices', '.productPrice'] },
        { match: 'veikonkone.fi', name: 'Veikon Kone', selectors: ['.product-info-price .price', '[data-price-type="finalPrice"]', '[itemprop="price"]'] },
        { match: 'euronics.fi', name: 'Euronics', selectors: ['.price-box .price', '.product-price', '[itemprop="price"]'] },
        { match: 'karkkainen.com', name: 'Kärkkäinen', selectors: ['.product-price', '[itemprop="price"]', '.price'] },
        { match: 'prisma.fi', name: 'Prisma', selectors: ['[data-test-id*="price"]', '[class*="ProductMainInfo"] [class*="price"]', '[itemprop="price"]'] },
        { match: 'telia.fi', name: 'Telia', selectors: ['[data-test*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'elisa.fi', name: 'Elisa', selectors: ['[data-testid*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'dna.fi', name: 'DNA', selectors: ['[data-testid*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'hobbyhall.fi', name: 'HobbyHall', selectors: ['.c-price__new', '.c-price', '[itemprop="price"]'] },
        { match: 'bigbox.fi', name: 'Bigbox', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'kasuplan.fi', name: 'Kasuplan', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'mikromafia.fi', name: 'Mikromafia', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'terastore.fi', name: 'TeraStore', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'digidreamer.fi', name: 'DigiDreamer', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'csmegastore.com', name: 'CS MEGASTORE', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'e-ville.com', name: 'e-ville.com', selectors: ['.product-price', '.price', '[itemprop="price"]'] },
        { match: 'satshop.fi', name: 'SatShop.fi', selectors: ['.price-box .price', '.product-price', '[itemprop="price"]'] },
        { match: 'dustin', name: 'Dustin', selectors: ['[data-testid*="price"]', '.c-price', '[itemprop="price"]'] },
        { match: 'amazon.de', name: 'Amazon.de', selectors: ['#corePriceDisplay_desktop_feature_div .a-price .a-offscreen', '#corePrice_feature_div .a-price .a-offscreen', '.a-price.aok-align-center .a-offscreen'] },
        // Groceries, Supermarkets & Everyday Discount Stores
        { match: 's-kaupat.fi', name: 'S-kaupat', categoryHint: 'grocery', selectors: ['[data-test-id="product-price__unit-price"]', '[data-test-id*="price"]', '[class*="ProductPrice"]'] },
        { match: 'k-ruoka.fi', name: 'K-Ruoka', categoryHint: 'grocery', selectors: ['[data-testid="product-unit-price"]', '[data-testid*="price"]', '[class*="price-value"]', '[class*="ProductPrice"]'] },
        { match: 'fiksuruoka.fi', name: 'Fiksuruoka', categoryHint: 'grocery', selectors: ['.product__price', '.price-item--sale', '.price-item--regular', '[itemprop="price"]'] },
        { match: 'matsmart.fi', name: 'Matsmart', categoryHint: 'grocery', selectors: ['[data-testid*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'ruohonjuuri.fi', name: 'Ruohonjuuri', selectors: ['.product__price', '.price-item--regular', '[itemprop="price"]'] },
        { match: 'tokmanni.fi', name: 'Tokmanni', selectors: ['[data-price-type="finalPrice"]', '.price-box .price', '[itemprop="price"]'] },
        { match: 'puuilo.fi', name: 'Puuilo', selectors: ['[data-price-type="finalPrice"]', '.price-box .price', '[itemprop="price"]'] },
        // Furniture, Tables, Home & DIY Stores
        { match: 'ikea.com', name: 'IKEA', categoryHint: 'furniture', selectors: ['.pip-temp-price__integer', '.pip-price__integer', '[data-testid="pip-price"]', '.pip-temp-price'] },
        { match: 'jysk.fi', name: 'JYSK', categoryHint: 'furniture', selectors: ['.ssr-product-price__value', '.product-price-value', '[itemprop="price"]'] },
        { match: 'sotka.fi', name: 'Sotka', categoryHint: 'furniture', selectors: ['.product-price', '.price-now', '[itemprop="price"]'] },
        { match: 'asko.fi', name: 'Asko', categoryHint: 'furniture', selectors: ['.product-price', '.price-now', '[itemprop="price"]'] },
        { match: 'masku.com', name: 'Masku', categoryHint: 'furniture', selectors: ['[data-testid*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'isku.fi', name: 'Isku', categoryHint: 'furniture', selectors: ['.price-item--sale', '.price-item--regular', '.product__price', '[itemprop="price"]'] },
        { match: 'veke.fi', name: 'Veke', categoryHint: 'furniture', selectors: ['[data-price-type="finalPrice"]', '.product-price', '[itemprop="price"]'] },
        { match: 'finnishdesignshop.fi', name: 'Finnish Design Shop', categoryHint: 'furniture', selectors: ['.product-price', '[itemprop="price"]', '.price'] },
        { match: 'k-rauta.fi', name: 'K-Rauta', selectors: ['[data-testid*="price"]', '.price-view', '[itemprop="price"]'] },
        { match: 'bauhaus.fi', name: 'Bauhaus', selectors: ['[data-price-type="finalPrice"]', '.price-box .price', '[itemprop="price"]'] },
        { match: 'motonet.fi', name: 'Motonet', selectors: ['[data-testid*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'biltema.fi', name: 'Biltema', selectors: ['[data-testid*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'clasohlson.com', name: 'Clas Ohlson', selectors: ['.product-price', '[itemprop="price"]', '.price'] },
        { match: 'jula.fi', name: 'Jula', selectors: ['[data-testid*="price"]', '.product-price', '[itemprop="price"]'] },
        { match: 'rusta.com', name: 'Rusta', selectors: ['.product-price', '[itemprop="price"]', '.price'] },
        { match: 'stockmann.com', name: 'Stockmann', selectors: ['.price .value', '.product-price', '[itemprop="price"]'] }
    ];

    // =========================================================================
    // LOCALIZATION (FI / EN)
    // =========================================================================
    const I18N = {
        fi: {
            greenLabel: 'EDULLINEN',
            greenSub: 'Halvin tai lähes markkinoiden halvin hinta',
            yellowLabel: 'OK HINTA',
            yellowSub: 'Kohtuullinen hinta, mutta halvemmallakin löytyy',
            redLabel: 'KALLIS',
            redSub: 'Selvästi kalliimpi kuin halvin kilpailija',
            usedGreenLabel: 'HYVÄ LÖYTÖ (KÄYTETTY)',
            usedGreenSub: 'Selvästi edullisempi kuin uutena kaupassa',
            usedYellowLabel: 'OK KÄYTETYN HINTA',
            usedYellowSub: 'Kohtuullinen, mutta melko lähellä uuden hintaa (tinkivaraa)',
            usedRedLabel: 'YLIHINTAINEN KÄYTETYKSI',
            usedRedSub: 'Lähes uuden hintainen tai kalliimpi kuin uutena kaupasta!',
            neutralLabel: 'VERTAA HINTOJA',
            neutralSub: 'Haetaan hintatietoja markkinoilta...',
            checking: 'Tarkistetaan...',
            headerTag: 'Hinta-analyysi',
            fetchingBadge: 'HAETAAN HINTOJA...',
            fetchingSub: (price) => `Verrataan hintaa (${price}) Hinta.fi- ja Tori.fi-tietokantoihin.`,
            cheapestBadge: 'Halvin hinta!',
            handleCheapest: 'HALVIN',
            thisStore: 'Tämä sivu',
            marketLowest: 'Uutena halvin',
            low30d: (p) => `30 pv alin: ${p}`,
            delivered: (p) => `Toim. ${p}`,
            freeShipping: 'Ilmainen toimitus',
            cheapestStores: (n) => `Uutena kaupoissa (${n})`,
            filterShip: '+Toimitus',
            filterStock: 'Varastossa',
            nowTag: ' (Nyt)',
            emptyResult: 'Tuotetta ei löytynyt automaattisesti Hinta.fi-haulla. Voit tarkentaa hakua alta.',
            searchPlaceholder: 'Tarkenna hakua (esim. DJI Mini 5 Pro)...',
            searchBtn: 'Hae',
            variantLabel: 'Vaihda osumaa:',
            chartTabNew: '📈 Uutena',
            chartTabTori: '♻️ Tori.fi',
            chartTitle: 'Hintahistoria',
            chartAtl: (price, store, date) => `Alin koskaan: ${price}${store ? ` (${store}, ${date})` : ''}`,
            toriChartTitle: (n) => `Tori.fi hintajakauma (${n} ilm.)`,
            toriChartStats: (min, avg, med) => `Halvin: ${min} • Keskiarvo: ${avg} • Mediaani: ${med}`,
            toriChartClickHint: 'Klikkaa pistettä avataksesi Tori-ilmoituksen',
            toriTitle: (n) => `Käytetyt • Tori.fi (${n})`,
            toriEmpty: 'Ei vastaavia käytettyjä ilmoituksia Torissa juuri nyt.',
            toriSavings: (pct) => `-${pct}% vs. uusi`,
            toriCompany: 'Yritys',
            compareBtn: '⚔️ Vertaa',
            compareCloseBtn: '⇔ Kapea',
            compareHeader: '⚔️ Vertaa toiseen malliin (esim. edellinen sukupolvi)',
            compareInputPlaceholder: 'Kirjoita verrattava malli (esim. DJI Mini 4 Pro)...',
            compareActionBtn: 'Vertaa',
            compareLoading: 'Haetaan vertailutuotetta...',
            compareNewLowest: 'Uutena halvin',
            compareToriLowest: 'Torissa halvin',
            compareToriMedian: 'Torissa mediaani',
            clubBadgeLabel: (clubName) => `${clubName || 'KLUBI'}-TARJOUS`,
            clubCheapestSub: (normPrice, nonClubLow, nonClubStore) =>
                `Halvin vain jäsenille! Normaalihinta ${normPrice}${nonClubLow ? ` • Ilman klubia halvin: ${nonClubLow} (${nonClubStore})` : ''}`,
            clubTag: '👑 KLUBI',
            nonClubCheapestTag: 'Ilman klubia halvin',
            inlineClubCheapest: (clubName, clubPrice, nonClubLow, nonClubStore) =>
                `👑 ${clubName || 'KLUBIHINTA'} HALVIN (${clubPrice})${nonClubLow ? ` • Ilman klubia: ${nonClubLow} (${nonClubStore})` : ''}`,
            inlineClubNormalWarn: (diff, pct, low, store) =>
                `Ilman klubia kallis (+${diff} / +${pct}% vs. ${low} ${store})`,
            inlineCheapest: (low) => `HALVIN HINTA MARKKINOILLA (${low})`,
            inlineCheap: (diff, low) => `EDULLINEN (+${diff} vs. halvin ${low})`,
            inlineOk: (diff, pct, store, low) => `OK HINTA (+${diff} / +${pct}% vs. ${store} ${low})`,
            inlineExpensive: (diff, pct, low, store) => `KALLIS! +${diff} (+${pct}%) • Halvin: ${low} (${store})`,
            inlineUsedGood: (saveEur, savePct, newLow, store) => `HYVÄ LÖYTÖ! ${saveEur} (${savePct}%) halvempi kuin uusi (${newLow} @ ${store})`,
            inlineUsedOk: (saveEur, savePct, newLow, store) => `OK KÄYTETTY (${saveEur} / ${savePct}% vs. uusi ${newLow} @ ${store})`,
            inlineUsedBad: (newLow, store) => `KALLIS KÄYTETYKSI! Uutena kaupasta takuulla: ${newLow} (${store})`
        },
        en: {
            greenLabel: 'CHEAP / GREAT DEAL',
            greenSub: 'Lowest or near-lowest price on the Finnish market',
            yellowLabel: 'OK PRICE',
            yellowSub: 'Fair price, though cheaper options exist',
            redLabel: 'TOO EXPENSIVE',
            redSub: 'Significantly pricier than the cheapest competitor',
            usedGreenLabel: 'GREAT USED DEAL',
            usedGreenSub: 'Well below brand-new retail price',
            usedYellowLabel: 'OK USED PRICE',
            usedYellowSub: 'Fair, though close to brand-new retail price',
            usedRedLabel: 'OVERPRICED USED',
            usedRedSub: 'Almost the same price or pricier than buying brand new!',
            neutralLabel: 'COMPARE PRICES',
            neutralSub: 'Fetching live market prices...',
            checking: 'Checking...',
            headerTag: 'Price Analyzer',
            fetchingBadge: 'CHECKING MARKET...',
            fetchingSub: (price) => `Comparing price (${price}) against Hinta.fi & Tori.fi.`,
            cheapestBadge: 'Best price!',
            handleCheapest: 'CHEAPEST',
            thisStore: 'This Page',
            marketLowest: 'Lowest New',
            low30d: (p) => `30d low: ${p}`,
            delivered: (p) => `Ship. ${p}`,
            freeShipping: 'Free shipping',
            cheapestStores: (n) => `New in Stores (${n})`,
            filterShip: '+Shipping',
            filterStock: 'In Stock',
            nowTag: ' (Here)',
            emptyResult: 'Product not found automatically on Hinta.fi. Refine the search query below.',
            searchPlaceholder: 'Refine search (e.g. DJI Mini 5 Pro)...',
            searchBtn: 'Search',
            variantLabel: 'Switch match:',
            chartTabNew: '📈 New History',
            chartTabTori: '♻️ Tori Used',
            chartTitle: 'Price History',
            chartAtl: (price, store, date) => `All-time low: ${price}${store ? ` (${store}, ${date})` : ''}`,
            toriChartTitle: (n) => `Tori.fi Used Prices (${n} ads)`,
            toriChartStats: (min, avg, med) => `Min: ${min} • Avg: ${avg} • Median: ${med}`,
            toriChartClickHint: 'Click any point to open that Tori.fi listing',
            toriTitle: (n) => `Used • Tori.fi (${n})`,
            toriEmpty: 'No matching used listings found on Tori.fi right now.',
            toriSavings: (pct) => `-${pct}% vs. new`,
            toriCompany: 'Refurb/Shop',
            compareBtn: '⚔️ Compare',
            compareCloseBtn: '⇔ Narrow',
            compareHeader: '⚔️ Compare Side-by-Side (e.g. Previous Gen)',
            compareInputPlaceholder: 'Enter model to compare (e.g. DJI Mini 4 Pro)...',
            compareActionBtn: 'Compare',
            compareLoading: 'Fetching comparison product...',
            compareNewLowest: 'Lowest New',
            compareToriLowest: 'Lowest Used (Tori)',
            compareToriMedian: 'Median Used (Tori)',
            clubBadgeLabel: (clubName) => `${clubName || 'CLUB'} SPECIAL DEAL`,
            clubCheapestSub: (normPrice, nonClubLow, nonClubStore) =>
                `Cheapest for members only! Regular ${normPrice}${nonClubLow ? ` • Best non-club: ${nonClubLow} (${nonClubStore})` : ''}`,
            clubTag: '👑 CLUB',
            nonClubCheapestTag: 'Best non-club',
            inlineClubCheapest: (clubName, clubPrice, nonClubLow, nonClubStore) =>
                `👑 ${clubName || 'CLUB DEAL'} CHEAPEST (${clubPrice})${nonClubLow ? ` • Non-club best: ${nonClubLow} (${nonClubStore})` : ''}`,
            inlineClubNormalWarn: (diff, pct, low, store) =>
                `Expensive without club (+${diff} / +${pct}% vs. ${low} ${store})`,
            inlineCheapest: (low) => `BEST MARKET PRICE (${low})`,
            inlineCheap: (diff, low) => `CHEAP (+${diff} vs. lowest ${low})`,
            inlineOk: (diff, pct, store, low) => `OK PRICE (+${diff} / +${pct}% vs. ${store} ${low})`,
            inlineExpensive: (diff, pct, low, store) => `TOO EXPENSIVE! +${diff} (+${pct}%) • Lowest: ${low} (${store})`,
            inlineUsedGood: (saveEur, savePct, newLow, store) => `GREAT USED DEAL! ${saveEur} (${savePct}%) below new (${newLow} @ ${store})`,
            inlineUsedOk: (saveEur, savePct, newLow, store) => `OK USED PRICE (${saveEur} / ${savePct}% vs. new ${newLow} @ ${store})`,
            inlineUsedBad: (newLow, store) => `OVERPRICED USED! Brand new in store: ${newLow} (${store})`
        }
    };

    function detectLanguage() {
        const saved = localStorage.getItem(CONFIG.storageKeyLang);
        if (saved === 'en' || saved === 'fi') return saved;
        if (/\/(en|en-gb|en-us|-\/en)\b/i.test(location.pathname)) return 'en';
        const htmlLang = (document.documentElement.lang || '').toLowerCase();
        if (htmlLang.startsWith('en')) return 'en';
        return 'fi';
    }

    function getStatusThemes(lang = detectLanguage(), isUsedSite = false) {
        const t = I18N[lang] || I18N.fi;
        return {
            green: {
                id: 'green',
                label: isUsedSite ? t.usedGreenLabel : t.greenLabel,
                sublabel: isUsedSite ? t.usedGreenSub : t.greenSub,
                icon: '✓',
                color: '#10b981',
                textBright: '#34d399',
                bgSoft: 'rgba(16, 185, 129, 0.14)',
                border: 'rgba(16, 185, 129, 0.45)',
                glow: '0 0 20px rgba(16, 185, 129, 0.28)'
            },
            club: {
                id: 'club',
                label: t.clubBadgeLabel('KLUBI'),
                sublabel: '',
                icon: '👑',
                color: '#a855f7',
                textBright: '#d8b4fe',
                bgSoft: 'rgba(168, 85, 247, 0.16)',
                border: 'rgba(192, 132, 252, 0.5)',
                glow: '0 0 22px rgba(168, 85, 247, 0.34)'
            },
            yellow: {
                id: 'yellow',
                label: isUsedSite ? t.usedYellowLabel : t.yellowLabel,
                sublabel: isUsedSite ? t.usedYellowSub : t.yellowSub,
                icon: '●',
                color: '#f59e0b',
                textBright: '#fbbf24',
                bgSoft: 'rgba(245, 158, 11, 0.14)',
                border: 'rgba(245, 158, 11, 0.45)',
                glow: '0 0 20px rgba(245, 158, 11, 0.25)'
            },
            red: {
                id: 'red',
                label: isUsedSite ? t.usedRedLabel : t.redLabel,
                sublabel: isUsedSite ? t.usedRedSub : t.redSub,
                icon: '⚠',
                color: '#ef4444',
                textBright: '#f87171',
                bgSoft: 'rgba(239, 68, 68, 0.15)',
                border: 'rgba(239, 68, 68, 0.5)',
                glow: '0 0 22px rgba(239, 68, 68, 0.32)'
            },
            neutral: {
                id: 'neutral',
                label: t.neutralLabel,
                sublabel: t.neutralSub,
                icon: '◈',
                color: '#6366f1',
                textBright: '#818cf8',
                bgSoft: 'rgba(99, 102, 241, 0.14)',
                border: 'rgba(99, 102, 241, 0.4)',
                glow: '0 0 18px rgba(99, 102, 241, 0.22)'
            }
        };
    }

    // =========================================================================
    // UTILITIES, SESSION CACHE & MULTILINGUAL NORMALIZERS
    // =========================================================================
    function getCached(key) {
        try {
            const raw = sessionStorage.getItem(`ufhpc_v64_${key}`);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.ts > CONFIG.cacheTtlMs) {
                sessionStorage.removeItem(`ufhpc_v64_${key}`);
                return null;
            }
            return parsed.data;
        } catch (_) {
            return null;
        }
    }

    function setCached(key, data) {
        try {
            sessionStorage.setItem(`ufhpc_v64_${key}`, JSON.stringify({ ts: Date.now(), data }));
        } catch (_) {
            // Ignore storage quota errors
        }
    }

    function parsePriceNumber(str) {
        if (typeof str === 'number') return Number.isFinite(str) ? str : null;
        if (!str || typeof str !== 'string') return null;

        const cleaned = str
            .replace(/[\u00A0\u202F\r\n\t]+/g, ' ')
            .replace(/€/g, '')
            .replace(/eur/gi, '')
            .replace(/,-/g, ',00')
            .replace(/\s+/g, ' ')
            .trim()
            // Handle superscript cents separated by a space (e.g. HobbyHall "819 00" or "1 295 39")
            .replace(/^(\d{1,3}(?:[ .]\d{3})*|\d+)\s+(\d{2})$/, '$1,$2');

        const match = cleaned.match(/(\d{1,3}(?:[ .]\d{3})+|\d+)(?:[.,](\d{1,2}))?/);
        if (!match) return null;

        const integerPart = match[1].replace(/[ .]/g, '');
        const decimalPart = match[2] ? match[2].padEnd(2, '0') : '00';
        const val = parseFloat(`${integerPart}.${decimalPart}`);
        return Number.isFinite(val) && val > 0 ? val : null;
    }

    function extractPriceFromElement(node) {
        if (!node) return null;
        const attrVal = node.getAttribute?.('content') || node.getAttribute?.('data-price');
        if (attrVal) {
            const p = parsePriceNumber(attrVal);
            if (p) return p;
        }
        // If node contains a <sup> or <small> with 2 digits (e.g. 819<sup>00</sup> €), insert comma before cents
        const supEl = node.querySelector?.('sup, small, [class*="cent" i], [class*="decimal" i], [class*="fraction" i]');
        if (supEl && /^\s*\d{2}\s*$/.test(supEl.textContent || '')) {
            const clone = node.cloneNode(true);
            const cloneSup = clone.querySelector('sup, small, [class*="cent" i], [class*="decimal" i], [class*="fraction" i]');
            if (cloneSup) {
                cloneSup.textContent = `,${cloneSup.textContent.trim()}`;
            }
            const parsedClone = parsePriceNumber(clone.textContent || '');
            if (parsedClone) return parsedClone;
        }
        return parsePriceNumber(node.innerText || node.textContent || '');
    }

    function formatEur(num, decimals = 2) {
        if (!Number.isFinite(num)) return '—';
        return num.toLocaleString('fi-FI', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }) + ' €';
    }

    function formatShortDate(rawLabel, customTitle) {
        if (customTitle && /Hinta nyt/i.test(customTitle)) {
            return 'Nyt / Now';
        }
        const m = String(rawLabel || '').match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
        if (m) {
            return `${m[2]}/${m[1]}`;
        }
        return customTitle || rawLabel || '';
    }

    function formatTimestampDate(ms) {
        if (!ms || !Number.isFinite(ms)) return '';
        const d = new Date(ms);
        if (isNaN(d.getTime())) return '';
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
    }

    function detectCurrentStore() {
        const host = location.hostname.toLowerCase();
        for (const s of STORES) {
            if (host.includes(s.match)) return s;
        }
        return { match: host, name: location.hostname.replace(/^www\./, ''), isUsedSite: false, selectors: [] };
    }

    function normalizeSwappedModelOrder(str) {
        if (!str) return '';
        // Fix human seller swaps on Tori.fi like "DJI Mini Pro 4" -> "DJI Mini 4 Pro" or "iPhone Pro 15" -> "iPhone 15 Pro"
        return str.replace(
            /\b(Mini|Air|Mavic|iPhone|Pixel|iPad|Watch)\s+(Pro\s*Max|Pro|Ultra|Plus|Max)\s+(\d{1,2}[A-Za-z]?)\b/gi,
            '$1 $3 $2'
        );
    }

    function cleanTitle(str) {
        if (!str) return '';
        return normalizeSwappedModelOrder(str)
            .replace(/[-|•–].*?(Verkkokauppa|Gigantti|Power|Proshop|Jimm's|Datatronic|Multitronic|Tietokonekauppa|Data-Systems|Komponenttikauppa|Cruzbroker|MaxGaming|VPD|Puolenkuun|Veikon|Euronics|Kärkkäinen|Prisma|Telia|Elisa|DNA|HobbyHall|Bigbox|Kasuplan|Mikromafia|TeraStore|DigiDreamer|MEGASTORE|e-ville|SatShop|Dustin|Amazon|Tori|S-kaupat|K-Ruoka|Fiksuruoka|Matsmart|Ruohonjuuri|Tokmanni|Puuilo|IKEA|JYSK|Sotka|Asko|Masku|Isku|Veke|Finnish Design Shop|K-Rauta|Bauhaus|Motonet|Biltema|Clas Ohlson|Rusta|Stockmann).*$/i, '')
            .replace(/^(Myydään|M:|ALE)\s+/i, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function detectProductCategory(title, store = detectCurrentStore()) {
        const norm = (title || '').toLowerCase();

        // 1. Explicitly check for Home Appliances, Electronics, PC Hardware & Gym/Tools FIRST
        // so "pyykinpesukone ... 8kg" on Prisma is NEVER misclassified as a grocery item!
        if (/\b(pyykinpesukone|pesukone|kuivausrumpu|kuivaava|astianpesukone|jääkaappi|pakastin|kylmiö|liesi|uuni|keittotaso|induktiokeittotaso|mikroaaltouuni|airfryer|kahvinkeitin|vedenkeitin|leivänpaahdin|imuri|robotti-imuri|varsi-imuri|televisio|älytelevisio|näyttö|pelinäyttö|kannettava|tietokone|pelikone|puhelin|älypuhelin|tabletti|älykello|urheilukello|kuulokkeet|kaiutin|soundbar|kamera|järjestelmäkamera|drone|drooni|tulostin|reititin|näytönohjain|prosessori|emolevy|keskusmuisti|virtalähde|kovalevy|ssd|pelikonsoli|käsipaino|kahvakuula|levypaino)\b/i.test(norm)) {
            return 'electronics';
        }

        if (store?.categoryHint === 'grocery') return 'grocery';
        if (store?.categoryHint === 'furniture') return 'furniture';

        if (/\b(ruokapöytä|työpöytä|sohvapöytä|sivupöytä|yöpöytä|sähköpöytä|kirjoituspöytä|pöytäryhmä|pöytä|ruokatuoli|työtuoli|nojatuoli|baarijakkara|jakkara|sohva|kulmasohva|vuodesohva|divaanisohva|sänky|jenkkisänky|runkopatja|patja|petauspatja|vaatekaappi|senkki|lipasto|vitriini|kirjahylly|hyllykkö|tv-taso|nukkamatto|villamatto|kattovalaisin|pöytävalaisin|lattiavalaisin|puutarhapöytä|parvekeryhmä|artek|ikea\s+\w+|jysk)\b/i.test(norm)) {
            return 'furniture';
        }

        // Only classify as grocery on general stores (like Prisma/Tokmanni/Ruohonjuuri) if an explicit food/drink/supplement word is present!
        if (/\b(kahvi|suodatinkahvi|pikakahvi|papukahvi|tee|maito|kaurajuoma|mantelijuoma|juusto|leipä|voi|margariini|jogurtti|rahka|kana|broileri|jauheliha|lohi|makkara|nakki|leikkele|suklaa|karkki|makeispussi|lakritsi|salmiakki|sipsit|perunalastut|pähkinä|virvoitusjuoma|energiajuoma|kivennäisvesi|lähdevesi|mehu|smoothie|pasta|makaroni|spagetti|nuudeli|riisi|kaurahiutale|puuro|mysli|granola|oliiviöljy|ruokaöljy|ketsuppi|sinappi|majoneesi|proteiinijauhe|heraproteiini|proteiinipatukka|kreatiini|monivitamiini|juhla\s*mokka|kulta\s*katriina|paulig|fazer|valio|arla|atria|snellman)\b/i.test(norm)) {
            return 'grocery';
        }
        return 'electronics';
    }

    // Extracts or calculates Unit Price (€/kg or €/l) ONLY for groceries, foods, beverages & supplements
    function extractUnitPriceInfo(title, currentPrice, category = 'electronics') {
        if (category !== 'grocery') return null;

        // 1. Check if the store DOM explicitly displays a unit price (e.g. "11,90 €/kg" or "3,50 €/l")
        const rootArea = document.querySelector('main') || document.body;
        const unitRegex = /(\d{1,4}(?:[.,]\d{1,2})?)\s*€\s*\/\s*(kg|l|kpl)\b/i;
        const unitEls = rootArea.querySelectorAll(
            '[data-test-id*="unit-price" i], [data-testid*="unit-price" i], [data-testid*="comparison-price" i], [class*="unit-price" i], [class*="comparison-price" i], [class*="unitPrice" i], [class*="kilohinta" i]'
        );
        for (const el of unitEls) {
            const txt = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
            const m = txt.match(unitRegex);
            if (m) {
                const val = parsePriceNumber(m[1]);
                const unit = m[2].toLowerCase();
                if (val && val > 0) {
                    return {
                        unitPrice: val,
                        unit,
                        quantityStr: null,
                        formatted: `${formatEur(val)}/${unit}`
                    };
                }
            }
        }

        // 2. Parse weight or volume from the product title (supports multipacks like "6 x 330 ml", "24x0,33l", "500 g", "1,5 l")
        if (!title || !currentPrice || currentPrice <= 0) return null;
        const norm = title.replace(/,/g, '.');

        let totalKg = null;
        let totalL = null;
        let quantityStr = null;

        const multiMatch = norm.match(/\b(\d{1,2})\s*[xX*]\s*(\d+(?:\.\d+)?)\s*(kg|g|l|dl|cl|ml)\b/i);
        if (multiMatch) {
            const count = parseInt(multiMatch[1], 10);
            const amount = parseFloat(multiMatch[2]);
            const unit = multiMatch[3].toLowerCase();
            quantityStr = `${count} x ${multiMatch[2].replace('.', ',')} ${unit}`;
            if (unit === 'kg') totalKg = count * amount;
            else if (unit === 'g') totalKg = (count * amount) / 1000;
            else if (unit === 'l') totalL = count * amount;
            else if (unit === 'dl') totalL = (count * amount) / 10;
            else if (unit === 'cl') totalL = (count * amount) / 100;
            else if (unit === 'ml') totalL = (count * amount) / 1000;
        } else {
            const singleMatch = norm.match(/\b(\d+(?:\.\d+)?)\s*(kg|g|l|dl|cl|ml)\b/i);
            if (singleMatch) {
                const amount = parseFloat(singleMatch[1]);
                const unit = singleMatch[2].toLowerCase();
                if (amount > 0) {
                    quantityStr = `${singleMatch[1].replace('.', ',')} ${unit}`;
                    if (unit === 'kg' && amount <= 25) totalKg = amount;
                    else if (unit === 'g' && amount >= 5 && amount <= 10000) totalKg = amount / 1000;
                    else if (unit === 'l' && amount <= 30) totalL = amount;
                    else if (unit === 'dl' && amount <= 100) totalL = amount / 10;
                    else if (unit === 'cl' && amount >= 2 && amount <= 500) totalL = amount / 100;
                    else if (unit === 'ml' && amount >= 5 && amount <= 5000) totalL = amount / 1000;
                }
            }
        }

        if (totalKg && totalKg > 0) {
            const unitPrice = currentPrice / totalKg;
            return {
                unitPrice,
                unit: 'kg',
                quantityStr,
                formatted: `${formatEur(unitPrice)}/kg`
            };
        }
        if (totalL && totalL > 0) {
            const unitPrice = currentPrice / totalL;
            return {
                unitPrice,
                unit: 'l',
                quantityStr,
                formatted: `${formatEur(unitPrice)}/l`
            };
        }

        return null;
    }

    function simplifyProductNameForSearch(name) {
        if (!name) return '';
        return normalizeSwappedModelOrder(name)
            .replace(/\s+-\s*[^\s]*(näytönohjain|prosessori|suoritin|emolevy|muisti|keskusmuisti|kovalevy|kiintolevy|ssd|virtalähde|kotelo|jäähdytin|prosessorijäähdytin|pelinäyttö|näyttö|pelituoli|pelihiiri|hiiri|pelinäppäimistö|näppäimistö|pelikuulokkeet|kuulokkeet|kannettava|pelikannettava|puhelin|älypuhelin|tabletti|reititin|verkkokortti|äänikortti|webkamera|mikrofoni|kaiuttimet|televisio|älykello|urheilukello|pelikonsoli|drone|drooni|nelikopteri|kuvauskopteri|pyykinpesukone|pesukone|kuivausrumpu|astianpesukone|jääkaappi|pakastin).*$/i, '')
            .replace(/,\s*[^,]*(näytönohjain|prosessori|suoritin|emolevy|keskusmuisti|ssd-levy|virtalähde|kotelo|pelinäyttö|älypuhelin|puhelin|kannettava|pelikannettava|drone|drooni|pyykinpesukone|pesukone|kuivausrumpu|astianpesukone).*$/i, '')
            .replace(/\b(edestä\s+täytettävä|päältä\s+täytettävä|kuivaava\s+pyykinpesukone|pyykinpesukone|pesukone|kuivausrumpu|astianpesukone|jääkaappipakastin)\b/gi, ' ')
            .replace(/\b(Graphics Card|Video Card|Processor|CPU|Motherboard|Mainboard|Gaming Monitor|Monitor|Internal SSD|Solid State Drive|Hard Drive|Power Supply|PSU|PC Case|Computer Case|Chassis|Liquid Cooler|CPU Cooler|Gaming Mouse|Wireless Mouse|Gaming Keyboard|Mechanical Keyboard|Gaming Headset|Headphones|Gaming Chair|Gaming Laptop|Laptop|Notebook|Smartphone|Mobile Phone|Tablet|Router|Smartwatch|Quadcopter|Drone|Drooni|Kuvauskopteri|Nelikopteri)\b/gi, '')
            .replace(/\b(Grafikkort|Processor|Moderkort|Bildskärm|Gamingskärm|Nätaggregat|Chassi|Datorchassi|Processorkylare|Gamingmus|Tangentbord|Hörlurar|Bärbar dator|Mobiltelefon|Surfplatta|Smartklocka|Drönare)\b/gi, '')
            .replace(/\((?:Boxed|Tray|WOF|Bulk|Retail)\)/gi, '')
            .replace(/[-–,|]+\s*$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function extractConciseModelQuery(name) {
        const simplified = simplifyProductNameForSearch(name)
            .replace(/\b(\d+)\s*Gt\b/gi, '$1GB')
            .replace(/\b(\d+)\s*Tt\b/gi, '$1TB');
        if (!simplified) return '';
        const cat = detectProductCategory(name);
        const words = simplified
            .replace(/[,/()[\]]/g, ' ')
            // Strip furniture dimensions like "140x65 cm" or "120 x 80 cm" when building concise model query
            .replace(/\b\d{2,3}\s*[xX×]\s*\d{2,3}(?:\s*[xX×]\s*\d{2,3})?\s*(?:cm|mm)?\b/gi, ' ')
            .split(/\s+/)
            .filter(w => {
                if (!(w.length >= 2 || /^\d+$/.test(w))) return false;
                if (cat === 'grocery') {
                    // For groceries, keep brand, product name, and weight/volume (e.g. "Juhla Mokka 500 g")
                    return !/^(laktoositon|gluteeniton|luomu|suomalainen|kotimainen|uutuus|tarjous|erä)$/i.test(w);
                }
                return !/^(GDDR\dX?|PCIe|AM4|AM5|LGA\d+|ATX|mATX|ITX|Wi-?Fi|Bluetooth|5G|4G|LTE|RGB|ARGB|Black|White|Silver|Gold|Blue|Green|Pink|Purple|Gray|Grey|Musta|Valkoinen|Hopea|Sininen|Vihreä|Harmaa|kultainen|mustatitaani|luonnontitaani|valkotitaani|tammi|koivu|mänty|valkolakattu|petsattu|Edition|Series|Gaming|OC|Takuu|Takuulla|Kuitti|Uudenveroinen|Hyväkuntoinen|Drone|Drooni|\d+kg|\d+kpl)$/i.test(w);
            });
        return words.slice(0, 6).join(' ').trim();
    }

    // Generates smart sibling/previous-gen model suggestions for Side-by-Side Compare (e.g. "DJI Mini 5 Pro" -> "DJI Mini 4 Pro", or furniture/grocery alternatives)
    function suggestComparisonQueries(title) {
        const clean = extractConciseModelQuery(title);
        if (!clean) return [];
        const suggestions = [];
        const addSug = (s) => {
            const v = (s || '').trim();
            if (v && v.toLowerCase() !== clean.toLowerCase() && !suggestions.some(x => x.toLowerCase() === v.toLowerCase())) {
                suggestions.push(v);
            }
        };

        const cat = detectProductCategory(title);
        if (cat === 'furniture') {
            if (/työpöytä|kirjoituspöytä|sähköpöytä|malm|bekant|mittzon|lagkapten/i.test(title)) {
                addSug('IKEA MALM työpöytä');
                addSug('IKEA MITTZON työpöytä');
                addSug('Sähköpöytä');
            } else if (/ruokapöytä|pöytä/i.test(title)) {
                addSug('Ruokapöytä tammi');
                addSug('Artek pöytä');
                addSug('IKEA ruokapöytä');
            } else if (/sohva/i.test(title)) {
                addSug('IKEA KIVIK sohva');
                addSug('IKEA SÖDERHAMN');
                addSug('Divani sohva');
            }
            return suggestions.slice(0, 4);
        }

        if (cat === 'grocery') {
            if (/kahvi|juhla\s*mokka|kultakatriina|presidentti|löfbergs/i.test(title)) {
                addSug('Juhla Mokka 500g');
                addSug('Paulig Presidentti 500g');
                addSug('Kulta Katriina 500g');
            }
            return suggestions.slice(0, 4);
        }

        // Look for a standalone generation number (2..25) and suggest N-1 and N+1
        const tokens = clean.split(/\s+/);
        for (let i = 0; i < tokens.length; i++) {
            const tok = tokens[i];
            if (/^\d{1,2}$/.test(tok)) {
                const num = parseInt(tok, 10);
                if (num >= 2 && num <= 25) {
                    const prev = [...tokens];
                    prev[i] = String(num - 1);
                    addSug(prev.join(' '));

                    const next = [...tokens];
                    next[i] = String(num + 1);
                    addSug(next.join(' '));
                    break;
                }
            }
            // Also handle S24 -> S23, M3 -> M2, etc.
            const prefixMatch = tok.match(/^([A-Za-z]{1,2})(\d{1,2})$/);
            if (prefixMatch) {
                const num = parseInt(prefixMatch[2], 10);
                if (num >= 2 && num <= 30) {
                    const prev = [...tokens];
                    prev[i] = `${prefixMatch[1]}${num - 1}`;
                    addSug(prev.join(' '));
                    break;
                }
            }
        }

        // Also suggest DJI Mini 4K if viewing DJI Mini 4 Pro or Mini 3 Pro
        if (/^dji\s+mini\b/i.test(clean)) {
            addSug('DJI Mini 4 Pro');
            addSug('DJI Mini 3 Pro');
            addSug('DJI Mini 4K');
        }

        return suggestions.slice(0, 4);
    }

    function buildToriSearchQueries(productInfo, marketProduct) {
        const candidates = [];
        const add = (str) => {
            if (!str) return;
            const isRam = /\bDDR[345]\b/i.test(str);
            let cleaned = normalizeSwappedModelOrder(str)
                .replace(/\b(\d+)\s*Gt\b/gi, '$1GB')
                .replace(/\b(\d+)\s*Tt\b/gi, '$1TB')
                .replace(/\([^)]*\)/g, ' ')
                .replace(/\b\d{2,3}\s*[xX×]\s*\d{2,3}(?:\s*[xX×]\s*\d{2,3})?\s*(?:cm|mm)?\b/gi, ' ');
            if (isRam) {
                cleaned = cleaned.replace(/\b\d+\s*(?:MHz|MT\/s|GHz|W|mm|cm|inch|tuumaa)\b/gi, ' ')
                    .replace(/\bCL\d+\b/gi, ' ');
            } else {
                cleaned = cleaned.replace(/\b\d+\s*(?:GB|Gt|TB|Tt|MHz|MT\/s|GHz|W|mm|cm|inch|tuumaa)\b/gi, ' ');
            }
            cleaned = cleaned
                .replace(/\b(?:musta|valkoinen|hopea|harmaa|sininen|vihreä|punainen|kulta|titaani|mustatitaani|luonnontitaani|tammi|koivu|mänty|black|white|silver|grey|gray|space gray|midnight|starlight|natural titanium|blue|oc|edition|gaming|wifi|5g|4g|dual sim|takuu|takuulla|kuitti|drone|drooni)\b/gi, ' ')
                .replace(/[,/|-]+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (cleaned.length >= 3 && !candidates.some(c => c.toLowerCase() === cleaned.toLowerCase())) {
                candidates.push(cleaned);
            }
        };

        const sourceTitle = normalizeSwappedModelOrder(marketProduct?.title || productInfo?.name || '');
        const modelRegexes = [
            // Require digit after Mini/Air/Mavic/Avata if followed by Pro/4K/Classic so "DJI Mini Pro 4" doesn't get truncated to "DJI Mini Pro"
            /\b(DJI\s+(?:Mini|Air|Mavic|Avata|Flip|Neo)(?:\s+\d+[A-Za-z]*)?(?:\s+(?:Pro|Classic|Enterprise|SE))?)\b/i,
            /\b(iPhone\s+\d+\s*(?:Pro\s*Max|Pro|Plus|Mini|e)?)\b/i,
            /\b(Galaxy\s+(?:S|Z\s*Fold|Z\s*Flip|A)\d+\s*(?:Ultra|Plus|\+|FE)?)\b/i,
            /\b(Pixel\s+\d+\s*(?:Pro\s*XL|Pro|a)?)\b/i,
            /\b(OnePlus\s+\d+[RT]?|OnePlus\s+Open|OnePlus\s+Nord\s*\d*)\b/i,
            /\b(MacBook\s+(?:Air|Pro)\s*(?:M\d\s*(?:Pro|Max)?)?)\b/i,
            /\b(iPad\s+(?:Pro|Air|mini)?\s*(?:M\d|\d+)?)\b/i,
            /\b((?:RTX|GTX|RX)\s*\d{4}\s*(?:Ti\s*SUPER|Ti|SUPER|XTX|XT|GRE)?)\b/i,
            /\b(Ryzen\s+[3579]\s+\d{4}[A-Z0-9]*)\b/i,
            /\b(Core\s+(?:Ultra\s+[579]\s+\d{3}[A-Z]*|i[3579]-\d{4,5}[A-Z]*))\b/i,
            /\b(PlayStation\s*5\s*(?:Pro|Slim)?|PS5\s*(?:Pro|Slim)?|Xbox\s+Series\s+[XS]|Switch\s+OLED|Steam\s+Deck(?:\s+OLED)?)\b/i,
            // Furniture & Home series on IKEA / Artek / Finnish Design
            /\b((?:IKEA\s+)?(?:MALM|KALLAX|BILLY|HEMNES|PAX|BESTÅ|POÄNG|STRANDMON|KIVIK|SÖDERHAMN|EKTORP|VIMLE|FRIHETEN|BEKANT|MITTZON|LAGKAPTEN|ALEX|TROFAST|BRIMNES|NORDLI|SONGESAND|IDANÄS|HAUGA|TONSTAD)\s*(?:työpöytä|ruokapöytä|sohvapöytä|pöytä|lipasto|hylly|sohva|sänky|nojatuoli|kaappi)?)\b/i,
            /\b(Artek\s+(?:pöytä|tuoli|jakkara)?\s*[0-9A-Za-z]*)\b/i
        ];
        for (const rx of modelRegexes) {
            const m = sourceTitle.match(rx);
            if (m && m[1]) {
                add(m[1]);
            }
        }

        if (marketProduct?.title) {
            add(extractConciseModelQuery(marketProduct.title));
            add(simplifyProductNameForSearch(marketProduct.title));
        }
        if (productInfo?.name) {
            add(extractConciseModelQuery(productInfo.name));
            add(simplifyProductNameForSearch(productInfo.name));
        }

        return candidates.slice(0, 3);
    }

    // =========================================================================
    // SMART PRODUCT PAGE DETECTION & METADATA EXTRACTION
    // =========================================================================
    function isNonProductPath() {
        const host = location.hostname.toLowerCase();
        const p = location.pathname.toLowerCase();

        if (host.includes('tori.fi')) {
            return !/\/recommerce\/forsale\/item\/\d+/i.test(p);
        }
        if (host.includes('hinta.fi')) {
            return !/^\/\d+\b/.test(p);
        }

        if (p === '/' || /^\/(fi|en|sv)\/?$/.test(p)) return true;
        if (/\/(cart|ostoskori|varukorg|checkout|kassa|search|haku|sok|login|account|asiakastili|customer|wishlist|vertailu|compare)\b/.test(p)) {
            return true;
        }
        return false;
    }

    function extractProductInfo() {
        if (isNonProductPath()) return null;

        const currentStore = detectCurrentStore();
        const info = {
            ean: null,
            mpn: null,
            sku: null,
            name: null,
            schemaPrice: null,
            hasProductSchema: false,
            isUsedSite: Boolean(currentStore.isUsedSite)
        };

        const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of jsonLdScripts) {
            try {
                const raw = JSON.parse(script.textContent);
                const queue = Array.isArray(raw) ? [...raw] : [raw];

                while (queue.length > 0) {
                    const item = queue.shift();
                    if (!item || typeof item !== 'object') continue;

                    if (Array.isArray(item['@graph'])) {
                        queue.push(...item['@graph']);
                    }

                    const type = item['@type'];
                    const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
                    if (isProduct) {
                        info.hasProductSchema = true;
                        const eanCandidate = item.gtin13 || item.gtin || item.ean || item.gtin12 || item.gtin14;
                        if (eanCandidate && /^\d{8,14}$/.test(String(eanCandidate).trim())) {
                            info.ean = String(eanCandidate).trim();
                        }
                        if (item.mpn && String(item.mpn).trim().length >= 4) {
                            info.mpn = String(item.mpn).trim();
                        }
                        if (item.sku && String(item.sku).trim().length >= 4) {
                            info.sku = String(item.sku).trim();
                        }
                        if (item.name && !info.name) {
                            info.name = cleanTitle(String(item.name));
                        }

                        const offers = item.offers;
                        const offerList = Array.isArray(offers) ? offers : (offers ? [offers] : []);
                        for (const offer of offerList) {
                            const p = parsePriceNumber(String(offer.price ?? offer.lowPrice ?? ''));
                            if (p && p > 0) {
                                info.schemaPrice = p;
                                break;
                            }
                        }
                    }
                }
            } catch (_) {
                // Ignore malformed JSON-LD blocks
            }
        }

        const hasProductUrlPattern = /\/(product|products|tuote|tuotteet|produkt|produkter|dp|gp\/product|p|recommerce\/forsale\/item)\b/i.test(location.pathname) ||
            /\/Product\/Show\//i.test(location.pathname) ||
            /\.html$/i.test(location.pathname);
        const hasProductMeta = Boolean(
            document.querySelector('meta[property="og:type"][content*="product" i], meta[property="product:price:amount"], [itemtype*="schema.org/Product"]')
        );

        if (!info.hasProductSchema && !hasProductUrlPattern && !hasProductMeta) {
            return null;
        }

        if (!info.name) {
            // Special handling for IKEA where h1 has brand series name and description span
            const ikeaH1 = document.querySelector('.pip-header-section h1, [data-testid="pip-product-information-section"] h1');
            const h1 = ikeaH1 || document.querySelector('h1[data-testid="object-title"], h1');
            if (h1 && h1.innerText.trim()) {
                info.name = cleanTitle(h1.innerText.replace(/\s+/g, ' ').trim());
            } else {
                const ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle && ogTitle.content) {
                    info.name = cleanTitle(ogTitle.content);
                }
            }
        }

        if (!info.schemaPrice) {
            const priceMeta = document.querySelector(
                'meta[property="product:price:amount"], meta[property="og:price:amount"], [itemprop="price"][content]'
            );
            if (priceMeta) {
                const val = parsePriceNumber(priceMeta.getAttribute('content') || '');
                if (val) info.schemaPrice = val;
            }
        }

        const priceDom = findPrimaryPriceElement(info.schemaPrice);
        const clubOffer = !info.isUsedSite ? detectClubOfferOnPage(priceDom, info.schemaPrice) : null;
        const currentPrice = clubOffer?.clubPrice || priceDom?.price || info.schemaPrice || null;

        if (!info.hasProductSchema && !currentPrice && !info.ean && !info.mpn) {
            return null;
        }

        const category = detectProductCategory(info.name, currentStore);
        const unitPriceInfo = extractUnitPriceInfo(info.name, currentPrice, category);

        const queries = [];
        const seen = new Set();
        const addQuery = (type, value) => {
            const v = (value || '').trim();
            if (v.length >= 3 && !seen.has(v.toLowerCase())) {
                seen.add(v.toLowerCase());
                queries.push({ type, value: v });
            }
        };

        const isPrivateLabelStore = /^(ikea\.com|jysk\.fi|sotka\.fi|asko\.fi|masku\.com|isku\.fi|veke\.fi|ruohonjuuri\.fi|s-kaupat\.fi|k-ruoka\.fi|fiksuruoka\.fi|matsmart\.fi)$/i.test(currentStore.match);

        if (!info.mpn && !isPrivateLabelStore) {
            const bodyText = (document.querySelector('main') || document.body)?.innerText || '';
            const mpnMatch = bodyText.match(/(?:Valmistajan\s+tuotekoodi|Valmistajan\s+koodi|Tuotekoodi|Manufacturer\s+Part\s+Number|MPN)\s*[:\n\t]+\s*([A-Z0-9][A-Z0-9._/-]{4,24})/i);
            if (mpnMatch && mpnMatch[1] && /[A-Z]/i.test(mpnMatch[1]) && /\d/.test(mpnMatch[1])) {
                info.mpn = mpnMatch[1].trim();
            }
        }

        if (info.ean && !isPrivateLabelStore) {
            addQuery('EAN', info.ean);
            if (/^0\d{12}$/.test(info.ean)) {
                addQuery('EAN', info.ean.slice(1));
            }
        }
        if (info.mpn && !isPrivateLabelStore) addQuery('MPN', info.mpn);
        if (info.name) {
            const simplified = simplifyProductNameForSearch(info.name);
            const simplifiedGb = simplified
                .replace(/\b(\d+)\s*Gt\b/gi, '$1GB')
                .replace(/\b(\d+)\s*Tt\b/gi, '$1TB');
            addQuery('Model', simplifiedGb);
            const concise = extractConciseModelQuery(info.name);
            if (concise && concise.split(/\s+/).length >= 2) {
                addQuery('Model', concise);
            }
            const modelQueries = buildToriSearchQueries(info, null);
            for (const mq of modelQueries) {
                addQuery('Model', mq);
            }
            addQuery('Model', simplified);
            addQuery('Title', info.name);
        }

        return {
            ...info,
            category,
            unitPriceInfo,
            currentPrice,
            priceElement: clubOffer?.clubElement || priceDom?.element || null,
            clubOffer,
            queries
        };
    }

    function detectClubOfferOnPage(primaryPriceDom, schemaPrice) {
        const clubRegex = /\b(HH\s*PLUS|PLUS\s*hinta|HobbyHall\s*PLUS|Klubihinta|Klubi-hinta|Gigantti-klubi|MyPOWER(?:-hinta)?|Jäsenhinta|Kantishinta|Asiakasomistajahinta|Kanta-asiakashinta|Etuasiakashinta)\b/i;
        const rootArea = document.querySelector('main') || document.body;
        const walker = document.createTreeWalker(rootArea, NodeFilter.SHOW_ELEMENT);
        let node = walker.currentNode;
        let clubLabelEl = null;
        let clubLabel = 'KLUBI';

        while (node) {
            if (!node.closest('#ufhpc-root') && node.children.length <= 4) {
                const txt = (node.innerText || '').trim();
                if (txt.length > 0 && txt.length <= 85 && clubRegex.test(txt)) {
                    const rect = node.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top < 900 && rect.width > 0 && rect.height > 0) {
                        clubLabelEl = node;
                        if (/HH\s*PLUS|HobbyHall\s*PLUS|PLUS\s*hinta/i.test(txt)) clubLabel = 'HH PLUS';
                        else if (/MyPOWER/i.test(txt)) clubLabel = 'MyPOWER';
                        else if (/Gigantti-klubi/i.test(txt)) clubLabel = 'Gigantti-klubi';
                        else if (/Asiakasomistaja/i.test(txt)) clubLabel = 'Asiakasomistaja';
                        else if (/Kantishinta/i.test(txt)) clubLabel = 'Kantishinta';
                        else if (/Jäsenhinta/i.test(txt)) clubLabel = 'Jäsenhinta';
                        else clubLabel = 'KLUBI';
                        break;
                    }
                }
            }
            node = walker.nextNode();
        }

        if (!clubLabelEl) return null;

        // Find the enclosing buy-box container around the club label
        let box = clubLabelEl.parentElement;
        for (let i = 0; i < 5 && box && box !== document.body; i++) {
            const r = box.getBoundingClientRect();
            if (r.height >= 90 && r.height <= 650 && r.width >= 180) {
                break;
            }
            box = box.parentElement;
        }
        if (!box) box = clubLabelEl.parentElement || rootArea;

        const priceNodes = [];
        const boxWalker = document.createTreeWalker(box, NodeFilter.SHOW_ELEMENT);
        let pNode = boxWalker.currentNode;
        while (pNode) {
            if (!pNode.closest('#ufhpc-root') && pNode.children.length <= 4) {
                const rawText = (pNode.innerText || '').trim();
                if (
                    rawText.length > 0 &&
                    rawText.length <= 24 &&
                    (/€|,-|\d+[,.]\d{2}/.test(rawText)) &&
                    !/\/kk|kk\s|\/month|erässä|luotto|toimitus|automaatti|noutopiste/i.test(rawText)
                ) {
                    const val = extractPriceFromElement(pNode);
                    if (val && val >= 10 && val <= 50000) {
                        const rect = pNode.getBoundingClientRect();
                        const style = window.getComputedStyle(pNode);
                        const fontSize = parseFloat(style.fontSize) || 14;
                        if (rect.width > 0 && rect.height > 0 && fontSize >= 16) {
                            // Deduplicate nested nodes with identical price
                            const existing = priceNodes.find(x => Math.abs(x.price - val) < 0.05);
                            if (!existing || fontSize > existing.fontSize) {
                                if (existing) {
                                    existing.element = pNode;
                                    existing.fontSize = fontSize;
                                } else {
                                    priceNodes.push({ element: pNode, price: val, fontSize, top: rect.top });
                                }
                            }
                        }
                    }
                }
            }
            pNode = boxWalker.nextNode();
        }

        if (primaryPriceDom?.price && !priceNodes.some(x => Math.abs(x.price - primaryPriceDom.price) < 0.05)) {
            priceNodes.push({
                element: primaryPriceDom.element,
                price: primaryPriceDom.price,
                fontSize: 20,
                top: primaryPriceDom.element?.getBoundingClientRect()?.top || 300
            });
        }

        if (priceNodes.length === 0) return null;
        priceNodes.sort((a, b) => a.price - b.price);

        const lowestNode = priceNodes[0];
        const highestNode = priceNodes.length > 1 ? priceNodes[priceNodes.length - 1] : null;
        const normalPrice = highestNode && highestNode.price > lowestNode.price + 0.5
            ? highestNode.price
            : (schemaPrice && schemaPrice > lowestNode.price + 0.5 ? schemaPrice : null);

        return {
            clubLabel,
            clubPrice: lowestNode.price,
            clubElement: lowestNode.element,
            normalPrice,
            normalElement: highestNode && highestNode.price > lowestNode.price + 0.5 ? highestNode.element : primaryPriceDom?.element || null
        };
    }

    function findPrimaryPriceElement(expectedPrice) {
        const currentStore = detectCurrentStore();
        const storeSelectors = [
            ...currentStore.selectors,
            '[itemprop="price"]',
            '[data-price-type="finalPrice"]',
            '[data-testid*="price"]',
            '.product-price',
            '.current-price',
            '.price'
        ];

        const isInvalidPriceNode = (el) => {
            if (!el || !el.isConnected) return true;
            if (el.closest('#ufhpc-root, del, s, strike, [class*="old-price"], [class*="original-price"], [class*="strikethrough"], [class*="was-price"]')) {
                return true;
            }
            const rect = el.getBoundingClientRect();
            const isOffscreenPrice = el.classList.contains('a-offscreen') && el.parentElement;
            const targetRect = isOffscreenPrice ? el.parentElement.getBoundingClientRect() : rect;
            if (targetRect.width === 0 || targetRect.height === 0) return true;

            const style = window.getComputedStyle(isOffscreenPrice ? el.parentElement : el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.textDecorationLine.includes('line-through')) {
                return true;
            }
            const txt = (el.innerText || '').toLowerCase();
            if (txt.includes('/kk') || txt.includes('kk ') || txt.includes('/month') || txt.includes('erässä') || txt.includes('luotto') || txt.includes('palvelumaksu') || txt.includes('toimitus alkaen')) {
                return true;
            }
            return false;
        };

        for (const sel of storeSelectors) {
            const nodes = document.querySelectorAll(sel);
            for (const node of nodes) {
                if (isInvalidPriceNode(node)) continue;
                const parsed = extractPriceFromElement(node);
                if (!parsed) continue;
                if (!expectedPrice || Math.abs(parsed - expectedPrice) < 1.0) {
                    const targetEl = node.classList.contains('a-offscreen') && node.parentElement ? node.parentElement : node;
                    return { element: targetEl, price: expectedPrice || parsed };
                }
            }
        }

        const candidates = [];
        const rootArea = document.querySelector('main') || document.body;
        const walker = document.createTreeWalker(rootArea, NodeFilter.SHOW_ELEMENT);
        let node = walker.currentNode;

        while (node) {
            if (!isInvalidPriceNode(node) && node.children.length <= 4) {
                const text = (node.innerText || '').trim();
                if (text.length > 0 && text.length <= 22 && (/€|,-|\d+[,.]\d{2}/.test(text))) {
                    const val = extractPriceFromElement(node);
                    if (val && val >= 0.15 && val <= 50000) {
                        const rect = node.getBoundingClientRect();
                        const style = window.getComputedStyle(node);
                        const fontSize = parseFloat(style.fontSize) || 14;

                        if (rect.top >= 0 && rect.top < 950 && fontSize >= 17) {
                            let score = fontSize * 2 - rect.top * 0.02;
                            if (expectedPrice && Math.abs(val - expectedPrice) < 0.5) {
                                score += 200;
                            }
                            candidates.push({ element: node, price: val, score });
                        }
                    }
                }
            }
            node = walker.nextNode();
        }

        if (candidates.length > 0) {
            candidates.sort((a, b) => b.score - a.score);
            return {
                element: candidates[0].element,
                price: expectedPrice || candidates[0].price
            };
        }

        return null;
    }

    // =========================================================================
    // HINTA.FI & TORI.FI LIVE FETCHERS
    // =========================================================================
    function gmFetch(url, accept = 'text/html,application/xhtml+xml,application/json') {
        return new Promise((resolve, reject) => {
            if (typeof GM_xmlhttpRequest !== 'function') {
                reject(new Error('GM_xmlhttpRequest unavailable'));
                return;
            }
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                headers: {
                    'Accept': accept,
                    'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8'
                },
                timeout: 10000,
                onload: (res) => {
                    if (res.status >= 200 && res.status < 400) {
                        resolve({ text: res.responseText, finalUrl: res.finalUrl || url });
                    } else {
                        reject(new Error(`HTTP ${res.status}`));
                    }
                },
                onerror: () => reject(new Error('Network error')),
                ontimeout: () => reject(new Error('Timeout'))
            });
        });
    }

    // =========================================================================
    // LIVE GITHUB UPDATE CHECKER (NOTIFIES USERS WHEN NEW VERSION IS PUSHED)
    // =========================================================================
    let latestUpdateVersion = null;
    let updateToastDismissed = false;

    function isNewerVersion(remoteVer, localVer) {
        if (!remoteVer || !localVer) return false;
        const rParts = String(remoteVer).trim().split('.').map(n => parseInt(n, 10) || 0);
        const lParts = String(localVer).trim().split('.').map(n => parseInt(n, 10) || 0);
        const len = Math.max(rParts.length, lParts.length);
        for (let i = 0; i < len; i++) {
            const r = rParts[i] || 0;
            const l = lParts[i] || 0;
            if (r > l) return true;
            if (r < l) return false;
        }
        return false;
    }

    async function fetchRemoteScriptVersion() {
        // 1. Try GitHub Contents API first (0-second CDN lag after git push)
        try {
            const { text } = await gmFetch(`${GITHUB_API_CONTENTS_URL}?_t=${Date.now()}`, 'application/vnd.github.v3.raw');
            const m = (text || '').slice(0, 1200).match(/@version\s+([0-9]+(?:\.[0-9]+)*)/i);
            if (m && m[1]) return m[1].trim();
        } catch (_) {
            // Fallback to raw.githubusercontent.com
        }
        // 2. Fallback to raw.githubusercontent.com with cache-buster
        const { text } = await gmFetch(`${GITHUB_RAW_SCRIPT_URL}?_t=${Date.now()}`, 'text/plain');
        const m = (text || '').slice(0, 1200).match(/@version\s+([0-9]+(?:\.[0-9]+)*)/i);
        return (m && m[1]) ? m[1].trim() : null;
    }

    async function checkForGithubUpdate(force = false) {
        try {
            if (!force) {
                const cachedRaw = localStorage.getItem(CONFIG.storageKeyUpdateCheck);
                if (cachedRaw) {
                    const parsed = JSON.parse(cachedRaw);
                    if (Date.now() - parsed.ts < CONFIG.updateCheckTtlMs) {
                        if (isNewerVersion(parsed.remoteVersion, SCRIPT_VERSION)) {
                            latestUpdateVersion = parsed.remoteVersion;
                        } else {
                            latestUpdateVersion = null;
                        }
                        return latestUpdateVersion;
                    }
                }
            }

            const remoteVersion = await fetchRemoteScriptVersion();
            if (remoteVersion) {
                localStorage.setItem(CONFIG.storageKeyUpdateCheck, JSON.stringify({
                    ts: Date.now(),
                    remoteVersion
                }));
                if (isNewerVersion(remoteVersion, SCRIPT_VERSION)) {
                    latestUpdateVersion = remoteVersion;
                    return remoteVersion;
                } else {
                    latestUpdateVersion = null;
                }
            }
        } catch (_) {
            // Ignore network errors during background update check
        }
        return null;
    }

    function doesToriHeadingMatchQuery(heading, query, targetTitle, allowExtraTierModifiers = false) {
        const normHeading = normalizeSwappedModelOrder(heading)
            .toLowerCase()
            .replace(/\b(\d+)\s*gt\b/gi, '$1gb')
            .replace(/\b(\d+)\s*tt\b/gi, '$1tb')
            .replace(/\b(\d+)\s*gb\b/gi, '$1gb')
            .replace(/[-_/,()+:;|[\]]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const normQuery = normalizeSwappedModelOrder(query)
            .toLowerCase()
            .replace(/\b(\d+)\s*gt\b/gi, '$1gb')
            .replace(/\b(\d+)\s*tt\b/gi, '$1tb')
            .replace(/\b(\d+)\s*gb\b/gi, '$1gb')
            .replace(/[-_/,()+:;|[\]]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const headingTokens = new Set(normHeading.split(' ').filter(Boolean));
        const queryTokens = normQuery.split(' ').filter(Boolean);
        if (queryTokens.length === 0) return false;

        const optionalUmbrellaBrands = new Set([
            'apple', 'samsung', 'sony', 'microsoft', 'amd', 'intel', 'nvidia', 'geforce', 'radeon',
            'google', 'lenovo', 'asus', 'acer', 'msi', 'gigabyte', 'hp', 'dell', 'logitech', 'razer',
            'corsair', 'steelseries', 'hyperx', 'jbl', 'bose', 'sennheiser', 'garmin'
        ]);

        const tokenSynonyms = {
            'playstation': ['playstation', 'ps', 'ps5', 'ps4'],
            'ps5': ['ps5', 'playstation'],
            'ryzen': ['ryzen', 'r5', 'r7', 'r9'],
            'macbook': ['macbook', 'mbp', 'mba'],
            'iphone': ['iphone']
        };

        const nonBrandTokens = queryTokens.filter(t => !optionalUmbrellaBrands.has(t));

        for (const qToken of queryTokens) {
            if (optionalUmbrellaBrands.has(qToken) && nonBrandTokens.length >= 2) {
                continue;
            }

            const syns = tokenSynonyms[qToken] || [qToken];
            let matched = false;
            for (const syn of syns) {
                if (headingTokens.has(syn)) {
                    matched = true;
                    break;
                }
                const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (syn.length >= 2 && new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i').test(normHeading)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) return false;
        }

        for (let i = 0; i < queryTokens.length - 1; i++) {
            const w1 = queryTokens[i];
            const w2 = queryTokens[i + 1];
            if (/^[a-zäöå]{2,}$/i.test(w1) && /^\d{1,2}[a-z]?$/i.test(w2)) {
                const w1Esc = w1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const w2Esc = w2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Allow "mini 4", "mini4", or human-swapped "mini pro 4", while rejecting reversed "rs 4 mini"
                const pairRx = new RegExp(`\\b${w1Esc}\\s+(?:(?:pro|max|ultra|plus|air|ti|super)\\s+)?${w2Esc}[a-z]?\\b`, 'i');
                const joinedRx = new RegExp(`\\b${w1Esc}${w2Esc}\\b`, 'i');
                if (!pairRx.test(normHeading) && !joinedRx.test(normHeading)) {
                    return false;
                }
            }
        }

        const tierModifiers = ['pro', 'max', 'ultra', 'plus', 'mini', 'air', 'ti', 'super', 'xtx', 'xt', 'x3d', 'oled', 'fe', 'lite', 'ddr4', 'ddr5'];
        const refString = `${normQuery} ${normalizeSwappedModelOrder(targetTitle || '').toLowerCase()}`;
        for (const mod of tierModifiers) {
            const modRx = new RegExp(`(?<![a-z0-9])${mod}(?![a-z0-9])`, 'i');
            const queryHasMod = modRx.test(normQuery);
            const targetHasMod = queryHasMod || modRx.test(refString);
            const headingHasMod = headingTokens.has(mod);

            if (allowExtraTierModifiers) {
                // In fallback mode (e.g. user searched partial "DJI Mini 4" without typing "Pro"),
                // require modifiers the user explicitly typed ("mini"), but allow extra tier suffixes ("pro") in headings
                if (queryHasMod && !headingHasMod) {
                    return false;
                }
            } else {
                if (targetHasMod !== headingHasMod) {
                    return false;
                }
            }
        }

        return true;
    }

    async function fetchToriUsedListings(productInfo, marketProduct, customQuery = null) {
        // Combine resolved marketProduct model queries with customQuery so partial searches like "DJI Mini 4"
        // also search the resolved model "DJI Mini 4 Pro" on Tori.fi
        const builtQueries = buildToriSearchQueries(
            customQuery ? { name: customQuery } : productInfo,
            marketProduct
        );
        const queries = [];
        for (const q of [...builtQueries, ...(customQuery ? [customQuery] : [])]) {
            const cleanQ = (q || '').trim();
            if (cleanQ && !queries.some(x => x.toLowerCase() === cleanQ.toLowerCase())) {
                queries.push(cleanQ);
            }
        }

        if (queries.length === 0) return { query: '', items: [], stats: null };

        const referenceNewPrice = marketProduct?.lowestPrice || (!productInfo?.isUsedSite ? productInfo?.currentPrice : null);
        const targetTitle = (marketProduct?.title || productInfo?.name || customQuery || '').toLowerCase();

        const targetIsFullPc = /pelikone|pelitietokone|tietokone|keskusyksikkö|gaming pc|desktop/i.test(targetTitle);
        const targetIsAccessory = /suojakuori|kuoret|kotelo|panssarilasi|suojalasi|laturi|kaapeli|adapteri|ranneke|laukku|akku|propelli|ohjain|suodin|suodinsarja|case|cover|charger|cable|strap|battery|controller|filter/i.test(targetTitle);

        for (const q of queries) {
            const cacheKey = `tori_${q.toLowerCase()}_${(marketProduct?.title || '').toLowerCase().slice(0, 24)}`;
            const cached = getCached(cacheKey);
            if (cached) return cached;

            const apiUrl = `https://www.tori.fi/recommerce/forsale/search/api/search/SEARCH_ID_BAP_COMMON?q=${encodeURIComponent(q)}`;
            try {
                const { text } = await gmFetch(apiUrl, 'application/json');
                const data = JSON.parse(text);
                const docs = Array.isArray(data?.docs) ? data.docs : [];

                const filterDocs = (allowExtraMods) => {
                    const matchedItems = [];
                    for (const doc of docs) {
                        const price = doc?.price?.amount;
                        const heading = (doc?.heading || '').trim();
                        if (!Number.isFinite(price) || price <= 0 || !heading) continue;

                        if (doc.trade_type && /ostetaan|vuokrataan|annetaan/i.test(doc.trade_type)) continue;
                        const lowerHeading = heading.toLowerCase();
                        if (/\b(ostetaan|halutaan ostaa|vuokrataan|vuokralle|annetaan)\b/i.test(lowerHeading) || /^o:/i.test(lowerHeading)) {
                            continue;
                        }

                        if (/\b(rikki|viallinen|varaosiksi|ei toimi|pelkkä laatikko|tyhjä laatikko|alkuperäinen laatikko)\b/i.test(lowerHeading)) {
                            continue;
                        }

                        // Exclude cheap accessories, camera ND/PL filters (suodinsarja), propellers, bags, chargers, etc.
                        if (!targetIsAccessory && /\b(suojakuori|kuoret|kuori|panssarilasi|suojalasi|näytönsuoja|laturi|autolaturi|virtalähde|kaapeli|ranneke|suojakotelo|akkuja|lisäakku|varaosat|propellit|potkurit|potkurisuojat|kantolaukku|olkalaukku|suodinsarja|suodin|suotimet|nd-suodin|linssisuoja|gimbal-suoja|pelkkä ohjain|rc\s*\d?\s*ohjain)\b/i.test(lowerHeading)) {
                            continue;
                        }

                        if (!targetIsFullPc && /\b(pelikone|pelitietokone|keskusyksikkö|konepaketti|tietokonepaketti)\b/i.test(lowerHeading)) {
                            continue;
                        }

                        if (!doesToriHeadingMatchQuery(heading, q, targetTitle, allowExtraMods)) {
                            continue;
                        }

                        if (referenceNewPrice && referenceNewPrice > 30) {
                            const ratio = price / referenceNewPrice;
                            const isFurn = productInfo?.category === 'furniture' || detectProductCategory(targetTitle) === 'furniture';
                            const minRatio = isFurn ? 0.08 : 0.35;
                            const maxRatio = isFurn ? 1.35 : 1.25;
                            if (ratio < minRatio || ratio > maxRatio) continue;
                        }

                        const flags = Array.isArray(doc.flags) ? doc.flags : [];
                        const hasToriDiili = flags.includes('shipping_exists') ||
                            flags.includes('buy_now') ||
                            (Array.isArray(doc.labels) && doc.labels.some(l => l.id === 'fiks_ferdig'));
                        const isCompany = flags.includes('retailer');

                        matchedItems.push({
                            id: String(doc.id),
                            title: heading,
                            price,
                            location: doc.location || 'Suomi',
                            url: doc.canonical_url || `https://www.tori.fi/recommerce/forsale/item/${doc.id}`,
                            imageUrl: doc.image?.url || (Array.isArray(doc.image_urls) ? doc.image_urls[0] : null),
                            hasToriDiili,
                            isCompany,
                            timestamp: doc.timestamp || Date.now(),
                            dateStr: formatTimestampDate(doc.timestamp)
                        });
                    }
                    return matchedItems;
                };

                // Pass 1: Strict tier modifier matching
                let items = filterDocs(false);
                // Pass 2: If user searched a partial query like "DJI Mini 4" without "Pro", allow extra tier suffixes
                if (items.length === 0) {
                    items = filterDocs(true);
                }

                items.sort((a, b) => a.price - b.price);

                if (items.length > 0) {
                    const prices = items.map(i => i.price);
                    const minPrice = prices[0];
                    const maxPrice = prices[prices.length - 1];
                    const avgPrice = prices.reduce((s, v) => s + v, 0) / prices.length;
                    const mid = Math.floor(prices.length / 2);
                    const medianPrice = prices.length % 2 !== 0
                        ? prices[mid]
                        : (prices[mid - 1] + prices[mid]) / 2;

                    const res = {
                        query: q,
                        items,
                        stats: { minPrice, maxPrice, avgPrice, medianPrice }
                    };
                    setCached(cacheKey, res);
                    return res;
                }
            } catch (_) {
                // Continue to next query
            }
        }

        return { query: queries[0] || '', items: [], stats: null };
    }

    const STOP_WORDS_FOR_MATCHING = new Set([
        'the', 'and', 'for', 'with', 'pro', 'max', 'plus', 'mini', 'air', 'new', 'uusi',
        'valkoinen', 'musta', 'harmaa', 'hopea', 'sininen', 'vihreä', 'punainen', 'kulta', 'beige', 'ruskea',
        'white', 'black', 'grey', 'gray', 'silver', 'blue', 'green', 'red', 'gold',
        'edestä', 'päältä', 'täytettävä', 'kpl', 'pkt', 'sarja', 'malli', 'edition', 'series'
    ]);

    function extractMeaningfulTokens(str) {
        if (!str) return [];
        return normalizeSwappedModelOrder(str)
            .toLowerCase()
            .replace(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|l|dl|cl|ml|cm|mm|m|kpl|w|hz)\b/gi, ' ')
            .split(/[\s/\-,()+:;|[\]]+/)
            .filter(t => (t.length >= 2 || /^\d+$/.test(t)) && !STOP_WORDS_FOR_MATCHING.has(t));
    }

    function doesItemMatchQueryWords(itemTitle, queryStr) {
        const qTokens = extractMeaningfulTokens(queryStr);
        if (qTokens.length === 0) return false;
        const normTitle = normalizeSwappedModelOrder(itemTitle || '').toLowerCase();

        let matched = 0;
        let firstTokenMatched = false;
        for (let i = 0; i < qTokens.length; i++) {
            const token = qTokens[i];
            const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (new RegExp(`(?<![a-z0-9äöå])${esc}(?![a-z0-9äöå])`, 'i').test(normTitle)) {
                matched++;
                if (i === 0) firstTokenMatched = true;
            }
        }

        if (matched === 0) return false;
        if (qTokens.length === 1) return matched === 1;
        if (qTokens.length === 2) return matched === 2;
        return firstTokenMatched && (matched / qTokens.length) >= 0.6;
    }

    function scoreSearchCandidate(candidate, targetName, currentPrice) {
        let score = 0;

        if (targetName && candidate.name) {
            const normTarget = simplifyProductNameForSearch(targetName).toLowerCase();
            const normCand = normalizeSwappedModelOrder(candidate.name).toLowerCase();

            if (normCand === normTarget) {
                score += 120;
            } else {
                const meaningfulTokens = extractMeaningfulTokens(normTarget);
                let meaningfulMatched = 0;
                for (const token of meaningfulTokens) {
                    const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    if (new RegExp(`(?<![a-z0-9äöå])${esc}(?![a-z0-9äöå])`, 'i').test(normCand)) {
                        meaningfulMatched++;
                    }
                }

                // CRITICAL GUARD: Never allow a candidate with ZERO meaningful words in common
                // or less than 35% token overlap to match (even if the price happens to be similar)!
                if (meaningfulTokens.length > 0) {
                    if (meaningfulMatched === 0) {
                        return -999;
                    }
                    if (meaningfulTokens.length >= 2 && (meaningfulMatched / meaningfulTokens.length) < 0.35) {
                        return -999;
                    }
                }

                // Huge bonus if candidate starts with the user's query (e.g. "DJI Mini 4 Pro" starts with "DJI Mini 4", unlike "DJI RS 4 Mini")
                if (normCand.startsWith(normTarget)) {
                    score += 65;
                } else if (normCand.includes(normTarget)) {
                    score += 38;
                }

                // Keep single-digit model numbers ("5", "4", "7") when scoring Hinta.fi candidates!
                const tokens = normTarget.split(/[\s/\-,()+]+/).filter(t => t.length >= 2 || /^\d+$/.test(t));
                let matched = 0;
                for (const token of tokens) {
                    const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    if (new RegExp(`(?<![a-z0-9])${esc}(?![a-z0-9])`, 'i').test(normCand)) {
                        matched++;
                    } else if (/^\d+$/.test(token)) {
                        // Heavy penalty if a model number (like "5" in "Mini 5 Pro") is missing in the Hinta.fi candidate!
                        score -= 95;
                    }
                }
                if (tokens.length > 0) {
                    score += (matched / tokens.length) * 75;
                }

                // Enforce ordered <word> <number> pairs (e.g. "mini 4" in "DJI Mini 4" vs reversed "rs 4 mini")
                for (let i = 0; i < tokens.length - 1; i++) {
                    const w1 = tokens[i];
                    const w2 = tokens[i + 1];
                    if (/^[a-zäöå]{2,}$/i.test(w1) && /^\d{1,2}[a-z]?$/i.test(w2)) {
                        const w1Esc = w1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const w2Esc = w2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const forwardPair = new RegExp(`\\b${w1Esc}\\s*${w2Esc}\\b`, 'i');
                        const reversedPair = new RegExp(`\\b${w2Esc}\\s+${w1Esc}\\b`, 'i');
                        if (forwardPair.test(normCand)) {
                            score += 35;
                        } else if (reversedPair.test(normCand)) {
                            score -= 65;
                        }
                    }
                }
            }

            const targetIsPc = /pelikone|tietokone|gaming pc|desktop pc|paketti|bundle/i.test(normTarget);
            const candIsPc = /pelikone|tietokone|gaming pc|paketti|bundle/i.test(normCand) ||
                /tietokoneet/i.test(candidate.category || '');
            if (!targetIsPc && candIsPc) {
                score -= 80;
            }
        }

        if (currentPrice && candidate.lowestPrice) {
            const ratio = candidate.lowestPrice / currentPrice;
            if (ratio >= 0.45 && ratio <= 2.2) {
                score += 40 - Math.abs(1 - ratio) * 28;
            } else {
                score -= 90;
            }
        }

        if (candidate.storeCount) {
            score += Math.min(candidate.storeCount, 15) * 1.2;
        }

        return score;
    }

    function parseHintaSearchHtml(html, targetName, currentPrice) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        if (doc.querySelector('#hv-oft, .hv-prh')) {
            return {
                directProductDoc: doc,
                candidates: []
            };
        }

        const rows = doc.querySelectorAll('table.hv-prt tbody tr.hv-prt-tr');
        const candidates = [];

        rows.forEach((row) => {
            const id = row.getAttribute('data-id');
            const lowestPrice = parsePriceNumber(row.getAttribute('data-price') || '');
            const lowestTotal = parsePriceNumber(row.getAttribute('data-price-total') || '');
            const linkEl = row.querySelector('a.hv-prt_product-a');
            const nameEl = row.querySelector('.hv--name');
            const groupEl = row.querySelector('.hv--group');
            const storeCountEl = row.querySelector('.hv--store-count');

            if (linkEl && nameEl && lowestPrice) {
                const href = linkEl.getAttribute('href');
                const item = {
                    id,
                    name: nameEl.textContent.trim(),
                    category: groupEl ? groupEl.textContent.trim() : '',
                    url: href.startsWith('http') ? href : `https://hinta.fi${href}`,
                    lowestPrice,
                    lowestTotal: lowestTotal || lowestPrice,
                    storeCount: parseInt(storeCountEl?.textContent?.trim() || '1', 10) || 1
                };
                item.score = scoreSearchCandidate(item, targetName, currentPrice);
                candidates.push(item);
            }
        });

        candidates.sort((a, b) => b.score - a.score);
        return { directProductDoc: null, candidates };
    }

    // Live IKEA Finland Public Search API Fetcher (strictly verified against query tokens!)
    async function fetchIkeaFinlandProducts(queryStr) {
        const q = (queryStr || '').trim();
        if (q.length < 2) return [];
        const cacheKey = `ikea_${q.toLowerCase()}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://sik.search.blue.cdtapps.com/fi/fi/search-result-page?q=${encodeURIComponent(q)}&size=6`;
            const { text } = await gmFetch(url, 'application/json');
            const data = JSON.parse(text);
            const rawItems = data?.searchResultPage?.products?.main?.items || [];
            const results = [];
            for (const entry of rawItems) {
                const p = entry?.product;
                const price = p?.salesPrice?.numeral;
                if (!p || !Number.isFinite(price) || price <= 0) continue;
                const fullTitle = `${p.name || ''} ${p.typeName || ''}${p.itemMeasureReferenceText ? `, ${p.itemMeasureReferenceText}` : ''}`.replace(/\s+/g, ' ').trim();
                // Reject IKEA fallback results (like "PATRULL Pistorasian suojus") that don't actually match the query words!
                if (!doesItemMatchQueryWords(fullTitle, q)) continue;

                const pipUrl = p.pipUrl || `https://www.ikea.com/fi/fi/search/?q=${encodeURIComponent(q)}`;
                const itemObj = {
                    id: p.id || pipUrl,
                    name: fullTitle,
                    category: 'IKEA Suomi • Huonekalut',
                    url: pipUrl,
                    lowestPrice: price,
                    lowestTotal: price,
                    storeCount: 1,
                    storeName: `IKEA (${p.name || 'Suomi'})`,
                    isDirectStoreProduct: true
                };
                setCached(`direct_prod_${pipUrl}`, itemObj);
                results.push(itemObj);
            }
            setCached(cacheKey, results);
            return results;
        } catch (_) {
            return [];
        }
    }

    // Live Ruohonjuuri Public Shopify Suggest API Fetcher (strictly verified against query tokens!)
    async function fetchRuohonjuuriProducts(queryStr) {
        const q = (queryStr || '').trim();
        if (q.length < 2) return [];
        const cacheKey = `rj_${q.toLowerCase()}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            const url = `https://www.ruohonjuuri.fi/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=5`;
            const { text } = await gmFetch(url, 'application/json');
            const data = JSON.parse(text);
            const rawProducts = data?.resources?.results?.products || [];
            const results = [];
            for (const p of rawProducts) {
                const price = parsePriceNumber(String(p.price || ''));
                if (!p.title || !price) continue;
                const cleanPTitle = p.title.trim();
                // Reject Ruohonjuuri fallback suggestions that don't match the query words!
                if (!doesItemMatchQueryWords(cleanPTitle, q)) continue;

                const prodUrl = p.url?.startsWith('http') ? p.url : `https://www.ruohonjuuri.fi${p.url || ''}`;
                const itemObj = {
                    id: String(p.id || prodUrl),
                    name: cleanPTitle,
                    category: 'Ruohonjuuri • Ruoka & Luomu',
                    url: prodUrl,
                    lowestPrice: price,
                    lowestTotal: price,
                    storeCount: 1,
                    storeName: 'Ruohonjuuri',
                    isDirectStoreProduct: true
                };
                setCached(`direct_prod_${prodUrl}`, itemObj);
                results.push(itemObj);
            }
            setCached(cacheKey, results);
            return results;
        } catch (_) {
            return [];
        }
    }

    // =========================================================================
    // DIRECT FINNISH RETAILERS LIVE SEARCH (PRISMA, K-RAUTA, PUUILO, MOTONET, TOKMANNI)
    // Covers stores that Hinta.fi does NOT index, with strict exact-product verification!
    // =========================================================================
    function extractModelCodes(str) {
        if (!str) return [];
        const matches = String(str).toUpperCase().match(/\b[A-Z]{1,6}\d{1,5}[A-Z0-9-]{2,15}\b/g) || [];
        return matches.filter(m =>
            !/^(18V|12V|20V|36V|40V|230V|20W|8KG|9KG|10KG|16GB|32GB|64GB|128GB|256GB|512GB|1TB|2TB|DDR4|DDR5|ONE|LED|USB|RGB|PRO|MAX)$/i.test(m) &&
            /[A-Z]/.test(m) && /\d/.test(m) && m.length >= 5
        );
    }

    function isSameExactProduct(candidate, targetName, targetEan, referencePrice) {
        if (!candidate || !candidate.name || !candidate.price || candidate.price <= 0) return false;
        const candTitle = candidate.name.toLowerCase();
        const targTitle = (targetName || '').toLowerCase();

        // Reject adapters/accessories if target is not an adapter/accessory
        const adapterRx = /\b(adapteri|akkuadapteri|sovitin|varaterä|hiomapaperi|hioma-arkki|kärkisarja|suojakuori|kantolaukku|varaosat)\b/i;
        if (!adapterRx.test(targTitle) && adapterRx.test(candTitle)) return false;

        // Price sanity guard when referencePrice is known
        if (referencePrice && referencePrice > 10) {
            const ratio = candidate.price / referencePrice;
            if (ratio < 0.38 || ratio > 2.5) return false;
        }

        // 1. Exact EAN match
        if (targetEan && candidate.ean && String(candidate.ean).trim() === String(targetEan).trim()) {
            return true;
        }

        // 2. If target has specific alphanumeric model codes (e.g. R18ALF-0, EW5F4248N1, EMS190DCL), require model code match
        const targetCodes = extractModelCodes(targetName);
        if (targetCodes.length > 0) {
            const candUpper = `${candidate.name} ${candidate.sku || ''} ${candidate.url || ''}`.toUpperCase();
            return targetCodes.some(code => {
                const baseCode = code.replace(/-0$/, '');
                return candUpper.includes(code) || (baseCode.length >= 6 && candUpper.includes(baseCode));
            });
        }

        // 3. Otherwise require strong meaningful word overlap (>= 75%) + first brand/noun token match
        if (!doesItemMatchQueryWords(candidate.name, targetName)) return false;
        const tTokens = extractMeaningfulTokens(targetName);
        const cTokens = new Set(extractMeaningfulTokens(candidate.name));
        if (tTokens.length < 2) return false;
        let matched = 0;
        for (const t of tTokens) {
            if (cTokens.has(t)) matched++;
        }
        return (matched / tTokens.length) >= 0.75;
    }

    async function fetchPrismaDirectOffers(query, targetName, targetEan, refPrice) {
        if (!query || query.length < 3) return [];
        try {
            const url = `https://www.prisma.fi/haku?search=${encodeURIComponent(query)}`;
            const { text: html } = await gmFetch(url);
            const offers = [];
            const seenIds = new Set();
            const cardRx = /data-cnstrc-item-id="([^"]+)"\s+data-cnstrc-item-name="([^"]+)"([\s\S]*?)(?=data-cnstrc-item-id="|<\/ul>)/g;
            let m;
            while ((m = cardRx.exec(html)) !== null) {
                const id = m[1];
                if (seenIds.has(id)) continue;
                seenIds.add(id);
                const name = m[2];
                const block = m[3];
                const hrefMatch = block.match(/data-test-id="product-card-link"\s+href="([^"]+)"/);
                const clubMatch = block.match(/Asiakasomistajahinta<\/span>(?:<!--[\s\S]*?-->|\s)*([0-9]+,[0-9]{2})/);
                const normMatch = block.match(/Hinta ilman S-Etukorttia:<\/span>(?:<!--[\s\S]*?-->|\s)*([0-9]+,[0-9]{2})/);
                const allPrices = [...block.matchAll(/([0-9]+,[0-9]{2})\s*(?:&nbsp;|\u00a0|\s)*€/g)].map(x => parseFloat(x[1].replace(',', '.')));
                const clubPrice = clubMatch ? parseFloat(clubMatch[1].replace(',', '.')) : null;
                const normalPrice = normMatch ? parseFloat(normMatch[1].replace(',', '.')) : null;
                const price = clubPrice || allPrices[0] || null;
                if (!price) continue;

                const prodUrl = hrefMatch ? `https://www.prisma.fi${hrefMatch[1].split('?')[0]}` : url;
                if (!isSameExactProduct({ name, price, url: prodUrl }, targetName, targetEan, refPrice)) continue;

                offers.push({
                    store: 'Prisma',
                    price,
                    totalPrice: price,
                    deliveryFee: 0,
                    url: prodUrl,
                    stockStatus: 'instock',
                    stockLabel: name,
                    isClubOffer: Boolean(clubPrice),
                    clubLabel: clubPrice ? 'Asiakasomistaja' : null,
                    normalPrice: normalPrice || null
                });
                break;
            }
            return offers;
        } catch (_) {
            return [];
        }
    }

    async function fetchKRautaDirectOffers(query, targetName, targetEan, refPrice) {
        if (!query || query.length < 3) return [];
        try {
            const url = `https://www.k-rauta.fi/etsi?query=${encodeURIComponent(query)}`;
            const { text: html } = await gmFetch(url);
            const start = html.indexOf('window.__PRELOADED_STATE__ = ');
            if (start === -1) return [];
            const jsonStart = start + 'window.__PRELOADED_STATE__ = '.length;
            const jsonEnd = html.indexOf('</script>', jsonStart);
            const state = JSON.parse(html.slice(jsonStart, jsonEnd).trim().replace(/;$/, ''));
            const results = state.search?.results || [];
            const prices = state.prices?.ecom || {};
            const offers = [];

            for (const r of results.slice(0, 4)) {
                const pObj = prices[r.ean] || prices[r.id];
                const price = pObj?.price || pObj?.campaignPrice || pObj?.basePrice;
                if (!price) continue;
                const cand = {
                    name: r.name,
                    ean: String(r.ean || r.id || ''),
                    price,
                    url: `https://www.k-rauta.fi/tuote/${r.id || r.ean}`
                };
                if (!isSameExactProduct(cand, targetName, targetEan, refPrice)) continue;
                const isPlussa = pObj?.qualifier === 'PLUSSA' || Boolean(pObj?.loyaltyOnly);
                offers.push({
                    store: 'K-Rauta',
                    price,
                    totalPrice: price,
                    deliveryFee: 0,
                    url: cand.url,
                    stockStatus: 'instock',
                    stockLabel: r.name,
                    isClubOffer: isPlussa,
                    clubLabel: isPlussa ? 'Plussa-etu' : null,
                    normalPrice: pObj?.previousPrice || pObj?.basePrice || null
                });
                break;
            }
            return offers;
        } catch (_) {
            return [];
        }
    }

    async function fetchMotonetDirectOffers(query, targetName, targetEan, refPrice) {
        if (!query || query.length < 3) return [];
        try {
            const url = `https://www.motonet.fi/haku?q=${encodeURIComponent(query)}`;
            const { text: html } = await gmFetch(url);
            const nextIdx = html.indexOf('__NEXT_DATA__');
            if (nextIdx === -1) return [];
            const start = html.indexOf('>', nextIdx) + 1;
            const end = html.indexOf('</script>', start);
            const data = JSON.parse(html.slice(start, end));
            const queries = data.props?.pageProps?.dehydratedState?.queries || [];
            const searchQ = queries.find(q => q.queryKey?.[0] === 'productSearch');
            const products = searchQ?.state?.data?.products || [];
            const offers = [];

            for (const p of products.slice(0, 4)) {
                const price = parsePriceNumber(String(p.price || ''));
                if (!price || !p.name) continue;
                const prodUrl = `https://www.motonet.fi/haku?q=${encodeURIComponent(p.id || p.name)}`;
                if (!isSameExactProduct({ name: p.name, sku: `${p.id || ''} ${p.description || ''}`, price, url: prodUrl }, targetName, targetEan, refPrice)) {
                    continue;
                }
                offers.push({
                    store: 'Motonet',
                    price,
                    totalPrice: price,
                    deliveryFee: 0,
                    url: prodUrl,
                    stockStatus: 'instock',
                    stockLabel: p.name
                });
                break;
            }
            return offers;
        } catch (_) {
            return [];
        }
    }

    async function fetchPuuiloDirectOffers(query, targetName, targetEan, refPrice) {
        if (!query || query.length < 3) return [];
        try {
            let algCfg = getCached('puuilo_algolia_cfg');
            if (!algCfg) {
                const { text: homeHtml } = await gmFetch('https://www.puuilo.fi/');
                const m = homeHtml.match(/window\.algoliaConfig\s*=\s*JSON\.parse\('([^']+)'\)/);
                if (m) {
                    const parsed = JSON.parse(JSON.parse(`"${m[1]}"`));
                    algCfg = {
                        applicationId: parsed.applicationId,
                        apiKey: parsed.apiKey,
                        indexName: parsed.indexName || 'puuilo_fi'
                    };
                    setCached('puuilo_algolia_cfg', algCfg);
                }
            }
            if (!algCfg || !algCfg.applicationId || !algCfg.apiKey) return [];

            const algUrl = `https://${algCfg.applicationId}-dsn.algolia.net/1/indexes/${algCfg.indexName}_products?query=${encodeURIComponent(query)}&hitsPerPage=4&x-algolia-application-id=${encodeURIComponent(algCfg.applicationId)}&x-algolia-api-key=${encodeURIComponent(algCfg.apiKey)}`;
            const { text } = await gmFetch(algUrl, 'application/json');
            const data = JSON.parse(text);
            const hits = data?.hits || [];
            const offers = [];

            for (const h of hits) {
                const price = Number(h.price?.EUR?.default);
                if (!Number.isFinite(price) || price <= 0 || !h.name) continue;
                const cand = {
                    name: h.name,
                    sku: String(h.sku || ''),
                    ean: String(h.ean || ''),
                    price,
                    url: h.url || `https://www.puuilo.fi/catalogsearch/result/?q=${encodeURIComponent(query)}`
                };
                if (!isSameExactProduct(cand, targetName, targetEan, refPrice)) continue;
                offers.push({
                    store: 'Puuilo',
                    price,
                    totalPrice: price,
                    deliveryFee: 0,
                    url: cand.url,
                    stockStatus: h.in_stock ? 'instock' : 'unknown',
                    stockLabel: h.name
                });
                break;
            }
            return offers;
        } catch (_) {
            return [];
        }
    }

    async function fetchTokmanniDirectOffers(query, targetName, targetEan, refPrice) {
        if (!query || query.length < 3) return [];
        try {
            const url = `https://eucs11.ksearchnet.com/cloud-search/n-search/search?ticket=klevu-15488592134928913&term=${encodeURIComponent(query)}&paginationStartsFrom=0&noOfResults=4&responseType=json`;
            const { text } = await gmFetch(url, 'application/json');
            const data = JSON.parse(text);
            const results = data?.result || [];
            const offers = [];

            for (const p of results) {
                const price = parsePriceNumber(String(p.salePrice || p.price || ''));
                if (!price || !p.name) continue;
                // On Tokmanni, p.sku is the 13-digit EAN!
                const cand = {
                    name: p.name,
                    sku: String(p.sku || ''),
                    ean: /^\d{8,14}$/.test(String(p.sku || '')) ? String(p.sku) : null,
                    price,
                    url: p.url || `https://www.tokmanni.fi/search/?q=${encodeURIComponent(query)}`
                };
                if (!isSameExactProduct(cand, targetName, targetEan, refPrice)) continue;
                offers.push({
                    store: 'Tokmanni',
                    price,
                    totalPrice: price,
                    deliveryFee: 0,
                    url: cand.url,
                    stockStatus: p.inStock === 'yes' ? 'instock' : 'unknown',
                    stockLabel: p.name
                });
                break;
            }
            return offers;
        } catch (_) {
            return [];
        }
    }

    async function fetchDirectFinnishRetailers(productInfo, marketProduct, customQuery = null) {
        const targetName = customQuery || marketProduct?.title || productInfo?.name || '';
        const targetEan = customQuery ? (/^\d{8,14}$/.test(customQuery.trim()) ? customQuery.trim() : null) : productInfo?.ean;
        const refPrice = marketProduct?.lowestPrice || productInfo?.currentPrice || null;
        const modelCodes = extractModelCodes(targetName);
        const primaryQuery = targetEan || modelCodes[0] || extractConciseModelQuery(targetName) || targetName;
        const modelOrNameQuery = modelCodes[0] || extractConciseModelQuery(targetName) || primaryQuery;

        if (!primaryQuery || primaryQuery.length < 3) return [];
        const cacheKey = `direct_fi_${primaryQuery.toLowerCase()}_${(modelOrNameQuery || '').toLowerCase()}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const host = location.hostname.toLowerCase();
        try {
            const [prismaOffers, krautaOffers, motonetOffers, puuiloOffers, tokmanniOffers] = await Promise.all([
                !host.includes('prisma.fi')
                    ? fetchPrismaDirectOffers(primaryQuery, targetName, targetEan, refPrice).then(res =>
                        (res.length === 0 && modelOrNameQuery && modelOrNameQuery !== primaryQuery)
                            ? fetchPrismaDirectOffers(modelOrNameQuery, targetName, targetEan, refPrice)
                            : res
                    )
                    : Promise.resolve([]),
                !host.includes('k-rauta.fi')
                    ? fetchKRautaDirectOffers(primaryQuery, targetName, targetEan, refPrice)
                    : Promise.resolve([]),
                !host.includes('motonet.fi')
                    ? fetchMotonetDirectOffers(modelOrNameQuery, targetName, targetEan, refPrice)
                    : Promise.resolve([]),
                !host.includes('puuilo.fi')
                    ? fetchPuuiloDirectOffers(modelOrNameQuery, targetName, targetEan, refPrice)
                    : Promise.resolve([]),
                !host.includes('tokmanni.fi')
                    ? fetchTokmanniDirectOffers(primaryQuery, targetName, targetEan, refPrice)
                    : Promise.resolve([])
            ]);

            const allDirect = [
                ...prismaOffers,
                ...krautaOffers,
                ...motonetOffers,
                ...puuiloOffers,
                ...tokmanniOffers
            ];
            setCached(cacheKey, allDirect);
            return allDirect;
        } catch (_) {
            return [];
        }
    }

    // Live Autocomplete Suggestion Fetcher so users never have to memorize full model names (e.g. typing "dji mini 4" suggests "DJI Mini 4 Pro", or furniture/grocery items)
    async function fetchAutocompleteSuggestions(queryStr) {
        const q = (queryStr || '').trim();
        if (q.length < 2) return [];

        const cacheKey = `ac_${q.toLowerCase()}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        try {
            const cat = detectProductCategory(q);
            const searchUrl = `https://hinta.fi/haku?q=${encodeURIComponent(q)}`;
            const [hintaRes, ikeaRes, rjRes] = await Promise.all([
                gmFetch(searchUrl).catch(() => null),
                cat === 'furniture' ? fetchIkeaFinlandProducts(q) : Promise.resolve([]),
                cat === 'grocery' ? fetchRuohonjuuriProducts(q) : Promise.resolve([])
            ]);

            let results = [];
            if (hintaRes && hintaRes.text) {
                const parsed = parseHintaSearchHtml(hintaRes.text, q, null);
                if (parsed.directProductDoc) {
                    const prod = parseHintaProductDoc(parsed.directProductDoc, hintaRes.finalUrl);
                    if (prod && prod.title && doesItemMatchQueryWords(prod.title, q)) {
                        results.push({
                            name: prod.title,
                            category: '',
                            url: hintaRes.finalUrl,
                            lowestPrice: prod.lowestPrice,
                            storeCount: prod.offers?.length || 1
                        });
                    }
                } else if (parsed.candidates.length > 0) {
                    results.push(...parsed.candidates.filter(c => c.score > 10).slice(0, 6));
                }
            }

            if (ikeaRes.length > 0) {
                results.push(...ikeaRes.slice(0, 4));
            }
            if (rjRes.length > 0) {
                results.push(...rjRes.slice(0, 4));
            }

            results = results.slice(0, 7);
            setCached(cacheKey, results);
            return results;
        } catch (_) {
            return [];
        }
    }

    function parseHintaProductDoc(doc, productUrl) {
        const titleEl = doc.querySelector('.hv-content-hd-h, h1');
        const title = titleEl ? titleEl.textContent.trim() : 'Tuote';

        const priceBoxes = doc.querySelectorAll('.hv-prh_price');
        const lowestPrice = priceBoxes[0] ? parsePriceNumber(priceBoxes[0].textContent) : null;
        const lowestDelivered = priceBoxes[1] ? parsePriceNumber(priceBoxes[1].textContent) : lowestPrice;

        const low30dEl = doc.querySelector('.hv-prh_price-old');
        const low30d = low30dEl ? parsePriceNumber(low30dEl.textContent) : null;

        const offers = [];
        const offerRows = doc.querySelectorAll('table.hv-oft tbody tr.hv-oft-tr');
        offerRows.forEach((row) => {
            const price = parsePriceNumber(row.getAttribute('data-price') || '');
            const totalPrice = parsePriceNumber(row.getAttribute('data-price-total') || '');
            const deliveryFee = parsePriceNumber(row.getAttribute('data-delivery-fee') || '');

            const storeCell = row.querySelector('th.hv--store');
            const storeNameEl = storeCell?.querySelector('.hv-visual-hide') || storeCell;
            const prodCell = row.querySelector('td.hv--product');
            const prodText = prodCell ? prodCell.textContent.trim() : '';
            const storeLinkEl = storeCell?.querySelector('a[href]') || prodCell?.querySelector('a[href]');
            const availEl = row.querySelector('td.hv--availability .hv-aic');

            let stockStatus = 'unknown';
            if (availEl) {
                if (availEl.classList.contains('hv--green')) stockStatus = 'instock';
                else if (availEl.classList.contains('hv--yellow')) stockStatus = 'order';
            }

            const isClubInHinta = /\b(klubi\w*|hh\s*plus|plus[\s-]*hinta|jäsen\w*|mypower|asiakasomistaja\w*|kantishinta)\b/i.test(prodText);
            let clubLabel = null;
            if (isClubInHinta) {
                if (/hh\s*plus|plus[\s-]*hinta/i.test(prodText)) clubLabel = 'HH PLUS';
                else if (/mypower/i.test(prodText)) clubLabel = 'MyPOWER';
                else clubLabel = 'KLUBI';
            }

            if (price) {
                const rawHref = storeLinkEl ? storeLinkEl.getAttribute('href') : '';
                offers.push({
                    store: storeNameEl ? storeNameEl.textContent.trim() : 'Kauppa',
                    price,
                    totalPrice: totalPrice || price,
                    deliveryFee: deliveryFee ?? (totalPrice && price ? Math.max(0, totalPrice - price) : 0),
                    url: rawHref ? (rawHref.startsWith('http') ? rawHref : `https://hinta.fi${rawHref}`) : productUrl,
                    stockStatus,
                    stockLabel: availEl?.getAttribute('title')?.replace(/Saatavuus:\s*/i, '') || '',
                    isClubOffer: isClubInHinta,
                    clubLabel
                });
            }
        });

        offers.sort((a, b) => a.price - b.price);

        const effectiveLowest = offers.length > 0 ? offers[0].price : lowestPrice;
        const effectiveDelivered = offers.length > 0
            ? Math.min(...offers.map(o => o.totalPrice || o.price))
            : lowestDelivered;

        return {
            title,
            url: productUrl,
            lowestPrice: effectiveLowest,
            lowestDelivered: effectiveDelivered,
            low30d,
            offers,
            history: null
        };
    }

    async function fetchProductHistory(productUrl) {
        if (!productUrl) return null;
        const cleanUrl = productUrl.replace(/\?.*$/, '').replace(/\/$/, '');
        const historyUrl = `${cleanUrl}/historia`;
        const cached = getCached(`hist_${historyUrl}`);
        if (cached) return cached;

        try {
            const { text: html } = await gmFetch(historyUrl);
            const match = html.match(/var\s+hvEnvProductHistory\s*=\s*(\{[\s\S]*?\});/);
            if (!match) return null;

            const raw = JSON.parse(match[1]);
            const dataset = raw?.datasets?.[0]?.data;
            const labels = raw?.labels;
            const custom = raw?.custom || {};

            if (!Array.isArray(dataset) || !Array.isArray(labels) || dataset.length < 2) {
                return null;
            }

            const points = [];
            let atlPoint = null;
            let maxPrice = -Infinity;

            for (let i = 0; i < dataset.length; i++) {
                const val = Number(dataset[i]);
                if (!Number.isFinite(val) || val <= 0) continue;

                const rawLabel = labels[i] || '';
                const meta = custom[rawLabel] || {};
                const topOffers = Array.isArray(meta.offers) ? meta.offers.slice(0, 3) : [];
                const bestStore = topOffers[0]?.store || '';

                const pt = {
                    index: points.length,
                    rawLabel,
                    dateStr: formatShortDate(rawLabel, meta.title),
                    fullTitle: meta.title || rawLabel,
                    subtitle: meta.subtitle || '',
                    storeCount: meta.storeCount || '',
                    price: val,
                    bestStore,
                    topOffers
                };

                points.push(pt);
                if (!atlPoint || val < atlPoint.price) {
                    atlPoint = pt;
                }
                if (val > maxPrice) {
                    maxPrice = val;
                }
            }

            if (points.length < 2) return null;

            const result = {
                points,
                atl: atlPoint,
                minPrice: atlPoint.price,
                maxPrice
            };
            setCached(`hist_${historyUrl}`, result);
            return result;
        } catch (_) {
            return null;
        }
    }

    async function fetchProductByUrl(productUrl) {
        const directItem = getCached(`direct_prod_${productUrl}`);
        if (directItem) {
            return {
                title: directItem.name,
                url: directItem.url,
                lowestPrice: directItem.lowestPrice,
                lowestDelivered: directItem.lowestPrice,
                low30d: null,
                offers: [{
                    store: directItem.storeName || 'Kauppa',
                    price: directItem.lowestPrice,
                    totalPrice: directItem.lowestPrice,
                    deliveryFee: 0,
                    url: directItem.url,
                    stockStatus: 'instock',
                    stockLabel: 'Saatavilla verkkokaupassa'
                }],
                history: null
            };
        }

        const cached = getCached(`prod_${productUrl}`);
        if (cached) return cached;

        const prodRes = await gmFetch(productUrl);
        const parser = new DOMParser();
        const prodDoc = parser.parseFromString(prodRes.text, 'text/html');
        const data = parseHintaProductDoc(prodDoc, productUrl);
        data.history = await fetchProductHistory(productUrl);

        setCached(`prod_${productUrl}`, data);
        return data;
    }

    async function fetchMarketComparison(productInfo, customQuery = null) {
        const queriesToTry = customQuery
            ? [{ type: 'Search', value: customQuery }]
            : productInfo.queries;

        let marketResult = null;
        const targetNameForScoring = customQuery || productInfo.name;
        const targetPriceForScoring = customQuery ? null : productInfo.currentPrice;
        const effectiveCategory = customQuery
            ? detectProductCategory(customQuery)
            : (productInfo.category || detectProductCategory(productInfo.name));

        const host = location.hostname.toLowerCase();

        // If user is currently browsing a Hinta.fi product page directly, parse current document directly
        if (!customQuery && host.includes('hinta.fi') && /^\/\d+\b/.test(location.pathname)) {
            const data = parseHintaProductDoc(document, location.href);
            data.history = await fetchProductHistory(location.href);
            marketResult = {
                matchedQuery: { type: 'Hinta.fi', value: data.title },
                product: data,
                alternatives: []
            };
        }

        for (const q of (marketResult ? [] : queriesToTry)) {
            const cacheKey = `search_${q.value.toLowerCase()}`;
            const cachedComp = getCached(cacheKey);
            if (cachedComp) {
                marketResult = cachedComp;
                break;
            }

            const searchUrl = `https://hinta.fi/haku?q=${encodeURIComponent(q.value)}`;
            try {
                const { text: html, finalUrl } = await gmFetch(searchUrl);
                const parsed = parseHintaSearchHtml(html, targetNameForScoring, targetPriceForScoring);

                if (parsed.directProductDoc) {
                    const data = parseHintaProductDoc(parsed.directProductDoc, finalUrl);
                    if (q.type === 'EAN' || customQuery || doesItemMatchQueryWords(data.title, targetNameForScoring)) {
                        data.history = await fetchProductHistory(finalUrl);
                        marketResult = {
                            matchedQuery: q,
                            product: data,
                            alternatives: []
                        };
                        setCached(cacheKey, marketResult);
                        break;
                    }
                }

                const validCandidates = customQuery
                    ? parsed.candidates.filter(c => c.score > -100)
                    : parsed.candidates.filter(c => c.score > 15);

                if (validCandidates.length > 0) {
                    const best = validCandidates[0];
                    const data = await fetchProductByUrl(best.url);
                    marketResult = {
                        matchedQuery: q,
                        product: data,
                        alternatives: validCandidates.slice(0, 6)
                    };
                    setCached(cacheKey, marketResult);
                    break;
                }
            } catch (_) {
                // Continue to next fallback query
            }
        }

        // Supplement with Direct Finnish Retailers that Hinta.fi does NOT index (Prisma, K-Rauta, Puuilo, Motonet, Tokmanni)
        // Strictly verified via isSameExactProduct (EAN / Model code / >=75% word overlap + price guard)
        if (effectiveCategory !== 'furniture' && effectiveCategory !== 'grocery') {
            try {
                const directOffers = await fetchDirectFinnishRetailers(productInfo, marketResult?.product, customQuery);
                if (directOffers.length > 0) {
                    if (marketResult && marketResult.product) {
                        const existingStores = new Set(marketResult.product.offers.map(o => o.store.toLowerCase()));
                        const mergedOffers = [...marketResult.product.offers];
                        for (const dOff of directOffers) {
                            if (!existingStores.has(dOff.store.toLowerCase())) {
                                mergedOffers.push(dOff);
                                existingStores.add(dOff.store.toLowerCase());
                            }
                        }
                        mergedOffers.sort((a, b) => a.price - b.price);
                        marketResult = {
                            ...marketResult,
                            product: {
                                ...marketResult.product,
                                offers: mergedOffers,
                                lowestPrice: mergedOffers[0].price,
                                lowestDelivered: Math.min(...mergedOffers.map(o => o.totalPrice || o.price))
                            }
                        };
                    } else {
                        directOffers.sort((a, b) => a.price - b.price);
                        marketResult = {
                            matchedQuery: { type: 'Suora', value: directOffers[0].stockLabel || targetNameForScoring },
                            product: {
                                title: directOffers[0].stockLabel || targetNameForScoring,
                                url: directOffers[0].url,
                                lowestPrice: directOffers[0].price,
                                lowestDelivered: directOffers[0].price,
                                low30d: null,
                                offers: directOffers,
                                history: null
                            },
                            alternatives: []
                        };
                    }
                }
            } catch (_) {
                // Ignore direct store errors
            }
        }

        // Only use live IKEA Finland (Furniture) or Ruohonjuuri (Groceries/Organic) APIs as a strict fallback when Hinta.fi has no match,
        // and NEVER inject external search items into an existing Hinta.fi product's offers array.
        const primaryQuery = customQuery || extractConciseModelQuery(productInfo.name) || queriesToTry[0]?.value || '';
        if (!marketResult && primaryQuery && (effectiveCategory === 'furniture' || effectiveCategory === 'grocery')) {
            try {
                const [ikeaItems, rjItems] = await Promise.all([
                    (effectiveCategory === 'furniture' && !host.includes('ikea.com'))
                        ? fetchIkeaFinlandProducts(primaryQuery)
                        : Promise.resolve([]),
                    (effectiveCategory === 'grocery' && !host.includes('ruohonjuuri.fi'))
                        ? fetchRuohonjuuriProducts(primaryQuery)
                        : Promise.resolve([])
                ]);
                const extraItems = [...ikeaItems, ...rjItems].filter(item =>
                    doesItemMatchQueryWords(item.name, targetNameForScoring)
                );
                if (extraItems.length > 0) {
                    const extraOffers = extraItems.map(item => ({
                        store: `${item.storeName}: ${item.name.slice(0, 34)}`,
                        price: item.lowestPrice,
                        totalPrice: item.lowestPrice,
                        deliveryFee: 0,
                        url: item.url,
                        stockStatus: 'instock',
                        stockLabel: item.name
                    }));

                    const bestExtra = extraItems[0];
                    marketResult = {
                        matchedQuery: { type: effectiveCategory === 'furniture' ? 'IKEA' : 'Grocery', value: primaryQuery },
                        product: {
                            title: bestExtra.name,
                            url: bestExtra.url,
                            lowestPrice: Math.min(...extraOffers.map(o => o.price)),
                            lowestDelivered: Math.min(...extraOffers.map(o => o.price)),
                            low30d: null,
                            offers: extraOffers,
                            history: null
                        },
                        alternatives: extraItems.slice(0, 6)
                    };
                }
            } catch (_) {
                // Ignore supplementary API errors
            }
        }

        const toriData = await fetchToriUsedListings(
            customQuery ? { name: customQuery, isUsedSite: true, category: effectiveCategory } : productInfo,
            marketResult?.product,
            customQuery
        );

        if (!marketResult && (!toriData || toriData.items.length === 0)) {
            return null;
        }

        return {
            matchedQuery: marketResult?.matchedQuery || (customQuery ? { type: 'Search', value: customQuery } : null),
            product: marketResult?.product || null,
            alternatives: marketResult?.alternatives || [],
            tori: toriData
        };
    }

    // =========================================================================
    // FILTERED OFFERS & VERDICT EVALUATION (WITH CLUB OFFER SUPPORT)
    // =========================================================================
    function getFilteredOffersAndLowest(marketProduct, includeShipping, inStockOnly, productInfo = null) {
        if (!marketProduct) {
            return { offers: [], lowestPrice: null, cheapestOffer: null, lowestNonClubPrice: null, lowestNonClubOffer: null };
        }

        const currentStoreObj = detectCurrentStore();
        const currentStoreName = currentStoreObj.name.toLowerCase().replace(/\.(fi|com|de).*$/, '');
        const pageClub = productInfo?.clubOffer || null;

        let offers = Array.isArray(marketProduct.offers)
            ? marketProduct.offers.map(o => {
                const clone = { ...o };
                // Cross-reference with on-page Club price (e.g. HobbyHall 819,00 € HH PLUS vs 1 295,39 € Normaalihinta)
                if (
                    pageClub &&
                    !productInfo?.isUsedSite &&
                    clone.store.toLowerCase().includes(currentStoreName) &&
                    Math.abs(clone.price - pageClub.clubPrice) <= 2.0
                ) {
                    clone.isClubOffer = true;
                    clone.clubLabel = pageClub.clubLabel || 'KLUBI';
                    clone.normalPrice = pageClub.normalPrice || null;
                }
                return clone;
            })
            : [];

        // If the current retail store (e.g. Prisma, Bauhaus, Jula, Puuilo, Motonet, K-Rauta) is not indexed by Hinta.fi,
        // inject the current page's live price into the offers list so it appears in "Uutena kaupoissa"
        if (
            productInfo &&
            !productInfo.isUsedSite &&
            !currentStoreObj.match.includes('hinta.fi') &&
            Number.isFinite(productInfo.currentPrice) &&
            productInfo.currentPrice > 0 &&
            !offers.some(o => o.store.toLowerCase().includes(currentStoreName))
        ) {
            offers.push({
                store: currentStoreObj.name,
                price: productInfo.currentPrice,
                totalPrice: productInfo.currentPrice,
                deliveryFee: 0,
                url: location.href,
                stockStatus: 'instock',
                stockLabel: productInfo.name || '',
                isClubOffer: Boolean(pageClub),
                clubLabel: pageClub?.clubLabel || null,
                normalPrice: pageClub?.normalPrice || null
            });
        }

        if (inStockOnly) {
            const inStockList = offers.filter(o => o.stockStatus === 'instock');
            if (inStockList.length > 0) {
                offers = inStockList;
            }
        }

        offers.sort((a, b) => {
            const pa = includeShipping ? (a.totalPrice || a.price) : a.price;
            const pb = includeShipping ? (b.totalPrice || b.price) : b.price;
            return pa - pb;
        });

        const cheapestOffer = offers[0] || null;
        const lowestPrice = cheapestOffer
            ? (includeShipping ? (cheapestOffer.totalPrice || cheapestOffer.price) : cheapestOffer.price)
            : (includeShipping ? marketProduct.lowestDelivered : marketProduct.lowestPrice);

        const nonClubOffers = offers.filter(o => !o.isClubOffer);
        const lowestNonClubOffer = nonClubOffers[0] || null;
        const lowestNonClubPrice = lowestNonClubOffer
            ? (includeShipping ? (lowestNonClubOffer.totalPrice || lowestNonClubOffer.price) : lowestNonClubOffer.price)
            : null;

        return { offers, lowestPrice, cheapestOffer, lowestNonClubPrice, lowestNonClubOffer };
    }

    function evaluatePriceVerdict(currentPrice, marketLowest, lang = detectLanguage(), isUsedSite = false, clubOffer = null, lowestNonClubPrice = null, lowestNonClubStore = null, productInfo = null, toriStats = null) {
        const themes = getStatusThemes(lang, isUsedSite);
        const t = I18N[lang] || I18N.fi;

        // If brand-new marketLowest is unavailable, check Tori.fi median (for used furniture/items) or Unit Price (€/kg, €/l for groceries)
        if (!currentPrice || !marketLowest) {
            if (currentPrice && isUsedSite && toriStats?.medianPrice) {
                const diffEur = currentPrice - toriStats.medianPrice;
                const diffPct = (diffEur / toriStats.medianPrice) * 100;
                const baseTheme = diffPct <= -12 ? themes.green : (diffPct <= 10 ? themes.yellow : themes.red);
                return {
                    theme: {
                        ...baseTheme,
                        sublabel: lang === 'en'
                            ? `Compared to Tori.fi median (${formatEur(toriStats.medianPrice, 0)})`
                            : `Verrattuna Torin mediaalihintaan (${formatEur(toriStats.medianPrice, 0)})`
                    },
                    diffEur,
                    diffPct,
                    isUsedSite: true
                };
            }
            if (productInfo?.unitPriceInfo) {
                const u = productInfo.unitPriceInfo;
                return {
                    theme: {
                        ...themes.neutral,
                        icon: '⚖️',
                        label: lang === 'en' ? `UNIT PRICE: ${u.formatted}` : `YKSIKKÖHINTA: ${u.formatted}`,
                        sublabel: lang === 'en'
                            ? `Calculated from package (${u.quantityStr || 'unit'}) • Compare groceries below`
                            : `Laskettu pakkauskoosta (${u.quantityStr || 'yksikkö'}) • Vertaa ruokakauppoja alta`
                    },
                    diffEur: null,
                    diffPct: null,
                    isUsedSite: false,
                    isUnitPriceVerdict: true
                };
            }
            if (currentPrice && !isUsedSite && toriStats?.minPrice) {
                const savePct = Math.round(((currentPrice - toriStats.minPrice) / currentPrice) * 100);
                return {
                    theme: {
                        ...themes.neutral,
                        icon: '♻️',
                        label: lang === 'en'
                            ? `USED ON TORI.FI FROM ${formatEur(toriStats.minPrice, 0)}`
                            : `TORISSA KÄYTETTYNÄ ALK. ${formatEur(toriStats.minPrice, 0)}`,
                        sublabel: savePct > 5
                            ? (lang === 'en'
                                ? `Save up to ${savePct}% used on Tori.fi (Median: ${formatEur(toriStats.medianPrice, 0)})`
                                : `Säästä jopa ${savePct}% käytettynä Torista (Mediaani: ${formatEur(toriStats.medianPrice, 0)})`)
                            : (lang === 'en'
                                ? `Tori.fi median price: ${formatEur(toriStats.medianPrice, 0)}`
                                : `Tori.fi mediaanihinta: ${formatEur(toriStats.medianPrice, 0)}`)
                    },
                    diffEur: null,
                    diffPct: null,
                    isUsedSite: false
                };
            }
            return {
                theme: themes.neutral,
                diffEur: null,
                diffPct: null,
                isUsedSite
            };
        }

        const diffEur = currentPrice - marketLowest;
        const diffPct = (diffEur / marketLowest) * 100;

        if (isUsedSite) {
            const discountPct = -diffPct;
            if (discountPct >= CONFIG.usedCheapDiscountPct) {
                return { theme: themes.green, diffEur, diffPct, isUsedSite: true };
            }
            if (discountPct >= CONFIG.usedOkDiscountPct) {
                return { theme: themes.yellow, diffEur, diffPct, isUsedSite: true };
            }
            return { theme: themes.red, diffEur, diffPct, isUsedSite: true };
        }

        // Special Club / Loyalty Deal Verdict (e.g. HobbyHall HH PLUS 819 € vs Normal 1 295,39 €)
        if (clubOffer && clubOffer.clubPrice && clubOffer.normalPrice && clubOffer.normalPrice > clubOffer.clubPrice + 1) {
            const clubDiffEur = clubOffer.clubPrice - marketLowest;
            const clubDiffPct = (clubDiffEur / marketLowest) * 100;
            if (clubDiffEur <= CONFIG.cheapMaxEur || clubDiffPct <= CONFIG.okMaxPct) {
                const clubTheme = {
                    ...themes.club,
                    label: t.clubBadgeLabel(clubOffer.clubLabel),
                    sublabel: t.clubCheapestSub(
                        formatEur(clubOffer.normalPrice),
                        lowestNonClubPrice ? formatEur(lowestNonClubPrice) : null,
                        lowestNonClubStore || 'Hinta.fi'
                    )
                };
                return {
                    theme: clubTheme,
                    diffEur: clubDiffEur,
                    diffPct: clubDiffPct,
                    isUsedSite: false,
                    isClubVerdict: true,
                    clubOffer
                };
            }
        }

        if (diffEur <= CONFIG.cheapMaxEur || diffPct <= CONFIG.cheapMaxPct) {
            return { theme: themes.green, diffEur, diffPct, isUsedSite: false };
        }

        if (diffPct <= CONFIG.okMaxPct) {
            return { theme: themes.yellow, diffEur, diffPct, isUsedSite: false };
        }

        return { theme: themes.red, diffEur, diffPct, isUsedSite: false };
    }

    // =========================================================================
    // ON-PAGE PRICE COLORING & INLINE BADGE (WRAP-SAFE + CLUB DEAL AWARE)
    // =========================================================================
    function createInlineBadgeElement(text, theme, href) {
        const badge = document.createElement('a');
        badge.className = 'ufhpc-inline-price-badge';
        badge.href = href || '#';
        badge.target = '_blank';
        badge.rel = 'noopener noreferrer';
        badge.title = 'Hinta.fi';
        badge.style.cssText = `
            display: inline-flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            gap: 5px !important;
            margin: 6px 0 4px 0 !important;
            padding: 5px 10px !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            border-radius: 10px !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif !important;
            font-size: 11.5px !important;
            font-weight: 700 !important;
            line-height: 1.35 !important;
            letter-spacing: 0.01em !important;
            color: ${theme.textBright} !important;
            background: #11131a !important;
            background-image: linear-gradient(135deg, ${theme.bgSoft}, rgba(17, 19, 26, 0.96)) !important;
            border: 1px solid ${theme.border} !important;
            box-shadow: ${theme.glow}, 0 4px 12px rgba(0, 0, 0, 0.35) !important;
            text-decoration: none !important;
            vertical-align: middle !important;
            cursor: pointer !important;
            z-index: 9999 !important;
            white-space: normal !important;
            word-break: break-word !important;
        `;
        badge.textContent = text;
        return badge;
    }

    function applyOnPagePriceAnnotation(priceElement, verdict, marketProduct, lang = detectLanguage(), includeShipping = false, inStockOnly = false, productInfo = null) {
        document.querySelectorAll('.ufhpc-inline-price-badge').forEach(el => el.remove());

        if (!priceElement || !priceElement.isConnected || !verdict) {
            return;
        }

        // If on a grocery page with a calculated unit price (€/kg or €/l), inject an inline unit-price badge
        if (verdict.isUnitPriceVerdict && productInfo?.unitPriceInfo) {
            const u = productInfo.unitPriceInfo;
            const qEnc = encodeURIComponent(extractConciseModelQuery(productInfo.name) || productInfo.name || '');
            const unitBadgeText = `⚖️ ${u.formatted}${u.quantityStr ? ` (${u.quantityStr})` : ''} • Vertaa S-kaupat ↗`;
            const unitBadge = createInlineBadgeElement(unitBadgeText, verdict.theme, `https://www.s-kaupat.fi/haku?q=${qEnc}`);
            if (priceElement.parentNode) {
                priceElement.insertAdjacentElement('afterend', unitBadge);
            }
            return;
        }

        if (verdict.theme.id === 'neutral') {
            return;
        }

        const t = I18N[lang] || I18N.fi;
        const themes = getStatusThemes(lang, verdict.isUsedSite);
        const { theme, diffEur, diffPct, isUsedSite } = verdict;
        const { lowestPrice, cheapestOffer, lowestNonClubPrice, lowestNonClubOffer } = getFilteredOffersAndLowest(
            marketProduct,
            includeShipping,
            inStockOnly,
            productInfo
        );
        const cheapestStore = cheapestOffer ? cheapestOffer.store : 'Hinta.fi';
        const lowestFormatted = formatEur(lowestPrice);
        const clubOffer = productInfo?.clubOffer;

        // If the page has BOTH a Club price (e.g. HH PLUS 819 €) and a Normal price (1 295,39 €), annotate both!
        if (clubOffer && clubOffer.clubElement && clubOffer.normalPrice && clubOffer.normalPrice > clubOffer.clubPrice + 1) {
            const clubEl = clubOffer.clubElement;
            const normEl = clubOffer.normalElement;

            clubEl.style.setProperty('color', theme.color, 'important');
            clubEl.style.setProperty('transition', 'color 0.25s ease, text-shadow 0.25s ease', 'important');
            clubEl.style.setProperty('text-shadow', `0 0 18px ${theme.bgSoft}`, 'important');

            const clubBadgeText = t.inlineClubCheapest(
                clubOffer.clubLabel,
                formatEur(clubOffer.clubPrice),
                lowestNonClubPrice ? formatEur(lowestNonClubPrice) : null,
                lowestNonClubOffer ? lowestNonClubOffer.store : null
            );
            const clubBadge = createInlineBadgeElement(clubBadgeText, theme, marketProduct?.url);
            if (clubEl.parentNode) {
                clubEl.insertAdjacentElement('afterend', clubBadge);
            }

            if (normEl && normEl !== clubEl && normEl.isConnected) {
                const refLow = lowestNonClubPrice || lowestPrice;
                const refStore = lowestNonClubOffer?.store || cheapestStore;
                if (refLow && clubOffer.normalPrice > refLow + 3) {
                    const normDiff = clubOffer.normalPrice - refLow;
                    const normPct = (normDiff / refLow) * 100;
                    normEl.style.setProperty('color', themes.red.color, 'important');
                    const normBadgeText = `${themes.red.icon} ${t.inlineClubNormalWarn(
                        formatEur(normDiff),
                        normPct.toFixed(1),
                        formatEur(refLow),
                        refStore
                    )}`;
                    const normBadge = createInlineBadgeElement(normBadgeText, themes.red, marketProduct?.url);
                    if (normEl.parentNode) {
                        normEl.insertAdjacentElement('afterend', normBadge);
                    }
                }
            }
            return;
        }

        priceElement.style.setProperty('color', theme.color, 'important');
        priceElement.style.setProperty('transition', 'color 0.25s ease, text-shadow 0.25s ease', 'important');
        priceElement.style.setProperty('text-shadow', `0 0 18px ${theme.bgSoft}`, 'important');

        let badgeText = '';
        if (isUsedSite) {
            if (theme.id === 'green') {
                badgeText = `${theme.icon} ${t.inlineUsedGood(formatEur(diffEur), diffPct.toFixed(1), lowestFormatted, cheapestStore)}`;
            } else if (theme.id === 'yellow') {
                badgeText = `${theme.icon} ${t.inlineUsedOk(formatEur(diffEur), diffPct.toFixed(1), lowestFormatted, cheapestStore)}`;
            } else {
                badgeText = `${theme.icon} ${t.inlineUsedBad(lowestFormatted, cheapestStore)}`;
            }
        } else {
            if (theme.id === 'green') {
                if (diffEur <= 0.05) {
                    badgeText = `${theme.icon} ${t.inlineCheapest(lowestFormatted)}`;
                } else {
                    badgeText = `${theme.icon} ${t.inlineCheap(formatEur(diffEur), lowestFormatted)}`;
                }
            } else if (theme.id === 'yellow') {
                badgeText = `${theme.icon} ${t.inlineOk(formatEur(diffEur), diffPct.toFixed(1), cheapestStore, lowestFormatted)}`;
            } else {
                badgeText = `${theme.icon} ${t.inlineExpensive(formatEur(diffEur), diffPct.toFixed(1), lowestFormatted, cheapestStore)}`;
            }
        }

        const badge = createInlineBadgeElement(badgeText, theme, marketProduct?.url);
        if (priceElement.parentNode) {
            priceElement.insertAdjacentElement('afterend', badge);
        }
    }

    // =========================================================================
    // DUAL INTERACTIVE SVG CHARTS (SUPPORTS PRIMARY & COMPARE COLUMNS)
    // =========================================================================
    function buildDualChartSectionHtml(history, toriData, currentPrice, lowestNewPrice, theme, lang, activeTab, prefix = 'main') {
        const hasNewChart = Boolean(history && Array.isArray(history.points) && history.points.length >= 2);
        const hasToriChart = Boolean(toriData && Array.isArray(toriData.items) && toriData.items.length >= 2);

        if (!hasNewChart && !hasToriChart) return '';

        const effectiveTab = (activeTab === 'tori' && hasToriChart)
            ? 'tori'
            : (hasNewChart ? 'new' : 'tori');

        const t = I18N[lang] || I18N.fi;
        const width = 308;
        const height = 98;
        const padLeft = 8;
        const padRight = 8;
        const padTop = 13;
        const padBottom = 15;
        const plotW = width - padLeft - padRight;
        const plotH = height - padTop - padBottom;

        const tabSwitcherHtml = (hasNewChart && hasToriChart) ? `
            <div class="ufhpc-chart-tabs">
                <button type="button" class="ufhpc-chart-tab ${effectiveTab === 'new' ? 'is-active' : ''}" data-tab="new">
                    ${escapeHtml(t.chartTabNew)}
                </button>
                <button type="button" class="ufhpc-chart-tab ${effectiveTab === 'tori' ? 'is-active-tori' : ''}" data-tab="tori">
                    ${escapeHtml(t.chartTabTori)} (${toriData.items.length})
                </button>
            </div>
        ` : '';

        if (effectiveTab === 'new') {
            const pts = history.points;
            const allVals = pts.map(p => p.price);
            if (currentPrice && Number.isFinite(currentPrice)) allVals.push(currentPrice);

            const minVal = Math.min(...allVals) * 0.96;
            const maxVal = Math.max(...allVals) * 1.04;
            const valSpan = Math.max(1, maxVal - minVal);

            const coords = pts.map((p, idx) => {
                const x = padLeft + (idx / (pts.length - 1)) * plotW;
                const y = padTop + plotH - ((p.price - minVal) / valSpan) * plotH;
                return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), pt: p };
            });

            const linePoints = coords.map(c => `${c.x},${c.y}`).join(' ');
            const areaPoints = `${coords[0].x},${padTop + plotH} ${linePoints} ${coords[coords.length - 1].x},${padTop + plotH}`;
            const atlCoord = coords.reduce((best, c) => (c.pt.price < best.pt.price ? c : best), coords[0]);
            const currentY = currentPrice
                ? Number((padTop + plotH - ((currentPrice - minVal) / valSpan) * plotH).toFixed(1))
                : null;

            const defaultAtlText = t.chartAtl(
                formatEur(history.atl.price),
                history.atl.bestStore,
                history.atl.dateStr
            );

            return `
                <div class="ufhpc-chart-box" id="ufhpc-chart-box-${prefix}" data-mode="new">
                    <div class="ufhpc-chart-header">
                        <span class="ufhpc-chart-title" id="ufhpc-chart-date-${prefix}">${escapeHtml(t.chartTitle)} (${pts[0].dateStr} – ${pts[pts.length - 1].dateStr})</span>
                        <span class="ufhpc-chart-price" id="ufhpc-chart-val-${prefix}">${formatEur(pts[pts.length - 1].price)}</span>
                    </div>
                    <div class="ufhpc-chart-sub" id="ufhpc-chart-sub-${prefix}">${escapeHtml(defaultAtlText)}</div>
                    ${tabSwitcherHtml}
                    <div class="ufhpc-svg-wrap">
                        <svg class="ufhpc-svg" id="ufhpc-chart-svg-${prefix}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="ufhpc-area-grad-${prefix}" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stop-color="#10b981" stop-opacity="0.38"/>
                                    <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                                </linearGradient>
                            </defs>
                            <line x1="${padLeft}" y1="${padTop}" x2="${width - padRight}" y2="${padTop}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                            <line x1="${padLeft}" y1="${padTop + plotH}" x2="${width - padRight}" y2="${padTop + plotH}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                            ${currentY !== null ? `
                                <line x1="${padLeft}" y1="${currentY}" x2="${width - padRight}" y2="${currentY}"
                                      stroke="${theme.color}" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.85"/>
                            ` : ''}
                            <polygon points="${areaPoints}" fill="url(#ufhpc-area-grad-${prefix})"/>
                            <polyline points="${linePoints}" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <circle cx="${atlCoord.x}" cy="${atlCoord.y}" r="3.5" fill="#34d399" stroke="#0f1118" stroke-width="1.5"/>
                            <line id="ufhpc-hover-line-${prefix}" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}"
                                  stroke="rgba(255,255,255,0.45)" stroke-width="1" stroke-dasharray="2,2" visibility="hidden"/>
                            <circle id="ufhpc-hover-dot-${prefix}" cx="0" cy="0" r="4.5"
                                    fill="#ffffff" stroke="#10b981" stroke-width="2.5" visibility="hidden"/>
                        </svg>
                    </div>
                </div>
            `;
        }

        const chronoItems = [...toriData.items].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        const allVals = chronoItems.map(i => i.price);
        if (lowestNewPrice && Number.isFinite(lowestNewPrice)) allVals.push(lowestNewPrice);

        const minVal = Math.min(...allVals) * 0.92;
        const maxVal = Math.max(...allVals) * 1.06;
        const valSpan = Math.max(1, maxVal - minVal);

        const coords = chronoItems.map((item, idx) => {
            const x = padLeft + (idx / (chronoItems.length - 1)) * plotW;
            const y = padTop + plotH - ((item.price - minVal) / valSpan) * plotH;
            return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), item };
        });

        const linePoints = coords.map(c => `${c.x},${c.y}`).join(' ');
        const areaPoints = `${coords[0].x},${padTop + plotH} ${linePoints} ${coords[coords.length - 1].x},${padTop + plotH}`;

        const newPriceY = (lowestNewPrice && Number.isFinite(lowestNewPrice))
            ? Number((padTop + plotH - ((lowestNewPrice - minVal) / valSpan) * plotH).toFixed(1))
            : null;

        const stats = toriData.stats;
        const defaultStatsText = stats
            ? t.toriChartStats(formatEur(stats.minPrice, 0), formatEur(stats.avgPrice, 0), formatEur(stats.medianPrice, 0))
            : t.toriChartClickHint;

        return `
            <div class="ufhpc-chart-box" id="ufhpc-chart-box-${prefix}" data-mode="tori">
                <div class="ufhpc-chart-header">
                    <span class="ufhpc-chart-title" id="ufhpc-chart-date-${prefix}">${escapeHtml(t.toriChartTitle(chronoItems.length))}</span>
                    <span class="ufhpc-chart-price is-tori" id="ufhpc-chart-val-${prefix}">${formatEur(stats?.medianPrice || chronoItems[0].price, 0)}</span>
                </div>
                <div class="ufhpc-chart-sub" id="ufhpc-chart-sub-${prefix}">${escapeHtml(defaultStatsText)}</div>
                ${tabSwitcherHtml}
                <div class="ufhpc-svg-wrap">
                    <svg class="ufhpc-svg" id="ufhpc-chart-svg-${prefix}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="ufhpc-tori-grad-${prefix}" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.38"/>
                                <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <line x1="${padLeft}" y1="${padTop}" x2="${width - padRight}" y2="${padTop}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
                        <line x1="${padLeft}" y1="${padTop + plotH}" x2="${width - padRight}" y2="${padTop + plotH}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
                        ${newPriceY !== null ? `
                            <line x1="${padLeft}" y1="${newPriceY}" x2="${width - padRight}" y2="${newPriceY}"
                                  stroke="#10b981" stroke-width="1.2" stroke-dasharray="3,3" opacity="0.85"/>
                        ` : ''}
                        <polygon points="${areaPoints}" fill="url(#ufhpc-tori-grad-${prefix})"/>
                        <polyline points="${linePoints}" fill="none" stroke="#fb7185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        ${coords.map(c => `
                            <circle cx="${c.x}" cy="${c.y}" r="2.8" fill="${c.item.hasToriDiili ? '#fda4af' : '#fb7185'}" stroke="#0f1118" stroke-width="1.2"/>
                        `).join('')}
                        <line id="ufhpc-hover-line-${prefix}" x1="0" y1="${padTop}" x2="0" y2="${padTop + plotH}"
                              stroke="rgba(255,255,255,0.45)" stroke-width="1" stroke-dasharray="2,2" visibility="hidden"/>
                        <circle id="ufhpc-hover-dot-${prefix}" cx="0" cy="0" r="4.8"
                                fill="#ffffff" stroke="#f43f5e" stroke-width="2.5" visibility="hidden"/>
                    </svg>
                </div>
            </div>
        `;
    }

    // =========================================================================
    // HIGH-END SIDEBAR UI (EXPANDABLE TO 2-COLUMN SIDE-BY-SIDE COMPARE VIEW)
    // =========================================================================
    function createSidebarStyles() {
        return `
            :host {
                all: initial;
                color-scheme: dark;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
                color: #f3f4f6;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            .ufhpc-wrapper {
                position: fixed;
                top: var(--sidebar-top, 50%);
                right: 0;
                transform: translateY(-50%);
                z-index: 2147483647;
                display: flex;
                align-items: center;
                transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
                user-select: none;
            }
            .ufhpc-wrapper.is-collapsed {
                transform: translate(calc(100% - 42px), -50%);
            }

            /* Side Handle / Draggable Edge Tab */
            .ufhpc-handle {
                width: 42px;
                min-height: 162px;
                background: rgba(15, 17, 24, 0.96);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-right: none;
                border-radius: 14px 0 0 14px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                padding: 12px 6px;
                cursor: grab;
                box-shadow: -6px 0 24px rgba(0, 0, 0, 0.45);
                position: relative;
                overflow: hidden;
                transition: background 0.2s ease, border-color 0.2s ease;
            }
            .ufhpc-handle:active {
                cursor: grabbing;
            }
            .ufhpc-handle:hover {
                background: rgba(24, 27, 38, 0.98);
            }
            .ufhpc-handle-bar {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: var(--status-color, #6366f1);
                box-shadow: 0 0 12px var(--status-color, #6366f1);
            }
            .ufhpc-handle-icon {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                font-weight: 800;
                background: var(--status-bg, rgba(99, 102, 241, 0.18));
                color: var(--status-bright, #818cf8);
                border: 1px solid var(--status-border, rgba(99, 102, 241, 0.4));
            }
            .ufhpc-handle-text {
                writing-mode: vertical-rl;
                transform: rotate(180deg);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                color: #e5e7eb;
                white-space: nowrap;
                margin: 8px 0;
            }
            .ufhpc-handle-chevron {
                font-size: 11px;
                color: #9ca3af;
                transition: transform 0.3s ease;
            }
            .ufhpc-wrapper.is-collapsed .ufhpc-handle-chevron {
                transform: rotate(180deg);
            }

            /* Main Sidebar Panel (358px standard, 700px when expanded for side-by-side comparison) */
            .ufhpc-panel {
                width: 358px;
                max-width: calc(100vw - 54px);
                max-height: 92vh;
                overflow-y: auto;
                background: rgba(14, 16, 23, 0.96);
                backdrop-filter: blur(22px);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-right: none;
                border-radius: 16px 0 0 16px;
                box-shadow: -16px 0 45px rgba(0, 0, 0, 0.65);
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 11px;
                color: #f3f4f6;
                transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .ufhpc-panel.is-expanded {
                width: 700px;
            }
            .ufhpc-panel::-webkit-scrollbar {
                width: 5px;
            }
            .ufhpc-panel::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.18);
                border-radius: 4px;
            }

            /* 2-Column Grid for Expanded Compare View */
            .ufhpc-columns {
                display: grid;
                grid-template-columns: 1fr;
                gap: 14px;
            }
            .ufhpc-panel.is-expanded .ufhpc-columns {
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            }
            .ufhpc-col {
                display: flex;
                flex-direction: column;
                gap: 10px;
                min-width: 0;
            }
            .ufhpc-col-compare {
                border-left: 1px solid rgba(255, 255, 255, 0.1);
                padding-left: 14px;
            }

            /* Top Header */
            .ufhpc-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 8px;
            }
            .ufhpc-brand {
                display: flex;
                flex-direction: column;
                gap: 2px;
                min-width: 0;
            }
            .ufhpc-brand-top {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 5px;
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                color: #9ca3af;
            }
            .ufhpc-product-title {
                font-size: 13px;
                font-weight: 600;
                color: #f9fafb;
                line-height: 1.35;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                user-select: text;
            }
            .ufhpc-header-btns {
                display: flex;
                align-items: center;
                gap: 5px;
                flex-shrink: 0;
            }
            .ufhpc-icon-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #9ca3af;
                height: 25px;
                padding: 0 8px;
                border-radius: 7px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10.5px;
                font-weight: 700;
                transition: all 0.15s ease;
                white-space: nowrap;
            }
            .ufhpc-icon-btn:hover {
                background: rgba(255, 255, 255, 0.14);
                color: #ffffff;
            }
            .ufhpc-icon-btn.is-active-compare {
                background: rgba(99, 102, 241, 0.22);
                color: #a5b4fc;
                border-color: rgba(99, 102, 241, 0.5);
            }

            /* Suggestion Chips for Quick Model Comparison (e.g. DJI Mini 4 Pro) */
            .ufhpc-chips {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            .ufhpc-chip {
                background: rgba(99, 102, 241, 0.14);
                border: 1px solid rgba(99, 102, 241, 0.35);
                color: #a5b4fc;
                font-size: 10.5px;
                font-weight: 600;
                padding: 3px 8px;
                border-radius: 999px;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .ufhpc-chip:hover {
                background: rgba(99, 102, 241, 0.28);
                color: #ffffff;
            }
            @keyframes ufhpc-update-pulse {
                0%, 100% { box-shadow: 0 0 10px rgba(16, 185, 129, 0.35); }
                50% { box-shadow: 0 0 22px rgba(16, 185, 129, 0.75); }
            }
            .ufhpc-ver-link {
                display: inline-flex;
                align-items: center;
                gap: 3px;
                white-space: nowrap;
                flex-shrink: 0;
                color: #818cf8;
                text-decoration: none;
                padding: 2px 6px;
                border-radius: 5px;
                background: rgba(99, 102, 241, 0.14);
                border: 1px solid rgba(99, 102, 241, 0.3);
                transition: all 0.15s ease;
                cursor: pointer;
                font-size: 9.5px;
                font-weight: 800;
                letter-spacing: 0.04em;
            }
            .ufhpc-ver-link:hover {
                background: rgba(99, 102, 241, 0.3);
                color: #ffffff;
            }
            .ufhpc-ver-link.has-update {
                background: rgba(16, 185, 129, 0.25);
                border-color: #34d399;
                color: #6ee7b7;
                animation: ufhpc-update-pulse 2s infinite;
            }
            .ufhpc-ver-link.is-up-to-date {
                background: rgba(16, 185, 129, 0.2);
                border-color: rgba(52, 211, 153, 0.5);
                color: #34d399;
            }
            .ufhpc-handle-update-badge {
                position: absolute;
                top: 4px;
                right: 4px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #10b981;
                border: 2px solid #0f1118;
                box-shadow: 0 0 10px #10b981;
                animation: ufhpc-update-pulse 1.6s infinite;
            }
            .ufhpc-update-banner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 9px 12px;
                border-radius: 10px;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.26), rgba(59, 130, 246, 0.24));
                border: 1px solid #34d399;
                box-shadow: 0 0 18px rgba(16, 185, 129, 0.35);
                color: #ecfdf5;
                font-size: 11.5px;
                font-weight: 700;
                text-decoration: none;
                transition: all 0.15s ease;
                animation: ufhpc-update-pulse 2.2s infinite;
            }
            .ufhpc-update-banner:hover {
                border-color: #6ee7b7;
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.38), rgba(59, 130, 246, 0.36));
                transform: translateY(-1px);
            }
            .ufhpc-update-banner-cta {
                background: #10b981;
                color: #06281e;
                padding: 3px 8px;
                border-radius: 6px;
                font-size: 10.5px;
                font-weight: 800;
                white-space: nowrap;
            }
            .ufhpc-update-toast {
                position: fixed;
                top: 18px;
                right: 18px;
                z-index: 2147483647;
                width: 330px;
                max-width: calc(100vw - 36px);
                background: rgba(14, 17, 26, 0.97);
                backdrop-filter: blur(18px);
                border: 1.5px solid #10b981;
                border-radius: 13px;
                box-shadow: 0 14px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(16, 185, 129, 0.35);
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                color: #f9fafb;
                animation: ufhpc-update-pulse 2.4s infinite;
            }
            .ufhpc-update-toast-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }
            .ufhpc-update-toast-title {
                font-size: 12px;
                font-weight: 800;
                color: #34d399;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .ufhpc-update-toast-close {
                background: transparent;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                font-size: 13px;
                padding: 2px 5px;
                border-radius: 5px;
            }
            .ufhpc-update-toast-close:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.1);
            }
            .ufhpc-update-toast-sub {
                font-size: 11px;
                color: #d1d5db;
                line-height: 1.35;
            }
            .ufhpc-update-toast-actions {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;
            }
            .ufhpc-update-toast-btn {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: linear-gradient(135deg, #10b981, #059669);
                color: #ffffff;
                text-decoration: none;
                font-size: 11px;
                font-weight: 800;
                padding: 6px 12px;
                border-radius: 8px;
                box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
                transition: transform 0.15s ease;
            }
            .ufhpc-update-toast-btn:hover {
                transform: translateY(-1px);
            }

            /* Verdict Banner */
            .ufhpc-verdict-card {
                padding: 10px 13px;
                border-radius: 12px;
                background: var(--status-bg, rgba(99, 102, 241, 0.14));
                border: 1px solid var(--status-border, rgba(99, 102, 241, 0.4));
                box-shadow: var(--status-glow, none);
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            .ufhpc-verdict-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }
            .ufhpc-verdict-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                font-weight: 800;
                letter-spacing: 0.04em;
                color: var(--status-bright, #818cf8);
            }
            .ufhpc-verdict-delta {
                font-size: 11.5px;
                font-weight: 700;
                color: #f9fafb;
                background: rgba(0, 0, 0, 0.35);
                padding: 3px 8px;
                border-radius: 6px;
                white-space: nowrap;
            }
            .ufhpc-verdict-sub {
                font-size: 11px;
                color: #d1d5db;
                line-height: 1.35;
            }

            /* Price Metrics Grid */
            .ufhpc-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            .ufhpc-metric-box {
                background: rgba(255, 255, 255, 0.035);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 9px 11px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .ufhpc-metric-label {
                font-size: 10px;
                font-weight: 600;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 0.04em;
            }
            .ufhpc-metric-value {
                font-size: 15.5px;
                font-weight: 800;
                color: #f9fafb;
                letter-spacing: -0.01em;
            }
            .ufhpc-metric-value.is-colored {
                color: var(--status-bright, #f9fafb);
            }
            .ufhpc-metric-sub {
                font-size: 10px;
                color: #9ca3af;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* Interactive Dual SVG Chart Card */
            .ufhpc-chart-box {
                background: rgba(255, 255, 255, 0.025);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 11px;
                padding: 9px 10px 6px 10px;
                display: flex;
                flex-direction: column;
                gap: 3px;
            }
            .ufhpc-chart-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
            }
            .ufhpc-chart-title {
                font-size: 10.5px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #d1d5db;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .ufhpc-chart-price {
                font-size: 12.5px;
                font-weight: 800;
                color: #34d399;
                flex-shrink: 0;
            }
            .ufhpc-chart-price.is-tori {
                color: #fda4af;
            }
            .ufhpc-chart-sub {
                font-size: 10.5px;
                color: #9ca3af;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-height: 14px;
            }
            .ufhpc-chart-tabs {
                display: flex;
                gap: 5px;
                margin-top: 2px;
            }
            .ufhpc-chart-tab {
                flex: 1;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: #9ca3af;
                font-size: 10px;
                font-weight: 700;
                padding: 3.5px 6px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .ufhpc-chart-tab:hover {
                color: #f3f4f6;
                background: rgba(255, 255, 255, 0.08);
            }
            .ufhpc-chart-tab.is-active {
                background: rgba(16, 185, 129, 0.16);
                color: #34d399;
                border-color: rgba(16, 185, 129, 0.4);
            }
            .ufhpc-chart-tab.is-active-tori {
                background: rgba(244, 63, 94, 0.16);
                color: #fda4af;
                border-color: rgba(244, 63, 94, 0.4);
            }
            .ufhpc-svg-wrap {
                position: relative;
                width: 100%;
                height: 98px;
                margin-top: 2px;
            }
            .ufhpc-svg {
                width: 100%;
                height: 100%;
                display: block;
                cursor: crosshair;
                overflow: visible;
            }

            /* Store List Header & Filter Pills */
            .ufhpc-section-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                margin-top: 2px;
            }
            .ufhpc-section-title {
                font-size: 10.5px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: #9ca3af;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .ufhpc-filters {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .ufhpc-pill-btn {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #9ca3af;
                font-size: 10px;
                font-weight: 600;
                padding: 3px 7px;
                border-radius: 999px;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .ufhpc-pill-btn:hover {
                color: #f3f4f6;
                border-color: rgba(255, 255, 255, 0.22);
            }
            .ufhpc-pill-btn.is-active {
                background: rgba(16, 185, 129, 0.16);
                color: #34d399;
                border-color: rgba(16, 185, 129, 0.45);
            }
            .ufhpc-pill-btn.is-active-tori {
                background: rgba(244, 63, 94, 0.16);
                color: #fb7185;
                border-color: rgba(244, 63, 94, 0.45);
            }

            /* Store Comparison Rows */
            .ufhpc-stores-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .ufhpc-store-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 6.5px 10px;
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.06);
                text-decoration: none;
                color: #e5e7eb;
                transition: all 0.15s ease;
            }
            .ufhpc-store-row:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.18);
                transform: translateX(-2px);
            }
            .ufhpc-store-row.is-current-store {
                border-color: var(--status-border, rgba(99, 102, 241, 0.5));
                background: var(--status-bg, rgba(99, 102, 241, 0.1));
            }
            .ufhpc-store-row.is-club-offer {
                border-color: rgba(192, 132, 252, 0.45);
                background: linear-gradient(90deg, rgba(168, 85, 247, 0.14), rgba(245, 158, 11, 0.06));
            }
            .ufhpc-club-tag {
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
                white-space: nowrap;
                padding: 1px 6px;
                border-radius: 5px;
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 0.03em;
                background: linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(245, 158, 11, 0.25));
                color: #f3e8ff;
                border: 1px solid rgba(192, 132, 252, 0.55);
                box-shadow: 0 0 10px rgba(168, 85, 247, 0.25);
            }
            .ufhpc-nonclub-tag {
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
                white-space: nowrap;
                padding: 1px 5px;
                border-radius: 4px;
                font-size: 8.5px;
                font-weight: 700;
                background: rgba(16, 185, 129, 0.18);
                color: #6ee7b7;
                border: 1px solid rgba(16, 185, 129, 0.35);
            }
            .ufhpc-store-left {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }
            .ufhpc-stock-dot {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                flex-shrink: 0;
                background: #6b7280;
            }
            .ufhpc-stock-dot.instock {
                background: #10b981;
                box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
            }
            .ufhpc-stock-dot.order {
                background: #f59e0b;
            }
            .ufhpc-store-name {
                font-size: 12px;
                font-weight: 600;
                color: #f3f4f6;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .ufhpc-store-right {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                flex-shrink: 0;
            }
            .ufhpc-store-price {
                font-size: 12.5px;
                font-weight: 700;
                color: #ffffff;
            }
            .ufhpc-store-row:first-child .ufhpc-store-price {
                color: #34d399;
            }
            .ufhpc-store-ship {
                font-size: 9.5px;
                color: #9ca3af;
            }

            /* Used on Tori.fi Section */
            .ufhpc-tori-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 6.5px 9px;
                border-radius: 8px;
                background: rgba(244, 63, 94, 0.045);
                border: 1px solid rgba(244, 63, 94, 0.14);
                text-decoration: none;
                color: #e5e7eb;
                transition: all 0.15s ease;
            }
            .ufhpc-tori-row:hover {
                background: rgba(244, 63, 94, 0.1);
                border-color: rgba(244, 63, 94, 0.32);
                transform: translateX(-2px);
            }
            .ufhpc-tori-thumb {
                width: 30px;
                height: 30px;
                border-radius: 6px;
                object-fit: cover;
                background: rgba(255, 255, 255, 0.06);
                flex-shrink: 0;
            }
            .ufhpc-tori-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
                min-width: 0;
                flex: 1;
            }
            .ufhpc-tori-heading {
                font-size: 11.5px;
                font-weight: 600;
                color: #f3f4f6;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .ufhpc-tori-meta {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 9.5px;
                color: #9ca3af;
                min-width: 0;
            }
            .ufhpc-tori-loc {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 0;
            }
            .ufhpc-tori-date {
                flex-shrink: 0;
                white-space: nowrap;
            }
            .ufhpc-tori-tag {
                display: inline-flex;
                align-items: center;
                flex-shrink: 0;
                white-space: nowrap;
                padding: 1px 5px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 700;
                background: rgba(244, 63, 94, 0.2);
                color: #fda4af;
                border: 1px solid rgba(244, 63, 94, 0.35);
            }
            .ufhpc-tori-tag.company {
                background: rgba(59, 130, 246, 0.2);
                color: #93c5fd;
                border-color: rgba(59, 130, 246, 0.35);
            }
            .ufhpc-tori-price {
                font-size: 12.5px;
                font-weight: 800;
                color: #fda4af;
            }

            /* Variant Switcher & Search Box */
            .ufhpc-variant-select {
                width: 100%;
                color-scheme: dark;
                background-color: #161924;
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 7px;
                padding: 6px 8px;
                color: #f3f4f6;
                font-size: 11px;
                font-weight: 500;
                outline: none;
                cursor: pointer;
            }
            .ufhpc-variant-select:focus {
                border-color: #6366f1;
            }
            .ufhpc-variant-select option {
                background-color: #161924;
                color: #f3f4f6;
                padding: 6px;
            }
            .ufhpc-search-wrap {
                position: relative;
                width: 100%;
            }
            .ufhpc-search-box {
                display: flex;
                gap: 6px;
            }
            .ufhpc-search-input {
                flex: 1;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 7px;
                padding: 6px 9px;
                color: #f3f4f6;
                font-size: 11.5px;
                outline: none;
            }
            .ufhpc-search-input:focus {
                border-color: #6366f1;
            }
            .ufhpc-search-btn {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.14);
                color: #e5e7eb;
                border-radius: 7px;
                padding: 0 10px;
                font-size: 11.5px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.15s;
            }
            .ufhpc-search-btn:hover {
                background: rgba(255, 255, 255, 0.16);
            }

            /* Live Autocomplete Dropdown Menu */
            .ufhpc-ac-menu {
                position: absolute;
                left: 0;
                right: 0;
                top: calc(100% + 4px);
                background: #141722;
                border: 1px solid rgba(99, 102, 241, 0.45);
                border-radius: 9px;
                box-shadow: 0 14px 32px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06);
                z-index: 50;
                max-height: 220px;
                overflow-y: auto;
                display: none;
                flex-direction: column;
                padding: 4px;
                gap: 2px;
            }
            .ufhpc-ac-menu.is-upward {
                top: auto;
                bottom: calc(100% + 4px);
            }
            .ufhpc-ac-menu.is-open {
                display: flex;
            }
            .ufhpc-ac-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 6px;
                cursor: pointer;
                background: transparent;
                border: none;
                text-align: left;
                color: #f3f4f6;
                width: 100%;
                transition: background 0.12s ease;
            }
            .ufhpc-ac-item:hover,
            .ufhpc-ac-item.is-highlighted {
                background: rgba(99, 102, 241, 0.22);
            }
            .ufhpc-ac-left {
                display: flex;
                flex-direction: column;
                gap: 1px;
                min-width: 0;
                flex: 1;
            }
            .ufhpc-ac-name {
                font-size: 11.5px;
                font-weight: 600;
                color: #f9fafb;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .ufhpc-ac-meta {
                font-size: 9.5px;
                color: #9ca3af;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .ufhpc-ac-price {
                font-size: 11.5px;
                font-weight: 800;
                color: #34d399;
                flex-shrink: 0;
            }

            /* External Action Buttons */
            .ufhpc-actions {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 6px;
            }
            .ufhpc-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                padding: 7px 6px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
                transition: all 0.15s ease;
                white-space: nowrap;
            }
            .ufhpc-btn-hinta {
                background: rgba(16, 185, 129, 0.14);
                color: #34d399;
                border: 1px solid rgba(16, 185, 129, 0.35);
            }
            .ufhpc-btn-hinta:hover {
                background: rgba(16, 185, 129, 0.24);
            }
            .ufhpc-btn-hintaopas {
                background: rgba(59, 130, 246, 0.14);
                color: #60a5fa;
                border: 1px solid rgba(59, 130, 246, 0.35);
            }
            .ufhpc-btn-hintaopas:hover {
                background: rgba(59, 130, 246, 0.24);
            }
            .ufhpc-btn-tori {
                background: rgba(244, 63, 94, 0.14);
                color: #fb7185;
                border: 1px solid rgba(244, 63, 94, 0.35);
            }
            .ufhpc-btn-tori:hover {
                background: rgba(244, 63, 94, 0.24);
            }

            .ufhpc-empty {
                font-size: 11px;
                color: #9ca3af;
                padding: 8px;
                text-align: center;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
                border: 1px dashed rgba(255, 255, 255, 0.1);
            }
        `;
    }

    function escapeHtml(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function renderToriRowsHtml(items, refPrice, t, maxCount) {
        return items.slice(0, maxCount).map((item) => {
            const savingsPct = refPrice && item.price < refPrice
                ? Math.round(((refPrice - item.price) / refPrice) * 100)
                : null;
            const locParts = String(item.location || '').split(',');
            const shortLocation = locParts.length > 1
                ? locParts[locParts.length - 1].trim()
                : item.location;
            return `
                <a class="ufhpc-tori-row" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(item.title)} — ${escapeHtml(item.location)}">
                    ${item.imageUrl ? `<img class="ufhpc-tori-thumb" src="${escapeHtml(item.imageUrl)}" alt="" loading="lazy" />` : ''}
                    <div class="ufhpc-tori-info">
                        <div class="ufhpc-tori-heading">${escapeHtml(item.title)}</div>
                        <div class="ufhpc-tori-meta">
                            <span class="ufhpc-tori-loc">📍 ${escapeHtml(shortLocation)}</span>
                            ${item.dateStr ? `<span class="ufhpc-tori-date">• ${escapeHtml(item.dateStr)}</span>` : ''}
                            ${item.hasToriDiili ? `<span class="ufhpc-tori-tag">ToriDiili</span>` : ''}
                            ${item.isCompany ? `<span class="ufhpc-tori-tag company">${escapeHtml(t.toriCompany)}</span>` : ''}
                        </div>
                    </div>
                    <div class="ufhpc-store-right">
                        <span class="ufhpc-tori-price">${formatEur(item.price, 0)}</span>
                        ${savingsPct && savingsPct > 0 ? `<span class="ufhpc-store-ship">${escapeHtml(t.toriSavings(savingsPct))}</span>` : ''}
                    </div>
                </a>
            `;
        }).join('');
    }

    class PriceCheckerSidebar {
        constructor() {
            this.hostEl = null;
            this.shadow = null;
            this.wrapperEl = null;
            this.isCollapsed = localStorage.getItem(CONFIG.storageKeyCollapsed) === '1';
            this.isExpanded = localStorage.getItem(CONFIG.storageKeyExpanded) === '1';
            this.lang = detectLanguage();
            this.topPct = parseFloat(localStorage.getItem(CONFIG.storageKeyTopPct)) || 50;
            this.includeShipping = localStorage.getItem(CONFIG.storageKeyIncShip) === '1';
            this.inStockOnly = localStorage.getItem(CONFIG.storageKeyInStock) === '1';
            this.toriDiiliOnly = localStorage.getItem(CONFIG.storageKeyToriDiili) === '1';
            this.chartTab = localStorage.getItem(CONFIG.storageKeyChartTab) || (detectCurrentStore().isUsedSite ? 'tori' : 'new');
            this.lastProductInfo = null;
            this.lastComparison = null;
            this.compareQuery = '';
            this.compareComparison = null;
            this.compareLoading = false;
        }

        mount() {
            const existing = document.getElementById('ufhpc-root');
            if (existing) existing.remove();

            this.hostEl = document.createElement('div');
            this.hostEl.id = 'ufhpc-root';
            this.shadow = this.hostEl.attachShadow({ mode: 'open' });

            const styleEl = document.createElement('style');
            styleEl.textContent = createSidebarStyles();

            this.wrapperEl = document.createElement('div');
            this.wrapperEl.className = `ufhpc-wrapper ${this.isCollapsed ? 'is-collapsed' : ''}`;
            this.wrapperEl.style.setProperty('--sidebar-top', `${this.topPct}%`);

            this.shadow.appendChild(styleEl);
            this.shadow.appendChild(this.wrapperEl);
            document.body.appendChild(this.hostEl);
        }

        setThemeVars(theme) {
            if (!this.wrapperEl) return;
            this.wrapperEl.style.setProperty('--status-color', theme.color);
            this.wrapperEl.style.setProperty('--status-bright', theme.textBright);
            this.wrapperEl.style.setProperty('--status-bg', theme.bgSoft);
            this.wrapperEl.style.setProperty('--status-border', theme.border);
            this.wrapperEl.style.setProperty('--status-glow', theme.glow);
        }

        toggleCollapse() {
            this.isCollapsed = !this.isCollapsed;
            localStorage.setItem(CONFIG.storageKeyCollapsed, this.isCollapsed ? '1' : '0');
            if (this.wrapperEl) {
                this.wrapperEl.classList.toggle('is-collapsed', this.isCollapsed);
            }
        }

        async toggleExpandCompare() {
            this.isExpanded = !this.isExpanded;
            localStorage.setItem(CONFIG.storageKeyExpanded, this.isExpanded ? '1' : '0');

            // If opening Compare Mode for the first time and we have a sibling suggestion (e.g. DJI Mini 4 Pro for DJI Mini 5 Pro), auto-fetch it!
            if (this.isExpanded && !this.compareComparison && !this.compareLoading && this.lastProductInfo) {
                const baseTitle = this.lastComparison?.product?.title || this.lastProductInfo.name || '';
                const suggestions = suggestComparisonQueries(baseTitle);
                if (suggestions.length > 0) {
                    await this.runComparisonQuery(suggestions[0]);
                    return;
                }
            }
            this.refreshView();
        }

        async runComparisonQuery(queryStr) {
            const q = (queryStr || '').trim();
            if (!q || !this.lastProductInfo) return;
            this.compareQuery = q;
            this.compareLoading = true;
            this.refreshView();

            try {
                const compResult = await fetchMarketComparison(this.lastProductInfo, q);
                this.compareComparison = compResult;
                if (compResult?.product?.title) {
                    this.compareQuery = compResult.product.title;
                }
            } catch (_) {
                this.compareComparison = null;
            } finally {
                this.compareLoading = false;
                this.refreshView();
            }
        }

        async runComparisonByUrl(targetUrl, targetName) {
            if (!targetUrl || !this.lastProductInfo) return;
            if (targetName) this.compareQuery = targetName;
            this.compareLoading = true;
            this.refreshView();

            try {
                const newProd = await fetchProductByUrl(targetUrl);
                if (newProd?.title) this.compareQuery = newProd.title;
                const newTori = await fetchToriUsedListings(
                    { name: newProd?.title || targetName, isUsedSite: true },
                    newProd,
                    newProd?.title || targetName
                );
                this.compareComparison = {
                    matchedQuery: { type: 'Select', value: newProd?.title || targetName || '' },
                    product: newProd,
                    alternatives: this.compareComparison?.alternatives || [],
                    tori: newTori
                };
            } catch (_) {
                // Keep previous state on error
            } finally {
                this.compareLoading = false;
                this.refreshView();
            }
        }

        async runMainByUrl(targetUrl, targetName, productInfo) {
            if (!targetUrl) return;
            this.renderLoading(productInfo);
            try {
                const newProd = await fetchProductByUrl(targetUrl);
                const newTori = await fetchToriUsedListings(productInfo, newProd, newProd?.title || targetName);
                this.lastComparison = {
                    ...(this.lastComparison || {}),
                    matchedQuery: { type: 'Select', value: newProd?.title || targetName || '' },
                    product: newProd,
                    tori: newTori
                };
                this.refreshView();
            } catch (_) {
                this.refreshView();
            }
        }

        refreshView() {
            if (!this.lastProductInfo) return;
            const { lowestPrice, lowestNonClubPrice, lowestNonClubOffer } = getFilteredOffersAndLowest(
                this.lastComparison?.product,
                this.includeShipping,
                this.inStockOnly,
                this.lastProductInfo
            );
            const verdict = evaluatePriceVerdict(
                this.lastProductInfo.currentPrice,
                lowestPrice,
                this.lang,
                this.lastProductInfo.isUsedSite,
                this.lastProductInfo.clubOffer,
                lowestNonClubPrice,
                lowestNonClubOffer?.store,
                this.lastProductInfo,
                this.lastComparison?.tori?.stats
            );
            this.renderResult(this.lastProductInfo, this.lastComparison, verdict);
            applyOnPagePriceAnnotation(
                this.lastProductInfo.priceElement,
                verdict,
                this.lastComparison?.product,
                this.lang,
                this.includeShipping,
                this.inStockOnly,
                this.lastProductInfo
            );
        }

        toggleLanguage() {
            this.lang = this.lang === 'fi' ? 'en' : 'fi';
            localStorage.setItem(CONFIG.storageKeyLang, this.lang);
            this.refreshView();
        }

        renderLoading(productInfo) {
            this.lastProductInfo = productInfo;
            const t = I18N[this.lang] || I18N.fi;
            const themes = getStatusThemes(this.lang, productInfo.isUsedSite);
            this.setThemeVars(themes.neutral);

            const fallbackQuery = encodeURIComponent(
                productInfo.ean || productInfo.mpn || simplifyProductNameForSearch(productInfo.name) || ''
            );
            const toriQuery = encodeURIComponent(extractConciseModelQuery(productInfo.name) || '');

            this.wrapperEl.innerHTML = `
                <div class="ufhpc-handle" id="ufhpc-toggle-handle" title="Click to toggle • Drag vertically to reposition">
                    <div class="ufhpc-handle-bar"></div>
                    <div class="ufhpc-handle-icon">◈</div>
                    <div class="ufhpc-handle-text">${escapeHtml(t.checking)}</div>
                    <div class="ufhpc-handle-chevron">❮</div>
                </div>
                <div class="ufhpc-panel ${this.isExpanded ? 'is-expanded' : ''}">
                    <div class="ufhpc-header">
                        <div class="ufhpc-brand">
                            <div class="ufhpc-brand-top"><span>⚡ ${escapeHtml(t.headerTag)}</span></div>
                            <div class="ufhpc-product-title">${escapeHtml(productInfo.name || 'Product')}</div>
                        </div>
                        <div class="ufhpc-header-btns">
                            <button class="ufhpc-icon-btn" id="ufhpc-lang-btn" title="Switch Language (FI / EN)">${this.lang.toUpperCase()}</button>
                            <button class="ufhpc-icon-btn" id="ufhpc-collapse-btn" title="Collapse">✕</button>
                        </div>
                    </div>
                    <div class="ufhpc-verdict-card">
                        <div class="ufhpc-verdict-top">
                            <span class="ufhpc-verdict-badge">◈ ${escapeHtml(t.fetchingBadge)}</span>
                        </div>
                        <div class="ufhpc-verdict-sub">${escapeHtml(t.fetchingSub(formatEur(productInfo.currentPrice)))}</div>
                    </div>
                    <div class="ufhpc-actions">
                        <a class="ufhpc-btn ufhpc-btn-hinta" href="https://hinta.fi/haku?q=${fallbackQuery}" target="_blank" rel="noopener">Hinta.fi ↗</a>
                        <a class="ufhpc-btn ufhpc-btn-hintaopas" href="https://hintaopas.fi/search?search=${fallbackQuery}" target="_blank" rel="noopener">Hintaopas ↗</a>
                        <a class="ufhpc-btn ufhpc-btn-tori" href="https://www.tori.fi/recommerce/forsale/search?q=${toriQuery}" target="_blank" rel="noopener">Tori.fi ↗</a>
                    </div>
                </div>
            `;

            this.bindCommonEvents(productInfo);
        }

        buildComparisonColumnHtml(t, theme, mainLowestNew, mainToriData) {
            const baseTitle = this.lastComparison?.product?.title || this.lastProductInfo?.name || '';
            const suggestions = suggestComparisonQueries(baseTitle);

            const chipsHtml = suggestions.length > 0 ? `
                <div class="ufhpc-chips">
                    ${suggestions.map(s => `
                        <button type="button" class="ufhpc-chip" data-suggest="${escapeHtml(s)}">
                            ⚡ ${escapeHtml(s)}
                        </button>
                    `).join('')}
                </div>
            ` : '';

            let bodyHtml = '';
            if (this.compareLoading) {
                bodyHtml = `<div class="ufhpc-empty">${escapeHtml(t.compareLoading)}</div>`;
            } else if (this.compareComparison) {
                const compProd = this.compareComparison.product;
                const compTori = this.compareComparison.tori || { query: '', items: [], stats: null };
                const { offers: compOffers, lowestPrice: compLowestNew } = getFilteredOffersAndLowest(
                    compProd,
                    this.includeShipping,
                    this.inStockOnly
                );

                const newDiff = (compLowestNew && mainLowestNew) ? (compLowestNew - mainLowestNew) : null;
                const newDiffStr = newDiff !== null
                    ? `${newDiff > 0 ? '+' : ''}${formatEur(newDiff, 0)} vs. vasen`
                    : (compProd?.history?.atl ? `ATL: ${formatEur(compProd.history.atl.price)}` : '');

                const compToriMin = compTori.stats?.minPrice || null;
                const mainToriMin = mainToriData?.stats?.minPrice || null;
                const toriDiff = (compToriMin && mainToriMin) ? (compToriMin - mainToriMin) : null;
                const toriSubStr = toriDiff !== null
                    ? `${toriDiff > 0 ? '+' : ''}${formatEur(toriDiff, 0)} vs. vasen (Med: ${formatEur(compTori.stats?.medianPrice, 0)})`
                    : (compTori.stats?.medianPrice ? `Mediaani: ${formatEur(compTori.stats.medianPrice, 0)}` : '—');

                const compChartHtml = buildDualChartSectionHtml(
                    compProd?.history,
                    compTori,
                    compLowestNew,
                    compLowestNew,
                    theme,
                    this.lang,
                    this.chartTab,
                    'comp'
                );

                const compStoresHtml = (compProd && compOffers.length > 0) ? `
                    <div class="ufhpc-section-bar">
                        <span class="ufhpc-section-title">${escapeHtml(t.cheapestStores(compOffers.length))}</span>
                    </div>
                    <div class="ufhpc-stores-list">
                        ${compOffers.slice(0, 4).map(offer => {
                            const displayedPrice = this.includeShipping ? (offer.totalPrice || offer.price) : offer.price;
                            return `
                                <a class="ufhpc-store-row" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer">
                                    <div class="ufhpc-store-left">
                                        <span class="ufhpc-stock-dot ${offer.stockStatus}"></span>
                                        <span class="ufhpc-store-name">${escapeHtml(offer.store)}</span>
                                    </div>
                                    <div class="ufhpc-store-right">
                                        <span class="ufhpc-store-price">${formatEur(displayedPrice)}</span>
                                    </div>
                                </a>
                            `;
                        }).join('')}
                    </div>
                ` : `<div class="ufhpc-empty">${escapeHtml(t.emptyResult)}</div>`;

                const compToriHtml = (compTori.items && compTori.items.length > 0) ? `
                    <div class="ufhpc-section-bar">
                        <span class="ufhpc-section-title">♻️ ${escapeHtml(t.toriTitle(compTori.items.length))}</span>
                    </div>
                    <div class="ufhpc-stores-list">
                        ${renderToriRowsHtml(compTori.items, compLowestNew, t, 4)}
                    </div>
                ` : `
                    <div class="ufhpc-section-bar">
                        <span class="ufhpc-section-title">♻️ ${escapeHtml(t.toriTitle(0))}</span>
                    </div>
                    <div class="ufhpc-empty">${escapeHtml(t.toriEmpty)}</div>
                `;

                const compAlternatives = this.compareComparison.alternatives || [];
                const compVariantSelectHtml = compAlternatives.length > 1 ? `
                    <select class="ufhpc-variant-select" id="ufhpc-compare-variant-select" title="${escapeHtml(t.variantLabel)}">
                        ${compAlternatives.map(alt => `
                            <option value="${escapeHtml(alt.url)}" ${alt.url === compProd?.url ? 'selected' : ''}>
                                ${escapeHtml(alt.name)} — ${formatEur(alt.lowestPrice)} (${alt.storeCount} kauppaa)
                            </option>
                        `).join('')}
                    </select>
                ` : '';

                bodyHtml = `
                    <div class="ufhpc-product-title" style="font-size:13px; color:#a5b4fc;">
                        ${escapeHtml(compProd?.title || this.compareQuery)}
                    </div>
                    ${compVariantSelectHtml}
                    <div class="ufhpc-metrics">
                        <div class="ufhpc-metric-box">
                            <span class="ufhpc-metric-label">${escapeHtml(t.compareNewLowest)}</span>
                            <span class="ufhpc-metric-value">${formatEur(compLowestNew)}</span>
                            <span class="ufhpc-metric-sub">${escapeHtml(newDiffStr)}</span>
                        </div>
                        <div class="ufhpc-metric-box">
                            <span class="ufhpc-metric-label">${escapeHtml(t.compareToriLowest)}</span>
                            <span class="ufhpc-metric-value" style="color:#fda4af;">${compToriMin ? formatEur(compToriMin, 0) : '—'}</span>
                            <span class="ufhpc-metric-sub">${escapeHtml(toriSubStr)}</span>
                        </div>
                    </div>
                    ${compChartHtml}
                    ${compStoresHtml}
                    ${compToriHtml}
                `;
            } else {
                bodyHtml = `<div class="ufhpc-empty">${escapeHtml(t.compareHeader)}</div>`;
            }

            return `
                <div class="ufhpc-col ufhpc-col-compare">
                    <div class="ufhpc-section-title">${escapeHtml(t.compareHeader)}</div>
                    ${chipsHtml}
                    <div class="ufhpc-search-wrap">
                        <form class="ufhpc-search-box" id="ufhpc-compare-search-form">
                            <input type="text" class="ufhpc-search-input" id="ufhpc-compare-search-input"
                                   autocomplete="off"
                                   placeholder="${escapeHtml(t.compareInputPlaceholder)}"
                                   value="${escapeHtml(this.compareQuery || suggestions[0] || '')}" />
                            <button type="submit" class="ufhpc-search-btn">${escapeHtml(t.compareActionBtn)}</button>
                        </form>
                        <div class="ufhpc-ac-menu" id="ufhpc-compare-ac-menu"></div>
                    </div>
                    ${bodyHtml}
                </div>
            `;
        }

        renderResult(productInfo, comparison, verdict) {
            this.lastProductInfo = productInfo;
            this.lastComparison = comparison;

            const t = I18N[this.lang] || I18N.fi;
            const theme = verdict.theme;
            this.setThemeVars(theme);

            const storeName = detectCurrentStore().name;
            const marketProd = comparison?.product;
            const { offers, lowestPrice, lowestNonClubPrice, lowestNonClubOffer } = getFilteredOffersAndLowest(
                marketProd,
                this.includeShipping,
                this.inStockOnly,
                productInfo
            );

            const searchTermRaw = productInfo.ean || productInfo.mpn || extractConciseModelQuery(productInfo.name) || '';
            const encodedSearch = encodeURIComponent(searchTermRaw);
            const hintaUrl = marketProd?.url || `https://hinta.fi/haku?q=${encodedSearch}`;

            const toriData = comparison?.tori || { query: '', items: [], stats: null };
            const toriSearchUrl = `https://www.tori.fi/recommerce/forsale/search?q=${encodeURIComponent(toriData.query || extractConciseModelQuery(productInfo.name) || searchTermRaw)}`;

            let deltaText = '';
            let handleLabel = theme.label;
            if (verdict.isClubVerdict && verdict.clubOffer) {
                deltaText = `Norm. ${formatEur(verdict.clubOffer.normalPrice)}`;
                handleLabel = `👑 ${verdict.clubOffer.clubLabel} • ${formatEur(verdict.clubOffer.clubPrice)}`;
            } else if (verdict.diffEur !== null && lowestPrice) {
                if (!productInfo.isUsedSite && verdict.diffEur <= 0.05) {
                    deltaText = t.cheapestBadge;
                    handleLabel = `${t.handleCheapest} • ${formatEur(productInfo.currentPrice)}`;
                } else {
                    const sign = verdict.diffEur > 0 ? '+' : '';
                    deltaText = `${sign}${formatEur(verdict.diffEur)} (${sign}${verdict.diffPct.toFixed(1)}%)`;
                    handleLabel = `${theme.label} (${sign}${Math.round(verdict.diffEur)} €)`;
                }
            }

            const chartHtml = buildDualChartSectionHtml(
                marketProd?.history,
                toriData,
                productInfo.currentPrice,
                lowestPrice,
                theme,
                this.lang,
                this.chartTab,
                'main'
            );

            const alternatives = comparison?.alternatives || [];
            const variantSelectHtml = alternatives.length > 1 ? `
                <select class="ufhpc-variant-select" id="ufhpc-variant-select" title="${escapeHtml(t.variantLabel)}">
                    ${alternatives.map(alt => `
                        <option value="${escapeHtml(alt.url)}" ${alt.url === marketProd?.url ? 'selected' : ''}>
                            ${escapeHtml(alt.name)} — ${formatEur(alt.lowestPrice)} (${alt.storeCount} kauppaa)
                        </option>
                    `).join('')}
                </select>
            ` : '';

            let storesHtml = '';
            if (marketProd && offers.length > 0) {
                const topOffers = offers.slice(0, CONFIG.maxStoresShown);
                const firstOfferIsClub = Boolean(topOffers[0]?.isClubOffer);
                storesHtml = `
                    <div class="ufhpc-section-bar">
                        <span class="ufhpc-section-title">${escapeHtml(t.cheapestStores(offers.length))}</span>
                        <div class="ufhpc-filters">
                            <button type="button" class="ufhpc-pill-btn ${this.includeShipping ? 'is-active' : ''}" id="ufhpc-btn-ship">
                                🚚 ${escapeHtml(t.filterShip)}
                            </button>
                            <button type="button" class="ufhpc-pill-btn ${this.inStockOnly ? 'is-active' : ''}" id="ufhpc-btn-stock">
                                📦 ${escapeHtml(t.filterStock)}
                            </button>
                        </div>
                    </div>
                    <div class="ufhpc-stores-list">
                        ${topOffers.map((offer) => {
                            const normStore = storeName.toLowerCase().replace(/\.(fi|com|de).*$/, '');
                            const isCurrent = !productInfo.isUsedSite && offer.store.toLowerCase().includes(normStore);
                            const isBestNonClub = firstOfferIsClub && lowestNonClubOffer && offer.store === lowestNonClubOffer.store && offer.price === lowestNonClubOffer.price;
                            const displayedPrice = this.includeShipping ? (offer.totalPrice || offer.price) : offer.price;
                            let shipText = offer.deliveryFee === 0
                                ? t.freeShipping
                                : (this.includeShipping
                                    ? `(${formatEur(offer.price)} + ${formatEur(offer.deliveryFee)})`
                                    : (offer.totalPrice > offer.price ? `${t.delivered(formatEur(offer.totalPrice))}` : ''));
                            if (offer.isClubOffer && offer.normalPrice) {
                                shipText = `Norm. ${formatEur(offer.normalPrice)}${shipText ? ` • ${shipText}` : ''}`;
                            }
                            return `
                                <a class="ufhpc-store-row ${isCurrent ? 'is-current-store' : ''} ${offer.isClubOffer ? 'is-club-offer' : ''}" href="${escapeHtml(offer.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(offer.stockLabel)}">
                                    <div class="ufhpc-store-left">
                                        <span class="ufhpc-stock-dot ${offer.stockStatus}"></span>
                                        <span class="ufhpc-store-name">${escapeHtml(offer.store)}${isCurrent ? escapeHtml(t.nowTag) : ''}</span>
                                        ${offer.isClubOffer ? `<span class="ufhpc-club-tag">👑 ${escapeHtml(offer.clubLabel || 'KLUBI')}</span>` : ''}
                                        ${isBestNonClub ? `<span class="ufhpc-nonclub-tag">${escapeHtml(t.nonClubCheapestTag)}</span>` : ''}
                                    </div>
                                    <div class="ufhpc-store-right">
                                        <span class="ufhpc-store-price" ${offer.isClubOffer ? 'style="color:#e9d5ff;"' : ''}>${formatEur(displayedPrice)}</span>
                                        ${shipText ? `<span class="ufhpc-store-ship">${escapeHtml(shipText)}</span>` : ''}
                                    </div>
                                </a>
                            `;
                        }).join('')}
                    </div>
                `;
            } else {
                storesHtml = `
                    <div class="ufhpc-empty">
                        ${escapeHtml(t.emptyResult)}
                    </div>
                `;
            }

            let filteredTori = toriData.items || [];
            if (this.toriDiiliOnly) {
                const diiliItems = filteredTori.filter(item => item.hasToriDiili);
                if (diiliItems.length > 0) filteredTori = diiliItems;
            }

            let toriHtml = '';
            if (toriData.items && toriData.items.length > 0) {
                const refPrice = lowestPrice || productInfo.currentPrice;
                toriHtml = `
                    <div class="ufhpc-section-bar">
                        <span class="ufhpc-section-title">♻️ ${escapeHtml(t.toriTitle(filteredTori.length))}</span>
                        <div class="ufhpc-filters">
                            <button type="button" class="ufhpc-pill-btn ${this.toriDiiliOnly ? 'is-active-tori' : ''}" id="ufhpc-btn-toridiili" title="Filter by ToriDiili buyer protection & shipping">
                                🛡️ ToriDiili
                            </button>
                        </div>
                    </div>
                    <div class="ufhpc-stores-list">
                        ${renderToriRowsHtml(filteredTori, refPrice, t, CONFIG.maxToriShown)}
                    </div>
                `;
            } else {
                toriHtml = `
                    <div class="ufhpc-section-bar">
                        <span class="ufhpc-section-title">♻️ ${escapeHtml(t.toriTitle(0))}</span>
                    </div>
                    <div class="ufhpc-empty">${escapeHtml(t.toriEmpty)}</div>
                `;
            }

            const low30dSub = ((verdict.isClubVerdict || offers[0]?.isClubOffer) && lowestNonClubPrice && lowestNonClubOffer)
                ? `Ilman klubia: ${formatEur(lowestNonClubPrice)} (${lowestNonClubOffer.store})`
                : (marketProd?.history?.atl
                    ? `ATL: ${formatEur(marketProd.history.atl.price)} (${marketProd.history.atl.dateStr})`
                    : (marketProd?.low30d
                        ? t.low30d(formatEur(marketProd.low30d))
                        : (marketProd?.lowestDelivered ? t.delivered(formatEur(marketProd.lowestDelivered)) : t.freeShipping)));

            const cheapestToriPrice = filteredTori[0]?.price;
            const unitInfo = productInfo.unitPriceInfo;
            const thisStoreSub = productInfo.clubOffer?.normalPrice
                ? `Norm. ${formatEur(productInfo.clubOffer.normalPrice)}${cheapestToriPrice ? ` • Tori ${formatEur(cheapestToriPrice, 0)}` : ''}`
                : (unitInfo
                    ? `⚖️ ${unitInfo.formatted}${unitInfo.quantityStr ? ` (${unitInfo.quantityStr})` : ''}`
                    : (cheapestToriPrice
                        ? `Tori.fi alk. ${formatEur(cheapestToriPrice, 0)}`
                        : storeName));
            const thisStoreLabel = productInfo.clubOffer
                ? `${t.thisStore} (👑 ${productInfo.clubOffer.clubLabel})`
                : t.thisStore;

            const rightMetricLabel = lowestPrice
                ? t.marketLowest
                : (unitInfo
                    ? (this.lang === 'en' ? 'Unit Price' : 'Yksikköhinta')
                    : (toriData.stats ? t.compareToriLowest : t.marketLowest));
            const rightMetricValue = lowestPrice
                ? formatEur(lowestPrice)
                : (unitInfo
                    ? unitInfo.formatted
                    : (toriData.stats ? formatEur(toriData.stats.minPrice, 0) : '—'));
            const rightMetricSub = lowestPrice
                ? low30dSub
                : (unitInfo
                    ? (unitInfo.quantityStr ? `Pakkauskoko: ${unitInfo.quantityStr}` : storeName)
                    : (toriData.stats ? `Mediaani Torissa: ${formatEur(toriData.stats.medianPrice, 0)}` : low30dSub));

            const actionBtnsHtml = productInfo.category === 'grocery' ? `
                <a class="ufhpc-btn ufhpc-btn-hinta" href="https://www.s-kaupat.fi/haku?q=${encodedSearch}" target="_blank" rel="noopener noreferrer">
                    S-kaupat ↗
                </a>
                <a class="ufhpc-btn ufhpc-btn-hintaopas" href="https://www.k-ruoka.fi/kauppa/tuotehaku?haku=${encodedSearch}" target="_blank" rel="noopener noreferrer">
                    K-Ruoka ↗
                </a>
                <a class="ufhpc-btn ufhpc-btn-tori" href="https://www.fiksuruoka.fi/search?q=${encodedSearch}" target="_blank" rel="noopener noreferrer">
                    Fiksuruoka ↗
                </a>
            ` : (productInfo.category === 'furniture' ? `
                <a class="ufhpc-btn ufhpc-btn-hinta" href="https://www.ikea.com/fi/fi/search/?q=${encodedSearch}" target="_blank" rel="noopener noreferrer">
                    IKEA ↗
                </a>
                <a class="ufhpc-btn ufhpc-btn-hintaopas" href="https://hintaopas.fi/search?search=${encodedSearch}" target="_blank" rel="noopener noreferrer">
                    Hintaopas ↗
                </a>
                <a class="ufhpc-btn ufhpc-btn-tori" href="${escapeHtml(toriSearchUrl)}" target="_blank" rel="noopener noreferrer">
                    Tori (${toriData.items?.length || 0}) ↗
                </a>
            ` : `
                <a class="ufhpc-btn ufhpc-btn-hinta" href="${escapeHtml(hintaUrl)}" target="_blank" rel="noopener noreferrer">
                    Hinta.fi ↗
                </a>
                <a class="ufhpc-btn ufhpc-btn-hintaopas" href="https://hintaopas.fi/search?search=${encodedSearch}" target="_blank" rel="noopener noreferrer">
                    Hintaopas ↗
                </a>
                <a class="ufhpc-btn ufhpc-btn-tori" href="${escapeHtml(toriSearchUrl)}" target="_blank" rel="noopener noreferrer">
                    Tori (${toriData.items?.length || 0}) ↗
                </a>
            `);

            const compareColumnHtml = this.isExpanded
                ? this.buildComparisonColumnHtml(t, theme, lowestPrice, toriData)
                : '';

            const updateBannerHtml = latestUpdateVersion ? `
                <a class="ufhpc-update-banner" href="${GITHUB_RAW_SCRIPT_URL}" target="_blank" rel="noopener noreferrer" title="Click to install the latest HintaTutka update from GitHub">
                    <span>🚀 ${this.lang === 'en' ? `New update available! (v${SCRIPT_VERSION} → v${escapeHtml(latestUpdateVersion)})` : `Uusi päivitys saatavilla! (v${SCRIPT_VERSION} → v${escapeHtml(latestUpdateVersion)})`}</span>
                    <span class="ufhpc-update-banner-cta">${this.lang === 'en' ? 'Update now ↗' : 'Päivitä nyt ↗'}</span>
                </a>
            ` : '';

            const updateToastHtml = (latestUpdateVersion && !updateToastDismissed) ? `
                <div class="ufhpc-update-toast" id="ufhpc-update-toast">
                    <div class="ufhpc-update-toast-top">
                        <span class="ufhpc-update-toast-title">🔔 ${this.lang === 'en' ? `HintaTutka Update (v${escapeHtml(latestUpdateVersion)})` : `HintaTutka-päivitys saatavilla (v${escapeHtml(latestUpdateVersion)})`}</span>
                        <button type="button" class="ufhpc-update-toast-close" id="ufhpc-update-toast-close" title="Sulje ilmoitus">✕</button>
                    </div>
                    <div class="ufhpc-update-toast-sub">
                        ${this.lang === 'en'
                            ? `A newer version (v${escapeHtml(latestUpdateVersion)}) has been pushed to GitHub. Click below to update via Tampermonkey in 1 click.`
                            : `Uusi versio (v${SCRIPT_VERSION} → v${escapeHtml(latestUpdateVersion)}) on julkaistu GitHubissa! Päivitä skripti yhdellä klikkauksella:`}
                    </div>
                    <div class="ufhpc-update-toast-actions">
                        <a class="ufhpc-update-toast-btn" href="${GITHUB_RAW_SCRIPT_URL}" target="_blank" rel="noopener noreferrer">
                            🚀 ${this.lang === 'en' ? 'Install Update ↗' : 'Asenna päivitys ↗'}
                        </a>
                    </div>
                </div>
            ` : '';

            this.wrapperEl.innerHTML = `
                ${updateToastHtml}
                <div class="ufhpc-handle" id="ufhpc-toggle-handle" title="Click to toggle • Drag vertically to reposition">
                    <div class="ufhpc-handle-bar"></div>
                    ${latestUpdateVersion ? '<div class="ufhpc-handle-update-badge" title="Uusi päivitys saatavilla!"></div>' : ''}
                    <div class="ufhpc-handle-icon">${theme.icon}</div>
                    <div class="ufhpc-handle-text">${escapeHtml(handleLabel)}</div>
                    <div class="ufhpc-handle-chevron">❮</div>
                </div>
                <div class="ufhpc-panel ${this.isExpanded ? 'is-expanded' : ''}">
                    ${updateBannerHtml}
                    <div class="ufhpc-header">
                        <div class="ufhpc-brand">
                            <div class="ufhpc-brand-top">
                                <span>⚡ ${escapeHtml(storeName)}</span>
                                ${comparison?.matchedQuery ? `<span>• ${escapeHtml(comparison.matchedQuery.type)}</span>` : ''}
                                <a class="ufhpc-ver-link ${latestUpdateVersion ? 'has-update' : ''}" id="ufhpc-version-check-btn" href="${GITHUB_RAW_SCRIPT_URL}" target="_blank" rel="noopener noreferrer" title="HintaTutka v${SCRIPT_VERSION} (GitHub: FIMARx/hintatutka) — Klikkaa tarkistaaksesi päivitykset">${latestUpdateVersion ? `🚀 v${SCRIPT_VERSION} → v${escapeHtml(latestUpdateVersion)}` : `v${SCRIPT_VERSION} ↻`}</a>
                            </div>
                            <div class="ufhpc-product-title" title="${escapeHtml(marketProd?.title || productInfo.name)}">
                                ${escapeHtml(marketProd?.title || productInfo.name || 'Product')}
                            </div>
                        </div>
                        <div class="ufhpc-header-btns">
                            <button class="ufhpc-icon-btn ${this.isExpanded ? 'is-active-compare' : ''}" id="ufhpc-expand-btn" title="Expand / Compare two models side-by-side">
                                ${escapeHtml(this.isExpanded ? t.compareCloseBtn : t.compareBtn)}
                            </button>
                            <button class="ufhpc-icon-btn" id="ufhpc-lang-btn" title="Switch Language (FI / EN)">${this.lang.toUpperCase()}</button>
                            <button class="ufhpc-icon-btn" id="ufhpc-collapse-btn" title="Collapse to side">✕</button>
                        </div>
                    </div>

                    <div class="ufhpc-columns">
                        <div class="ufhpc-col">
                            <div class="ufhpc-verdict-card">
                                <div class="ufhpc-verdict-top">
                                    <span class="ufhpc-verdict-badge">${theme.icon} ${escapeHtml(theme.label)}</span>
                                    ${deltaText ? `<span class="ufhpc-verdict-delta">${escapeHtml(deltaText)}</span>` : ''}
                                </div>
                                <div class="ufhpc-verdict-sub">${escapeHtml(theme.sublabel)}</div>
                            </div>

                            <div class="ufhpc-metrics">
                                <div class="ufhpc-metric-box">
                                    <span class="ufhpc-metric-label">${escapeHtml(thisStoreLabel)}</span>
                                    <span class="ufhpc-metric-value is-colored">${formatEur(productInfo.currentPrice)}</span>
                                    <span class="ufhpc-metric-sub">${escapeHtml(thisStoreSub)}</span>
                                </div>
                                <div class="ufhpc-metric-box">
                                    <span class="ufhpc-metric-label">${escapeHtml(rightMetricLabel)}</span>
                                    <span class="ufhpc-metric-value">${escapeHtml(rightMetricValue)}</span>
                                    <span class="ufhpc-metric-sub" title="${escapeHtml(rightMetricSub)}">${escapeHtml(rightMetricSub)}</span>
                                </div>
                            </div>

                            ${chartHtml}
                            ${variantSelectHtml}
                            ${storesHtml}
                            ${toriHtml}

                            <div class="ufhpc-search-wrap">
                                <div class="ufhpc-ac-menu is-upward" id="ufhpc-custom-ac-menu"></div>
                                <form class="ufhpc-search-box" id="ufhpc-custom-search-form">
                                    <input type="text" class="ufhpc-search-input" id="ufhpc-custom-search-input"
                                           autocomplete="off"
                                           placeholder="${escapeHtml(t.searchPlaceholder)}"
                                           value="${escapeHtml(productInfo.ean || marketProd?.title || comparison?.matchedQuery?.value || searchTermRaw)}" />
                                    <button type="submit" class="ufhpc-search-btn">${escapeHtml(t.searchBtn)}</button>
                                </form>
                            </div>

                            <div class="ufhpc-actions">
                                ${actionBtnsHtml}
                            </div>
                        </div>

                        ${compareColumnHtml}
                    </div>
                </div>
            `;

            this.bindCommonEvents(productInfo);
            this.bindDualChartEvents(marketProd?.history, toriData, productInfo.currentPrice, lowestPrice, 'main');
            if (this.isExpanded && this.compareComparison) {
                const compProd = this.compareComparison.product;
                const { lowestPrice: compLowest } = getFilteredOffersAndLowest(compProd, this.includeShipping, this.inStockOnly);
                this.bindDualChartEvents(compProd?.history, this.compareComparison.tori, compLowest, compLowest, 'comp');
            }
        }

        bindDualChartEvents(history, toriData, currentPrice, lowestNewPrice, prefix = 'main') {
            const chartBox = this.shadow.getElementById(`ufhpc-chart-box-${prefix}`);
            const svg = this.shadow.getElementById(`ufhpc-chart-svg-${prefix}`);
            const hoverLine = this.shadow.getElementById(`ufhpc-hover-line-${prefix}`);
            const hoverDot = this.shadow.getElementById(`ufhpc-hover-dot-${prefix}`);
            const dateEl = this.shadow.getElementById(`ufhpc-chart-date-${prefix}`);
            const valEl = this.shadow.getElementById(`ufhpc-chart-val-${prefix}`);
            const subEl = this.shadow.getElementById(`ufhpc-chart-sub-${prefix}`);

            if (chartBox) {
                const tabBtns = chartBox.querySelectorAll('.ufhpc-chart-tab');
                tabBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetTab = btn.getAttribute('data-tab');
                        if (targetTab && targetTab !== this.chartTab) {
                            this.chartTab = targetTab;
                            localStorage.setItem(CONFIG.storageKeyChartTab, targetTab);
                            this.refreshView();
                        }
                    });
                });
            }

            if (!chartBox || !svg || !hoverLine || !hoverDot) return;

            const mode = chartBox.getAttribute('data-mode');
            const t = I18N[this.lang] || I18N.fi;
            const width = 308;
            const height = 98;
            const padLeft = 8;
            const padRight = 8;
            const padTop = 13;
            const padBottom = 15;
            const plotW = width - padLeft - padRight;
            const plotH = height - padTop - padBottom;

            if (mode === 'new' && history && Array.isArray(history.points) && history.points.length >= 2) {
                const pts = history.points;
                const allVals = pts.map(p => p.price);
                if (currentPrice && Number.isFinite(currentPrice)) allVals.push(currentPrice);
                const minVal = Math.min(...allVals) * 0.96;
                const maxVal = Math.max(...allVals) * 1.04;
                const valSpan = Math.max(1, maxVal - minVal);

                const defaultTitle = `${t.chartTitle} (${pts[0].dateStr} – ${pts[pts.length - 1].dateStr})`;
                const defaultVal = formatEur(pts[pts.length - 1].price);
                const defaultSub = t.chartAtl(formatEur(history.atl.price), history.atl.bestStore, history.atl.dateStr);

                svg.addEventListener('mousemove', (e) => {
                    const rect = svg.getBoundingClientRect();
                    if (rect.width <= 0) return;
                    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const idx = Math.round(relX * (pts.length - 1));
                    const pt = pts[idx];
                    if (!pt) return;

                    const cx = padLeft + (idx / (pts.length - 1)) * plotW;
                    const cy = padTop + plotH - ((pt.price - minVal) / valSpan) * plotH;

                    hoverLine.setAttribute('x1', cx.toFixed(1));
                    hoverLine.setAttribute('x2', cx.toFixed(1));
                    hoverLine.setAttribute('visibility', 'visible');

                    hoverDot.setAttribute('cx', cx.toFixed(1));
                    hoverDot.setAttribute('cy', cy.toFixed(1));
                    hoverDot.setAttribute('visibility', 'visible');

                    if (dateEl) dateEl.textContent = pt.subtitle ? `${pt.fullTitle} (${pt.subtitle})` : pt.fullTitle;
                    if (valEl) valEl.textContent = formatEur(pt.price);
                    if (subEl) {
                        if (pt.topOffers && pt.topOffers.length > 0) {
                            subEl.textContent = pt.topOffers
                                .slice(0, 2)
                                .map(o => `${o.store}: ${formatEur(o.value)}`)
                                .join(' • ');
                        } else {
                            subEl.textContent = pt.storeCount || defaultSub;
                        }
                    }
                });

                svg.addEventListener('mouseleave', () => {
                    hoverLine.setAttribute('visibility', 'hidden');
                    hoverDot.setAttribute('visibility', 'hidden');
                    if (dateEl) dateEl.textContent = defaultTitle;
                    if (valEl) valEl.textContent = defaultVal;
                    if (subEl) subEl.textContent = defaultSub;
                });
            } else if (mode === 'tori' && toriData && Array.isArray(toriData.items) && toriData.items.length >= 2) {
                const chronoItems = [...toriData.items].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                const allVals = chronoItems.map(i => i.price);
                if (lowestNewPrice && Number.isFinite(lowestNewPrice)) allVals.push(lowestNewPrice);
                const minVal = Math.min(...allVals) * 0.92;
                const maxVal = Math.max(...allVals) * 1.06;
                const valSpan = Math.max(1, maxVal - minVal);

                const stats = toriData.stats;
                const defaultTitle = t.toriChartTitle(chronoItems.length);
                const defaultVal = formatEur(stats?.medianPrice || chronoItems[0].price, 0);
                const defaultSub = stats
                    ? t.toriChartStats(formatEur(stats.minPrice, 0), formatEur(stats.avgPrice, 0), formatEur(stats.medianPrice, 0))
                    : t.toriChartClickHint;

                let hoveredItem = null;

                svg.addEventListener('mousemove', (e) => {
                    const rect = svg.getBoundingClientRect();
                    if (rect.width <= 0) return;
                    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const idx = Math.round(relX * (chronoItems.length - 1));
                    const item = chronoItems[idx];
                    if (!item) return;

                    hoveredItem = item;
                    const cx = padLeft + (idx / (chronoItems.length - 1)) * plotW;
                    const cy = padTop + plotH - ((item.price - minVal) / valSpan) * plotH;

                    hoverLine.setAttribute('x1', cx.toFixed(1));
                    hoverLine.setAttribute('x2', cx.toFixed(1));
                    hoverLine.setAttribute('visibility', 'visible');

                    hoverDot.setAttribute('cx', cx.toFixed(1));
                    hoverDot.setAttribute('cy', cy.toFixed(1));
                    hoverDot.setAttribute('visibility', 'visible');

                    if (dateEl) {
                        dateEl.textContent = `${item.dateStr || 'Tori.fi'} • ${item.location}`;
                    }
                    if (valEl) {
                        valEl.textContent = formatEur(item.price, 0);
                    }
                    if (subEl) {
                        const diiliTag = item.hasToriDiili ? ' [ToriDiili]' : '';
                        subEl.textContent = `${item.title}${diiliTag}`;
                    }
                });

                svg.addEventListener('click', () => {
                    if (hoveredItem && hoveredItem.url) {
                        window.open(hoveredItem.url, '_blank', 'noopener,noreferrer');
                    }
                });

                svg.addEventListener('mouseleave', () => {
                    hoveredItem = null;
                    hoverLine.setAttribute('visibility', 'hidden');
                    hoverDot.setAttribute('visibility', 'hidden');
                    if (dateEl) dateEl.textContent = defaultTitle;
                    if (valEl) valEl.textContent = defaultVal;
                    if (subEl) subEl.textContent = defaultSub;
                });
            }
        }

        bindCommonEvents(productInfo) {
            const handle = this.shadow.getElementById('ufhpc-toggle-handle');
            const closeBtn = this.shadow.getElementById('ufhpc-collapse-btn');
            const expandBtn = this.shadow.getElementById('ufhpc-expand-btn');
            const langBtn = this.shadow.getElementById('ufhpc-lang-btn');
            const shipBtn = this.shadow.getElementById('ufhpc-btn-ship');
            const stockBtn = this.shadow.getElementById('ufhpc-btn-stock');
            const toriDiiliBtn = this.shadow.getElementById('ufhpc-btn-toridiili');
            const variantSelect = this.shadow.getElementById('ufhpc-variant-select');
            const searchForm = this.shadow.getElementById('ufhpc-custom-search-form');
            const compareForm = this.shadow.getElementById('ufhpc-compare-search-form');
            const suggestChips = this.shadow.querySelectorAll('.ufhpc-chip[data-suggest]');

            if (handle) {
                let startY = 0;
                let startTopPct = this.topPct;
                let dragged = false;

                const onMouseMove = (e) => {
                    const dy = e.clientY - startY;
                    if (Math.abs(dy) > 5) dragged = true;
                    if (dragged) {
                        const newPct = Math.max(12, Math.min(88, startTopPct + (dy / window.innerHeight) * 100));
                        this.topPct = newPct;
                        this.wrapperEl.style.setProperty('--sidebar-top', `${newPct.toFixed(1)}%`);
                    }
                };

                const onMouseUp = () => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                    if (dragged) {
                        localStorage.setItem(CONFIG.storageKeyTopPct, this.topPct.toFixed(1));
                    } else {
                        this.toggleCollapse();
                    }
                };

                handle.addEventListener('mousedown', (e) => {
                    if (e.button !== 0) return;
                    startY = e.clientY;
                    startTopPct = this.topPct;
                    dragged = false;
                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                });
            }

            if (closeBtn) closeBtn.addEventListener('click', () => this.toggleCollapse());
            if (expandBtn) expandBtn.addEventListener('click', () => this.toggleExpandCompare());
            if (langBtn) langBtn.addEventListener('click', () => this.toggleLanguage());

            const toastCloseBtn = this.shadow.getElementById('ufhpc-update-toast-close');
            if (toastCloseBtn) {
                toastCloseBtn.addEventListener('click', () => {
                    updateToastDismissed = true;
                    const toastEl = this.shadow.getElementById('ufhpc-update-toast');
                    if (toastEl) toastEl.remove();
                });
            }

            const versionCheckBtn = this.shadow.getElementById('ufhpc-version-check-btn');
            if (versionCheckBtn) {
                versionCheckBtn.addEventListener('click', async (e) => {
                    if (latestUpdateVersion) {
                        // Already detected an update: let the link open GITHUB_RAW_SCRIPT_URL directly
                        return;
                    }
                    e.preventDefault();
                    versionCheckBtn.textContent = this.lang === 'en' ? '⏳ Checking...' : '⏳ Tarkistetaan...';
                    const newVer = await checkForGithubUpdate(true);
                    if (newVer) {
                        updateToastDismissed = false;
                        this.refreshView();
                        window.open(GITHUB_RAW_SCRIPT_URL, '_blank', 'noopener,noreferrer');
                    } else {
                        versionCheckBtn.classList.add('is-up-to-date');
                        versionCheckBtn.textContent = this.lang === 'en' ? `✓ Latest (v${SCRIPT_VERSION})` : `✓ Uusin (v${SCRIPT_VERSION})`;
                        setTimeout(() => {
                            if (versionCheckBtn.isConnected) {
                                versionCheckBtn.classList.remove('is-up-to-date');
                                versionCheckBtn.textContent = `v${SCRIPT_VERSION} ↻`;
                            }
                        }, 3000);
                    }
                });
            }

            if (shipBtn) {
                shipBtn.addEventListener('click', () => {
                    this.includeShipping = !this.includeShipping;
                    localStorage.setItem(CONFIG.storageKeyIncShip, this.includeShipping ? '1' : '0');
                    this.refreshView();
                });
            }

            if (stockBtn) {
                stockBtn.addEventListener('click', () => {
                    this.inStockOnly = !this.inStockOnly;
                    localStorage.setItem(CONFIG.storageKeyInStock, this.inStockOnly ? '1' : '0');
                    this.refreshView();
                });
            }

            if (toriDiiliBtn) {
                toriDiiliBtn.addEventListener('click', () => {
                    this.toriDiiliOnly = !this.toriDiiliOnly;
                    localStorage.setItem(CONFIG.storageKeyToriDiili, this.toriDiiliOnly ? '1' : '0');
                    this.refreshView();
                });
            }

            if (variantSelect) {
                variantSelect.addEventListener('change', async () => {
                    const targetUrl = variantSelect.value;
                    if (!targetUrl || !this.lastComparison) return;
                    await this.runMainByUrl(targetUrl, '', productInfo);
                });
            }

            const compVariantSelect = this.shadow.getElementById('ufhpc-compare-variant-select');
            if (compVariantSelect) {
                compVariantSelect.addEventListener('change', async () => {
                    const targetUrl = compVariantSelect.value;
                    if (!targetUrl) return;
                    await this.runComparisonByUrl(targetUrl, '');
                });
            }

            if (searchForm) {
                searchForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const input = this.shadow.getElementById('ufhpc-custom-search-input');
                    const queryVal = input?.value?.trim();
                    if (!queryVal) return;

                    this.renderLoading(productInfo);
                    const comparison = await fetchMarketComparison(productInfo, queryVal);
                    this.lastComparison = comparison;
                    this.refreshView();
                });
            }

            if (compareForm) {
                compareForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const input = this.shadow.getElementById('ufhpc-compare-search-input');
                    const queryVal = input?.value?.trim();
                    if (!queryVal) return;
                    await this.runComparisonQuery(queryVal);
                });
            }

            // Bind Live Autocomplete Suggestions to both search inputs
            const customInput = this.shadow.getElementById('ufhpc-custom-search-input');
            const customMenu = this.shadow.getElementById('ufhpc-custom-ac-menu');
            if (customInput && customMenu) {
                this.bindAutocompleteInput(customInput, customMenu, (item) => {
                    this.runMainByUrl(item.url, item.name, productInfo);
                });
            }

            const compareInput = this.shadow.getElementById('ufhpc-compare-search-input');
            const compareMenu = this.shadow.getElementById('ufhpc-compare-ac-menu');
            if (compareInput && compareMenu) {
                this.bindAutocompleteInput(compareInput, compareMenu, (item) => {
                    this.runComparisonByUrl(item.url, item.name);
                });
            }

            suggestChips.forEach(chip => {
                chip.addEventListener('click', async () => {
                    const val = chip.getAttribute('data-suggest');
                    if (val) await this.runComparisonQuery(val);
                });
            });
        }

        bindAutocompleteInput(inputEl, menuEl, onSelectItem) {
            let debounceTimer = null;
            let currentItems = [];
            let activeIndex = -1;

            const closeMenu = () => {
                menuEl.classList.remove('is-open');
                menuEl.innerHTML = '';
                currentItems = [];
                activeIndex = -1;
            };

            const renderMenu = (items) => {
                currentItems = items;
                activeIndex = -1;
                if (!items || items.length === 0) {
                    closeMenu();
                    return;
                }

                menuEl.innerHTML = items.map((item, idx) => {
                    const metaParts = [];
                    if (item.category) metaParts.push(item.category);
                    if (item.storeCount) metaParts.push(`${item.storeCount} kauppaa`);
                    return `
                        <button type="button" class="ufhpc-ac-item" data-idx="${idx}">
                            <div class="ufhpc-ac-left">
                                <span class="ufhpc-ac-name">${escapeHtml(item.name)}</span>
                                ${metaParts.length > 0 ? `<span class="ufhpc-ac-meta">${escapeHtml(metaParts.join(' • '))}</span>` : ''}
                            </div>
                            <span class="ufhpc-ac-price">${formatEur(item.lowestPrice)}</span>
                        </button>
                    `;
                }).join('');

                menuEl.classList.add('is-open');

                menuEl.querySelectorAll('.ufhpc-ac-item').forEach((btn) => {
                    btn.addEventListener('mousedown', (e) => {
                        // Use mousedown so it fires before input blur
                        e.preventDefault();
                        const idx = parseInt(btn.getAttribute('data-idx'), 10);
                        const chosen = currentItems[idx];
                        if (chosen) {
                            inputEl.value = chosen.name;
                            closeMenu();
                            onSelectItem(chosen);
                        }
                    });
                });
            };

            const highlightIndex = (newIdx) => {
                const btns = menuEl.querySelectorAll('.ufhpc-ac-item');
                if (btns.length === 0) return;
                activeIndex = Math.max(-1, Math.min(btns.length - 1, newIdx));
                btns.forEach((b, i) => b.classList.toggle('is-highlighted', i === activeIndex));
                if (activeIndex >= 0 && btns[activeIndex]) {
                    btns[activeIndex].scrollIntoView({ block: 'nearest' });
                }
            };

            const triggerLookup = (val) => {
                const q = (val || '').trim();
                if (q.length < 2) {
                    closeMenu();
                    return;
                }
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(async () => {
                    const results = await fetchAutocompleteSuggestions(q);
                    if (this.shadow.activeElement === inputEl) {
                        renderMenu(results);
                    }
                }, 200);
            };

            inputEl.addEventListener('input', () => {
                triggerLookup(inputEl.value);
            });

            inputEl.addEventListener('focus', () => {
                if (inputEl.value.trim().length >= 2) {
                    triggerLookup(inputEl.value);
                }
            });

            inputEl.addEventListener('keydown', (e) => {
                if (!menuEl.classList.contains('is-open') || currentItems.length === 0) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    highlightIndex(activeIndex + 1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    highlightIndex(activeIndex - 1);
                } else if (e.key === 'Enter' && activeIndex >= 0 && currentItems[activeIndex]) {
                    e.preventDefault();
                    const chosen = currentItems[activeIndex];
                    inputEl.value = chosen.name;
                    closeMenu();
                    onSelectItem(chosen);
                } else if (e.key === 'Escape') {
                    closeMenu();
                }
            });

            inputEl.addEventListener('blur', () => {
                setTimeout(() => closeMenu(), 150);
            });
        }
    }

    // =========================================================================
    // INITIALIZATION, LIVE VARIANT PRICE WATCHER & SPA OBSERVER
    // =========================================================================
    let activeRunId = 0;
    let priceNodeObserver = null;

    function cleanupExistingUI() {
        if (priceNodeObserver) {
            priceNodeObserver.disconnect();
            priceNodeObserver = null;
        }
        const existingRoot = document.getElementById('ufhpc-root');
        if (existingRoot) existingRoot.remove();
        document.querySelectorAll('.ufhpc-inline-price-badge').forEach(el => el.remove());
    }

    async function runPriceChecker(retryCount = 0) {
        const runId = ++activeRunId;
        const productInfo = extractProductInfo();

        if (!productInfo || (!productInfo.name && productInfo.queries.length === 0)) {
            if (retryCount < 2 && !isNonProductPath()) {
                setTimeout(() => {
                    if (runId === activeRunId) runPriceChecker(retryCount + 1);
                }, 900);
            } else {
                cleanupExistingUI();
            }
            return;
        }

        const sidebar = new PriceCheckerSidebar();
        sidebar.mount();
        sidebar.renderLoading(productInfo);

        const comparison = await fetchMarketComparison(productInfo);
        if (runId !== activeRunId) return;

        if (!productInfo.priceElement || !productInfo.currentPrice) {
            const refreshed = findPrimaryPriceElement(productInfo.schemaPrice);
            if (refreshed) {
                productInfo.priceElement = refreshed.element;
                productInfo.currentPrice = productInfo.currentPrice || refreshed.price;
            }
        }

        sidebar.lastProductInfo = productInfo;
        sidebar.lastComparison = comparison;
        sidebar.refreshView();

        // Non-blocking background check against GitHub raw URL so any pushed update notifies users
        checkForGithubUpdate().then((newVer) => {
            if (newVer && runId === activeRunId) {
                sidebar.refreshView();
            }
        });

        // If user had Expanded Compare Mode open, auto-populate sibling comparison
        if (sidebar.isExpanded && !sidebar.compareComparison) {
            const baseTitle = comparison?.product?.title || productInfo.name || '';
            const suggestions = suggestComparisonQueries(baseTitle);
            if (suggestions.length > 0) {
                sidebar.runComparisonQuery(suggestions[0]);
            }
        }

        if (productInfo.priceElement) {
            if (priceNodeObserver) priceNodeObserver.disconnect();
            priceNodeObserver = new MutationObserver(() => {
                const newPrice = parsePriceNumber(productInfo.priceElement.innerText || '');
                if (newPrice && newPrice !== productInfo.currentPrice) {
                    productInfo.currentPrice = newPrice;
                    sidebar.refreshView();
                }
            });
            priceNodeObserver.observe(productInfo.priceElement, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    }

    if (document.readyState === 'complete') {
        setTimeout(() => runPriceChecker(0), 500);
    } else {
        window.addEventListener('load', () => setTimeout(() => runPriceChecker(0), 500));
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            cleanupExistingUI();
            setTimeout(() => runPriceChecker(0), 800);
        }
    }).observe(document, { subtree: true, childList: true });
})();
