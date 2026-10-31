import { notFound, permanentRedirect } from 'next/navigation';
import { resolve, listPaths, getChrome } from '../../lib/content';

const toPath = (slug) => '/' + (slug?.length ? slug.join('/') + '/' : '');
const NAV = { flights: '/flights/', hotels: '/hotels/', destinations: '/destinations/', tours: '/tours/', transportation: '/transportation/', blog: '/blog/' };

export async function generateStaticParams() {
  try {
    return (await listPaths()).map((p) => ({ slug: p === '/' ? [] : p.split('/').filter(Boolean) }));
  } catch {
    return []; // WordPress unreachable at build time: pages are generated on first request instead
  }
}

export async function generateMetadata({ params }) {
  const path = toPath((await params).slug);
  const page = await resolve(path);
  if (!page || page.redirect) return {};
  const { seo = {} } = page;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: seo.canonical || path },
    robots: seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: { type: path.startsWith('/blog/') && path !== '/blog/' ? 'article' : 'website', siteName: 'Travora', title: page.title, description: page.description, url: seo.canonical || path, images: seo.og_image || page.image ? [seo.og_image || page.image] : undefined },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description },
  };
}

// Mark the current service link active, as the original markup does.
const markActive = (html, service) => {
  const href = NAV[service];
  if (!href) return html;
  return html.replace(`<a href="${href}" class="" >`, `<a href="${href}" class="active" aria-current="page">`);
};

export default async function Page({ params }) {
  const path = toPath((await params).slug);
  const page = await resolve(path);
  if (!page) notFound();
  if (page.redirect) permanentRedirect(page.redirect);
  const { skip, header, footer, currencyConfig } = await getChrome();
  return (
    <>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: skip + markActive(header, page.service) }} />
      <main id="main" dangerouslySetInnerHTML={{ __html: page.main }} />
      {page.jsonld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page.jsonld).replace(/</g, String.fromCharCode(92) + 'u003c') }} />}
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: footer + `<script id="currency-config" type="application/json">${currencyConfig}</script>` }} />
    </>
  );
}
