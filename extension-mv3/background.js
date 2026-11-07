/**
 * HintaTutka v9.0 — Manifest V3 Background Service Worker
 *
 * Moves all cross-origin HTTP fetching off the active tab's UI thread into a dedicated
 * background worker with cross-tab in-flight deduplication and shared response caching.
 */

const BG_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes raw HTTP cache in Service Worker memory
const BG_CACHE_MAX_ENTRIES = 120;

const bgHttpCache = new Map();
const bgInFlight = new Map();

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

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || typeof msg !== 'object') return false;

    if (msg.type === 'HT_BG_FETCH') {
        performBackgroundFetch(msg).then(sendResponse);
        return true; // Keep async message channel open
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
            bgCachedUrls: bgHttpCache.size,
            inFlightCount: bgInFlight.size
        });
        return false;
    }

    return false;
});
