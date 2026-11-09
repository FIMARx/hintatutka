import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

const rel = (p) => relative(repoRoot, p).replace(/\\/g, '/');
const read = (p) => readFileSync(p, 'utf8');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'out']);

function walk(dir, accept, found = []) {
    for (const name of readdirSync(dir)) {
        if (SKIP_DIRS.has(name)) continue;
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) walk(full, accept, found);
        else if (accept(rel(full))) found.push(full);
    }
    return found;
}

test('guard 1: HintaTutka.user.js and extension-mv3/hintatutka-core.js are 100% byte-identical', () => {
    const userJs = readFileSync(join(repoRoot, 'HintaTutka.user.js'));
    const coreJs = readFileSync(join(repoRoot, 'extension-mv3', 'hintatutka-core.js'));
    assert.strictEqual(
        userJs.length,
        coreJs.length,
        `File lengths differ: Userscript (${userJs.length} bytes) vs MV3 core (${coreJs.length} bytes)`
    );
    assert.ok(userJs.equals(coreJs), 'HintaTutka.user.js and extension-mv3/hintatutka-core.js must be byte-identical');
});

test('guard 2: version consistency across userscript header, script constant and manifest.json', () => {
    const userJsText = read(join(repoRoot, 'HintaTutka.user.js'));
    const manifestText = read(join(repoRoot, 'extension-mv3', 'manifest.json'));
    const packageText = read(join(repoRoot, 'package.json'));

    const headerVerM = userJsText.match(/\/\/\s*@version\s+([0-9]+(?:\.[0-9]+)*)/);
    assert.ok(headerVerM, 'Missing @version in Userscript header');
    const headerVer = headerVerM[1];

    const constVerM = userJsText.match(/const\s+SCRIPT_VERSION\s*=\s*['"]([^'"]+)['"]/);
    assert.ok(constVerM, 'Missing SCRIPT_VERSION constant in script');
    const constVer = constVerM[1];

    assert.strictEqual(headerVer, constVer, `@version (${headerVer}) and SCRIPT_VERSION (${constVer}) must match`);

    const manifest = JSON.parse(manifestText);
    assert.ok(
        manifest.version.startsWith(constVer),
        `manifest.json version (${manifest.version}) must match SCRIPT_VERSION (${constVer})`
    );

    const pkg = JSON.parse(packageText);
    assert.ok(
        pkg.version.startsWith(constVer),
        `package.json version (${pkg.version}) must match SCRIPT_VERSION (${constVer})`
    );
});

test('guard 3: selectors.json exists, is valid strict JSON, and matches schemaVersion 1', () => {
    const selPath = join(repoRoot, 'selectors.json');
    assert.ok(existsSync(selPath), 'selectors.json must exist');
    const parsed = JSON.parse(read(selPath));
    assert.strictEqual(parsed.schemaVersion, 1, 'selectors.json schemaVersion must be 1');
    assert.ok(parsed.storeOverrides && typeof parsed.storeOverrides === 'object', 'selectors.json must define storeOverrides');
});

test('guard 4: SVG hero banner is valid XML and has balanced closing tags', () => {
    const svgPath = join(repoRoot, 'assets', 'hero-banner.svg');
    assert.ok(existsSync(svgPath), 'assets/hero-banner.svg must exist');
    const svg = read(svgPath);
    assert.ok(svg.includes('<svg') && svg.includes('</svg>'), 'Banner must have valid <svg> and </svg> tags');
    assert.ok(!svg.includes('NaN') && !svg.includes('undefined'), 'SVG must not contain NaN or undefined coordinates');
    assert.ok(svg.includes('viewBox="0 0 1200 400"'), 'SVG viewBox must be 1200x400');
});

test('guard 5: no personal developer paths, usernames, or secrets leaked into repository files', () => {
    // Avoid tripping this test on itself:
    const bannedPrefix = ['C:', '\\Users', '\\nuori'].join('');
    const bannedSlash = ['C:', '/Users', '/nuori'].join('');
    const files = walk(repoRoot, (p) =>
        /^(HintaTutka\.user\.js|README\.md|package\.json|selectors\.json|extension-mv3\/|assets\/)/.test(p) &&
        /\.(js|json|md|svg|html|css|ps1|sh)$/.test(p)
    );

    assert.ok(files.length > 5, `Expected at least 5 scanned files, got ${files.length}`);

    const violations = [];
    for (const f of files) {
        const text = read(f);
        if (text.includes(bannedPrefix) || text.includes(bannedSlash)) {
            violations.push(rel(f));
        }
    }
    assert.deepEqual(violations, [], `Forbidden local paths leaked in: ${violations.join(', ')}`);
});

test('guard 6: docs/index.html exists and all embedded scripts compile cleanly with zero syntax errors', () => {
    const docsPath = join(repoRoot, 'docs', 'index.html');
    assert.ok(existsSync(docsPath), 'docs/index.html must exist');
    const html = read(docsPath);
    const scripts = [...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)];
    assert.ok(scripts.length > 0, 'docs/index.html must contain at least one <script> tag');
    for (const [_, code] of scripts) {
        assert.doesNotThrow(() => {
            new vm.Script(code);
        }, 'Script in docs/index.html failed syntax compilation');
    }
});
