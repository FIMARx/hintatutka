// Strict Hardware Component Invariant Contract Enforcer
// Prevents regression bugs like naked unpriced storage, detached units, pure numbers, and bogus search queries.

import assert from 'node:assert/strict';

export const FORBIDDEN_GENERIC_NAMES = [
    /^sisäinen\s+ssd(?:-levy)?$/i,
    /^sisäinen\s+kovalevy$/i,
    /^m\.2\s+pcie(?:\s+nvme)?(?:\s+ssd)?$/i,
    /^pcie\s+nvme\s+ssd$/i,
    /^ssd-levy$/i,
    /^kovalevy$/i,
    /^emolevy$/i,
    /^motherboard$/i,
    /^virtalähde$/i,
    /^power\s*supply$/i,
    /^prosessori$/i,
    /^processor$/i,
    /^näytönohjain$/i,
    /^graphics\s*card$/i,
    /^keskusmuisti$/i,
    /^memory$/i,
    /^kotelo$/i,
    /^chassis$/i,
    /^(?:kyllä|ei|on|ei ole|-|none|yes|no|sisäinen|valinnainen|integroitu)$/i
];

export function assertValidComponentContract(comp, context = {}) {
    const ctx = context.fixtureName ? `[${context.fixtureName}] ` : '';

    assert.ok(comp, `${ctx}Component must be defined`);
    assert.ok(typeof comp.name === 'string' && comp.name.trim().length >= 2, `${ctx}Component name must be non-empty string >= 2 chars, got: "${comp.name}"`);
    assert.ok(!/^\d+$/.test(comp.name.trim()), `${ctx}Component name cannot be a bare number, got: "${comp.name}"`);

    // Reject generic category names that have no purchasable meaning on Hinta.fi
    for (const pat of FORBIDDEN_GENERIC_NAMES) {
        assert.ok(!pat.test(comp.name.trim()), `${ctx}Component name cannot be a naked type descriptor: "${comp.name}"`);
    }

    assert.ok(typeof comp.cleanQuery === 'string' && comp.cleanQuery.trim().length >= 2, `${ctx}Clean query must be non-empty string, got: "${comp.cleanQuery}"`);
    assert.ok(!/piirisarjaan\s+(?:pohjautuva|perustuva)/i.test(comp.cleanQuery), `${ctx}Clean query contains uncleaned retailer fluff: "${comp.cleanQuery}"`);

    // Role-specific invariants
    if (comp.roleKey === 'storage') {
        assert.match(
            comp.name,
            /\b\d+\s*(?:TB|GB|Tt|Gt)\b/i,
            `${ctx}Storage component MUST contain a capacity (e.g. 1TB, 512GB), got name: "${comp.name}"`
        );
        assert.match(
            comp.cleanQuery,
            /\b\d+\s*(?:TB|GB|Tt|Gt)\b/i,
            `${ctx}Storage cleanQuery MUST contain a capacity, got: "${comp.cleanQuery}"`
        );
    }

    if (comp.roleKey === 'ram') {
        assert.match(
            comp.name,
            /\b\d+\s*(?:GB|Gt)\b/i,
            `${ctx}RAM component MUST contain a capacity, got name: "${comp.name}"`
        );
        assert.match(
            comp.cleanQuery,
            /\b\d+\s*(?:GB|Gt|RAM)\b/i,
            `${ctx}RAM cleanQuery MUST specify capacity or RAM keyword, got: "${comp.cleanQuery}"`
        );
    }

    if (comp.roleKey === 'psu') {
        assert.match(
            comp.cleanQuery,
            /\b\d{3,4}\s*W\b/i,
            `${ctx}PSU cleanQuery MUST specify wattage (e.g. 750W), got: "${comp.cleanQuery}"`
        );
    }

    if (comp.roleKey === 'mobo') {
        assert.ok(
            comp.cleanQuery.length >= 3 && !/^\s*emolevy\s*$/i.test(comp.cleanQuery),
            `${ctx}Motherboard cleanQuery must specify valid model or chipset, got: "${comp.cleanQuery}"`
        );
    }
}

export function assertValidBundleContract(bundleData, context = {}) {
    const ctx = context.fixtureName ? `[${context.fixtureName}] ` : '';

    assert.ok(bundleData, `${ctx}Bundle data must be detected`);
    assert.ok(bundleData.isBundle || bundleData.isPcBuild, `${ctx}Must be detected as bundle or prebuilt PC`);
    assert.ok(Array.isArray(bundleData.components), `${ctx}Components array must be present`);
    assert.ok(bundleData.components.length >= 3, `${ctx}Prebuilt PC must contain at least 3 distinct core components, got ${bundleData.components.length}`);

    // Check individual components against component contract
    for (const comp of bundleData.components) {
        assertValidComponentContract(comp, context);
    }

    // Role deduplication check: Prebuilts must NOT contain duplicate single-unit parts
    const singleUnitRoles = ['cpu', 'mobo', 'gpu', 'cooler', 'case', 'psu', 'os'];
    for (const roleKey of singleUnitRoles) {
        const matching = bundleData.components.filter(c => c.roleKey === roleKey);
        assert.ok(
            matching.length <= 1,
            `${ctx}Prebuilt PC must not contain multiple ${roleKey} components, got ${matching.length}: ${matching.map(m => m.name).join(' | ')}`
        );
    }

    // Storage deduplication: no orphan storage entries without capacity
    const storages = bundleData.components.filter(c => c.roleKey === 'storage');
    assert.ok(storages.length >= 1, `${ctx}Prebuilt PC must have at least 1 storage drive`);
    for (const s of storages) {
        assert.match(s.name, /\b\d+\s*(?:TB|GB|Tt|Gt)\b/i, `${ctx}All storage drives must have valid capacity: "${s.name}"`);
    }
}
