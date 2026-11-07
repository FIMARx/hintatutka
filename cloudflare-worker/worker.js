/**
 * HintaTutka v9.0 — Decoupled Serverless Edge Proxy & Selector Hub (Cloudflare Worker)
 *
 * Features:
 * 1. Masks individual user IPs behind Cloudflare's global edge network (prevents per-user 429 / WAF blocks).
 * 2. Shared Edge Caching (15-min TTL via caches.default) — popular products are scraped once at the edge.
 * 3. Strict domain allowlist & header sanitization (prevents SSRF / open-proxy abuse).
 * 4. Serves hot-patchable `selectors.json` from `/selectors` with 1-hour edge caching.
 */

const SELECTORS_UPSTREAM_URL = 'https://raw.githubusercontent.com/FIMARx/hintatutka/main/selectors.json';
const PROXY_CACHE_TTL_SECONDS = 900; // 15 minutes
const SELECTORS_CACHE_TTL_SECONDS = 3600; // 1 hour

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
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Accept-Language, Content-Type',
    'Access-Control-Expose-Headers': 'X-Final-Url, X-HT-Edge-Cache'
};

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

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        const reqUrl = new URL(request.url);

        if (reqUrl.pathname === '/health' || reqUrl.pathname === '/') {
            return jsonResponse({
                ok: true,
                service: 'hintatutka-serverless-proxy',
                version: '9.0',
                endpoints: ['/proxy?url=<encoded_https_url>', '/selectors', '/health']
            });
        }

        if (reqUrl.pathname === '/selectors') {
            const cache = caches.default;
            const cacheKey = new Request('https://hintatutka-edge.local/selectors-v90', { method: 'GET' });
            let cached = await cache.match(cacheKey);
            if (cached) {
                const headers = new Headers(cached.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
                headers.set('X-HT-Edge-Cache', 'HIT');
                return new Response(cached.body, { status: cached.status, headers });
            }

            const upstream = await fetch(SELECTORS_UPSTREAM_URL, {
                headers: { 'Accept': 'application/json', 'User-Agent': 'HintaTutka-Edge-Worker/9.0' }
            });
            if (!upstream.ok) {
                return jsonResponse({ error: `Upstream selectors HTTP ${upstream.status}` }, 502);
            }
            const bodyText = await upstream.text();
            const outHeaders = {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': `public, max-age=300, s-maxage=${SELECTORS_CACHE_TTL_SECONDS}`,
                'X-HT-Edge-Cache': 'MISS',
                ...CORS_HEADERS
            };
            const res = new Response(bodyText, { status: 200, headers: outHeaders });
            ctx.waitUntil(cache.put(cacheKey, res.clone()));
            return res;
        }

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
            const normalizedCacheUrl = `https://hintatutka-edge.local/proxy-cache?u=${encodeURIComponent(targetUrl.toString())}&a=${encodeURIComponent(accept.slice(0, 60))}`;
            const cacheKey = new Request(normalizedCacheUrl, { method: 'GET' });

            const cachedRes = await cache.match(cacheKey);
            if (cachedRes) {
                const headers = new Headers(cachedRes.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
                headers.set('X-HT-Edge-Cache', 'HIT');
                return new Response(cachedRes.body, { status: cachedRes.status, headers });
            }

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
                const outHeaders = new Headers({
                    'Content-Type': contentType,
                    'X-Final-Url': upstreamRes.url || targetUrl.toString(),
                    'X-HT-Edge-Cache': 'MISS',
                    ...CORS_HEADERS
                });

                if (upstreamRes.status >= 200 && upstreamRes.status < 300) {
                    outHeaders.set('Cache-Control', `public, max-age=180, s-maxage=${PROXY_CACHE_TTL_SECONDS}`);
                    const responseToCache = new Response(bodyBuffer, { status: upstreamRes.status, headers: outHeaders });
                    ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
                    return responseToCache;
                }

                outHeaders.set('Cache-Control', 'no-store');
                return new Response(bodyBuffer, { status: upstreamRes.status, headers: outHeaders });
            } catch (err) {
                return jsonResponse({ error: 'Upstream fetch failed', detail: String(err?.message || err) }, 502);
            }
        }

        return jsonResponse({ error: 'Not found' }, 404);
    }
};
