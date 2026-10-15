#!/usr/bin/env node
/*
 * vamp.sh build + check. No dependencies (Node 18+).
 *
 *   node tools/build.mjs          write llms.txt and index.md from content.js
 *   node tools/build.mjs --og     also render og.png from tools/og.html (headless Chrome; set CHROME=/path/to/chrome)
 *   node tools/build.mjs --check  fail if llms.txt / index.md are stale, a local link or anchor is broken,
 *                                 or an <img> lacks alt; print the page's transfer weight
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.join(SITE, p);
const args = new Set(process.argv.slice(2));
let failed = false;
const fail = (msg) => { failed = true; console.error('✗ ' + msg); };

/* ── text outputs from the same source as the Machine view ── */
const ctx = { console };
ctx.window = ctx; ctx.globalThis = ctx; ctx.Buffer = Buffer;
vm.createContext(ctx);
for (const f of ['data.js', 'bat-mask.js', 'field.js', 'content.js']) vm.runInContext(fs.readFileSync(rel(f), 'utf8'), ctx, { filename: f });
const outputs = {
  'llms.txt': ctx.VampContent.llms(ctx.VAMP_DATA),
  'index.md': ctx.VampContent.markdown(ctx.VAMP_DATA),
};
for (const [name, text] of Object.entries(outputs)) {
  const cur = fs.existsSync(rel(name)) ? fs.readFileSync(rel(name), 'utf8') : null;
  if (args.has('--check')) { if (cur !== text) fail(name + ' is stale: run node tools/build.mjs'); }
  else if (cur !== text) { fs.writeFileSync(rel(name), text); console.log('wrote ' + name); }
}

/* ── og.png ── */
if (args.has('--og')) {
  const chrome = process.env.CHROME || findChrome();
  if (!chrome) { fail('no Chrome found; set CHROME'); }
  else {
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'vamp-og-'));
    execFileSync(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`,
      '--window-size=1200,630', '--force-device-scale-factor=1', '--virtual-time-budget=3000',
      `--screenshot=${rel('og.png')}`, 'file://' + rel('tools/og.html')], { stdio: 'ignore', timeout: 60000 });
    fs.rmSync(profile, { recursive: true, force: true });
    console.log('wrote og.png');
  }
}
function findChrome() {
  const roots = [path.join(os.homedir(), '.cache/ms-playwright')];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    for (const d of fs.readdirSync(r).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
      const p = path.join(r, d, 'chrome-linux64/chrome');
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

/* ── checks ── */
if (args.has('--check')) {
  const pages = ['index.html', '404.html'];
  for (const page of pages) {
    const html = fs.readFileSync(rel(page), 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      let u = m[1];
      if (/^(https?:|mailto:|data:)/.test(u) || !/[./#]/.test(u)) continue;
      if (u.startsWith('#')) {
        if (u.length > 1 && u !== '#machine' && !ids.has(u.slice(1))) fail(`${page}: missing anchor ${u}`);
        continue;
      }
      u = u.split(/[?#]/)[0];
      if (!/\.\w+$/.test(u) && !u.endsWith('/')) continue;
      const file = u.startsWith('/') ? rel(u.slice(1) || 'index.html') : rel(u);
      if (!fs.existsSync(file)) fail(`${page}: missing file ${m[1]}`);
    }
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt=/.test(m[0])) fail(`${page}: <img> without alt: ${m[0]}`);
    if (!/<title>[^<]+<\/title>/.test(html)) fail(`${page}: no <title>`);
    if (!/<html lang="/.test(html)) fail(`${page}: no lang`);
  }
  // The Human page's one-liners must match content.js (the Machine view, llms.txt and index.md use the same lines).
  const index = fs.readFileSync(rel('index.html'), 'utf8');
  for (const s of ctx.VampContent.SECTIONS) {
    if (!index.includes(`data-line="${s.id}">${s.line}</p>`)) fail(`index.html: line for ${s.id} differs from content.js`);
  }
  if (!index.includes(ctx.VampContent.TAGLINE.replace(/(humans|agents)/g, '<span class="px">$1</span>'))) fail('index.html: hero differs from content.js TAGLINE');
  if (!index.includes(`<code id="install-cmd">${ctx.VampContent.INSTALL}</code>`)) fail('index.html: install one-liner differs from content.js INSTALL');
  for (const m of fs.readFileSync(rel('styles.css'), 'utf8').matchAll(/url\("([^"]+)"\)/g)) {
    if (!fs.existsSync(rel(m[1]))) fail(`styles.css: missing ${m[1]}`);
  }
  // Transfer weight of a full visit: index.html and everything it loads (og/touch icons excluded).
  const assets = ['index.html', 'styles.css', 'data.js', 'bat-mask.js', 'field.js', 'content.js', 'app.js',
    'fonts/archivo-800.woff2', 'fonts/geist-mono.woff2', 'fonts/departure-mono.woff2', 'favicon.svg',
    'assets/wing-study-preview.jpg', 'assets/vampire-icon-112.png'];
  let raw = 0, gz = 0;
  const rows = assets.map((a) => {
    const b = fs.readFileSync(rel(a));
    const z = /\.(woff2|png|jpe?g)$/.test(a) ? b.length : zlib.gzipSync(b, { level: 9 }).length;
    raw += b.length; gz += z;
    return `  ${a.padEnd(30)} ${String(b.length).padStart(7)}  ${String(z).padStart(7)}`;
  });
  console.log('full visit (bytes)                 raw  gzip/br-ish\n' + rows.join('\n') +
    `\n  ${'total'.padEnd(30)} ${String(raw).padStart(7)}  ${String(gz).padStart(7)}  (${(gz / 1024).toFixed(1)} KiB over the wire)`);
  if (!failed) console.log('✓ checks passed');
}
process.exit(failed ? 1 : 0);
