import { sitemapFile, XML } from '../../../lib/sitemap.js';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const n = Number(((await params).file || '').replace(/\.xml$/, ''));
  const xml = Number.isInteger(n) && n > 0 ? await sitemapFile(n) : null;
  return xml ? new Response(xml, { headers: XML }) : new Response('Not found', { status: 404 });
}
