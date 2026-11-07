<div align="center">

<img src="assets/hero-banner.svg" width="100%" alt="HintaTutka v9.2 — Finnish & EU Real-Time Price Intelligence" />

<br />

[![Release](https://img.shields.io/github/v/release/FIMARx/hintatutka?style=for-the-badge&label=RELEASE&labelColor=0f172a&color=10b981)](https://github.com/FIMARx/hintatutka/releases/latest)
[![Total Downloads](https://img.shields.io/github/downloads/FIMARx/hintatutka/total?style=for-the-badge&logo=github&label=TOTAL%20DOWNLOADS&labelColor=0f172a&color=38bdf8)](https://github.com/FIMARx/hintatutka/releases)
[![Supported Stores](https://img.shields.io/badge/STORES-81%20SUPPORTED-f59e0b?style=for-the-badge&labelColor=0f172a)](#-supported-stores-81)
[![Core Size](https://img.shields.io/github/size/FIMARx/hintatutka/HintaTutka.user.js?style=for-the-badge&label=CORE%20ENGINE&labelColor=0f172a&color=8b5cf6)](https://github.com/FIMARx/hintatutka/blob/main/HintaTutka.user.js)
[![Stars](https://img.shields.io/github/stars/FIMARx/hintatutka?style=for-the-badge&logo=github&label=STARS&labelColor=0f172a&color=eab308)](https://github.com/FIMARx/hintatutka/stargazers)
[![License](https://img.shields.io/badge/LICENSE-MIT-64748b?style=for-the-badge&labelColor=0f172a)](#-license)

<p>
  <a href="#-quick-install--download-telemetry"><b>📦 Install &amp; Downloads</b></a> •
  <a href="#-core-intelligence-engines-v90"><b>✨ v9.0 Engines</b></a> •
  <a href="#-architecture--shield-pipeline"><b>🏗️ Architecture</b></a> •
  <a href="#-supported-stores-81"><b>🏪 81 Stores</b></a> •
  <a href="#-suomenkielinen-pikaopas"><b>🇫🇮 Suomeksi</b></a> •
  <a href="#-changelog"><b>🗺️ Changelog</b></a>
</p>

</div>

---

## 📦 Quick Install & Download Telemetry

<div align="center">

| 📊 Live Download Telemetry | ⚡ Option A: Userscript (Recommended) | 🧩 Option B: Native MV3 Extension |
| :---: | :---: | :---: |
| [![Total Downloads](https://img.shields.io/github/downloads/FIMARx/hintatutka/total?style=for-the-badge&logo=github&label=ALL%20DOWNLOADS&labelColor=0f172a&color=10b981)](https://github.com/FIMARx/hintatutka/releases)<br />[![Latest Release Downloads](https://img.shields.io/github/downloads/FIMARx/hintatutka/latest/total?style=for-the-badge&label=LATEST%20RELEASE&labelColor=0f172a&color=38bdf8)](https://github.com/FIMARx/hintatutka/releases/latest)<br /><sub>Tracked live via GitHub Releases API</sub> | [![Install Userscript](https://img.shields.io/badge/INSTALL-HintaTutka.user.js-f43f5e?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka.user.js)<br />[![Userscript Downloads](https://img.shields.io/github/downloads/FIMARx/hintatutka/latest/HintaTutka.user.js?style=flat-square&label=installs&labelColor=0f172a&color=f43f5e)](https://github.com/FIMARx/hintatutka/releases/latest)<br /><sub>1-click install for <b>Tampermonkey</b> &amp; <b>Violentmonkey</b></sub> | [![Download MV3 ZIP](https://img.shields.io/badge/DOWNLOAD-MV3%20Extension%20(.zip)-8b5cf6?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka-MV3-Extension.zip)<br />[![MV3 Downloads](https://img.shields.io/github/downloads/FIMARx/hintatutka/latest/HintaTutka-MV3-Extension.zip?style=flat-square&label=downloads&labelColor=0f172a&color=8b5cf6)](https://github.com/FIMARx/hintatutka/releases/latest)<br /><sub>Off-main-thread Service Worker for <b>Chrome / Edge / Brave</b></sub> |

</div>

### Step-by-Step Setup

1. **⚡ Userscript (`Tampermonkey` / `Violentmonkey` — Chrome, Firefox, Edge, Brave, Safari)**
   - Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
   - Click **[Install `HintaTutka.user.js`](https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka.user.js)** (or [Direct Raw Mirror](https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js)) and confirm **Install**.
   - Open any product page on Verkkokauppa.com, Gigantti, Power, Jimm's, Prisma, XXL, Tori.fi, or 70+ other stores!

2. **🧩 Native Manifest V3 Browser Extension (`extension-mv3/`)**
   - Download **[`HintaTutka-MV3-Extension.zip`](https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka-MV3-Extension.zip)** and extract it to a folder *(disable the Tampermonkey script first so you don't run two copies at once)*.
   - Open `chrome://extensions` (or `edge://extensions` / `brave://extensions`) and toggle **Developer mode** ON.
   - Click **Load unpacked** and select the extracted folder.
   - **Auto-Updates & Hot-Patches**: Store CSS selectors ([`selectors.json`](selectors.json)) auto-update silently every 12h. When a new engine release ships, the toolbar icon lights up with a **`NEW`** badge — run the included `update-extension.ps1` (Windows) or `update-extension.sh` (macOS/Linux) script to update files in 1 click, then click `↻` in `chrome://extensions`.

3. **☁️ Optional: Self-Hosted Cloudflare Worker Edge Proxy (`cloudflare-worker/`)**
   - Masks your client IP behind Cloudflare's global network, shares a **15-minute edge cache** (`caches.default`), and exposes `/proxy`, `/selectors`, and a custom SVG telemetry card at `/stats-card.svg`:
     ```bash
     cd cloudflare-worker
     npx wrangler deploy
     ```
   - Paste your `https://hintatutka-proxy.<account>.workers.dev` URL into the MV3 Extension popup or Tampermonkey's **`☁️ HintaTutka: Serverless Proxy URL`** menu command. If unreachable, HintaTutka automatically falls back to direct fetching.

---

## ✨ Core Intelligence Engines (v9.0)

| Engine | What It Does |
| :--- | :--- |
| **🇪🇺 EU Cross-Border & Finnish VAT Optimizer** | Queries **Amazon.de** live by GS1-validated EAN or model code, strips sponsored/bundle traps, and calculates exact **delivered cost to Finland**: `DE Price × (1.255 / 1.19) + FI Shipping` (`0 €` when `≥ 99 €`, else `10.49 €`; `14% / 7%` for books). Exposes the *"Suomi-lisä"* markup and adds 1-click **Amazon.de**, **Geizhals.eu**, and **Idealo.de** buttons. |
| **🔥 Second-Hand Arbitrage & Flip Engine** | Aggregates **Tori.fi**, **Vinted.fi**, and **Huuto.net** in real time, filters `1 €` / accessory noise via **Tukey IQR**, and flags deeply underpriced listings with **`🔥 FLIP +XX €`** net-profit badges after deducting `~5%` (min `8 €`) shipping & buyer-protection fees. |
| **🎭 Club Price Truth Benchmarking** | Audits loyalty deals (`MyPOWER`, `Klubihinta`, `HH PLUS`, `Asiakasomistaja`) against open non-club competitors and historical **ATL** — exposing **`🎭 ILLUSORY CLUB DEALS`** (where a rival matches/beats the club price without membership) and **`⚠️ INFLATED NORMAL PRICES`** (`> 8.5%` anchor markup) vs. **`🏆 TRUE CLUB MARKET LOWS`**. |
| **🔮 Predictive Analytics & Seasonal AI** | Combines ATL/ATH range percentile, 6-interval linear regression price momentum (`📉 Falling`, `📈 Rising`, `➡️ Stable`), and the **Finnish Retail Seasonal Calendar** (*Tammiale, Spring/Autumn Hullut Päivät, Juhannus/Kesäale, Back to School, Singles' Day 11.11, Black Week / Black Friday, Välipäiväale*) to advise **`🟢 BUY NOW`** vs. **`⏳ WAIT X DAYS`**. |
| **🛡️ Zero-CLS & Anti-Rate-Limit Shield** | Pre-reserves a fixed `27px` (`contain: layout style`) inline verdict slot before network calls for **0 layout shift**, defers execution in unopened background tabs (`visibilityState`), shares a 2-tier L1/L2 cache across all 81 domains, paces per-host requests with jitter + Cloudflare/`429` circuit breakers, and hot-patches store selectors from [`selectors.json`](selectors.json). |
| **🛒 Smart Everyday Shopping Suite** | Includes **⭐ Price Watchlist** (no login), **🤝 Bargaining Advisor** (1-click polite counter-offer copy for Tori/Vinted/Huuto), **⚔️ 2-Column Side-by-Side Model Compare**, **💳 5% S-Bonus & K-Plussa Cashback**, **⚖️ Unit-Price Analyzer (`€/kg`, `€/l`)**, **🧠 Self-Learning Search Memory**, and **FI / EN** UI toggle. |

---

## 🏗️ Architecture & Shield Pipeline

```mermaid
flowchart LR
    A["81 Storefronts<br/>(GS1 EAN + Split-Cent DOM)"] --> B["Zero-CLS 27px Badge<br/>+ Geometry Guard"]
    A --> C{"L1 / L2 Shared<br/>Cross-Store Cache"}
    C -- "Cache Hit (0 ms)" --> G["Obsidian Glass UI<br/>& Inline Verdict"]
    C -- "Cache Miss" --> D["Polite Pacer +<br/>Circuit Breaker / Edge Proxy"]
    D --> E["Stage 1 (~300 ms)<br/>Hinta.fi + ATL History"]
    D --> F["Stage 2 (Parallel)<br/>Direct FI Stores • Amazon.de (25.5% VAT)<br/>Tori.fi • Vinted • Huuto.net"]
    E --> G
    F --> H["v9.0 Intelligence<br/>Club Audit • Flip ROI • Seasonal AI"]
    H --> G
```

---

## 🏪 Supported Stores (81)

HintaTutka works across all localized store paths (`/fi/`, `/en/`, `/sv/`) and Single-Page Applications (History API hooks):

| Category | Supported Storefronts |
| :--- | :--- |
| **Electronics & Appliances** | Verkkokauppa.com, Gigantti, Power, Veikon Kone, Euronics, HobbyHall, Bigbox |
| **PC Hardware & Gaming** | Jimm's, Proshop, Datatronic, Multitronic, Tietokonekauppa.fi, Data-Systems, Komponenttikauppa.fi, Cruzbroker, MaxGaming, VPD, Puolenkuun Pelit, Kasuplan, Mikromafia, TeraStore, DigiDreamer, CS Megastore |
| **Refurbished Tech** | Swappie, Taitonetti, Fonum |
| **Sports & Outdoor** | XXL, Intersport, Budget Sport, Varuste.net, Scandinavian Outdoor, Stadium, Partioaitta, Haglöfs |
| **Price Aggregators & EU** | Hinta.fi, Hintaseuranta.fi, Amazon.de *(+ 1-click Geizhals.eu & Idealo.de)* |
| **Pharmacy, Beauty & Pets** | Yliopiston Apteekki (`ya.fi`), Lyko, Kicks, Musti ja Mirri, Zooplus, Peten Koiratarvike |
| **Groceries & Everyday** | S-kaupat.fi *(Prisma, S-market, Alepa, Sale)*, K-Ruoka.fi *(K-Citymarket, K-Supermarket, K-Market)*, Fiksuruoka, Matsmart, Ruohonjuuri, Tokmanni, Puuilo |
| **Furniture, Home & Books** | IKEA, JYSK, Sotka, Asko, Masku, Isku, Veke, Finnish Design Shop, Stockmann, Rusta, Clas Ohlson, Adlibris, Suomalainen Kirjakauppa |
| **DIY, Hardware & Auto** | K-Rauta, Taloon.com, Netrauta, Bauhaus, Motonet, Biltema, Prisma, Kärkkäinen, Dustin / DustinHome, e-ville, SatShop, Jula |
| **Telecom Carriers** | Elisa, Telia, DNA |
| **Second-Hand Marketplaces** | Tori.fi, Vinted.fi, Huuto.net *(both inside retail sidebars and directly on second-hand item pages)* |

---

## 🇫🇮 Suomenkielinen pikaopas

**HintaTutka v9.0** tuo reaaliaikaisen hintavertailun, käytettyjen markkinat ja EU-hintalaskurin suoraan **81 verkkokaupan** tuotesivuille:

- **Välitön hintatuomio sivulla (0-CLS)**: Näet suoraan kaupan hinnan vieressä, onko tuote **🟢 Edullinen**, **🟡 OK** vai **🔴 Kallis** (euro- ja prosenttierolla halvimpaan kauppaan).
- **🇪🇺 EU / Saksa "Suomi-lisä" -laskuri**: Tarkistaa **Amazon.de**-hinnan, muuntaa Saksan `19 %` ALV:n Suomen `25,5 %` ALV-kantaan ja lisää Suomi-toimituksen (`0 €` yli `99 €` tilauksille, muuten `10,49 €`).
- **🔥 Arbitraasi- & Flip-moottori (`Tori.fi`, `Vinted`, `Huuto.net`)**: Merkitsee käytettyjen markkinoilta selvästi alihinnoitellut löydöt **`🔥 FLIP +XX €`** -tunnisteella (toimitus- ja turvakulujen jälkeen) ja tarjoaa **🤝 Tinkausapurin** valmiilla viestipohjalla.
- **🎭 Klubihintojen totuusmittari**: Paljastaa **`🎭 Näennäisalet`** (kun kilpailija myy tuotetta halvemmalla *ilman* jäsenyyttä) ja **`⚠️ Korotetut normaalihinnat`**, sekä vahvistaa aidot **`🏆 Klubipohjahinnat`**.
- **🔮 Hintaennuste & Suomen alekalenteri**: Yhdistää hintahistorian regressiotrendin ja suomalaiset alekaudet (*Tammiale, Hullut Päivät, Juhannusale, Back to School, Singles' Day, Black Week, Välipäiväale*) kertoen kannattaako **🟢 Ostaa nyt** vai **⏳ Odottaa**.
- **Asennus 10 sekunnissa**: Asenna [Tampermonkey](https://www.tampermonkey.net/) ja klikkaa **[Asenna `HintaTutka.user.js`](https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka.user.js)** — tai lataa natiivi Chrome/Edge/Brave-laajennus **[`HintaTutka-MV3-Extension.zip`](https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka-MV3-Extension.zip)**.

---

## 🗺️ Changelog

### 🚀 v9.2 (Latest)
- **⚡ Critical Loading Fix (`isValidBarcodeChecksum`)**: Fixed an uncaught `ReferenceError` when rendering products with GS1 EAN barcodes (`buildEuHubLinks` / `fetchAmazonDeCrossBorder`) that froze the Tampermonkey sidebar and inline `◈ Tarkistetaan...` badge on loading.
- **🛡️ Anti-Hang Watchdog & Stage-2 Timeouts**: Hardened `executeRawGmGet` (`onabort` + JS watchdog timer), `acquirePoliteHostSlot` (12s auto-releasing slot lease), Stage-2 parallel scraper timeouts, and `runPriceChecker` error recovery so stalled network calls can never freeze the UI.
- **🎨 Squircle Radar-Bolt Brand Logo**: Added standalone vector [`assets/logo.svg`](assets/logo.svg), 64× supersampled `icon16`/`32`/`48`/`128.png` extension icons, `popup.html` brand header, Tampermonkey `@icon` metadata, and inline sidebar emblem.

### 🚀 v9.1
- **🔔 Smart MV3 Extension Update System & 1-Click Updater**: Background GitHub version watcher with automatic emerald **`NEW`** toolbar icon badge (`chrome.action.setBadgeText`), MV3-aware download banners/popup UI, on-demand `selectors.json` hot-patch button, and 1-click in-place `update-extension.ps1` / `update-extension.sh` scripts.
- **🎨 Studio-Grade Vector Hero Banner & Live Download Telemetry**: Rebuilt [`assets/hero-banner.svg`](assets/hero-banner.svg) with custom geometric vector icons, mini price-history sparkline, and automated GitHub Release asset packaging ([`.github/workflows/release.yml`](.github/workflows/release.yml)).

### 🚀 v9.0
- **🇪🇺 Cross-Border EU Shipping & Finnish VAT Landed-Cost Optimizer**: Live `Amazon.de` lookup (`19% MwSt → 25.5% FI ALV` + `99 €` free FI shipping threshold), US/UK comma-thousands price parser fix (`€1,181.28`), and 1-click **Amazon.de**, **Geizhals.eu**, and **Idealo.de** buttons.
- **🔥 Arbitrage & Flipping Engine**: Net resale margin & ROI calculator across **Tori.fi**, **Vinted.fi**, and **Huuto.net** (`🔥 FLIP +XX €` row tags + Arbitrage Opportunity cards).
- **🎭 Club Price Truth Benchmarking**: Audits `MyPOWER`, `Klubihinta`, `HH PLUS`, and `Asiakasomistaja` deals against open non-club stores and historical ATL (`🏆 True Club Low` vs. `🎭 Illusory Club Deal` vs. `⚠️ Inflated Normal Price`).
- **🔮 Historical Predictive Analytics & Seasonal Buy/Wait Engine**: 6-point linear regression trend + 8-event Finnish retail sale calendar (`🟢 BUY NOW` / `⏳ WAIT`).
- **☁️ Decoupled Serverless Edge Proxy (`cloudflare-worker/`)**: Cloudflare Worker with strict allowlist, 15-min `caches.default` edge cache, IP masking, `/selectors`, and `/stats-card.svg`.
- **🧩 Native Manifest V3 Extension (`extension-mv3/`)**: Dedicated `background.js` Service Worker fetcher, cross-domain `chrome.storage.local` bridge, and toolbar popup UI.

<details>
<summary><b>📜 View Previous Releases (v7.0 – v8.1)</b></summary>

#### 🛡️ v8.1 — Shield & Zero-CLS Update
- **Anti-Rate-Limit & Cloudflare Shield**: Background-tab deferral (`visibilityState`), cross-domain L1/L2 `GM_getValue` shared cache, polite per-host jitter pacing, Cloudflare/`429` circuit breaker, and lazy Stage-2 deferral when collapsed.
- **Zero-CLS Rendering**: Pre-reserved `27px` (`contain: layout style`) inline badge slot, `requestIdleCallback` scheduling, lightweight collapsed edge pill, and lazy SVG chart hydration.
- **Remote Hot-Patch Selector Registry**: Background sync of [`selectors.json`](selectors.json) + self-checking bounding-box anchor guard (`insertBadgeWithGeometryGuard`).

#### 🌟 v8.0 — Next-Gen Search & Precision Price Engine
- **GS1 Mod-10 Barcode Checksum & Multi-Source EAN Extraction**: Extracts validated barcodes across JSON-LD, microdata, spec tables, and `__NEXT_DATA__`.
- **Multilingual FI/EN/SV Concept Synonyms & Spec Conflict Guard**: Prevents storage/size/pack/bundle mismatches (`128GB` vs `256GB`, `55"` vs `65"`, single vs `2-pack`).
- **Split-Cent & Ex-VAT Price Engine**: Parses superscript/flex-split cents (`270` + `30` → `270,30 €`), rejects `ALV 0%` business prices, deduplicates canonical store names, adds live **Hintaseuranta.fi** scraping, restores **Huuto.net** API, and introduces 2-stage progressive rendering.

#### 🌟 v7.5 – v7.8
- **v7.8**: Fixed Hintaseuranta (`/haku/{query}`) & Hintaopas (`/search?query=`) routing; dimmed unverified secondary buttons.
- **v7.7**: Added Adaptive Self-Learning Search Memory (`🧠 Learned match`) & cross-store model aliases.
- **v7.6**: Multi-tier slash/hyphen model code matcher (`HX3886/43`, `WH-1000XM5`, `SM-S928B/DS`).
- **v7.5**: Clean block-flow inline badge anchoring on Verkkokauppa.com & Gigantti.

#### 🌟 v7.0 – v7.4
- **v7.4**: Obsidian Glassmorphism UI rework + 1-click Update & Reload flow.
- **v7.1 – v7.3**: Segmented tabs (`Stores` / `Used` / `History`), 81 stores, Vinted EUR currency guard, and used-median verdicts.
- **v7.0**: Watchlist, Bargaining Advisor, 2-column Compare Mode, S-Bonus / K-Plussa calculator, and `€/kg` unit-price analyzer.

</details>

---

## 📄 License

Released under the **MIT License** by [**FIMARx**](https://github.com/FIMARx).
