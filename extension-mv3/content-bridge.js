/**
 * HintaTutka v9.0 — MV3 Content-Script Bridge
 *
 * Hydrates cross-domain extension storage (`chrome.storage.local`) and exposes
 * synchronous `GM_getValue` / `GM_setValue` plus off-main-thread `GM_xmlhttpRequest`
 * so `hintatutka-core.js` runs natively in Manifest V3 with zero UI-thread blocking.
 */
(function () {
    'use strict';

    const WATCHLIST_KEY = 'ufhpc_watchlist_items_v70';
    const PROXY_URL_KEY = 'ufhpc_proxy_url_v90';
    const memStore = Object.create(null);

    // Pre-hydrate all persisted HintaTutka keys from chrome.storage.local immediately
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get(null, (items) => {
            if (chrome.runtime?.lastError || !items) return;
            for (const [k, v] of Object.entries(items)) {
                memStore[k] = v;
            }
            // Sync global proxy URL & cross-domain watchlist into page-isolated localStorage
            try {
                if (typeof items[PROXY_URL_KEY] === 'string') {
                    if (items[PROXY_URL_KEY]) localStorage.setItem(PROXY_URL_KEY, items[PROXY_URL_KEY]);
                    else localStorage.removeItem(PROXY_URL_KEY);
                }
                if (typeof items[WATCHLIST_KEY] === 'string' && items[WATCHLIST_KEY].length > 2) {
                    const localRaw = localStorage.getItem(WATCHLIST_KEY);
                    if (!localRaw || localRaw === '[]') {
                        localStorage.setItem(WATCHLIST_KEY, items[WATCHLIST_KEY]);
                    }
                }
            } catch (_) {}
        });

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'local' || !changes) return;
            for (const [k, change] of Object.entries(changes)) {
                if (change.newValue === undefined) {
                    delete memStore[k];
                } else {
                    memStore[k] = change.newValue;
                }
                if (k === PROXY_URL_KEY) {
                    try {
                        if (change.newValue) localStorage.setItem(PROXY_URL_KEY, String(change.newValue));
                        else localStorage.removeItem(PROXY_URL_KEY);
                    } catch (_) {}
                }
            }
        });
    }

    // Mirror localStorage Watchlist updates up to chrome.storage.local so the MV3 toolbar popup shows all saved items
    try {
        const origSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
            origSetItem.call(this, key, value);
            if ((key === WATCHLIST_KEY || key === PROXY_URL_KEY) && typeof chrome !== 'undefined' && chrome.storage?.local) {
                const strVal = String(value ?? '');
                memStore[key] = strVal;
                chrome.storage.local.set({ [key]: strVal });
            }
        };
    } catch (_) {}

    globalThis.GM_getValue = function (key, defaultValue) {
        if (Object.prototype.hasOwnProperty.call(memStore, key)) {
            return memStore[key];
        }
        try {
            const ls = localStorage.getItem(key);
            if (ls !== null) return ls;
        } catch (_) {}
        return defaultValue;
    };

    globalThis.GM_setValue = function (key, value) {
        memStore[key] = value;
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            chrome.storage.local.set({ [key]: value });
        }
    };

    globalThis.GM_registerMenuCommand = function () {
        // Handled natively via the Manifest V3 Extension Toolbar Popup (popup.html)
    };

    globalThis.GM_xmlhttpRequest = function (details) {
        if (!details || !details.url) return;

        chrome.runtime.sendMessage(
            {
                type: 'HT_BG_FETCH',
                url: details.url,
                method: details.method || 'GET',
                headers: details.headers || {},
                timeout: details.timeout || 8500
            },
            (res) => {
                if (chrome.runtime?.lastError || !res) {
                    if (typeof details.onerror === 'function') {
                        details.onerror(new Error(chrome.runtime?.lastError?.message || 'Extension worker unavailable'));
                    }
                    return;
                }

                if (!res.ok) {
                    if (res.isTimeout && typeof details.ontimeout === 'function') {
                        details.ontimeout();
                    } else if (typeof details.onerror === 'function') {
                        details.onerror(new Error(res.error || 'Network error'));
                    }
                    return;
                }

                if (typeof details.onload === 'function') {
                    details.onload({
                        status: res.status,
                        statusText: res.statusText,
                        finalUrl: res.finalUrl || details.url,
                        responseHeaders: res.responseHeaders || '',
                        responseText: res.responseText || ''
                    });
                }
            }
        );
    };
})();
