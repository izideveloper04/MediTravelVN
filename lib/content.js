// Content access layer. Static pages come from content/pages.json; structured content
// (destinations, tours, hotels, transport, journal) comes from WordPress, or the bundled
// sample data when WP_API_URL is not set. See lib/wp.js.
import pages from '../content/pages.json';
import chrome from '../content/chrome.json';
import { getSite } from './wp.js';
import { renderers } from './render/index.js';
import { patchListing, patchFooter } from './render/listings.js';
import { esc } from './render/util.js';

const SERVICE = { destination: 'destinations', tour: 'tours', hotel: 'hotels', transport: 'transportation', post: 'blog' };

export const getStaticPaths = () => Object.keys(pages);
export const getChrome = async () => {
  const site = await getSite();
  return { ...chrome, footer: patchFooter(chrome.footer, site) };
};

// Generic WordPress pages carry a body and nothing more.
function renderPage(p) {
  return `<section class="page-hero"><div class="wrap"><h1>${esc(p.title)}</h1></div></section><section class="section wrap"><div class="prose">${p.fields?.body_html || ''}</div></section>`;
}

export async function resolve(path) {
  const site = await getSite();
  const to = site.redirects[path];
  if (to) return { redirect: to };

  const item = site.byPath[path];
  if (item) {
    const render = item.type === 'page' ? renderPage : renderers[item.type];
    if (render) {
      return {
        title: item.seo?.title || item.title,
        description: item.seo?.description || '',
        seo: item.seo || {},
        service: SERVICE[item.type],
        main: render(item, site),
      };
    }
  }
  const page = pages[path];
  if (!page) return null;
  return { ...page, seo: {}, main: patchListing(path, page.main, site) };
}

export async function listPaths() {
  const site = await getSite();
  return [...new Set([...Object.keys(pages), ...site.items.map((i) => i.path)])];
}
