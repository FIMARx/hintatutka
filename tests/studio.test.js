import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const DOCS_PATH = join(ROOT_DIR, 'docs', 'index.html');

test('studio: docs/index.html exists and is well-formed HTML', () => {
    assert.ok(existsSync(DOCS_PATH), 'docs/index.html must exist');
    const html = readFileSync(DOCS_PATH, 'utf8');
    assert.ok(html.includes('<!DOCTYPE html>'), 'Must start with doctype');
    assert.ok(html.includes('<html'), 'Must contain html tag');
    assert.ok(html.includes('</html>'), 'Must close html tag');
});

test('studio: embedded script compiles cleanly in VM with zero syntax errors', () => {
    const html = readFileSync(DOCS_PATH, 'utf8');
    const scriptM = html.match(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/i);
    assert.ok(scriptM, 'Must contain a <script> block');
    
    assert.doesNotThrow(() => {
        new vm.Script(scriptM[1]);
    }, 'Studio script must be 100% syntactically valid JavaScript');
});

test('studio: all button onclick handlers reference functions defined in the script', () => {
    const html = readFileSync(DOCS_PATH, 'utf8');
    const scriptM = html.match(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/i);
    const scriptCode = scriptM[1];

    const onclickRegex = /onclick="([a-zA-Z0-9_]+)\(/g;
    const calledFunctions = new Set();
    let m;
    while ((m = onclickRegex.exec(html)) !== null) {
        calledFunctions.add(m[1]);
    }

    assert.ok(calledFunctions.size >= 5, `Expected multiple onclick functions, found ${calledFunctions.size}`);

    for (const fnName of calledFunctions) {
        const fnDefRegex = new RegExp(`function\\s+${fnName}\\b`);
        assert.ok(
            fnDefRegex.test(scriptCode),
            `Button onclick calls "${fnName}()" but it is not defined in the studio script!`
        );
    }
});

test('studio: all static getElementById calls in script exist in DOM', () => {
    const html = readFileSync(DOCS_PATH, 'utf8');
    const scriptM = html.match(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/i);
    const scriptCode = scriptM[1];

    const getElemRegex = /getElementById\(['"]([a-zA-Z0-9_-]+)['"]\)/g;
    const referencedIds = new Set();
    let m;
    while ((m = getElemRegex.exec(scriptCode)) !== null) {
        referencedIds.add(m[1]);
    }

    for (const id of referencedIds) {
        // Exclude dynamic IDs constructed at runtime
        if (id.includes('+')) continue;
        const idRegex = new RegExp(`id=["']${id}["']`);
        assert.ok(
            idRegex.test(html),
            `Script references document.getElementById("${id}") but id="${id}" is missing from docs/index.html!`
        );
    }
});
