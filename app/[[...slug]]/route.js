import { resolve, listPaths, getChrome } from '../../lib/content';
import { document, notFoundPage } from '../../lib/html';

// Every page is plain HTML built on first visit and cached (see lib/html.js). A publish refreshes
// only the pages whose data changed, through /api/revalidate/.
export const dynamic = 'force-static';
export const revalidate = 3600;

const toPath = (slug) => '/' + (slug?.length ? slug.join('/') + '/' : '');
const HTML = { 'Content-Type': 'text/html; charset=utf-8' };

export async function generateStaticParams() {
  try {
    return (await listPaths()).map((p) => ({ slug: p === '/' ? [] : p.split('/').filter(Boolean) }));
  } catch {
    return []; // WordPress unreachable at build time: pages are generated on first request instead
  }
}

export async function GET(_request, { params }) {
  const path = toPath((await params).slug);
  const page = await resolve(path);
  if (page?.redirect) return new Response(null, { status: 308, headers: { Location: page.redirect } });
  const shell = await getChrome();
  if (!page) return new Response(document(notFoundPage, path, shell), { status: 404, headers: HTML });
  return new Response(document(page, path, shell), { headers: HTML });
}
