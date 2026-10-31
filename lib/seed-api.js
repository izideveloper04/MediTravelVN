// The content API over a plain payload. The WordPress plugin implements the same calls over HTTP,
// so the front end reads sample data and WordPress through one interface.
// The same module backs scripts/mock-wp.mjs.

const byOrder = (a, b) => (a.order ?? 1000) - (b.order ?? 1000);

export function makeApi(raw) {
  const locBy = Object.fromEntries(raw.locations.map((l) => [l.slug, l]));
  const kids = (slug) => raw.locations.filter((l) => l.parent === slug).map((l) => l.slug);
  const sorted = (type) => raw.items.filter((i) => i.type === type).sort(byOrder);
  const primary = (i) => (i.fields?.city_slug || i.locations?.[0] || '');

  return {
    // Each location carries its published tour count (a country counts the tours in its places).
    locations: () => raw.locations.map((l) => ({ ...l, tours: sorted('tour').filter((i) => i.locations.some((s) => s === l.slug || (!l.parent && kids(l.slug).includes(s)))).length })),

    item: (path) => raw.items.find((i) => i.path === path) || null,

    // Items of one type, newest/ordered first. `location` includes the places inside a country.
    list({ type, location = '', slugs = '', exclude = '', category = '', featured = '', page = 1, perPage = 24 }) {
      let rows = sorted(type);
      if (location) {
        const scope = new Set([location, ...kids(location)]);
        rows = rows.filter((i) => i.locations.some((s) => scope.has(s)));
      }
      if (slugs) {
        const want = new Set(String(slugs).split(','));
        rows = rows.filter((i) => want.has(i.slug));
      }
      if (category) rows = rows.filter((i) => i.fields?.category_slug === category);
      if (exclude) rows = rows.filter((i) => i.slug !== exclude);
      if (featured) rows = rows.filter((i) => i.fields?.featured > 0).sort((a, b) => a.fields.featured - b.fields.featured);
      const total = rows.length;
      const per = Math.max(1, Number(perPage) || 24);
      const pages = Math.max(1, Math.ceil(total / per));
      const from = (Math.max(1, Number(page) || 1) - 1) * per;
      const facets = {};
      if (type === 'post') {
        facets.categories = [...new Map(sorted('post').map((p) => [p.fields.category_slug, p.fields.category])).entries()].map(([slug, name]) => ({ slug, name }));
      }
      if (type === 'hotel') facets.places = [...new Set(sorted('hotel').map(primary))].filter(Boolean);
      return { items: rows.slice(from, from + per), total, pages, page: Number(page) || 1, facets };
    },

    redirects: () => raw.redirects || {},

    // Every public address, for sitemaps.
    index({ page = 1, perPage = 5000 } = {}) {
      const all = raw.items.map((i) => ({ path: i.path, type: i.type, modified: i.modified || '' }));
      const from = (Math.max(1, Number(page)) - 1) * perPage;
      return { items: all.slice(from, from + Number(perPage)), total: all.length, pages: Math.max(1, Math.ceil(all.length / perPage)) };
    },
  };
}
