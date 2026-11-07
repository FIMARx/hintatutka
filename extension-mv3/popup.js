(function () {
    'use strict';

    const PROXY_KEY = 'ufhpc_proxy_url_v90';
    const WATCHLIST_KEY = 'ufhpc_watchlist_items_v70';
    const UPDATE_STATE_KEY = 'ufhpc_mv3_update_state_v91';

    const verBadge = document.getElementById('ver-badge');
    const checkUpdateBtn = document.getElementById('check-update-btn');
    const updateCard = document.getElementById('update-card');
    const updateTitle = document.getElementById('update-title');
    const updateDownloadLink = document.getElementById('update-download-link');
    const proxyInput = document.getElementById('proxy-input');
    const proxyPill = document.getElementById('proxy-pill');
    const saveProxyBtn = document.getElementById('save-proxy-btn');
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    const cacheStat = document.getElementById('cache-stat');
    const watchListEl = document.getElementById('watch-list');
    const watchCountEl = document.getElementById('watch-count');
    const statusMsg = document.getElementById('status-msg');

    function flashStatus(text) {
        statusMsg.textContent = text;
        setTimeout(() => {
            if (statusMsg.textContent === text) statusMsg.textContent = '';
        }, 3200);
    }

    function updateProxyBadge(url) {
        if (url) {
            proxyPill.textContent = 'Edge Proxy ON';
            proxyPill.style.color = '#6ee7b7';
        } else {
            proxyPill.textContent = 'Direct Mode';
            proxyPill.style.color = '#94a3b8';
        }
    }

    function renderUpdateState(state) {
        if (!state || !state.hasUpdate) {
            updateCard.classList.remove('is-visible');
            return;
        }
        updateTitle.textContent = `🚀 Update Available (v${state.localVersion} → v${state.remoteVersion})`;
        if (state.downloadUrl) updateDownloadLink.href = state.downloadUrl;
        updateCard.classList.add('is-visible');
    }

    function renderWatchlist(rawStr) {
        let items = [];
        try {
            items = JSON.parse(rawStr || '[]');
            if (!Array.isArray(items)) items = [];
        } catch (_) {
            items = [];
        }
        watchCountEl.textContent = String(items.length);
        if (items.length === 0) return;

        watchListEl.innerHTML = '';
        for (const item of items.slice(0, 20)) {
            const a = document.createElement('a');
            a.className = 'watch-item';
            a.href = item.url || '#';
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'watch-name';
            nameSpan.textContent = item.name || 'Product';

            const priceSpan = document.createElement('span');
            priceSpan.className = 'watch-price';
            const priceNum = Number(item.initialPrice);
            priceSpan.textContent = Number.isFinite(priceNum) && priceNum > 0
                ? `${priceNum.toFixed(2).replace('.', ',')} €`
                : '—';

            a.appendChild(nameSpan);
            a.appendChild(priceSpan);
            watchListEl.appendChild(a);
        }
    }

    chrome.storage.local.get([PROXY_KEY, WATCHLIST_KEY, UPDATE_STATE_KEY], (res) => {
        const savedProxy = String(res?.[PROXY_KEY] || '').trim();
        proxyInput.value = savedProxy;
        updateProxyBadge(savedProxy);
        if (res?.[WATCHLIST_KEY]) {
            renderWatchlist(res[WATCHLIST_KEY]);
        }
        if (res?.[UPDATE_STATE_KEY]) {
            renderUpdateState(res[UPDATE_STATE_KEY]);
        }
    });

    chrome.runtime.sendMessage({ type: 'HT_GET_STATS' }, (res) => {
        if (res?.ok) {
            cacheStat.textContent = `${res.bgCachedUrls} cached`;
            if (res.localVersion) verBadge.textContent = `MV3 v${res.localVersion}`;
        }
    });

    checkUpdateBtn.addEventListener('click', () => {
        checkUpdateBtn.textContent = '⏳...';
        chrome.runtime.sendMessage({ type: 'HT_CHECK_UPDATE', force: true }, (res) => {
            checkUpdateBtn.textContent = '↻ Update';
            if (res?.updateState) {
                renderUpdateState(res.updateState);
                if (res.updateState.hasUpdate) {
                    flashStatus(`🚀 New version v${res.updateState.remoteVersion} found!`);
                } else {
                    flashStatus(`✓ Up to date (v${res.updateState.localVersion}) + selectors synced!`);
                }
            } else {
                flashStatus('✓ Selectors hot-patched!');
            }
        });
    });

    saveProxyBtn.addEventListener('click', () => {
        const cleaned = proxyInput.value.trim().replace(/\/proxy\/?$/i, '').replace(/\/+$/, '');
        if (cleaned && !/^https?:\/\/[a-z0-9.-]+(?::\d+)?(?:\/[^\s]*)?$/i.test(cleaned)) {
            flashStatus('⚠️ Invalid HTTPS URL');
            return;
        }
        proxyInput.value = cleaned;
        chrome.storage.local.set({ [PROXY_KEY]: cleaned }, () => {
            updateProxyBadge(cleaned);
            flashStatus(cleaned ? '☁️ Serverless Proxy saved!' : '⚡ Switched to Direct Mode');
        });
    });

    clearCacheBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'HT_CLEAR_CACHE' }, () => {
            cacheStat.textContent = '0 cached';
            flashStatus('🧹 Shared cache cleared!');
        });
    });
})();
