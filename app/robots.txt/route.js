import { SITE } from '../../lib/sitemap.js';

export const dynamic = 'force-dynamic';

export function GET() {
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
