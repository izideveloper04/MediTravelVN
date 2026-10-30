import { ic, icBtn, esc, imgTag, breadcrumb, longDate } from './util.js';
import { blogCard } from './cards.js';

// body_html is a flat run of <h2> and <p>; each <h2> opens a numbered section.
function sections(html) {
  const parts = String(html || '').split(/(?=<h2>)/).filter((p) => p.trim());
  return parts.map((p) => ({ title: (p.match(/<h2>(.*?)<\/h2>/) || [])[1] || '', html: p }));
}

export function renderPost(p, site) {
  const f = p.fields;
  const hero = p.images.hero;
  const secs = sections(f.body_html);
  const tour = site.ofType('tour').find((t) => t.slug === f.tour);
  const main = site.destination(f.main_destination);
  const places = (f.place_links || []).map((s) => site.destination(s)).filter(Boolean);
  const others = site.ofType('post').filter((x) => x.slug !== p.slug);
  const related = f.related?.length ? f.related.map((s) => others.find((x) => x.slug === s)).filter(Boolean) : others.slice(0, 3);
  return `<article class="journal-article">
  <header class="journal-hero journal-article-hero">
   ${imgTag(hero, { cls: 'journal-hero-image', lazy: false, width: 1800, height: 1200, extra: ` style="object-position:${f.hero_pos || '50% 50%'}" fetchpriority="high"` })}
   <div class="journal-hero-shade" aria-hidden="true"></div>
   <div class="wrap journal-hero-inner"><a class="journal-eyebrow" href="/blog/?category=${esc(f.category_slug)}#journal"><span></span>${esc(f.category)}</a><h1>${esc(p.title)}</h1><p>${esc(f.excerpt)}</p><div class="journal-article-meta"><span>Travora Journal</span><time datetime="${f.date}">${longDate(f.date)}</time><span>${ic('clock')}${f.read_minutes} min read</span></div></div>
  </header>
  <div class="wrap">${breadcrumb([['Blog', '/blog/'], [p.title, null]])}</div>
  <div class="wrap section blog-article-grid">
   <div class="blog-article-copy"><p class="blog-article-intro">${esc(f.intro)}</p>${secs.map((s, i) => `<section class="blog-prose-section" id="story-section-${i + 1}">${s.html}</section>`).join('')}
    <aside class="blog-takeaway" aria-label="A thought to take with you"><span class="eyebrow">A THOUGHT TO TAKE WITH YOU</span><p>${esc(f.takeaway)}</p></aside>
    <div class="blog-article-end"><span class="blog-editorial-mark">${ic('check')}</span><div><strong>The Travora Journal</strong><p>Ideas for thoughtful journeys and a little more discovery.</p></div><a href="/blog/">More stories ${ic('arrow')}</a></div>
   </div>
   <aside class="blog-article-sidebar" aria-label="Explore this story">
    <div class="blog-sidebar-block"><span class="eyebrow">IN THIS STORY</span><nav aria-label="Article sections">${secs.map((s, i) => `<a href="#story-section-${i + 1}"><span>${String(i + 1).padStart(2, '0')}</span>${s.title}</a>`).join('')}</nav></div>
    <div class="blog-sidebar-destination"><span class="eyebrow">A CLOSER LOOK</span><h2>${esc(f.sidebar_title)}</h2><p>${esc(f.sidebar_text)}</p><div class="blog-place-links">${places.map((d) => `<a href="${d.path}">${ic('heart')}${esc(d.title)}${ic('arrow')}</a>`).join('')}</div>${main ? `<a class="btn btn-primary" href="${main.path}">Explore ${esc(main.title)} ${ic('arrow')}</a>` : ''}</div>
   </aside>
  </div>
  ${tour ? `<section class="blog-inspiration"><div class="wrap blog-inspiration-inner"><div><span class="eyebrow">MAKE IT YOUR NEXT CHAPTER</span><h2>A holiday shaped around you.</h2><p>${esc(f.inspiration_text)}</p></div><div class="blog-inspiration-actions"><a class="btn btn-primary" href="${tour.path}">Explore this holiday ${ic('arrow')}</a>${main ? `<a class="btn btn-outline" href="${main.path}">Discover ${esc(main.title)}</a>` : ''}</div></div></section>` : ''}
 </article>
 <section class="wrap section" aria-labelledby="blog-related-heading"><div class="section-head"><div><span class="eyebrow">KEEP YOUR CURIOSITY GOING</span><h2 id="blog-related-heading">More stories, more possibilities</h2></div><a class="btn btn-link" href="/blog/">All stories ${ic('arrow')}</a></div><div class="blog-grid">${related.map((r) => blogCard(r)).join('')}</div></section>`;
}
