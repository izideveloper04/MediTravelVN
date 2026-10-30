import { revalidatePath, revalidateTag } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';

// WordPress calls this after a publish, update, unpublish or slug change.
// Header: x-revalidate-secret (or ?secret=). Body: { paths?: string[] }
const same = (a, b) => {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function POST(request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return Response.json({ ok: false, error: 'REVALIDATE_SECRET is not set' }, { status: 503 });
  const given = request.headers.get('x-revalidate-secret') ?? new URL(request.url).searchParams.get('secret');
  if (!same(given, expected)) return Response.json({ ok: false }, { status: 401 });

  // Every page reads the full site payload, so one tag refreshes everything.
  revalidateTag('wp');
  const body = await request.json().catch(() => ({}));
  const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === 'string' && p.startsWith('/')) : [];
  paths.forEach((p) => revalidatePath(p));
  revalidatePath('/', 'layout');
  return Response.json({ ok: true, paths });
}
