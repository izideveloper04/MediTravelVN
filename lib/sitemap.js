import { getIndex } from './source.js';
import { getStaticPaths } from './content.js';

// Each sitemap file lists up to SIZE addresses, so files stay small however many pages exist.
export const SIZE = 1000;
export const SITE = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const XML = { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const url = (path, modified) => `<url><loc>${esc(SITE + path)}</loc>${modified ? `<lastmod>${modified}</lastmod>` : ''}</url>`;

export async function sitemapIndex() {
  const { pages } = await getIndex(1, SIZE);
  const files = Array.from({ length: pages }, (_, i) => `<sitemap><loc>${SITE}/sitemaps/${i + 1}.xml</loc></sitemap>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${files}</sitemapindex>`;
}

export async function sitemapFile(n) {
  const { items, pages } = await getIndex(n, SIZE);
  if (n > pages) return null;
  const fixed = n === 1 ? getStaticPaths().map((p) => url(p)) : [];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...fixed, ...items.map((i) => url(i.path, i.modified))].join('')}</urlset>`;
}
