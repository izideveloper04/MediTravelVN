// Indexes over the normalized content payload (same shape from WordPress or the bundled seed).

// Editors may publish an item with only a title. Missing text fields read as empty, and a few
// values fall back to something sensible, so templates never print "undefined".
function withDefaults(item) {
  const f = { ...(item.fields || {}) };
  if (item.type === 'destination') {
    f.hero_title ||= item.title;
    f.overview_title ||= item.title;
  }
  if (item.type === 'tour' && f.nights === undefined && f.days) f.nights = Math.max(0, Number(f.days) - 1);
  const fields = new Proxy(f, { get: (t, k) => (k in t ? t[k] : typeof k === 'string' ? '' : undefined) });
  return { ...item, fields, images: item.images || {}, locations: item.locations || [], seo: item.seo || {} };
}
export function buildSite(raw) {
  const locations = [...raw.locations].sort((a, b) => a.order - b.order);
  const locBy = Object.fromEntries(locations.map((l) => [l.slug, l]));
  const items = raw.items.map(withDefaults);
  const byPath = Object.fromEntries(items.map((i) => [i.path, i]));
  const ofType = (t) => items.filter((i) => i.type === t).sort((a, b) => (a.order ?? 1000) - (b.order ?? 1000));
  const loc = (slug) => locBy[slug];
  const countryOf = (slug) => {
    const l = locBy[slug];
    if (!l) return '';
    return l.parent ? l.parent : l.slug;
  };
  const children = (slug) => locations.filter((l) => l.parent === slug);
  const countries = () => locations.filter((l) => !l.parent);
  const destination = (slug) => items.find((i) => i.type === 'destination' && i.slug === slug);
  // Items assigned to a location, or to any child of it when it is a country.
  const within = (type, slug) => {
    const scope = new Set([slug, ...children(slug).map((c) => c.slug)]);
    return ofType(type).filter((i) => i.locations.some((s) => scope.has(s)));
  };
  return {
    raw, locations, locBy, items, byPath, ofType, loc, countryOf, children, countries, destination,
    redirects: raw.redirects || {},
    toursAt: (slug) => within('tour', slug),
    hotelsAt: (slug) => within('hotel', slug),
    postsAt: (slug) => within('post', slug),
    tours: () => ofType('tour'),
    hotels: () => ofType('hotel'),
    transports: () => ofType('transport'),
    posts: () => ofType('post'),
    destinations: () => ofType('destination'),
    pages: () => ofType('page'),
  };
}
