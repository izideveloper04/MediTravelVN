import { ic, icBtn, esc, money, breadcrumb } from './util.js';
import config from '../../content/flight-config.json' with { type: 'json' };

// Flight routes are content (type "flight"). Everything else about the flight pages, the search form
// markup, trip options and cabin classes, is shared by every route and stays in the page templates.

export const routesOf = (site) => site.ofType('flight');
const assetFile = (url) => (url || '').split('/').pop();

// The route as portal.js reads it from #flight-catalogue.
export function catalogueRoute(item) {
  const f = item.fields;
  return {
    id: item.slug, slug: item.slug, name: item.title,
    fromCity: f.from_city, fromCode: f.from_code, fromCityId: f.from_city_id, fromAirport: f.from_airport,
    fromCountryId: f.from_country_id, fromCountry: f.from_country,
    toCity: f.to_city, toCode: f.to_code, toAirport: f.to_airport,
    countryId: f.to_country_id, country: f.to_country, cityId: f.to_city_id,
    image: assetFile(item.images.hero?.url), tag: f.tagline, intro: f.intro, highlights: f.highlights || [],
    sampleFareFrom: Number(f.fare_usd), sampleDurationMinutes: Number(f.minutes), published: true,
    metaTitle: item.seo.title, metaDescription: item.seo.description,
  };
}

// The catalogue portal.js reads: routes from content, cabin classes and trip options shared by all routes.
// Inside a script tag, so a stray "<" in route text cannot close it.
export const catalogue = (site) => JSON.stringify({ routes: routesOf(site).map(catalogueRoute), cabins: config.cabins, options: config.options }).replace(/</g, '\\u003c');

export function patchCatalogue(html, site) {
  return html.replace(/(<script id="flight-catalogue" type="application\/json">)[\s\S]*?(<\/script>)/, (m, open, close) => `${open}${catalogue(site)}${close}`);
}

// Airports are grouped by country (alphabetical), each country listing its cities (alphabetical).
function airports(site) {
  const map = new Map();
  for (const item of routesOf(site)) {
    const f = item.fields;
    map.set(f.from_code, { code: f.from_code, city: f.from_city, airport: f.from_airport, country: f.from_country, countryId: f.from_country_id, cityId: f.from_city_id });
    map.set(f.to_code, { code: f.to_code, city: f.to_city, airport: f.to_airport, country: f.to_country, countryId: f.to_country_id, cityId: f.to_city_id });
  }
  const groups = new Map();
  for (const a of map.values()) groups.set(a.country, [...(groups.get(a.country) || []), a]);
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([country, list]) => [country, list.sort((a, b) => a.city.localeCompare(b.city))]);
}

export const airportOptions = (site, selected = '') => airports(site).map(([country, list]) => `<optgroup label="${esc(country)}">${list.map((a) => `<option value="${a.code}" data-city="${esc(a.city)}" data-country="${esc(a.country)}" data-country-id="${esc(a.countryId)}" data-city-id="${esc(a.cityId)}" ${selected === a.code ? 'selected' : ''}>${esc(a.city)} (${a.code}) · ${esc(a.airport)}</option>`).join('')}</optgroup>`).join('');

// Rebuilds the From and To lists of every search form in a page, keeping what each one has selected.
export function patchAirportSelects(html, site) {
  return html.replace(/(<select name="(from|to)" required autocomplete="off">)([\s\S]*?)(<\/select>)/g, (m, open, name, body, close) => {
    const selected = (body.match(/<option value="([A-Z]{3})"[^>]*selected/) || [])[1] || '';
    const blank = body.match(/^<option value="">[^<]*<\/option>/);
    return `${open}${blank ? blank[0] : ''}${airportOptions(site, selected)}${close}`;
  });
}

export function routeCard(item) {
  const f = item.fields;
  const im = item.images.card || item.images.hero;
  return `<article class="travel-card travel-card--flight"><a class="travel-card-media" href="${item.path}" tabindex="-1" aria-hidden="true"><img src="${esc(im?.url)}" alt="${esc(im?.alt)}" width="960" height="600" loading="lazy" decoding="async"><span class="travel-card-badge">${f.from_code} → ${f.to_code}</span></a><div class="travel-card-body"><span class="travel-card-eyebrow">${esc(f.to_country)}</span><h3 class="travel-card-title"><a href="${item.path}">${esc(item.title)}</a></h3><p class="travel-card-description">${esc(f.tagline)}</p><div class="travel-card-footer"><div class="travel-card-price"><small>Illustrative one-way fare from</small><strong>${money(f.fare_usd)}</strong><span>per person · Economy</span></div><a class="btn btn-primary travel-card-action" href="${item.path}"><span>Explore flights</span>${icBtn('right')}</a></div></div></article>`;
}

function searchForm(site, item) {
  const f = item.fields;
  const trips = '<fieldset class="tf-trip-types"><legend class="visually-hidden">Trip type</legend><label><input type="radio" name="tripType" value="oneway" >One Way</label><label><input type="radio" name="tripType" value="round" checked>Round Trip</label></fieldset>';
  const counts = Array.from({ length: 9 }, (_, i) => `<option value="${i + 1}" ${i === 1 ? 'selected' : ''}>${i + 1} ${i === 0 ? 'traveller' : 'travellers'}</option>`).join('');
  const cabins = [['economy', 'Economy'], ['premium-economy', 'Premium Economy'], ['business', 'Business'], ['first', 'First']].map(([v, l]) => `<option value="${v}" ${v === 'economy' ? 'selected' : ''}>${l}</option>`).join('');
  return `<form class="tf-search-form  " data-flight-search data-trip="round" action="/flights/results/" method="get"><div class="tf-search-top">${trips}<span>Find a journey that fits your plans</span></div><div class="tf-search-fields"><label><span>From</span><select name="from" required autocomplete="off">${airportOptions(site, f.from_code)}</select></label><label><span>To</span><select name="to" required autocomplete="off">${airportOptions(site, f.to_code)}</select></label><label><span>Departure Date</span><input type="date" name="depart" value="" required></label><label data-flight-return ><span>Return Date</span><input type="date" name="return" value="" required></label><label><span>Travellers</span><select name="travellers">${counts}</select></label><label><span>Cabin Class</span><select name="cabin">${cabins}</select></label><button type="submit" class="btn btn-yellow tf-search-button">${ic('arrowUp')}Search flights</button></div><p class="tf-search-error" data-flight-search-error role="alert" hidden></p></form>`;
}

export function renderFlight(item, site) {
  const f = item.fields;
  const hero = item.images.hero;
  const [lead, ...rest] = item.title.split(' to ');
  const others = routesOf(site).filter((r) => r.slug !== item.slug);
  const related = (f.related?.length ? f.related.map((s) => others.find((r) => r.slug === s)).filter(Boolean) : others).slice(0, 3);
  const ideas = (f.highlights || []).map((h, i) => `<article><span>${String(i + 1).padStart(2, '0')}</span><h3>${esc(h)}</h3></article>`).join('');
  const countryPath = `/destinations/${f.to_country_id}/`;
  const faq = [
    ['How do I compare journey options?', `The search is already set to ${esc(f.from_city)} and ${esc(f.to_city)}. Choose One Way or Round Trip, your travel dates, traveller count and cabin. On the results page, filter the examples by stops, departure time and fare.`],
    ['Does this guide confirm a direct airline service?', 'No. All direct and connecting options are illustrative planning examples. An actual airline quote must confirm available routes, airlines, schedules and any connection details for your dates.'],
    ['Can I add a stay or holiday package?', `Yes. Explore ${esc(f.to_country)} and its associated holiday packages, or add hotel and transfer preferences to your enquiry.`],
  ].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('');
  return `<div class="wrap">${breadcrumb([['Flights', '/flights/'], [item.title, null]])}</div><section class="tf-hero tf-route-hero"><img src="${esc(hero?.url)}" alt="${esc(hero?.alt)}" width="1800" height="1000" fetchpriority="high"><div class="tf-hero-shade"></div><div class="wrap tf-hero-content"><span class="eyebrow">YOUR NEXT CHAPTER · ${esc(f.to_country)}</span><h1>${esc(lead)}<br><em>to ${esc(rest.join(' to '))}.</em></h1><p>${esc(f.tagline)}</p><span class="tf-route-codes">${f.from_code} ${ic('plane')} ${f.to_code}</span></div></section><div class="wrap tf-search-over-hero"><div class="tf-search-card"><div class="tf-search-heading">${ic('plane')}<h2>Plan your ${esc(f.to_city)} journey</h2></div>${searchForm(site, item)}</div></div><section class="section wrap tf-route-detail"><div><span class="eyebrow">MORE THAN THE JOURNEY THERE</span><h2>Arrive with possibilities.</h2><p>${esc(f.intro)}</p><div class="tf-route-ideas">${ideas}</div><div class="tf-faq tf-route-faq"><div><span class="eyebrow">GOOD TO KNOW</span><h2>Your route, your way.</h2></div><div>${faq}</div></div></div><aside class="tf-route-aside-slot"><article class="travel-card travel-card--country"><a class="travel-card-media" href="${countryPath}" tabindex="-1" aria-hidden="true"><img src="${esc(hero?.url)}" alt="Travel inspiration for ${esc(f.to_city)}" width="960" height="600" loading="lazy" decoding="async"></a><div class="travel-card-body"><span class="travel-card-eyebrow">STAY A LITTLE LONGER</span><h3 class="travel-card-title"><a href="${countryPath}">Get to know ${esc(f.to_country)}.</a></h3><p class="travel-card-description">Explore places, experiences and holiday itineraries that make the journey worthwhile.</p><div class="travel-card-details"><a class="travel-card-secondary" href="/tours/?country=${esc(f.to_country_id)}">Browse holiday packages ${ic('arrow')}</a></div><div class="travel-card-footer"><a class="btn btn-primary travel-card-action" href="${countryPath}"><span>Explore ${esc(f.to_country)}</span>${icBtn('right')}</a></div></div></article></aside></section><section class="tf-soft-section"><div class="section wrap"><div class="section-head"><div><span class="eyebrow">KEEP YOUR OPTIONS OPEN</span><h2>Another route. Another story.</h2></div><a href="/flights/" class="btn btn-outline">All flights ${ic('arrow')}</a></div><div class="tf-route-grid">${related.map(routeCard).join('')}</div></div></section><div class="wrap tf-page-note"><p class="tf-notice">${ic('sun')}<span>Flight options and fares are illustrative, not live airline inventory. Your quote confirms airlines, schedules, baggage, availability and final terms.</span></p></div><script id="flight-catalogue" type="application/json">${catalogue(site)}</script>`;
}
