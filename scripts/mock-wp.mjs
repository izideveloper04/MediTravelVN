// Stand-in for the WordPress plugin API, for testing WP mode without WordPress.
// Serves content/seed.json plus whatever is in scripts/mock-extra.json, through the same
// functions the front end uses for the bundled content.
// Usage: node scripts/mock-wp.mjs [port]
import fs from 'node:fs';
import http from 'node:http';
import { makeApi } from '../lib/seed-api.js';

const port = Number(process.argv[2] || 4010);
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url)));
const hits = {};

const load = () => {
  const seed = read('../content/seed.json');
  let extra = { locations: [], items: [], redirects: {} };
  try { extra = read('./mock-extra.json'); } catch {}
  return makeApi({ locations: [...seed.locations, ...extra.locations], items: [...seed.items, ...extra.items], redirects: extra.redirects || {} });
};

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const m = url.pathname.match(/^\/wp-json\/travora\/v1\/([a-z]+)$/);
  if (url.pathname === '/_hits') return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(hits));
  if (!m) return res.writeHead(404).end();
  const q = Object.fromEntries(url.searchParams);
  const api = load();
  hits[m[1]] = (hits[m[1]] || 0) + 1;
  const out = {
    locations: () => api.locations(),
    redirects: () => api.redirects(),
    item: () => ({ item: api.item(q.path) }),
    list: () => api.list({ type: q.type, location: q.location, slugs: q.slugs, exclude: q.exclude, category: q.category, featured: q.featured, page: q.page, perPage: q.per_page }),
    index: () => api.index({ page: q.page, perPage: q.per_page }),
  }[m[1]];
  if (!out) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(out()));
}).listen(port, () => console.log(`mock WordPress API on ${port}`));
