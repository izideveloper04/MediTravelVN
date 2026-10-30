// Compares markup rendered from structured content against the original prototype pages.
// Usage: node scripts/fidelity.mjs [type] [slug-substring] [maxDiffs]
import fs from 'node:fs';
import { buildSite } from '../lib/site.js';
import { renderers } from '../lib/render/index.js';
import { ICONS } from '../lib/render/icons.js';
const INV = Object.fromEntries(Object.entries(ICONS).map(([k, v]) => [v, k]));

const seed = JSON.parse(fs.readFileSync(new URL('../content/seed.json', import.meta.url)));
const pages = JSON.parse(fs.readFileSync(new URL('../content/pages.json', import.meta.url)));
const site = buildSite(seed);

const IGNORE_VALUE = new Set(['data-name', 'data-dv5-search', 'data-blog-searchtext', 'min', 'value']);
function tokens(html) {
  const out = [];
  for (const m of html.matchAll(/<[^>]+>|[^<]+/g)) {
    const t = m[0];
    if (t.startsWith('<')) {
      if (t.startsWith('<!--')) continue;
      const name = (t.match(/^<\/?([a-zA-Z0-9]+)/) || [])[1];
      if (name === 'path' && !t.startsWith('</')) { const d = t; const hit = Object.keys(INV).find((p) => p.includes(t.replace(/^<path /, '').replace(/\/?>$/, '').trim())); out.push(`<icon:${hit ? INV[hit] : 'new'}>`); continue; }
      const attrs = [...t.matchAll(/\s([a-zA-Z0-9:_-]+)(?:="([^"]*)")?/g)].map((a) => `${a[1]}${a[2] !== undefined && !IGNORE_VALUE.has(a[1]) ? `="${a[2]}"` : ''}`).sort();
      out.push(`<${t.startsWith('</') ? '/' : ''}${name} ${attrs.join(' ')}>`);
    } else {
      const s = t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
      if (s) out.push(s);
    }
  }
  return out;
}

function myers(a, b) {
  const n = a.length, m = b.length, max = n + m;
  const v = new Int32Array(2 * max + 2).fill(-1);
  const off = max;
  const trace = [];
  v[off + 1] = 0;
  for (let d = 0; d <= max; d++) {
    trace.push(v.slice());
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[off + k - 1] < v[off + k + 1]) ? v[off + k + 1] : v[off + k - 1] + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) { x++; y++; }
      v[off + k] = x;
      if (x >= n && y >= m) return backtrack(trace, a, b, off);
    }
  }
  return [];
}
function backtrack(trace, a, b, off) {
  let x = a.length, y = b.length;
  const ops = [];
  for (let d = trace.length - 1; d > 0; d--) {
    const v = trace[d];
    const k = x - y;
    const prevK = k === -d || (k !== d && v[off + k - 1] < v[off + k + 1]) ? k + 1 : k - 1;
    const prevX = v[off + prevK];
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) { ops.push(['=', a[x - 1]]); x--; y--; }
    if (x === prevX) ops.push(['+', b[y - 1]]); else ops.push(['-', a[x - 1]]);
    x = prevX; y = prevY;
  }
  while (x > 0 && y > 0) { ops.push(['=', a[x - 1]]); x--; y--; }
  return ops.reverse();
}

const [, , typeArg, slugArg, maxArg] = process.argv;
const maxDiffs = Number(maxArg || 6);
let total = 0, bad = 0;
for (const item of site.items) {
  if (typeArg && item.type !== typeArg) continue;
  if (slugArg && !item.slug.includes(slugArg)) continue;
  const render = renderers[item.type];
  if (!render) continue;
  const original = pages[item.path]?.main;
  if (!original) continue;
  total++;
  const ops = myers(tokens(original), tokens(render(item, site)));
  const diffs = ops.filter((o) => o[0] !== '=');
  if (diffs.length) {
    bad++;
    console.log(`\n### ${item.type} ${item.path}  (${diffs.length} token diffs)`);
    let shown = 0;
    for (let i = 0; i < ops.length && shown < maxDiffs; i++) {
      if (ops[i][0] !== '=') {
        let j = i - 1; while (j >= 0 && /^<(icon|svg|\/svg|path)/.test(ops[j][1])) j--; const ctx = j >= 0 ? ops[j][1].slice(0, 90) : '';
        console.log(`  ${ops[i][0]} ${ops[i][1].slice(0, 150)}    [after: ${ctx}]`);
        shown++;
      }
    }
  }
}
console.log(`\n${total - bad}/${total} pages match exactly`);

// Listing pages: regenerate the dynamic regions of the stored page and compare with the original.
if (typeArg === 'lists') {
  const { patchListing } = await import('../lib/render/listings.js');
  for (const [path, page] of Object.entries(pages)) {
    if (slugArg && !path.includes(slugArg)) continue;
    if (site.byPath[path]) continue;
    const ops = myers(tokens(page.main), tokens(patchListing(path, page.main, site)));
    const diffs = ops.filter((o) => o[0] !== '=');
    if (!diffs.length) continue;
    console.log(`\n### list ${path} (${diffs.length} token diffs)`);
    let shown = 0;
    for (let i = 0; i < ops.length && shown < maxDiffs; i++) {
      if (ops[i][0] === '=') continue;
      let j = i - 1; while (j >= 0 && /^<(icon|svg|\/svg|path)/.test(ops[j][1])) j--;
      console.log(`  ${ops[i][0]} ${ops[i][1].slice(0, 150)}    [after: ${j >= 0 ? ops[j][1].slice(0, 90) : ''}]`);
      shown++;
    }
  }
}

// Live check: fetch pages from a running server and compare their <main> with the original.
// Usage: node scripts/fidelity.mjs live http://localhost:3112 [path-substring]
if (typeArg === 'live') {
  const base = slugArg.replace(/\/$/, '');
  const only = process.argv[5] || '';
  let n = 0, off = 0;
  for (const [path, page] of Object.entries(pages)) {
    if (only && !path.includes(only)) continue;
    const res = await fetch(base + path);
    const html = await res.text();
    const main = (html.match(/<main id="main">([\s\S]*?)<\/main>/) || [])[1];
    n++;
    if (res.status !== 200 || main === undefined) { off++; console.log(`### ${path}: status ${res.status}`); continue; }
    const diffs = myers(tokens(page.main), tokens(main)).filter((o) => o[0] !== '=');
    if (diffs.length) { off++; console.log(`### ${path}: ${diffs.length} token diffs`, diffs.slice(0, 3).map((d) => d[0] + ' ' + d[1].slice(0, 100))); }
  }
  console.log(`${n - off}/${n} live pages match`);
}
