// Structured data (schema.org) for search engines, built from the same item the page shows.
const site = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const abs = (u) => (u ? (/^https?:/.test(u) ? u : site() + u) : undefined);
const clean = (o) => JSON.parse(JSON.stringify(o));

const crumbs = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(path ? { item: abs(path) } : {}) })),
});

const faq = (list) => (list?.length ? { '@type': 'FAQPage', mainEntity: list.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) } : null);
const offer = (price) => (price ? { '@type': 'Offer', priceCurrency: 'INR', price: String(price), availability: 'https://schema.org/InStock' } : undefined);

export function structuredData(item, site) {
  const f = item.fields;
  const image = abs(item.images?.hero?.url);
  const url = abs(item.path);
  const home = ['Home', '/'];
  const out = [];
  switch (item.type) {
    case 'destination': {
      const l = site.loc(item.slug);
      const country = l?.parent ? site.loc(l.parent) : null;
      out.push(crumbs([home, ['Destinations', '/destinations/'], ...(country ? [[country.name, `/destinations/${country.slug}/`]] : []), [item.title]]));
      out.push({ '@type': 'TouristDestination', name: item.title, description: f.overview_text || item.seo?.description, url, image, ...(country ? { containedInPlace: { '@type': 'Country', name: country.name } } : {}) });
      out.push(faq(f.faqs));
      break;
    }
    case 'tour':
      out.push(crumbs([home, ['Tours', '/tours/'], [item.title]]));
      out.push({ '@type': 'TouristTrip', name: item.title, description: f.tagline || item.seo?.description, url, image, touristType: f.styles || undefined, offers: offer(f.price_inr) });
      out.push(faq(f.faqs));
      break;
    case 'hotel':
      out.push(crumbs([home, ['Hotels', '/hotels/'], [item.title]]));
      out.push({ '@type': 'Hotel', name: item.title, description: f.tagline || item.seo?.description, url, image, address: f.place_text ? { '@type': 'PostalAddress', addressLocality: f.place_text } : undefined, priceRange: f.price_inr ? `From INR ${f.price_inr}` : undefined });
      out.push(faq(f.faqs));
      break;
    case 'transport':
      out.push(crumbs([home, ['Transportation', '/transportation/'], [item.title]]));
      break;
    case 'post':
      out.push(crumbs([home, ['Blog', '/blog/'], [item.title]]));
      out.push({ '@type': 'Article', headline: item.title, description: f.excerpt || item.seo?.description, image, datePublished: f.date || undefined, mainEntityOfPage: url, author: { '@type': 'Organization', name: 'Travora' }, publisher: { '@type': 'Organization', name: 'Travora' } });
      break;
    default:
  }
  const graph = out.filter(Boolean);
  return graph.length ? clean({ '@context': 'https://schema.org', '@graph': graph }) : null;
}

// Site-wide data for the home page.
export const siteData = () => clean({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: 'Travora', url: site() },
    { '@type': 'WebSite', name: 'Travora', url: site(), potentialAction: { '@type': 'SearchAction', target: `${site()}/tours/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
  ],
});
