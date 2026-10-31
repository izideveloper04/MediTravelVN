import seed from '../content/seed.json' with { type: 'json' };
import { makeApi } from './seed-api.js';

// WordPress mode: set WP_API_URL (for example https://cms.example.com). Without it the bundled
// sample content in content/seed.json is used, so the site still renders.
const WP = (process.env.WP_API_URL || '').replace(/\/$/, '');
export const usingWordPress = () => Boolean(WP);

const local = makeApi(seed);
export const PAGE_SIZE = { tour: Number(process.env.TOURS_PAGE_SIZE) || 48, hotel: 48, post: 24, destination: 200, transport: 50 };

// One HTTP call to the plugin. Responses are cached per tag; the plugin names the tags it wants
// refreshed after a publish, so only the pages that show a changed item are rebuilt.
async function call(name, params, tags) {
  if (!WP) {
    const { per_page: perPage, ...rest } = params || {};
    return name === 'item' ? local.item(rest.path) : local[name]({ ...rest, ...(perPage ? { perPage } : {}) });
  }
  const qs = new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v !== '' && v !== undefined && v !== null)).toString();
  // A busy or cold WordPress can answer 5xx once (for example while building many pages at once): retry.
  let res;
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await fetch(`${WP}/wp-json/travora/v1/${name}${qs ? `?${qs}` : ''}`, {
      headers: process.env.WP_API_TOKEN ? { Authorization: `Bearer ${process.env.WP_API_TOKEN}` } : undefined,
      next: { tags, revalidate: 3600 }, // the timer is only a safety net
    }).catch(() => null);
    if (res?.ok || (res && res.status < 500)) break;
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
  if (!res?.ok) throw new Error(`WordPress responded ${res ? res.status : 'no answer'} for ${name}`);
  return res.json();
}

export const getLocations = () => call('locations', {}, ['locations']);
export const getRedirects = () => call('redirects', {}, ['redirects']);
export const getIndex = (page, perPage = 5000) => call('index', { page, per_page: perPage }, ['index']);

// {item} so that a missing page is a cacheable answer instead of an error.
export async function getItem(path) {
  const r = await call('item', { path }, [`item:${path}`]);
  return WP ? r.item : r;
}

// `country` is only used to name the cache tag: list:<type>:<country or all>.
export function getItems({ type, location = '', slugs = '', exclude = '', category = '', featured = '', page = 1, perPage }, country = 'all') {
  const per = perPage || PAGE_SIZE[type] || 24;
  const params = { type, location, slugs, exclude, category, featured, page, per_page: per };
  return call('list', params, [`list:${type}:${country || 'all'}`]);
}
