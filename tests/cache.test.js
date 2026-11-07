import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadHintaTutka } from './lib/harness.js';

test('cache: CACHE_PREFIX uses isolated v95 namespace', () => {
    const { exports: HT } = loadHintaTutka();
    assert.strictEqual(HT.CACHE_PREFIX, 'ufhpc_v95_', 'CACHE_PREFIX must be isolated to ufhpc_v95_');
});

test('cache: purgeLegacyCaches dynamically removes stale versions but keeps current version entries', () => {
    const initialStorage = {
        'ufhpc_v81_oldkey': 'stale_v81',
        'ufhpc_v90_oldkey': 'stale_v90',
        'ufhpc_v93_iphone17': 'stale_v93',
        'ufhpc_v94_iphone18': 'stale_v94',
        'ufhpc_v95_iphone18': 'valid_v95',
        'other_app_key': 'unrelated'
    };

    const { exports: HT, storage } = loadHintaTutka({ initialStorage });

    HT.purgeLegacyCaches();

    assert.strictEqual(storage.getItem('ufhpc_v81_oldkey'), null, 'v81 cache must be purged');
    assert.strictEqual(storage.getItem('ufhpc_v90_oldkey'), null, 'v90 cache must be purged');
    assert.strictEqual(storage.getItem('ufhpc_v93_iphone17'), null, 'v93 cache must be purged');
    assert.strictEqual(storage.getItem('ufhpc_v94_iphone18'), null, 'v94 cache must be purged');
    assert.strictEqual(storage.getItem('ufhpc_v95_iphone18'), 'valid_v95', 'Current v95 cache must be preserved');
    assert.strictEqual(storage.getItem('other_app_key'), 'unrelated', 'Non-HintaTutka keys must not be touched');
});

test('cache: getCached and setCached store and retrieve data with TTL in L1 memory cache', () => {
    const { exports: HT } = loadHintaTutka();

    const sampleData = { title: 'Apple iPhone 18 Pro', price: 1509.00 };
    HT.setCached('test_item', sampleData, 60000); // 60s TTL

    const cached = HT.getCached('test_item');
    assert.ok(cached, 'Cached item must be retrieved');
    assert.strictEqual(cached.title, sampleData.title);
    assert.strictEqual(cached.price, sampleData.price);
});
