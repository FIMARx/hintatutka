import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertValidComponentContract, assertValidBundleContract } from './lib/invariants.js';

test('invariants: correctly catches and rejects naked capacity-less storage', () => {
    const bogusComp1 = { roleKey: 'storage', name: 'Sisäinen SSD-levy', cleanQuery: 'Sisäinen SSD-levy' };
    assert.throws(
        () => assertValidComponentContract(bogusComp1),
        /cannot be a naked type descriptor|MUST contain a capacity/
    );

    const bogusComp2 = { roleKey: 'storage', name: 'M.2 PCIe NVMe SSD', cleanQuery: 'M.2 PCIe NVMe SSD' };
    assert.throws(
        () => assertValidComponentContract(bogusComp2),
        /cannot be a naked type descriptor|MUST contain a capacity/
    );

    const validComp = { roleKey: 'storage', name: '1TB M.2 PCIe NVMe SSD', cleanQuery: '1TB M.2 NVMe SSD' };
    assert.doesNotThrow(() => assertValidComponentContract(validComp));
});

test('invariants: correctly rejects pure numbers or generic hardware category names', () => {
    const numericComp = { roleKey: 'ram', name: '1000', cleanQuery: '1000' };
    assert.throws(
        () => assertValidComponentContract(numericComp),
        /cannot be a bare number/
    );

    const genericMobo = { roleKey: 'mobo', name: 'Emolevy', cleanQuery: 'Emolevy' };
    assert.throws(
        () => assertValidComponentContract(genericMobo),
        /cannot be a naked type descriptor/
    );
});

test('invariants: rejects uncleaned retailer fluff in cleanQuery', () => {
    const fluffyMobo = {
        roleKey: 'mobo',
        name: 'ASUS AMD B650 -piirisarjaan pohjautuva',
        cleanQuery: 'ASUS AMD B650 -piirisarjaan pohjautuva'
    };
    assert.throws(
        () => assertValidComponentContract(fluffyMobo),
        /contains uncleaned retailer fluff/
    );
});

test('invariants: rejects prebuilt bundle with duplicate single-unit roles or missing capacity', () => {
    const duplicateCpuBundle = {
        isPcBuild: true,
        components: [
            { roleKey: 'cpu', name: 'Intel Core i5-14400', cleanQuery: 'Intel Core i5-14400' },
            { roleKey: 'cpu', name: 'Intel Core i5-14400F', cleanQuery: 'Intel Core i5-14400F' },
            { roleKey: 'storage', name: '1TB SSD', cleanQuery: '1TB SSD' },
            { roleKey: 'ram', name: '16GB DDR5', cleanQuery: '16GB DDR5 RAM' }
        ]
    };
    assert.throws(
        () => assertValidBundleContract(duplicateCpuBundle),
        /must not contain multiple cpu components/
    );
});
