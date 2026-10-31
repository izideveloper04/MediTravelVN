// The HTML document around a page. Pages are plain HTML: the original markup and portal.js do all the
// work in the browser, so no React runtime is sent and the markup appears once.
import chrome from '../content/chrome.json';

// Read when a page is built, not when the server starts, so the address is always the current one.
const site = () => (process.env.SITE_URL || '').replace(/\/$/, '');
const NAV = { flights: '/flights/', hotels: '/hotels/', destinations: '/destinations/', tours: '/tours/', transportation: '/transportation/', blog: '/blog/' };

const attr = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const absolute = (u) => (!u ? '' : /^https?:/.test(u) ? u : site() + u);

// Mark the current service link active, as the original markup does.
const markActive = (html, service) => {
  const href = NAV[service];
  return href ? html.replace(`<a href="${href}" class="" >`, `<a href="${href}" class="active" aria-current="page">`) : html;
};

const json = (data) => JSON.stringify(data).replace(/</g, '\u003c');

function head(page, path) {
  const seo = page.seo || {};
  const canonical = absolute(seo.canonical || path);
  const image = absolute(seo.og_image || page.image);
  const article = path.startsWith('/blog/') && path !== '/blog/' && !path.includes('/page/');
  const tags = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="theme-color" content="#175CFF">',
    `<title>${attr(page.title).replace(/&quot;/g, '"')}</title>`,
    page.description ? `<meta name="description" content="${attr(page.description)}">` : '',
    canonical ? `<link rel="canonical" href="${attr(canonical)}">` : '',
    seo.noindex ? '<meta name="robots" content="noindex, follow">' : '',
    `<meta property="og:site_name" content="Travora"><meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:title" content="${attr(page.title)}">`,
    page.description ? `<meta property="og:description" content="${attr(page.description)}">` : '',
    canonical ? `<meta property="og:url" content="${attr(canonical)}">` : '',
    image ? `<meta property="og:image" content="${attr(image)}">` : '',
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${attr(page.title)}">`,
    page.description ? `<meta name="twitter:description" content="${attr(page.description)}">` : '',
    '<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">',
    '<link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/design-tokens.css">',
    '<script src="/currency.js" defer></script><script src="/portal.js" defer></script>',
    page.jsonld ? `<script type="application/ld+json">${json(page.jsonld)}</script>` : '',
  ];
  return tags.filter(Boolean).join('');
}

export function document(page, path, shell) {
  const { skip, header, footer, currencyConfig } = shell;
  return `<!DOCTYPE html><html lang="en"><head>${head(page, path)}</head><body>${skip}${markActive(header, page.service)}<main id="main">${page.main}</main>${footer}<script id="currency-config" type="application/json">${currencyConfig}</script></body></html>`;
}

export const notFoundPage = {
  title: 'Page not found | Travora',
  description: '',
  seo: { noindex: true },
  main: '<section class="page-hero"><div class="wrap"><h1>We could not find that page</h1></div></section><section class="section wrap"><div class="prose"><p>The address may have changed. Try the <a href="/">home page</a>, <a href="/destinations/">destinations</a> or <a href="/tours/">holidays</a>.</p></div></section>',
};

export { chrome };
