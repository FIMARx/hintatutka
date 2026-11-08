/**
 * HintaTutka v9.6 — Decoupled Serverless Edge Proxy & Real-Time Intelligence Hub (Cloudflare Worker)
 *
 * Features:
 * 1. Masks individual user IPs behind Cloudflare's global edge network (prevents per-user 429 / WAF blocks).
 * 2. True Micro-Caching with Stale-While-Revalidate (SWR):
 *    - Serves instantaneous 0ms cached responses.
 *    - Revalidates stale entries silently in background via ctx.waitUntil.
 *    - Store-specific cache profiles (volatile second-hand vs retail).
 * 3. Holt-Winters Triple Exponential Smoothing endpoint (/forecast) at the edge.
 * 4. Strict domain allowlist & header sanitization (prevents SSRF / open-proxy abuse).
 * 5. Serves hot-patchable selectors.json from /selectors with SWR caching.
 * 6. Live telemetry download badge at /stats-card.svg.
 */

const SELECTORS_UPSTREAM_URL = 'https://raw.githubusercontent.com/FIMARx/hintatutka/main/selectors.json';

const ALLOWED_HOST_SUFFIXES = [
    'hinta.fi',
    'hintaseuranta.fi',
    'tori.fi',
    'vinted.fi',
    'huuto.net',
    'amazon.de',
    'geizhals.eu',
    'idealo.de',
    'prisma.fi',
    'k-rauta.fi',
    'motonet.fi',
    'puuilo.fi',
    'clasohlson.com',
    'tokmanni.fi',
    'algolia.net',
    'ksearchnet.com',
    'cdtapps.com',
    'ruohonjuuri.fi',
    'budgetsport.fi',
    'partioaitta.fi',
    'haglofs.com',
    'duckduckgo.com'
];

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Type',
    'Access-Control-Expose-Headers': 'X-Final-Url, X-HT-Cache-Status, X-HT-Cache-Age'
};

function getStoreCachePolicy(hostname) {
    const h = String(hostname || '').toLowerCase();
    if (h.includes('tori.fi') || h.includes('vinted.fi') || h.includes('huuto.net')) {
        // High-volatility second-hand listings: 3 min fresh, 15 min SWR
        return { maxAge: 180, swr: 900, category: 'peer_to_peer' };
    }
    // Standard retail stores & aggregators: 10 min fresh, 1 hour SWR
    return { maxAge: 600, swr: 3600, category: 'retail' };
}

function isAllowedUpstreamHost(hostname) {
    const h = String(hostname || '').toLowerCase().trim();
    if (!h || h === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(':')) {
        return false;
    }
    return ALLOWED_HOST_SUFFIXES.some(suffix => h === suffix || h.endsWith(`.${suffix}`));
}

function jsonResponse(payload, status = 200, extraHeaders = {}) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...CORS_HEADERS,
            ...extraHeaders
        }
    });
}

// Holt-Winters Triple Exponential Smoothing Model for Edge Forecasts
function calculateHoltWintersForecast(prices, seasonalPeriod = 4, alpha = 0.25, beta = 0.15, gamma = 0.35, forecastHorizon = 1) {
    if (!Array.isArray(prices) || prices.length < 3) return null;
    const cleanPrices = prices.filter(p => Number.isFinite(p) && p > 0);
    const n = cleanPrices.length;
    if (n < 3) return null;
    const m = Math.min(seasonalPeriod, Math.max(2, Math.floor(n / 2)));
    let L = cleanPrices[0];
    let b = (cleanPrices[Math.min(m, n - 1)] - cleanPrices[0]) / Math.max(1, m);
    const s = new Array(m).fill(1.0);
    if (n >= m * 2) {
        for (let i = 0; i < m; i++) {
            const avg = (cleanPrices[i] + cleanPrices[i + m]) / 2;
            s[i] = (L > 0) ? (avg / L) : 1.0;
        }
    }
    for (let t = 0; t < n; t++) {
        const y = cleanPrices[t];
        const sIdx = t % m;
        const prevL = L;
        const prevB = b;
        const sFactor = Math.max(0.5, Math.min(1.5, s[sIdx]));
        L = alpha * (y / sFactor) + (1 - alpha) * (prevL + prevB);
        b = beta * (L - prevL) + (1 - beta) * prevB;
        s[sIdx] = gamma * (y / Math.max(1, L)) + (1 - gamma) * sFactor;
    }
    const h = Math.max(1, forecastHorizon);
    const sFutureIdx = (n - 1 + h) % m;
    const futureSeasonal = Math.max(0.65, Math.min(1.35, s[sFutureIdx]));
    const forecastedPrice = Math.max(1, (L + h * b) * futureSeasonal);
    const trendPct = (L > 0) ? ((b * h) / L) * 100 : 0;
    return {
        baselineLevel: Math.round(L * 100) / 100,
        trendPerInterval: Math.round(b * 100) / 100,
        trendPct: Math.round(trendPct * 10) / 10,
        seasonalIndices: s.map(x => Math.round(x * 100) / 100),
        forecastedPrice: Math.round(forecastedPrice * 100) / 100,
        trendDir: trendPct <= -2.0 ? 'falling' : (trendPct >= 2.0 ? 'rising' : 'stable')
    };
}

async function fetchAndCacheUpstream(targetUrl, accept, cache, cacheKey, policy) {
    try {
        const upstreamRes = await fetch(targetUrl.toString(), {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Accept': accept,
                'Accept-Language': 'fi-FI,fi;q=0.9,en-GB;q=0.8,en;q=0.7',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            }
        });

        const bodyBuffer = await upstreamRes.arrayBuffer();
        const contentType = upstreamRes.headers.get('Content-Type') || 'text/html; charset=utf-8';
        const nowMs = Date.now();

        const outHeaders = new Headers({
            'Content-Type': contentType,
            'X-Final-Url': upstreamRes.url || targetUrl.toString(),
            'X-HT-Cache-Status': 'MISS',
            'X-HT-Cached-At': String(nowMs),
            'X-HT-Cache-Policy': policy.category,
            ...CORS_HEADERS
        });

        if (upstreamRes.status >= 200 && upstreamRes.status < 300) {
            outHeaders.set('Cache-Control', `public, max-age=${policy.maxAge}, stale-while-revalidate=${policy.swr}`);
            const responseToCache = new Response(bodyBuffer, { status: upstreamRes.status, headers: outHeaders });
            await cache.put(cacheKey, responseToCache.clone());
            return responseToCache;
        }

        outHeaders.set('Cache-Control', 'no-store');
        return new Response(bodyBuffer, { status: upstreamRes.status, headers: outHeaders });
    } catch (err) {
        return jsonResponse({ error: 'Upstream fetch failed', detail: String(err?.message || err) }, 502);
    }
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        const reqUrl = new URL(request.url);

        if (reqUrl.pathname === '/health' || reqUrl.pathname === '/') {
            return jsonResponse({
                ok: true,
                service: 'hintatutka-serverless-proxy',
                version: '9.6',
                endpoints: [
                    '/proxy?url=<encoded_https_url>',
                    '/selectors',
                    '/forecast?prices=p1,p2,p3...',
                    '/stats-card.svg',
                    '/health'
                ],
                features: ['SWR micro-caching (stale-while-revalidate)', 'Holt-Winters edge forecasting']
            });
        }

        // Holt-Winters Seasonal Price Forecast API endpoint
        if (reqUrl.pathname === '/forecast') {
            let prices = [];
            let seasonalPeriod = 4;
            if (request.method === 'POST') {
                try {
                    const body = await request.json();
                    if (Array.isArray(body?.prices)) prices = body.prices;
                    if (Number.isFinite(body?.seasonalPeriod)) seasonalPeriod = body.seasonalPeriod;
                } catch (_) {}
            } else {
                const pParam = reqUrl.searchParams.get('prices');
                if (pParam) {
                    prices = pParam.split(',').map(x => parseFloat(x.trim())).filter(x => Number.isFinite(x) && x > 0);
                }
                const spParam = reqUrl.searchParams.get('period');
                if (spParam) seasonalPeriod = parseInt(spParam, 10) || 4;
            }

            if (!prices || prices.length < 3) {
                return jsonResponse({ error: 'At least 3 valid price points required in prices array/query' }, 400);
            }

            const forecast = calculateHoltWintersForecast(prices, seasonalPeriod);
            return jsonResponse({
                ok: true,
                model: 'Holt-Winters Triple Exponential Smoothing',
                inputPointsCount: prices.length,
                forecast
            }, 200, {
                'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600'
            });
        }

        // Dynamic Download Telemetry Card
        if (reqUrl.pathname === '/stats-card.svg') {
            const cache = caches.default;
            const cacheKey = new Request('https://hintatutka-edge.local/stats-card-v96', { method: 'GET' });
            const cached = await cache.match(cacheKey);
            if (cached) return cached;

            let totalDownloads = 0;
            let scriptDownloads = 0;
            let extDownloads = 0;
            let latestTag = 'v9.6';
            try {
                const relRes = await fetch('https://api.github.com/repos/FIMARx/hintatutka/releases?per_page=30', {
                    headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'HintaTutka-Edge-Worker/9.6' }
                });
                if (relRes.ok) {
                    const releases = await relRes.json();
                    if (Array.isArray(releases) && releases.length > 0) {
                        latestTag = releases[0].tag_name || latestTag;
                        for (const rel of releases) {
                            for (const asset of (rel.assets || [])) {
                                const c = Number(asset.download_count) || 0;
                                totalDownloads += c;
                                if (String(asset.name).endsWith('.user.js')) scriptDownloads += c;
                                else if (String(asset.name).endsWith('.zip')) extDownloads += c;
                            }
                        }
                    }
                }
            } catch (_) {}

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="148" viewBox="0 0 520 148" role="img" aria-label="HintaTutka Downloads: ${totalDownloads}">
  <rect width="520" height="148" rx="14" fill="#0b1324" stroke="#1e293b" stroke-width="2"/>
  <text x="22" y="32" font-family="Inter,Segoe UI,sans-serif" font-size="14" font-weight="800" fill="#f8fafc">⚡ HintaTutka Live Download Telemetry (${latestTag})</text>
  <rect x="22" y="48" width="148" height="78" rx="10" fill="#064e3b" fill-opacity="0.38" stroke="#10b981" stroke-opacity="0.5"/>
  <text x="36" y="72" font-family="Inter,Segoe UI,sans-serif" font-size="10" font-weight="700" fill="#a7f3d0">TOTAL DOWNLOADS</text>
  <text x="36" y="108" font-family="Inter,Segoe UI,sans-serif" font-size="28" font-weight="900" fill="#6ee7b7">${totalDownloads}</text>
  <rect x="186" y="48" width="148" height="78" rx="10" fill="#1e293b" stroke="#334155"/>
  <text x="200" y="72" font-family="Inter,Segoe UI,sans-serif" font-size="10" font-weight="700" fill="#fda4af">USERSCRIPT (.JS)</text>
  <text x="200" y="108" font-family="Inter,Segoe UI,sans-serif" font-size="26" font-weight="900" fill="#f8fafc">${scriptDownloads}</text>
  <rect x="350" y="48" width="148" height="78" rx="10" fill="#1e293b" stroke="#334155"/>
  <text x="364" y="72" font-family="Inter,Segoe UI,sans-serif" font-size="10" font-weight="700" fill="#c4b5fd">MV3 EXTENSION</text>
  <text x="364" y="108" font-family="Inter,Segoe UI,sans-serif" font-size="26" font-weight="900" fill="#f8fafc">${extDownloads}</text>
</svg>`;
            const res = new Response(svg, {
                status: 200,
                headers: {
                    'Content-Type': 'image/svg+xml; charset=utf-8',
                    'Cache-Control': 'public, max-age=180, s-maxage=300',
                    ...CORS_HEADERS
                }
            });
            ctx.waitUntil(cache.put(cacheKey, res.clone()));
            return res;
        }

        // Hot-Patchable Selectors Registry with Stale-While-Revalidate
        if (reqUrl.pathname === '/selectors') {
            const cache = caches.default;
            const cacheKey = new Request('https://hintatutka-edge.local/selectors-v96', { method: 'GET' });
            let cached = await cache.match(cacheKey);

            if (cached) {
                const cachedAt = Number(cached.headers.get('X-HT-Cached-At') || 0);
                const ageSecs = (Date.now() - cachedAt) / 1000;
                const headers = new Headers(cached.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));

                if (ageSecs > 1800) {
                    // Stale: serve cached immediately (0ms) and revalidate upstream in background
                    headers.set('X-HT-Cache-Status', 'STALE_REVALIDATING');
                    headers.set('X-HT-Cache-Age', Math.round(ageSecs).toString());
                    ctx.waitUntil((async () => {
                        try {
                            const up = await fetch(SELECTORS_UPSTREAM_URL, {
                                headers: { 'Accept': 'application/json', 'User-Agent': 'HintaTutka-Edge-Worker/9.6' }
                            });
                            if (up.ok) {
                                const body = await up.text();
                                const freshHeaders = {
                                    'Content-Type': 'application/json; charset=utf-8',
                                    'Cache-Control': 'public, max-age=1800, stale-while-revalidate=7200',
                                    'X-HT-Cached-At': String(Date.now()),
                                    'X-HT-Cache-Status': 'MISS',
                                    ...CORS_HEADERS
                                };
                                await cache.put(cacheKey, new Response(body, { status: 200, headers: freshHeaders }));
                            }
                        } catch (_) {}
                    })());
                    return new Response(cached.body, { status: cached.status, headers });
                }

                headers.set('X-HT-Cache-Status', 'HIT');
                headers.set('X-HT-Cache-Age', Math.round(ageSecs).toString());
                return new Response(cached.body, { status: cached.status, headers });
            }

            const upstream = await fetch(SELECTORS_UPSTREAM_URL, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'HintaTutka-Edge-Worker/9.6' }
            });
            if (!upstream.ok) {
                return jsonResponse({ error: `Upstream selectors HTTP ${upstream.status}` }, 502);
            }
            const bodyText = await upstream.text();
            const outHeaders = {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=1800, stale-while-revalidate=7200',
                'X-HT-Cached-At': String(Date.now()),
                'X-HT-Cache-Status': 'MISS',
                ...CORS_HEADERS
            };
            const res = new Response(bodyText, { status: 200, headers: outHeaders });
            ctx.waitUntil(cache.put(cacheKey, res.clone()));
            return res;
        }

        // Real-Time Store E-Commerce Edge Proxy with True SWR Micro-Caching
        if (reqUrl.pathname === '/proxy') {
            const rawTarget = reqUrl.searchParams.get('url');
            if (!rawTarget) {
                return jsonResponse({ error: 'Missing ?url= parameter' }, 400);
            }

            let targetUrl;
            try {
                targetUrl = new URL(rawTarget);
            } catch (_) {
                return jsonResponse({ error: 'Invalid target URL' }, 400);
            }

            if (targetUrl.protocol !== 'https:' || !isAllowedUpstreamHost(targetUrl.hostname)) {
                return jsonResponse({ error: `Host not in allowlist: ${targetUrl.hostname}` }, 403);
            }

            const accept = request.headers.get('Accept') || 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8';
            const cache = caches.default;
            const policy = getStoreCachePolicy(targetUrl.hostname);

            const normalizedCacheUrl = `https://hintatutka-edge.local/proxy-cache-v96?u=${encodeURIComponent(targetUrl.toString())}&a=${encodeURIComponent(accept.slice(0, 60))}`;
            const cacheKey = new Request(normalizedCacheUrl, { method: 'GET' });

            const cachedRes = await cache.match(cacheKey);
            if (cachedRes) {
                const cachedAt = Number(cachedRes.headers.get('X-HT-Cached-At') || 0);
                const ageSecs = (Date.now() - cachedAt) / 1000;
                const headers = new Headers(cachedRes.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));

                // If cache is older than store maxAge but within SWR window:
                // Return cached response instantly (0ms latency) and revalidate upstream in background!
                if (ageSecs > policy.maxAge && ageSecs < (policy.maxAge + policy.swr)) {
                    headers.set('X-HT-Cache-Status', 'STALE_REVALIDATING');
                    headers.set('X-HT-Cache-Age', Math.round(ageSecs).toString());
                    ctx.waitUntil(fetchAndCacheUpstream(targetUrl, accept, cache, cacheKey, policy));
                    return new Response(cachedRes.body, { status: cachedRes.status, headers });
                }

                if (ageSecs <= policy.maxAge) {
                    headers.set('X-HT-Cache-Status', 'HIT');
                    headers.set('X-HT-Cache-Age', Math.round(ageSecs).toString());
                    return new Response(cachedRes.body, { status: cachedRes.status, headers });
                }
            }

            // Cold cache MISS or completely expired past SWR window
            return await fetchAndCacheUpstream(targetUrl, accept, cache, cacheKey, policy);
        }

        return jsonResponse({ error: 'Not found' }, 404);
    }
};