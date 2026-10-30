import { ic, esc, countOptions } from './util.js';

export const placeOptions = (site, selectedCountry = '', selectedPlace = '') =>
  site.locations.filter((l) => l.parent).map((l) =>
    `<option value="${l.slug}" data-country="${l.parent}" data-kind="${l.kind}" ${selectedPlace === l.slug ? 'selected' : ''}>${esc(l.name)}</option>`).join('');

export const countryOptions = (site, selected = '') =>
  site.countries().map((c) => `<option value="${c.slug}" ${selected === c.slug ? 'selected' : ''}>${esc(c.name)}</option>`).join('');

export const tourDestinationOptions = (site, selected = '') =>
  site.countries().map((c) => {
    const opts = [c, ...site.children(c.slug)].map((l) =>
      `<option value="${l.slug}" data-country="${c.slug}" data-place-name="${esc(l.name)}" ${selected === l.slug ? 'selected' : ''}>${esc(l.name)}</option>`).join('');
    return `<optgroup label="${esc(c.name)}">${opts}</optgroup>`;
  }).join('');

export function heroPanel(site, { country = '', place = '', selected = '' }) {
  const sel = selected || place || country;
  return `<section class="original-booking-panel" aria-label="Find your next journey" data-banner-search><div class="original-booking-tabs" role="tablist" aria-label="Choose your search"><button class="" type="button" role="tab" id="hero-tab-destinations" data-banner-tab="destinations" aria-selected="false" aria-controls="hero-panel-destinations" tabindex="-1">${ic('check')}<span>Destination</span></button><button class="active" type="button" role="tab" id="hero-tab-tours" data-banner-tab="tours" aria-selected="true" aria-controls="hero-panel-tours" tabindex="0">${ic('search')}<span>Holidays</span></button><span class="original-search-tagline">Your journey, your way</span></div><div role="tabpanel" id="hero-panel-destinations" aria-labelledby="hero-tab-destinations" data-banner-panel="destinations" hidden><form class="ts-search-form ts-search-hero " data-service-search="destinations" action="/destinations/" method="get"><div class="ts-search-top"><p>Choose a country, then find your favourite corner.</p></div><div class="ts-search-fields ts-fields-destinations"><label class="ts-field" ><span>${ic('users')}Country</span><select name="country" required data-ts-country><option value="">Choose a country</option>${countryOptions(site, country)}</select></label><label class="ts-field" data-ts-place-field><span>${ic('users')}City or area</span><select name="destination" data-ts-place><option value="">All places in this country</option>${placeOptions(site, country, place)}</select></label><button class="btn btn-yellow ts-search-button" type="submit">${ic('arrowUp')}Explore destination</button></div><p class="ts-search-error" data-ts-error role="alert" hidden></p></form></div><div role="tabpanel" id="hero-panel-tours" aria-labelledby="hero-tab-tours" data-banner-panel="tours" ><form class="ts-search-form ts-search-hero " data-service-search="tours" action="/tours/" method="get"><div class="ts-search-top"><p>Your dates, your favourite places, your kind of holiday.</p></div><div class="ts-search-fields ts-fields-tours"><label class="ts-field" ><span>${ic('users')}Destination</span><select name="destination"><option value="">Anywhere beautiful</option>${tourDestinationOptions(site, sel)}</select></label><label class="ts-field" ><span>${ic('wifi')}Departure</span><input type="date" name="depart" ></label><label class="ts-field" ><span>${ic('wifi')}Return</span><input type="date" name="return" ></label><label class="ts-field" ><span>${ic('users2')}Travellers</span><select name="travellers">${countOptions(30, 'travellers', 2, 'traveller')}</select></label><button class="btn btn-yellow ts-search-button" type="submit">${ic('arrowUp')}Find holidays</button></div><p class="ts-search-error" data-ts-error role="alert" hidden></p></form></div></section>`;
}

export const stamp = '<div class="original-hero-stamp" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="scenic-circle" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"/></defs><text><textPath href="#scenic-circle">TAKE THE SCENIC ROUTE · TAKE THE SCENIC ROUTE · </textPath></text><path d="m50 27 6 17 17 6-17 6-6 17-6-17-17-6 17-6Z" fill="currentColor"/></svg></div>';
