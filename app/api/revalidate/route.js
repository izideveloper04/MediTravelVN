import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';

// WordPress calls this after a publish, update, unpublish or slug change.
// Header: x-revalidate-secret (or ?secret=).
// Body: { tags?: string[], paths?: string[], all?: boolean }. Tags name the data that changed (item:<path>,
// list:<type>:<country|all>, locations, redirects, index); paths are pages to rebuild.
// Only the named data and pages are refreshed, so the rest of the site stays cached.
// `all` (after an import, or from the plugin's refresh button) marks every page stale.
const TAG = /^(item:\/[^\s]*|list:[a-z]+:[a-z0-9-]+|locations|redirects|index)$/;
const MAX = 200;

const same = (a, b) => {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
};
const strings = (v) => (Array.isArray(v) ? v.filter((s) => typeof s === 'string').slice(0, MAX) : []);

export async function POST(request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return Response.json({ ok: false, error: 'REVALIDATE_SECRET is not set' }, { status: 503 });
  const given = request.headers.get('x-revalidate-secret') ?? new URL(request.url).searchParams.get('secret');
  if (!same(given, expected)) return Response.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const tags = strings(body.tags).filter((t) => TAG.test(t));
  const paths = strings(body.paths).filter((p) => p.startsWith('/'));
  if (body.all === true) {
    ['locations', 'redirects', 'index'].forEach((t) => revalidateTag(t));
    revalidatePath('/', 'layout');
  }
  tags.forEach((t) => revalidateTag(t));
  paths.forEach((p) => revalidatePath(p));
  return Response.json({ ok: true, tags, paths, all: body.all === true });
}
