import { ic, esc, plural } from './util.js';
import { tourCard, hotelCard, vehicleCard, blogCard, countryCard } from './cards.js';
import { countryOptions, placeOptions, tourDestinationOptions } from './panels.js';

// Index of the tag that closes the element opened at `start` (balanced for the same tag name).
function closeOf(html, start) {
  const name = html.slice(start + 1).match(/^[a-z0-9]+/i)[0];
  const re = new RegExp(`<(/?)${name}(?=[\\s>/])[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (!depth) return m.index;
  }
  return -1;
}

// Replaces the contents of the first element whose opening tag matches `open`.
export function setInner(html, open, inner) {
  const m = html.match(open);
  if (!m) return html;
  const from = m.index + m[0].length;
  const to = closeOf(html, m.index);
  return to < 0 ? html : html.slice(0, from) + inner + html.slice(to);
}

// Keeps the placeholder option of a select and swaps the rest.
function setSelect(html, open, options) {
  const m = html.match(open);
  if (!m) return html;
  const from = m.index + m[0].length;
  const to = html.indexOf('</select>', from);
  const first = html.slice(from, to).match(/^<option value="">[^<]*<\/option>/);
  return html.slice(0, from) + (first ? first[0] : '') + options + html.slice(to);
}

export function patchSelects(html, site) {
  let out = html;
  out = setSelect(out, /<select name="country" required data-ts-country>/, countryOptions(site));
  out = setSelect(out, /<select name="destination" data-ts-place>/, placeOptions(site));
  out = out.replace(/(<select name="destination">(?:<option value="">[^<]*<\/option>))(?:<optgroup[\s\S]*?<\/optgroup>)+/g, (m, head) => `${head}${tourDestinationOptions(site)}`);
  // Hotel pickers list every place that has a stay, not only the page of hotels being rendered.
  const places = site.facets.hotelPlaces || [...new Set(site.hotels().map((h) => h.fields.city_slug || h.locations[0]))];
  const hotelPlaces = places.map((s) => site.loc(s)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  const hotelCountries = site.countries().filter((c) => hotelPlaces.some((l) => site.countryOf(l.slug) === c.slug)).sort((a, b) => a.name.localeCompare(b.name));
  out = setSelect(out, /<select name="country" aria-label="Filter hotels by country" data-fh-country>/, hotelCountries.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join(''));
  out = setSelect(out, /<select name="city" aria-label="Filter hotels by city" data-fh-city>/, hotelPlaces.map((l) => `<option value="${l.slug}" data-country="${site.countryOf(l.slug)}">${esc(l.name)}</option>`).join(''));
  return out;
}

export function patchFooter(html, site) {
  const links = site.countries().map((c) => `<a href="/destinations/${c.slug}/">${esc(c.name)}</a>`).join('');
  return html.replace(/(<h3>A little further afield<\/h3>)(?:<a href="\/destinations\/[^"]+">[^<]*<\/a>)+/, `$1${links}`);
}

// Country groups of the tours filter: every country with its places and tour count.
const geoGroups = (site) => `<legend>Countries & places</legend><label class="ex-anywhere"><input type="radio" name="geo-all" value="all" data-ex-geo checked>All destinations</label>${site.countries().map((c) => `<details class="ex-country-group"  data-ex-country-group="${c.slug}"><summary><span>${esc(c.name)}</span><small>${site.tourCount(c.slug)}</small>${ic('chev')}</summary><div class="ex-country-options"><label class="ex-country-all"><input type="radio" name="geo-all" value="${c.slug}" data-ex-geo ><span>All ${esc(c.name)}</span></label>${site.children(c.slug).map((k) => `<label class="ex-city-option"><input type="radio" name="geo-all" value="${k.slug}" data-ex-geo ><span>${esc(k.name)}${k.kind === 'area' ? '<small>Area</small>' : ''}</span></label>`).join('')}</div></details>`).join('')}`;

const countryDestinations = (site) => site.countries().map((c) => site.destination(c.slug)).filter(Boolean);

// Regions of listing pages that come from content. Everything else on those pages stays as authored.
const rules = {
  '/destinations/': (h, site) => {
    const list = countryDestinations(site);
    h = setInner(h, /<div class="dv5-country-grid">/, list.map((d) => countryCard(d, site, { compact: false })).join(''));
    return h.replace(/(data-dv5-country-count[^>]*>)[^<]*/, `$1${plural(list.length, 'country', 'countries')} to inspire your next chapter`);
  },
  '/': (h, site) => setInner(h, /<div class="v3-country-grid">/, countryDestinations(site).slice(0, 7).map((d) => countryCard(d, site, { home: true })).join('')),
  '/tours/': (h, site) => {
    h = setInner(h, /<div class="ex-tour-grid" data-ex-grid>/, site.tours().map((t) => tourCard(t, site)).join(''));
    h = setInner(h, /<fieldset class="ex-geo-fieldset">/, geoGroups(site));
    return h.replace(/\d+ countries? · \d+ holiday ideas?/, `${plural(site.countries().length, 'country', 'countries')} · ${plural(site.total('tour'), 'holiday idea', 'holiday ideas')}`);
  },
  '/blog/': (h, site) => {
    const posts = site.posts();
    h = setInner(h, /<div class="blog-grid" data-blog-grid>/, posts.map((p) => blogCard(p, { filterAttrs: true })).join(''));
    const cats = site.facets.categories ? site.facets.categories.map((c) => [c.slug, c.name]) : [...new Map(posts.map((p) => [p.fields.category_slug, p.fields.category])).entries()];
    h = setInner(h, /<div class="blog-categories"[^>]*>/, `<button type="button" class="blog-category is-active" data-blog-category-filter="all" aria-pressed="true">All stories</button>${cats.map(([s, n]) => `<button type="button" class="blog-category" data-blog-category-filter="${s}" aria-pressed="false">${esc(n)}</button>`).join('')}`);
    return h.replace(/(data-blog-count[^>]*>)[^<]*/, `$1${plural(site.total('post'), 'story', 'stories')}`);
  },
  '/hotels/results/': (h, site) => {
    const list = site.hotels();
    h = setInner(h, /<div class="fh-hotel-list">/, list.map((x) => hotelCard(x, site)).join(''));
    return h.replace(/Showing 1–(\d+) of \d+ stay concepts/, (m, n) => `Showing 1–${Math.min(Number(n), list.length)} of ${site.total('hotel')} stay concepts`);
  },
  '/hotels/': (h, site) => setInner(h, /<div class="grid-3">/, site.hotels().filter((x) => x.fields.featured).sort((a, b) => a.fields.featured - b.fields.featured).slice(0, 6).map((x) => hotelCard(x, site)).join('')),
  '/transportation/results/': (h, site) => setInner(h, /<div class="results-list tp-results-list">/, site.transports().map((v) => vehicleCard(v)).join('')),
};

export function patchListing(path, html, site) {
  const rule = rules[path];
  return patchSelects(rule ? rule(html, site) : html, site);
}
