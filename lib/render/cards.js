import { ic, icBtn, amenityIcon, esc, enc, money, imgTag, assetName, longDate } from './util.js';

const kindBadge = { city: 'City', area: 'Area', region: 'Island / region', country: 'Country guide' };
export const placeBadge = (kind) => kindBadge[kind] || 'City';

export function tourCard(t, site, { hidden = false } = {}) {
  const f = t.fields;
  const tokens = t.locations;
  const countries = [...new Set(tokens.map((s) => site.countryOf(s)).filter(Boolean))];
  const name = [t.title, f.route_line, ...countries.map((c) => site.loc(c)?.name), ...tokens.map((s) => site.loc(s)?.name), t.slug, ...tokens, ...countries, ...countries.map((c) => site.loc(c)?.keywords), ...tokens.map((s) => site.loc(s)?.keywords)]
    .filter(Boolean).join(' ').toLowerCase();
  const title = esc(t.title);
  const href = t.path;
  const card = t.images.card || t.images.hero;
  return `<article${hidden ? ' hidden' : ''} class="travel-card travel-card--holiday" data-ex-tour data-country="${countries[0] || ''}" data-countries="${countries.join(' ')}" data-destinations="${tokens.join(' ')}" data-style="${esc(f.styles)}" data-price="${f.price_inr}" data-days="${f.days}" data-name="${esc(name)}"><a class="travel-card-media" href="${href}" tabindex="-1" aria-hidden="true">${imgTag(card, { cls: null, width: 960, height: 600 })}<span class="travel-card-badge">${esc(f.badge)}</span></a><button type="button" class="travel-card-save" data-save-id="tour:${t.slug}" data-save-title="${title}" data-save-image="${assetName(card?.url)}" data-save-url="${href}" data-save-subtitle="${f.days} days · ${esc(f.route_line)}" aria-pressed="false" aria-label="Save ${title}">${ic('holidays')}</button><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.route_line)}</span><h3 class="travel-card-title"><a href="${href}">${title}</a></h3><p class="travel-card-description">${f.days} days / ${f.nights} nights · Flexible itinerary</p><div class="travel-card-details"><div class="travel-card-chips"><span>${ic('hotel')}Stays</span><span>${ic('pin')}Transfers</span><span>${ic('check')}Experiences</span></div></div><div class="travel-card-footer"><div class="travel-card-price"><small>Indicative price from</small><strong>${money(f.price_inr)}</strong><span>/ person</span></div><a class="btn btn-primary travel-card-action" href="${href}"><span>View holiday</span>${icBtn('right')}</a></div></div></article>`;
}

export function hotelCard(h, site) {
  const f = h.fields;
  const card = h.images.card;
  const chips = f.amenities.slice(0, 3).map((a) => `<span>${amenityIcon(a)}${esc(a)}</span>`).join('');
  const city = f.city_slug || h.locations[0];
  const loc = f.destination_slug || city;
  const country = f.country_slug || site.countryOf(loc);
  const key = (a) => a.toLowerCase();
  const search = [h.title, site.loc(city)?.name, site.loc(city)?.name, city, site.loc(country)?.name, country, f.place_text].filter(Boolean).join(' ').toLowerCase();
  return `<article class="travel-card travel-card--hotel" data-fh-hotel data-destination="${loc}" data-country="${country || ''}" data-city="${city}" data-search="${esc(search)}" data-kind="${esc(f.kind)}" data-price="${f.price_inr}" data-amenities="${esc(f.amenities.slice(0, 4).map(key).join(' '))}"><a class="travel-card-media" href="${h.path}" tabindex="-1" aria-hidden="true">${imgTag(card, { cls: null, width: 960, height: 600 })}<span class="travel-card-badge">${esc(f.card_badge || f.type_label)}</span></a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.place_text)}</span><h3 class="travel-card-title"><a href="${h.path}">${esc(h.title)}</a></h3><p class="travel-card-description">${esc(f.tagline)}</p><div class="travel-card-details"><div class="travel-card-chips">${chips}</div></div><div class="travel-card-footer"><div class="travel-card-price"><small>Illustrative nightly rate</small><strong>${money(f.price_inr)}</strong><span>/ night</span></div><a class="btn btn-primary travel-card-action" href="${h.path}"><span>View stay</span>${icBtn('right')}</a></div></div></article>`;
}

export function vehicleCard(v) {
  const f = v.fields;
  const im = v.images.hero;
  return `<article class="travel-card travel-card--vehicle" data-tp-vehicle data-price="${f.price_inr}" data-seats="${f.seats}"><a class="travel-card-media" href="${v.path}" tabindex="-1" aria-hidden="true" data-tp-detail><img class="tp-vehicle-photo ${f.photo_class}" src="${esc(im?.url)}" alt="${esc(im?.alt)}" width="1600" height="1000" loading="lazy"><span class="travel-card-badge">Illustrative vehicle class</span></a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.card_eyebrow)}</span><h3 class="travel-card-title"><a href="${v.path}" data-tp-detail>${esc(v.title)}</a></h3><p class="travel-card-description">${esc(f.card_text)}</p><div class="travel-card-details"><div class="travel-card-meta"><span>${ic('cup')}Up to ${f.passengers} passengers</span><span>${ic('bag')}${f.bags} standard bags</span></div><div class="travel-card-chips"><span>${ic('globe')}Private driver</span><span>${ic('globe')}Air conditioning</span></div></div><div class="travel-card-footer"><div class="travel-card-price"><small>Illustrative price from</small><strong>${money(f.price_inr)}</strong><span>/ vehicle · route dependent</span></div><a class="btn btn-primary travel-card-action" href="${v.path}" data-tp-detail><span>View vehicle</span>${icBtn('right')}</a></div></div></article>`;
}

export function blogCard(p, { filterAttrs = false } = {}) {
  const f = p.fields;
  const card = p.images.card;
  const attrs = filterAttrs ? ` data-blog-card="" data-blog-category="${esc(f.category_slug)}" data-blog-searchtext="${esc(f.search_text)}"` : '';
  return `<article class="travel-card blog-card"${attrs}><a class="travel-card-media" href="${p.path}" tabindex="-1" aria-hidden="true">${imgTag(card, { cls: null, width: 960, height: 600, extra: f.card_pos ? ` style="object-position:${f.card_pos}"` : '' })}</a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.category)}</span><h3 class="travel-card-title"><a href="${p.path}">${esc(p.title)}</a></h3><p class="travel-card-description">${esc(f.excerpt)}</p><div class="travel-card-footer"><div class="blog-card-meta"><time datetime="${f.date}">${longDate(f.date)}</time><span>${f.read_minutes} min read</span></div><a class="btn btn-primary travel-card-action" href="${p.path}"><span>Read More</span>${icBtn('right')}</a></div></div></article>`;
}

export function placeCard(d, site) {
  const f = d.fields;
  const im = d.images.card || d.images.hero;
  const loc = site.loc(d.slug);
  return `<article class="travel-card travel-card--place"><a class="travel-card-media" href="${d.path}" tabindex="-1" aria-hidden="true">${imgTag(im, { width: 900, height: 600 })}<span class="travel-card-badge">${placeBadge(loc?.kind)}</span></a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.card_eyebrow)}</span><h3 class="travel-card-title"><a href="${d.path}">${esc(d.title)}</a></h3><p class="travel-card-description">${esc(f.card_text)}</p><div class="travel-card-footer"><a class="btn btn-primary travel-card-action" href="${d.path}"><span>Explore ${esc(d.title)}</span>${icBtn('right')}</a></div></div></article>`;
}

export function countryCard(d, site, { compact = true, home = false } = {}) {
  const f = d.fields;
  const im = d.images.card || d.images.hero;
  const kids = site.children(d.slug);
  const tourCount = site.toursAt(d.slug).length;
  const noun = kids.some((k) => k.kind === 'area') ? 'areas' : 'places';
  const search = [d.title, d.slug, site.loc(d.slug)?.keywords, ...kids.flatMap((k) => [k.name, k.keywords])].filter(Boolean).join(' ').toLowerCase();
  if (home) {
    return `<article class="travel-card travel-card--country travel-card--compact"><a class="travel-card-media" href="${d.path}" tabindex="-1" aria-hidden="true">${imgTag(im, { cls: null, width: 960, height: 600 })}</a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.card_eyebrow)}</span><h3 class="travel-card-title"><a href="${d.path}">${esc(d.title)}</a></h3><p class="travel-card-description">${esc(f.overview_text || f.card_text)}</p><div class="travel-card-details"><div class="travel-card-meta"><span>${ic('search')}${tourCount} holiday idea${tourCount === 1 ? '' : 's'}</span></div></div><div class="travel-card-footer"><a class="btn btn-primary travel-card-action" href="${d.path}"><span>Explore ${esc(d.title)}</span>${icBtn('right')}</a></div></div></article>`;
  }
  return `<article class="travel-card travel-card--country${compact ? ' travel-card--compact' : ''}" data-dv5-country data-dv5-search="${esc(search)}" data-dv5-styles="${esc(f.styles || 'city culture')}"><a class="travel-card-media" href="${d.path}" tabindex="-1" aria-hidden="true">${imgTag(im, { width: 900, height: 600 })}<span class="travel-card-badge">Country guide</span></a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.card_eyebrow)}</span><h3 class="travel-card-title"><a href="${d.path}">${esc(d.title)}</a></h3><p class="travel-card-description">${esc(f.overview_text || f.card_text)}</p><div class="travel-card-details"><div class="travel-card-meta"><span>${ic('search')}${tourCount} holiday idea${tourCount === 1 ? '' : 's'}</span><span>${ic('heart')}${kids.length ? `${kids.length} ${noun} to explore` : esc(f.card_meta || '')}</span></div></div><div class="travel-card-footer"><a class="btn btn-primary travel-card-action" href="${d.path}"><span>Explore ${esc(d.title)}</span>${icBtn('right')}</a></div></div></article>`;
}
