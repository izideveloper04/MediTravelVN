import { sitemapIndex, XML } from '../../lib/sitemap.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(await sitemapIndex(), { headers: XML });
}
