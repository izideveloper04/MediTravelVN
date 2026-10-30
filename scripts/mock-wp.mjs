// Stand-in for the WordPress plugin feed, for testing WP mode without WordPress.
// Serves content/seed.json plus whatever is in scripts/mock-extra.json.
// Usage: node scripts/mock-wp.mjs [port]
import fs from 'node:fs';
import http from 'node:http';

const port = Number(process.argv[2] || 4010);
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url)));

http.createServer((req, res) => {
  if (req.url.startsWith('/wp-json/travora/v1/site')) {
    const seed = read('../content/seed.json');
    let extra = { locations: [], items: [], redirects: {} };
    try { extra = read('./mock-extra.json'); } catch {}
    const body = { locations: [...seed.locations, ...extra.locations], items: [...seed.items, ...extra.items], redirects: extra.redirects || {} };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
    return;
  }
  res.writeHead(404).end();
}).listen(port, () => console.log(`mock WordPress feed on ${port}`));
