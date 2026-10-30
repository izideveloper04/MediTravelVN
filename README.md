# Travora front end

Next.js 15 app that reproduces the original Travora design page for page. Styling, fonts, images and behaviours come from the original prototype. Content comes from WordPress, or from bundled sample data when WordPress is not connected.

## Run
    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

Without configuration the site runs on `content/seed.json`. To use WordPress, copy `.env.example` to `.env.local` and set `WP_API_URL`.

## How content flows
- Countries, cities and areas, tours, hotels, transfers and journal stories are data. `lib/source.js` asks the WordPress plugin for one thing at a time (`/wp-json/travora/v1/` `locations`, `item?path=`, `list`, `index`, `redirects`), or reads `content/seed.json` through the same functions (`lib/seed-api.js`). `lib/site.js` indexes whatever a page loaded.
- Each page loads only what it shows (see `lib/content.js`): the item, a few related items, or one page of a listing. Nothing loads the whole catalogue, so thousands of pages cost the same as a few.
- `lib/render/*.js` turn each item into the original page markup. Listing pages (`/destinations/`, `/tours/`, `/hotels/`, `/transportation/results/`, `/blog/`, the home page country cards and every place or country picker) keep their authored markup, and `lib/render/listings.js` regenerates the card grids, counts and option lists from the data.
- Long listings are paged by address: `/tours/page/2/`, `/hotels/results/page/2/`, `/blog/page/2/` (48, 48 and 24 per page). Every page is a real, crawlable address with Previous/Next links. Filters in the browser work within the page that is loaded.
- Everything else (home page copy, flights, plan-a-trip, saved, help, about) is served from `content/pages.json`. A WordPress page at the same address replaces it.
- Pages are built on the first visit and then cached. A published item appears at its address immediately. Addresses are flat: `/destinations/<slug>/` for countries and cities, `/tours/<slug>/`, `/hotels/<slug>/`, `/transportation/<slug>/`, `/blog/<slug>/`. Unknown addresses return 404. Old addresses sent by WordPress answer with a permanent redirect.
- `/sitemap.xml` lists chunks under `/sitemaps/<n>.xml` (1000 addresses each); `/robots.txt` points to it.

## Refreshing after a publish
The plugin posts to `/api/revalidate/` with the header `x-revalidate-secret` and a body `{tags, paths, all}`. Tags name the data that changed: `item:<path>`, `list:<type>:<country|all>`, `locations`, `redirects`, `index`. Only pages that used that data are rebuilt. `REVALIDATE_SECRET` here must equal the secret in the plugin settings. As a safety net each answer is also refetched after an hour.
Build the site with `WP_API_URL` set and WordPress reachable, so the pages built ahead of time contain WordPress content.

## Environment
| Variable | Purpose |
| --- | --- |
| `WP_API_URL` | WordPress address. Empty means sample content. |
| `WP_API_TOKEN` | Bearer token, if the feed is protected. |
| `REVALIDATE_SECRET` | Shared secret for `/api/revalidate/`. |
| `SITE_URL` | Public address of this site, used for canonical URLs and the sitemap. |
| `TOURS_PAGE_SIZE` | Optional. Tours per listing page (default 48), handy for testing paging. |

## Structure
- `public/styles.css`, `design-tokens.css`, `assets/`, `portal.js`, `currency.js`: original CSS, fonts, photography and behaviours
- `content/seed.json`: sample content in the same shape as the WordPress feed
- `content/pages.json`, `content/chrome.json`: static page bodies, shared header and footer
- `lib/content.js`: resolves an address to a page (redirect, WordPress item, listing page, static page)
- `lib/source.js`, `lib/seed-api.js`: the content API (WordPress or sample data)
- `app/[[...slug]]/page.js`: renders every route; `app/api/revalidate/route.js`: refresh webhook

## Checking markup against the original
`npm run fidelity` renders every item from data and compares it with the original page markup (`node scripts/fidelity.mjs destination london` for one page, `node scripts/fidelity.mjs lists` for listings, `node scripts/fidelity.mjs live http://localhost:3000` to check running pages).
`node scripts/mock-wp.mjs` serves the plugin API with extra content from `scripts/mock-extra.json`, for trying WordPress mode without WordPress.

## Notes
- Internal links are full page loads because `portal.js` initialises on load.
- Prices are stored in INR and converted in the browser. Fares, availability and prices are illustrative. Saved trips live in the browser only.
