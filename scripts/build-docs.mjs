#!/usr/bin/env node
/**
 * HintaTutka — GitHub Pages Studio & Harvester Builder
 * Compiles the interactive web harvester and 81-store directory into docs/index.html.
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHintaTutka } from '../tests/lib/harness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const DOCS_DIR = join(ROOT_DIR, 'docs');

const { exports: HT } = loadHintaTutka();

const storesData = HT.STORES.map(s => ({
    name: s.name,
    match: s.match,
    category: s.categoryHint || (s.isUsedSite ? 'used' : (s.isRefurbishedSite ? 'refurbished' : 'electronics')),
    selectors: s.selectors
}));

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HintaTutka Store Harvester & Retail Studio</title>
    <meta name="description" content="Visual DOM Skeleton Harvester, Store Onboarding & Selector Canary for Finnish & EU Retailers.">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
    <style>
        :root {
            --bg-main: #0b0f19;
            --bg-card: #111827;
            --bg-elevated: #1e293b;
            --border: #334155;
            --border-highlight: #3b82f6;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --accent-blue: #3b82f6;
            --accent-cyan: #06b6d4;
            --accent-green: #10b981;
            --accent-yellow: #f59e0b;
            --accent-red: #ef4444;
            --accent-purple: #8b5cf6;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-main);
            color: var(--text-primary);
            line-height: 1.5;
            padding: 0;
            margin: 0;
            min-height: 100vh;
        }

        header {
            background: linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(11, 15, 25, 0.95) 100%);
            border-bottom: 1px solid var(--border);
            padding: 1.5rem 2rem;
            position: sticky;
            top: 0;
            z-index: 50;
            backdrop-filter: blur(12px);
        }

        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .logo-icon {
            font-size: 1.75rem;
            background: linear-gradient(135deg, #3b82f6, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .brand-title {
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: -0.025em;
        }

        .brand-subtitle {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .badge-version {
            background: rgba(59, 130, 246, 0.15);
            color: var(--accent-blue);
            border: 1px solid rgba(59, 130, 246, 0.3);
            padding: 0.2rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }

        .nav-tabs {
            display: flex;
            gap: 0.5rem;
            background: var(--bg-card);
            padding: 0.25rem;
            border-radius: 0.5rem;
            border: 1px solid var(--border);
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            border-radius: 0.375rem;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .tab-btn:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
            color: var(--text-primary);
            background: var(--accent-blue);
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        main {
            max-width: 1400px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
        }

        @media (max-width: 1024px) {
            .grid-2 {
                grid-template-columns: 1fr;
            }
        }

        .card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border);
        }

        .card-title {
            font-size: 1.1rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn {
            background: var(--accent-blue);
            color: white;
            border: none;
            padding: 0.6rem 1.2rem;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 0.375rem;
            cursor: pointer;
            transition: all 0.15s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn:hover {
            background: #2563eb;
            box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4);
        }

        .btn-secondary {
            background: var(--bg-elevated);
            color: var(--text-primary);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--text-muted);
        }

        .btn-sm {
            padding: 0.35rem 0.75rem;
            font-size: 0.75rem;
        }

        .btn-success {
            background: var(--accent-green);
        }
        .btn-success:hover {
            background: #059669;
        }

        .preset-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .pill {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            color: var(--text-secondary);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .pill:hover {
            background: rgba(59, 130, 246, 0.15);
            color: var(--text-primary);
            border-color: var(--accent-blue);
        }

        textarea.code-input {
            width: 100%;
            height: 320px;
            background: var(--bg-main);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            color: #e2e8f0;
            font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
            font-size: 0.85rem;
            padding: 1rem;
            resize: vertical;
            outline: none;
            transition: border-color 0.15s ease;
        }

        textarea.code-input:focus {
            border-color: var(--accent-blue);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .stat-card {
            background: var(--bg-elevated);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 1rem;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
        }

        .stat-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-top: 0.25rem;
            word-break: break-all;
        }

        .stat-badge {
            display: inline-block;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-top: 0.25rem;
        }

        .badge-green { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-yellow { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
        .badge-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .badge-purple { background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); }

        .code-block {
            background: var(--bg-main);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 1rem;
            font-family: "JetBrains Mono", Consolas, monospace;
            font-size: 0.8rem;
            overflow-x: auto;
            position: relative;
            margin-bottom: 1rem;
            color: #e2e8f0;
            white-space: pre-wrap;
        }

        .copy-overlay {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
        }

        table.styled-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            margin-top: 0.5rem;
        }

        table.styled-table th, table.styled-table td {
            padding: 0.6rem 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }

        table.styled-table th {
            background: rgba(255, 255, 255, 0.03);
            color: var(--text-secondary);
            font-weight: 600;
        }

        table.styled-table tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        .search-bar {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            color: white;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
            outline: none;
        }

        .search-bar:focus {
            border-color: var(--accent-blue);
        }

        .store-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1rem;
        }

        .store-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 1.25rem;
            transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .store-card:hover {
            transform: translateY(-2px);
            border-color: var(--accent-blue);
        }

        .store-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .store-name {
            font-size: 1rem;
            font-weight: 700;
        }

        .store-domain {
            font-size: 0.8rem;
            color: var(--text-secondary);
            font-family: monospace;
        }

        .selector-tag {
            display: inline-block;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #93c5fd;
            font-family: monospace;
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            margin: 0.2rem 0.2rem 0.2rem 0;
            word-break: break-all;
        }

        .warning-box {
            background: rgba(245, 158, 11, 0.1);
            border-left: 4px solid var(--accent-yellow);
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
            font-size: 0.85rem;
            color: #fde68a;
            margin-bottom: 1rem;
        }

        .success-box {
            background: rgba(16, 185, 129, 0.1);
            border-left: 4px solid var(--accent-green);
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
            font-size: 0.85rem;
            color: #a7f3d0;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>

<header>
    <div class="header-content">
        <div class="brand">
            <span class="logo-icon">⚡</span>
            <div>
                <div class="brand-title">HintaTutka <span class="badge-version">v${HT.SCRIPT_VERSION} Studio</span></div>
                <div class="brand-subtitle">Retail DOM Skeleton Harvester & 81-Store Registry</div>
            </div>
        </div>

        <nav class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('harvester')">🌾 Harvester Studio</button>
            <button class="tab-btn" onclick="switchTab('tester')">🎯 Selector Playground</button>
            <button class="tab-btn" onclick="switchTab('stores')">🏪 81-Store Directory</button>
            <button class="tab-btn" onclick="switchTab('guide')">📖 Integration Guide</button>
        </nav>
    </div>
</header>

<main>
    <!-- TAB 1: HARVESTER STUDIO -->
    <div id="tab-harvester" class="tab-content active">
        <div class="grid-2">
            <!-- INPUT COLUMN -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📥 HTML Source Input</div>
                    <button class="btn btn-sm btn-secondary" onclick="clearInput()">Clear</button>
                </div>

                <div class="preset-bar">
                    <span style="font-size: 0.75rem; color: var(--text-muted); align-self: center;">Quick Presets:</span>
                    <button class="pill" onclick="loadPreset('power')">Power (table)</button>
                    <button class="pill" onclick="loadPreset('gigantti')">Gigantti (dl/dt/dd)</button>
                    <button class="pill" onclick="loadPreset('jimms')">Jimm's (br lines)</button>
                    <button class="pill" onclick="loadPreset('verkkokauppa')">Verkkokauppa (ul/li)</button>
                    <button class="pill" onclick="loadPreset('grocery')">Grocery (€/kg)</button>
                    <button class="pill" onclick="loadPreset('newstore')">✨ New Store</button>
                </div>

                <textarea id="htmlInput" class="code-input" placeholder="Paste product page HTML source code here (Inspect Element -> Edit as HTML or View Source)..."></textarea>

                <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                        📁 Upload HTML File
                        <input type="file" id="fileUpload" accept=".html,.htm,.txt" style="display: none;" onchange="handleFileUpload(event)">
                    </label>

                    <button class="btn" onclick="runHarvest()">⚡ Harvest Skeleton & Generate</button>
                </div>
            </div>

            <!-- OUTPUT COLUMN -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">📊 Harvested Skeleton Report</div>
                    <div id="reportActions" style="display: none; gap: 0.5rem;">
                        <button class="btn btn-sm btn-success" onclick="downloadFixture()">💾 Download Fixture</button>
                        <button class="btn btn-sm btn-secondary" onclick="openGitHubIssue()">🚀 Submit to GitHub</button>
                    </div>
                </div>

                <div id="emptyState" style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🌾</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-secondary);">No HTML Analyzed Yet</div>
                    <div style="font-size: 0.85rem; max-width: 360px; margin: 0.5rem auto;">Select a Quick Preset above or paste your product page HTML to harvest its DOM skeleton, prices, and specs.</div>
                </div>

                <div id="reportContainer" style="display: none;">
                    <div class="stat-grid">
                        <div class="stat-card">
                            <div class="stat-label">Store Identity</div>
                            <div class="stat-value" id="resStoreName">-</div>
                            <div id="resStoreStatus" class="stat-badge badge-blue">-</div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-label">Cash Price</div>
                            <div class="stat-value" id="resPrice" style="color: #34d399;">-</div>
                            <div id="resPriceSelector" class="stat-badge badge-green">-</div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-label">Category</div>
                            <div class="stat-value" id="resCategory">-</div>
                            <div id="resCategoryBadge" class="stat-badge badge-purple">-</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <div class="stat-label">Product Title</div>
                        <div style="font-size: 1rem; font-weight: 600; margin-top: 0.25rem;" id="resTitle">-</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;" id="resTitleSelector">-</div>
                    </div>

                    <div id="unitPriceBox" class="success-box" style="display: none;"></div>
                    <div id="installmentWarningBox" class="warning-box" style="display: none;"></div>

                    <!-- HARDWARE BREAKDOWN IF PC -->
                    <div id="hardwareSection" style="display: none; margin-bottom: 1.5rem;">
                        <div class="card-title" style="font-size: 0.95rem; margin-bottom: 0.5rem;">🖥️ Deconstructed PC Components</div>
                        <table class="styled-table" id="hardwareTable">
                            <thead>
                                <tr><th>Role</th><th>Extracted Model Query</th><th>Raw Source Spec</th></tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>

                    <!-- CODE SNIPPET STORES -->
                    <div class="stat-label">Generated STORES Configuration (HintaTutka.user.js)</div>
                    <div class="code-block">
                        <button class="btn btn-sm btn-secondary copy-overlay" onclick="copySnippet('storesSnippet')">📋 Copy</button>
                        <code id="storesSnippet">// Run harvest to generate</code>
                    </div>

                    <!-- CODE SNIPPET SELECTORS.JSON -->
                    <div class="stat-label">Generated Hot-Patch Override (selectors.json)</div>
                    <div class="code-block">
                        <button class="btn btn-sm btn-secondary copy-overlay" onclick="copySnippet('jsonSnippet')">📋 Copy</button>
                        <code id="jsonSnippet">// Run harvest to generate</code>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- TAB 2: SELECTOR PLAYGROUND -->
    <div id="tab-tester" class="tab-content">
        <div class="card">
            <div class="card-header">
                <div class="card-title">🎯 Live CSS Selector Playground</div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
                Test any CSS selector directly against the loaded HTML source code to verify matches, text extraction, and price parsing before deploying.
            </p>

            <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <input type="text" id="customSelectorInput" class="search-bar" style="margin-bottom: 0;" placeholder="Enter CSS Selector (e.g. [data-testid=&quot;price&quot;], .product-price, dl dt)...">
                <button class="btn" onclick="testCustomSelector()">Test Selector</button>
            </div>

            <div id="selectorTestResult" style="display: none; margin-top: 1rem;">
                <div class="stat-grid">
                    <div class="stat-card">
                        <div class="stat-label">Matches Found</div>
                        <div class="stat-value" id="testMatchCount">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Parsed Number</div>
                        <div class="stat-value" id="testParsedPrice">-</div>
                    </div>
                </div>

                <div class="stat-label" style="margin-top: 1rem;">Matched Elements Content</div>
                <div class="code-block" id="testMatchedText" style="max-height: 250px;"></div>
            </div>
        </div>
    </div>

    <!-- TAB 3: 81 STORES DIRECTORY -->
    <div id="tab-stores" class="tab-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h2 style="font-size: 1.5rem; font-weight: 700;">🏪 81 Supported Finnish & EU Stores</h2>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Complete registry of live price scraping rules, category hints, and selector fallbacks.</p>
            </div>

            <div class="preset-bar" style="margin-bottom: 0;">
                <button class="pill" onclick="filterStores('all')">All (81)</button>
                <button class="pill" onclick="filterStores('electronics')">Electronics (51)</button>
                <button class="pill" onclick="filterStores('grocery')">Grocery (8)</button>
                <button class="pill" onclick="filterStores('sports')">Sports (8)</button>
                <button class="pill" onclick="filterStores('furniture')">Furniture (8)</button>
                <button class="pill" onclick="filterStores('used')">Used (3)</button>
                <button class="pill" onclick="filterStores('refurbished')">Refurbished (3)</button>
            </div>
        </div>

        <input type="text" id="storeSearchInput" class="search-bar" placeholder="🔍 Search stores by name or domain (e.g. Gigantti, Power, IKEA, Telia)..." oninput="renderStoreList()">

        <div class="store-grid" id="storesContainer"></div>
    </div>

    <!-- TAB 4: INTEGRATION GUIDE -->
    <div id="tab-guide" class="tab-content">
        <div class="card">
            <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem;">📖 How to Add a New Store to HintaTutka</h2>
            
            <div style="display: grid; gap: 1.5rem;">
                <div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #60a5fa; margin-bottom: 0.25rem;">Step 1: Harvest the Store DOM</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                        Open any product page in your browser. Right-click anywhere on the page and select <b>Inspect</b> or <b>View Page Source</b>.
                        Copy the HTML and paste it into the <b>Harvester Studio</b> tab above, or use the CLI:
                    </p>
                    <div class="code-block">node scripts/harvest-store.mjs https://www.newstore.fi/product/12345</div>
                </div>

                <div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #60a5fa; margin-bottom: 0.25rem;">Step 2: Hot-Patch via selectors.json (Zero Reinstall)</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                        Add the generated selector block to <code>selectors.json</code>. The userscript and Chrome extension automatically fetch this file every 12 hours, giving all users instant support without requiring a script update!
                    </p>
                </div>

                <div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #60a5fa; margin-bottom: 0.25rem;">Step 3: Save Test Fixture & Verify</h3>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">
                        Save the HTML snapshot into <code>tests/fixtures/</code> and run the test suite to ensure 100% zero-regression protection:
                    </p>
                    <div class="code-block">npm run verify:quick</div>
                </div>
            </div>
        </div>
    </div>
</main>

<script>
const REGISTERED_STORES = ${JSON.stringify(storesData, null, 2)};
let currentHarvestResult = null;

// Tab switcher
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabId).classList.add('active');
    event.currentTarget.classList.add('active');

    if (tabId === 'stores') renderStoreList();
}

// Preset loader
const PRESETS = {
    power: '<!DOCTYPE html><html><head><title>PCSPECIALIST PRIME 504 - Power.fi</title></head><body><h1>PCSPECIALIST PRIME 504 I7-14/16/1TB/RX9070XT PELITIETOKONE</h1><div class="product-price">1 899,00 €</div><table class="specs-table"><tr><th>Suoritin</th><td>Intel Core i7-14700F</td></tr><tr><th>Näytönohjain</th><td>AMD Radeon RX 9070 XT 16 Gt</td></tr><tr><th>RAM-muisti</th><td>16 GB DDR5 5600 MHz</td></tr><tr><th>Tallennustila</th><td>1 TB M.2 NVMe SSD</td></tr><tr><th>Virtalähde</th><td>750 W 80+ Gold</td></tr></table></body></html>',
    gigantti: '<!DOCTYPE html><html><head><title>Lenovo LOQ 17IRR9 - Gigantti verkkokauppa</title></head><body><h1>Lenovo LOQ 17IRR9 i5-14/8/1TB/3050 pelitietokone</h1><div class="product-price">1 299,00 €</div><dl class="specification-list"><dt>Prosessorin malli</dt><dd>Intel® Core™ i5-14400</dd><dt>Näytönohjaimen malli</dt><dd>NVIDIA GeForce RTX 3050</dd><dt>Asennettu RAM (GB)</dt><dd>8</dd><dt>Tallennuskapasiteetti (GB)</dt><dd>1000</dd><dt>Tallennusliitäntä</dt><dd>M.2 PCIe NVMe SSD</dd><dt>Piirisarja</dt><dd>Intel B760</dd></dl></body></html>',
    jimms: '<!DOCTYPE html><html><head><title>Jimm\\'s GtG Voidwalker 5070 Ti, pelitietokone - Jimm\\'s</title></head><body><h1>Jimm\\'s GtG Voidwalker 5070 Ti, pelitietokone</h1><div class="price">2 499,00 €</div><div class="product-description"><p>Prosessori: AMD Ryzen 7 9850X3D, 4,7 / 5,6 GHz<br>Emolevy: GIGABYTE, AMD X870 -piirisarjaan pohjautuva<br>Näytönohjain: PNY NVIDIA GeForce RTX 5070 Ti, 16 GB GDDR7<br>Keskusmuisti: 32 GB (2 x 16 GB) DDR5 5600 MHz<br>Massamuisti: 2 TB M.2 PCIe 4.0 NVMe SSD<br>Kotelo: Phanteks EX5 Plus<br>Virtalähde: 850 W 80+ Gold</p></div></body></html>',
    verkkokauppa: '<!DOCTYPE html><html><head><title>Blackstorm R9 5090 – Verkkokauppa.com</title></head><body><h1>Blackstorm R9 5090 Gaming Computer</h1><span data-qa="price">4 799,99 €</span><ul><li>AMD Ryzen 9 9950X3D -suoritin</li><li>NVIDIA GeForce RTX 5090 32 Gt -näytönohjain</li><li>64 Gt DDR5 6000 MHz -keskusmuisti</li><li>2 Tt M.2 NVMe SSD -tallennustila</li><li>ASUS TUF GAMING X870E-PLUS WIFI7 -emolevy</li><li>1000 W 80+ Platinum -virtalähde</li></ul></body></html>',
    grocery: '<!DOCTYPE html><html><head><title>Juhla Mokka Kahvi 500g - S-kaupat.fi</title></head><body><h1>Juhla Mokka Kahvi 500g</h1><span data-test-id="product-price-final">4,99 €</span><div data-test-id="unit-price">9,98 €/kg</div></body></html>',
    newstore: '<!DOCTYPE html><html><head><title>Sony WH-1000XM5 Kuulokkeet - UusiVerkkokauppa.fi</title></head><body><h1 class="pdp-title">Sony WH-1000XM5 Langattomat Vastamelukuulokkeet</h1><div data-testid="pdp-price">349,00 €</div><del class="old-price">419,00 €</del><span class="installment">29,90 € / kk</span><table class="specs"><tr><th>Tyyppi</th><td>Vastamelukuulokkeet</td></tr><tr><th>Akunkesto</th><td>30h</td></tr></table></body></html>'
};

function loadPreset(key) {
    document.getElementById('htmlInput').value = PRESETS[key] || '';
    runHarvest();
}

function clearInput() {
    document.getElementById('htmlInput').value = '';
    document.getElementById('reportContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    document.getElementById('reportActions').style.display = 'none';
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('htmlInput').value = e.target.result;
        runHarvest();
    };
    reader.readAsText(file);
}

// Client-Side Parser
function parsePriceNumber(str) {
    if (!str || typeof str !== 'string') return null;
    let s = str.replace(/\\s+|\\u00a0/g, '').replace(/€|EUR|,-/gi, '').trim();
    if (s.endsWith(',-')) s = s.slice(0, -2);
    if (s.includes(',') && s.includes('.')) {
        if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\\./g, '').replace(',', '.');
        else s = s.replace(/,/g, '');
    } else if (s.includes(',')) {
        s = s.replace(',', '.');
    }
    const val = parseFloat(s);
    return Number.isFinite(val) ? val : null;
}

function runHarvest() {
    const rawHtml = document.getElementById('htmlInput').value;
    if (!rawHtml.trim()) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // 1. Identify Store
    const docTitle = doc.title || '';
    let domain = 'unknown-store.fi';
    let storeName = 'Unknown Store';
    let isRegistered = false;

    for (const s of REGISTERED_STORES) {
        const cleanName = s.name.toLowerCase().replace(/[^a-z0-9äöå]/g, '');
        if (docTitle.toLowerCase().includes(cleanName) || rawHtml.includes(s.match)) {
            domain = s.match;
            storeName = s.name;
            isRegistered = true;
            break;
        }
    }

    if (!isRegistered) {
        const suffixM = docTitle.match(/[-|–—]\\s*([a-zA-Z0-9äöåÄÖÅ.\\-_ ]+)$/);
        if (suffixM) {
            const raw = suffixM[1].trim();
            domain = raw.includes('.') ? raw.toLowerCase() : raw.toLowerCase().replace(/\\s+/g, '') + '.fi';
            storeName = raw.charAt(0).toUpperCase() + raw.slice(1);
        }
    }

    // 2. Identify Title
    const h1 = doc.querySelector('h1');
    const title = h1 ? h1.textContent.trim() : (docTitle.split(/[-|–—]/)[0].trim() || 'Unknown Title');
    const titleSelector = h1 ? (h1.className ? 'h1.' + h1.className.split(/\\s+/)[0] : 'h1') : 'title';

    // 3. Identify Price (rejecting installment and strikethrough)
    const installmentRx = /(?:\\/|\\b)kk\\b|erissä|luotto|osamaksu|\\/month/i;
    const strikeRx = /<del|<s\\b|line-through|text-decoration:\\s*line-through|old-price|was-price|strikethrough/i;

    let candidateSelectors = [];
    let discoveredPrice = null;
    let rejectedInstallment = null;

    // Scan data attributes
    const dataElems = doc.querySelectorAll('[data-testid], [data-test-id], [data-qa], [data-price]');
    for (const el of dataElems) {
        const txt = el.textContent || '';
        if (installmentRx.test(txt)) { rejectedInstallment = txt.trim(); continue; }
        if (strikeRx.test(el.outerHTML)) continue;
        const p = parsePriceNumber(txt);
        if (p && p > 0.5) {
            const attr = el.hasAttribute('data-testid') ? 'data-testid' : (el.hasAttribute('data-test-id') ? 'data-test-id' : (el.hasAttribute('data-qa') ? 'data-qa' : 'data-price'));
            candidateSelectors.push(\`[\${attr}="\${el.getAttribute(attr)}"]\`);
            if (!discoveredPrice) discoveredPrice = p;
        }
    }

    // Scan semantic classes
    const classElems = doc.querySelectorAll('.product-price, .price--pdp, .price__amount, .pip-price, .price');
    for (const el of classElems) {
        const txt = el.textContent || '';
        if (installmentRx.test(txt)) { rejectedInstallment = txt.trim(); continue; }
        if (strikeRx.test(el.outerHTML)) continue;
        const p = parsePriceNumber(txt);
        if (p && p > 0.5) {
            candidateSelectors.push('.' + el.className.split(/\\s+/)[0]);
            if (!discoveredPrice) discoveredPrice = p;
        }
    }

    if (candidateSelectors.length === 0) {
        candidateSelectors = ['.product-price', '.price', '[itemprop="price"]'];
    }
    candidateSelectors = [...new Set(candidateSelectors)];

    // 4. Category
    let category = 'electronics';
    if (/kahvi|maito|ruoka|jauheliha|leipä|ravintolisä/i.test(title)) category = 'grocery';
    else if (/takki|kengät|sukset|reppu|ulkoilu/i.test(title)) category = 'sports';
    else if (/pöytä|sohva|sänky|tuoli|lipasto/i.test(title)) category = 'furniture';

    // 5. Deconstruct PC Components if applicable
    const components = [];
    const fullText = doc.body ? doc.body.textContent : rawHtml;
    
    const cpuM = fullText.match(/(?:Ryzen|Intel Core|i[3579]-|Core Ultra)\\s*[^\\n<,]+/i);
    if (cpuM) components.push({ role: 'CPU', query: cpuM[0].trim(), raw: cpuM[0].trim() });

    const gpuM = fullText.match(/(?:GeForce|Radeon|RTX|RX)\\s*\\d{4}[^\\n<,]+/i);
    if (gpuM) components.push({ role: 'GPU', query: gpuM[0].trim(), raw: gpuM[0].trim() });

    const ramM = fullText.match(/\\b(\\d{1,3})\\s*(?:GB|Gt)\\s*(?:\\(.*?\\))?\\s*(?:DDR[45])?[^\\n<,]*?(?:RAM|keskusmuisti)?/i);
    if (ramM) components.push({ role: 'RAM', query: ramM[0].trim(), raw: ramM[0].trim() });

    const ssdM = fullText.match(/\\b(\\d{1,2})\\s*(?:TB|Tt|GB|Gt)\\s*(?:M\\.2|PCIe|NVMe|SSD)/i);
    if (ssdM) components.push({ role: 'STORAGE', query: ssdM[0].trim(), raw: ssdM[0].trim() });

    const moboM = fullText.match(/(?:ASUS|MSI|GIGABYTE|ASRock)?[^\\n<,]*(?:B650|X870|B760|Z790|B850)[^\\n<,]*/i);
    if (moboM && !/näytönohjain/i.test(moboM[0])) {
        const cleanMobo = moboM[0].replace(/-piirisarjaan pohjautuva/i, '').trim();
        components.push({ role: 'MOBO', query: cleanMobo, raw: moboM[0].trim() });
    }

    // Populate Report UI
    document.getElementById('resStoreName').textContent = storeName;
    document.getElementById('resStoreStatus').textContent = isRegistered ? '✔ 81 STORES Registered' : '✨ New Store';
    document.getElementById('resStoreStatus').className = isRegistered ? 'stat-badge badge-green' : 'stat-badge badge-blue';

    document.getElementById('resPrice').textContent = discoveredPrice ? discoveredPrice.toFixed(2) + ' €' : '⚠️ No cash price';
    document.getElementById('resPriceSelector').textContent = candidateSelectors[0] || 'None';

    document.getElementById('resCategory').textContent = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('resCategoryBadge').textContent = category;

    document.getElementById('resTitle').textContent = title;
    document.getElementById('resTitleSelector').textContent = 'Selector: ' + titleSelector;

    // Warning boxes
    const warnBox = document.getElementById('installmentWarningBox');
    if (rejectedInstallment) {
        warnBox.style.display = 'block';
        warnBox.innerHTML = '🛡️ <b>Installment Trap Protected:</b> Ignored monthly rate (<code>' + rejectedInstallment + '</code>) in favor of cash price.';
    } else {
        warnBox.style.display = 'none';
    }

    // Hardware Table
    const hwSec = document.getElementById('hardwareSection');
    const hwBody = document.querySelector('#hardwareTable tbody');
    hwBody.innerHTML = '';
    if (components.length >= 2) {
        hwSec.style.display = 'block';
        for (const c of components) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td><span class="stat-badge badge-blue">' + c.role + '</span></td><td><b>' + c.query + '</b></td><td style="color: var(--text-muted);">' + c.raw + '</td>';
            hwBody.appendChild(tr);
        }
    } else {
        hwSec.style.display = 'none';
    }

    // Code Snippets
    const storesSnippetCode = "        { match: '" + domain + "', name: '" + storeName.replace(/'/g, "\\\\'") + "'" + (category !== 'electronics' ? ", categoryHint: '" + category + "'" : "") + ", selectors: " + JSON.stringify(candidateSelectors) + " },";
    document.getElementById('storesSnippet').textContent = storesSnippetCode;

    const jsonSnippetCode = '  "' + domain + '": {\\n    "prependSelectors": [],\\n    "anchorSelectors": ' + JSON.stringify(candidateSelectors, null, 6) + '\\n  }';
    document.getElementById('jsonSnippet').textContent = jsonSnippetCode;

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('reportContainer').style.display = 'block';
    document.getElementById('reportActions').style.display = 'flex';

    currentHarvestResult = { domain, storeName, category, selectors: candidateSelectors, title, price: discoveredPrice, html: rawHtml };
}

function copySnippet(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

function downloadFixture() {
    if (!currentHarvestResult) return;
    const blob = new Blob([currentHarvestResult.html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = currentHarvestResult.domain.replace(/[^a-z0-9]/gi, '_') + '-fixture.html';
    a.click();
}

function openGitHubIssue() {
    if (!currentHarvestResult) return;
    const title = encodeURIComponent('Add store support: ' + currentHarvestResult.storeName + ' (' + currentHarvestResult.domain + ')');
    const body = encodeURIComponent(
        '### New Store Support Request\\n\\n' +
        '**Store Name**: ' + currentHarvestResult.storeName + '\\n' +
        '**Domain**: \`' + currentHarvestResult.domain + '\`\\n' +
        '**Category**: \`' + currentHarvestResult.category + '\`\\n' +
        '**Harvested Selectors**:\\n\`\`\`json\\n' + JSON.stringify(currentHarvestResult.selectors, null, 2) + '\\n\`\`\`\\n\\n' +
        '**Harvested Price**: ' + (currentHarvestResult.price ? currentHarvestResult.price + ' €' : 'N/A') + '\\n'
    );
    window.open('https://github.com/FIMARx/hintatutka/issues/new?title=' + title + '&body=' + body, '_blank');
}

// Selector Tester Tab
function testCustomSelector() {
    const rawHtml = document.getElementById('htmlInput').value;
    const sel = document.getElementById('customSelectorInput').value.trim();
    if (!rawHtml || !sel) return;

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');
        const matches = doc.querySelectorAll(sel);

        document.getElementById('selectorTestResult').style.display = 'block';
        document.getElementById('testMatchCount').textContent = matches.length;

        if (matches.length > 0) {
            const firstTxt = matches[0].textContent.trim();
            const p = parsePriceNumber(firstTxt);
            document.getElementById('testParsedPrice').textContent = p ? p.toFixed(2) + ' €' : 'Non-numeric';

            let output = '';
            matches.forEach((el, i) => {
                output += \`[\${i + 1}] <\${el.tagName.toLowerCase()}>\` + el.textContent.trim().slice(0, 100) + '\\n';
            });
            document.getElementById('testMatchedText').textContent = output;
        } else {
            document.getElementById('testParsedPrice').textContent = '-';
            document.getElementById('testMatchedText').textContent = 'No elements matched this selector.';
        }
    } catch (err) {
        alert('Invalid CSS Selector syntax: ' + err.message);
    }
}

// Stores Directory Tab
let currentStoreFilter = 'all';

function filterStores(cat) {
    currentStoreFilter = cat;
    renderStoreList();
}

function renderStoreList() {
    const search = (document.getElementById('storeSearchInput').value || '').toLowerCase();
    const container = document.getElementById('storesContainer');
    container.innerHTML = '';

    const filtered = REGISTERED_STORES.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search) || s.match.toLowerCase().includes(search);
        const matchesCat = currentStoreFilter === 'all' || s.category === currentStoreFilter;
        return matchesSearch && matchesCat;
    });

    for (const s of filtered) {
        const card = document.createElement('div');
        card.className = 'store-card';
        card.innerHTML = \`
            <div class="store-card-header">
                <div>
                    <div class="store-name">\${s.name}</div>
                    <div class="store-domain">\${s.match}</div>
                </div>
                <span class="stat-badge badge-blue">\${s.category}</span>
            </div>
            <div style="margin-top: 0.75rem;">
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">SELECTORS (\${s.selectors.length})</div>
                \${s.selectors.map(sel => \`<span class="selector-tag">\${sel}</span>\`).join('')}
            </div>
        \`;
        container.appendChild(card);
    }
}

// Initial render
renderStoreList();
</script>

</body>
</html>
`;

writeFileSync(join(DOCS_DIR, 'index.html'), htmlContent, 'utf8');
console.log('✔ Successfully generated docs/index.html (GitHub Pages Studio & Harvester)');
console.log(`  File size: ${(htmlContent.length / 1024).toFixed(1)} KB`);
console.log(`  Stores embedded: ${storesData.length}`);
