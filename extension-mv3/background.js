/**
 * HintaTutka v9.1 — Manifest V3 Background Service Worker
 *
 * 1. Off-main-thread cross-origin HTTP fetching with cross-tab deduplication & shared cache.
 * 2. Automatic GitHub version checker + toolbar icon "NEW" badge (`chrome.action.setBadgeText`).
 * 3. Remote `selectors.json` hot-patch synchronization across all 81 stores.
 */

const BG_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes raw HTTP cache in Service Worker memory
const BG_CACHE_MAX_ENTRIES = 120;
const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // Check GitHub every 4 hours lazily

const GITHUB_RAW_SCRIPT_URL = 'https://raw.githubusercontent.com/FIMARx/hintatutka/main/HintaTutka.user.js';
const GITHUB_API_CONTENTS_URL = 'https://api.github.com/repos/FIMARx/hintatutka/contents/HintaTutka.user.js';
const GITHUB_SELECTORS_URL = 'https://raw.githubusercontent.com/FIMARx/hintatutka/main/selectors.json';
const GITHUB_LATEST_MV3_ZIP_URL = 'https://github.com/FIMARx/hintatutka/releases/latest/download/HintaTutka-MV3-Extension.zip';
const UPDATE_STATE_KEY = 'ufhpc_mv3_update_state_v91';
const SELECTORS_STORAGE_KEY = 'ufhpc_remote_selectors_v81';

const bgHttpCache = new Map();
const bgInFlight = new Map();
let lastUpdateCheckTs = 0;

function isNewerSemver(remoteVer, localVer) {
    if (!remoteVer || !localVer) return false;
    const r = String(remoteVer).trim().split('.').map(n => parseInt(n, 10) || 0);
    const l = String(localVer).trim().split('.').map(n => parseInt(n, 10) || 0);
    // Normalize 2-part script version (e.g. "9.1") vs 3-part manifest version ("9.1.0")
    const len = Math.max(r.length, l.length);
    for (let i = 0; i < len; i++) {
        const rv = r[i] || 0;
        const lv = l[i] || 0;
        if (rv > lv) return true;
        if (rv < lv) return false;
    }
    return false;
}

function getLocalCoreVersion() {
    try {
        const raw = chrome.runtime.getManifest().version || '9.1.0';
        const parts = raw.split('.');
        return (parts.length === 3 && parts[2] === '0') ? `${parts[0]}.${parts[1]}` : raw;
    } catch (_) {
        return '9.1';
    }
}

async function applyToolbarUpdateBadge(hasUpdate) {
    try {
        if (!chrome.action?.setBadgeText) return;
        if (hasUpdate) {
            await chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
            await chrome.action.setBadgeText({ text: 'NEW' });
        } else {
            await chrome.action.setBadgeText({ text: '' });
        }
    } catch (_) {}
}

async function checkExtensionUpdateInBackground(force = false) {
    const now = Date.now();
    if (!force && (now - lastUpdateCheckTs) < UPDATE_CHECK_INTERVAL_MS) {
        return null;
    }
    lastUpdateCheckTs = now;

    const localVersion = getLocalCoreVersion();
    let remoteVersion = null;

    try {
        const apiRes = await fetch(`${GITHUB_API_CONTENTS_URL}?_t=${now}`, {
            headers: { 'Accept': 'application/vnd.github.v3.raw' },
            cache: 'no-store'
        });
        if (apiRes.ok) {
            const headText = (await apiRes.text()).slice(0, 1200);
            const m = headText.match(/@version\s+([0-9]+(?:\.[0-9]+)*)/i);
            if (m && m[1]) remoteVersion = m[1].trim();
        }
    } catch (_) {}

    if (!remoteVersion) {
        try {
            const rawRes = await fetch(`${GITHUB_RAW_SCRIPT_URL}?_t=${now}`, { cache: 'no-store' });
            if (rawRes.ok) {
                const headText = (await rawRes.text()).slice(0, 1200);
                const m = headText.match(/@version\s+([0-9]+(?:\.[0-9]+)*)/i);
                if (m && m[1]) remoteVersion = m[1].trim();
            }
        } catch (_) {}
    }

    if (!remoteVersion) return null;

    const hasUpdate = isNewerSemver(remoteVersion, localVersion);
    const state = {
        localVersion,
        remoteVersion,
        hasUpdate,
        checkedAt: now,
        downloadUrl: GITHUB_LATEST_MV3_ZIP_URL
    };

    chrome.storage.local.set({ [UPDATE_STATE_KEY]: state });
    await applyToolbarUpdateBadge(hasUpdate);
    return state;
}

async function syncHotPatchSelectorsNow() {
    try {
        const res = await fetch(`${GITHUB_SELECTORS_URL}?_t=${Date.now()}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
        });
        if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
        const json = await res.json();
        if (json && typeof json === 'object' && json.schemaVersion >= 1) {
            const payload = JSON.stringify({ ts: Date.now(), data: json });
            await chrome.storage.local.set({ [SELECTORS_STORAGE_KEY]: payload });
            return { ok: true, updated: json.updated || 'latest' };
        }
        return { ok: false, error: 'Invalid schema' };
    } catch (err) {
        return { ok: false, error: String(err?.message || err) };
    }
}

function pruneBgCache() {
    const now = Date.now();
    for (const [k, entry] of bgHttpCache.entries()) {
        if (now - entry.ts > BG_CACHE_TTL_MS) {
            bgHttpCache.delete(k);
        }
    }
    while (bgHttpCache.size > BG_CACHE_MAX_ENTRIES) {
        const oldestKey = bgHttpCache.keys().next().value;
        if (!oldestKey) break;
        bgHttpCache.delete(oldestKey);
    }
}

function serializeHeaders(headers) {
    const lines = [];
    try {
        headers.forEach((value, key) => {
            lines.push(`${key}: ${value}`);
        });
    } catch (_) {}
    return lines.join('\r\n');
}

async function performBackgroundFetch({ url, method = 'GET', headers = {}, timeout = 8500 }) {
    // Piggyback periodic non-blocking GitHub update + selector hot-patch check every 4h
    if ((Date.now() - lastUpdateCheckTs) >= UPDATE_CHECK_INTERVAL_MS) {
        checkExtensionUpdateInBackground(false).catch(() => {});
    }

    const cacheKey = `${method}::${url}::${headers.Accept || ''}`;
    if (method === 'GET') {
        const hit = bgHttpCache.get(cacheKey);
        if (hit && (Date.now() - hit.ts) < BG_CACHE_TTL_MS) {
            return { ...hit.payload, fromBgCache: true };
        }
    }

    const existing = bgInFlight.get(cacheKey);
    if (existing) return existing;

    const task = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), Math.max(1500, Number(timeout) || 8500));
        try {
            const safeHeaders = new Headers();
            if (headers && typeof headers === 'object') {
                for (const [k, v] of Object.entries(headers)) {
                    const low = k.toLowerCase();
                    if (low === 'user-agent' || low === 'host' || low === 'cookie' || low === 'origin') continue;
                    if (v !== undefined && v !== null) safeHeaders.set(k, String(v));
                }
            }
            if (!safeHeaders.has('Accept-Language')) {
                safeHeaders.set('Accept-Language', 'fi-FI,fi;q=0.9,en;q=0.8');
            }

            const res = await fetch(url, {
                method,
                headers: safeHeaders,
                redirect: 'follow',
                credentials: 'omit',
                signal: controller.signal
            });

            const responseText = await res.text();
            const payload = {
                ok: true,
                status: res.status,
                statusText: res.statusText || '',
                finalUrl: res.url || url,
                responseHeaders: serializeHeaders(res.headers),
                responseText
            };

            if (method === 'GET' && res.status >= 200 && res.status < 300 && responseText.length < 950000) {
                pruneBgCache();
                bgHttpCache.set(cacheKey, { ts: Date.now(), payload });
            }
            return payload;
        } catch (err) {
            const isTimeout = err?.name === 'AbortError';
            return {
                ok: false,
                isTimeout,
                error: String(err?.message || err || 'Network error')
            };
        } finally {
            clearTimeout(timer);
        }
    })().finally(() => {
        bgInFlight.delete(cacheKey);
    });

    bgInFlight.set(cacheKey, task);
    return task;
}

chrome.runtime.onInstalled.addListener(() => {
    checkExtensionUpdateInBackground(true).catch(() => {});
    syncHotPatchSelectorsNow().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
    checkExtensionUpdateInBackground(false).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || typeof msg !== 'object') return false;

    if (msg.type === 'HT_BG_FETCH') {
        performBackgroundFetch(msg).then(sendResponse);
        return true;
    }

    if (msg.type === 'HT_CHECK_UPDATE') {
        Promise.all([
            checkExtensionUpdateInBackground(Boolean(msg.force)),
            syncHotPatchSelectorsNow()
        ]).then(([updateState, selectorSync]) => {
            sendResponse({ ok: true, updateState, selectorSync });
        });
        return true;
    }

    if (msg.type === 'HT_CLEAR_CACHE') {
        bgHttpCache.clear();
        chrome.storage.local.remove([
            'ufhpc_shared_cache_v81',
            'ufhpc_circuit_breakers_v81',
            'ufhpc_host_pacing_v81'
        ], () => {
            sendResponse({ ok: true });
        });
        return true;
    }

    if (msg.type === 'HT_GET_STATS') {
        pruneBgCache();
        sendResponse({
            ok: true,
            localVersion: getLocalCoreVersion(),
            bgCachedUrls: bgHttpCache.size,
            inFlightCount: bgInFlight.size
        });
        return false;
    }

    return false;
});
