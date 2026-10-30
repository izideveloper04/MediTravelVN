// Content access layer. Static pages come from content/pages.json; structured content
// (destinations, tours, hotels, transport, journal) comes from WordPress, or the bundled
// sample data when WP_API_URL is not set. See lib/source.js.
//
// Each route loads only what its page shows (the item, a few related items, a page of a listing),
// so a site of thousands of pages renders the same way as a site of a few.
import { cache } from 'react';
import pages from '../content/pages.json';
import chrome from '../content/chrome.json';
import { getLocations, getRedirects, getItem, getItems, getIndex, usingWordPress, PAGE_SIZE } from './source.js';
import { buildSite } from './site.js';
import { renderers } from './render/index.js';
import { patchListing, patchFooter } from './render/listings.js';
import { esc } from './render/util.js';

const SERVICE = { destination: 'destinations', tour: 'tours', hotel: 'hotels', transport: 'transportation', post: 'blog' };
const PACKAGES_CAP = 60;
const HOME_COUNTRIES = 7;

// Detail addresses are never served from the static copies: an unpublished item must be gone.
const DETAIL = /^\/(destinations|tours|hotels|transportation|blog)\/(?!results\/|page\/)[^/]+\/$/;
const PAGED = /^(\/tours\/|\/hotels\/results\/|\/blog\/)page\/(\d+)\/$/;
const isStatic = (p) => !DETAIL.test(p);

export const getStaticPaths = () => Object.keys(pages).filter(isStatic);

const getLocs = cache(getLocations);
const part = (locations, items, extra = {}) => buildSite({ locations, items: items.filter(Boolean), redirects: {}, ...extra });
const uniq = (list) => [...new Set(list.filter(Boolean))];
const dest = (slug) => getItem(`/destinations/${slug}/`);

export const getChrome = async () => {
  const site = part(await getLocs(), []);
  return { ...chrome, footer: patchFooter(chrome.footer, site) };
};

// Generic WordPress pages carry a body and nothing more.
function renderPage(p) {
  return `<section class="page-hero"><div class="wrap"><h1>${esc(p.title)}</h1></div></section><section class="section wrap"><div class="prose">${p.fields?.body_html || ''}</div></section>`;
}

const none = { items: [] };

// What each page type needs besides the item itself.
const loaders = {
  async destination(item, locations) {
    const base = part(locations, []);
    const l = base.loc(item.slug);
    const country = l?.parent || item.slug;
    const kidSlugs = base.children(item.slug).map((k) => k.slug);
    const siblingSlugs = l?.parent ? base.children(country).map((k) => k.slug).filter((s) => s !== item.slug) : [];
    const want = uniq([...kidSlugs, ...siblingSlugs]);
    const f = item.fields || {};
    const relatedSlugs = f.related?.length ? f.related : base.countries().filter((c) => c.slug !== country).slice(0, 3).map((c) => c.slug);
    const [tours, places, related] = await Promise.all([
      getItems({ type: 'tour', location: country, perPage: PACKAGES_CAP }, country),
      want.length ? getItems({ type: 'destination', slugs: want.join(','), perPage: PAGE_SIZE.destination }, country) : none,
      Promise.all(relatedSlugs.map(dest)),
    ]);
    return part(locations, [item, ...places.items, ...related, ...tours.items]);
  },
  async tour(item, locations) {
    const base = part(locations, []);
    const country = base.countryOf(item.locations?.[0]);
    const [related, ...dests] = await Promise.all([
      getItems({ type: 'tour', location: country, exclude: item.slug, perPage: 3 }, country),
      ...uniq([...(item.locations || []), country]).map(dest),
    ]);
    return part(locations, [item, ...related.items, ...dests]);
  },
  async post(item, locations) {
    const f = item.fields || {};
    const [others, picked, tours, main, ...places] = await Promise.all([
      getItems({ type: 'post', exclude: item.slug, perPage: 4 }, 'all'),
      f.related?.length ? getItems({ type: 'post', slugs: f.related.join(','), perPage: 12 }, 'all') : none,
      f.tour ? getItems({ type: 'tour', slugs: f.tour, perPage: 1 }, 'all') : none,
      f.main_destination ? dest(f.main_destination) : null,
      ...(f.place_links || []).map(dest),
    ]);
    return part(locations, [item, ...others.items, ...picked.items, ...tours.items, main, ...places]);
  },
  async hotel(item, locations) { return part(locations, [item]); },
  async transport(item, locations) { return part(locations, [item]); },
  async page(item, locations) { return part(locations, [item]); },
};

// Listing pages: the authored markup plus the items of the current page.
const listingLoaders = {
  async '/destinations/'(locations) {
    const base = part(locations, []);
    const r = await getItems({ type: 'destination', slugs: base.countries().map((c) => c.slug).join(','), perPage: PAGE_SIZE.destination }, 'all');
    return { site: part(locations, r.items) };
  },
  async '/'(locations) {
    const base = part(locations, []);
    const r = await getItems({ type: 'destination', slugs: base.countries().slice(0, HOME_COUNTRIES).map((c) => c.slug).join(','), perPage: HOME_COUNTRIES }, 'all');
    return { site: part(locations, r.items) };
  },
  async '/tours/'(locations, page) {
    const r = await getItems({ type: 'tour', page }, 'all');
    return { site: part(locations, r.items, { totals: { tour: r.total } }), pages: r.pages };
  },
  async '/blog/'(locations, page) {
    const r = await getItems({ type: 'post', page }, 'all');
    return { site: part(locations, r.items, { totals: { post: r.total }, facets: { categories: r.facets?.categories } }), pages: r.pages };
  },
  async '/hotels/results/'(locations, page) {
    const r = await getItems({ type: 'hotel', page }, 'all');
    return { site: part(locations, r.items, { totals: { hotel: r.total }, facets: { hotelPlaces: r.facets?.places } }), pages: r.pages };
  },
  async '/hotels/'(locations) {
    const r = await getItems({ type: 'hotel', featured: 1, perPage: 6 }, 'all');
    return { site: part(locations, r.items, { facets: { hotelPlaces: r.facets?.places } }) };
  },
  async '/transportation/results/'(locations) {
    const r = await getItems({ type: 'transport' }, 'all');
    return { site: part(locations, r.items) };
  },
};

const pager = (base, page, pages) => {
  const href = (n) => (n === 1 ? base : `${base}page/${n}/`);
  return `<nav class="wrap seo-pager" aria-label="More pages" style="display:flex;gap:1.5rem;justify-content:center;align-items:center;padding:2rem 0">${page > 1 ? `<a rel="prev" href="${href(page - 1)}">Previous</a>` : ''}<span>Page ${page} of ${pages}</span>${page < pages ? `<a rel="next" href="${href(page + 1)}">Next</a>` : ''}</nav>`;
};

async function listingPage(path, base, page, locations) {
  const staticPage = pages[base];
  if (!staticPage) return null;
  const load = listingLoaders[base];
  const { site, pages: total = 1 } = load ? await load(locations, page) : { site: part(locations, []) };
  if (page > total) return null;
  const main = patchListing(base, staticPage.main, site) + (total > 1 ? pager(base, page, total) : '');
  const title = page > 1 ? `${staticPage.title} – Page ${page}` : staticPage.title;
  return { ...staticPage, title, seo: { canonical: path }, main };
}

async function itemPage(path, item, locations) {
  const render = item.type === 'page' ? renderPage : renderers[item.type];
  if (!render) return null;
  const site = await loaders[item.type](item, locations);
  const it = site.byPath[path];
  return {
    title: it.seo?.title || it.title,
    description: it.seo?.description || '',
    seo: it.seo || {},
    service: SERVICE[it.type],
    main: render(it, site),
  };
}

export async function resolve(path) {
  const to = (await getRedirects())[path];
  if (to) return { redirect: to };

  const locations = await getLocs();
  const paged = path.match(PAGED);
  if (paged) {
    const page = Number(paged[2]);
    return page < 2 ? null : listingPage(path, paged[1], page, locations);
  }

  // A WordPress item or page wins; only addresses that are not item addresses fall back to the static copy.
  const item = await getItem(path);
  if (item && (item.type !== 'page' || !listingLoaders[path])) return itemPage(path, item, locations);
  if (!isStatic(path)) return null;
  return listingPage(path, path, 1, locations);
}

// Addresses built ahead of time. In WordPress mode everything else is built on first visit and cached.
export async function listPaths() {
  const fixed = getStaticPaths();
  if (usingWordPress()) return fixed;
  const all = [];
  for (let page = 1, last = 1; page <= last; page++) {
    const r = await getIndex(page);
    last = r.pages;
    all.push(...r.items.map((i) => i.path));
  }
  return uniq([...fixed, ...all]);
}
