# Travora front end

Next.js 15 app that reproduces the original Travora design page for page. Styling, fonts, images and behaviours come from the original prototype. Content comes from WordPress, or from bundled sample data when WordPress is not connected.

## Run
    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

Without configuration the site runs on `content/seed.json`. To use WordPress, copy `.env.example` to `.env.local` and set `WP_API_URL`.

## How content flows
- Countries, cities and areas, tours, hotels, transfers and journal stories are data. `lib/wp.js` loads them from `GET {WP_API_URL}/wp-json/travora/v1/site` (or `content/seed.json`) and `lib/site.js` indexes them.
- `lib/render/*.js` turn each item into the original page markup. Listing pages (`/destinations/`, `/tours/`, `/hotels/`, `/transportation/results/`, `/blog/`, the home page country cards and every place or country picker) keep their authored markup, and `lib/render/listings.js` regenerates the card grids, counts and option lists from the data.
- Everything else (home page copy, flights, plan-a-trip, saved, help, about) is served from `content/pages.json`. A WordPress page at the same address replaces it.
- A published item appears at its address immediately. Addresses are flat: `/destinations/<slug>/` for countries and cities, `/tours/<slug>/`, `/hotels/<slug>/`, `/transportation/<slug>/`, `/blog/<slug>/`. Unknown addresses return 404. Old addresses sent by WordPress answer with a permanent redirect.

## Refreshing after a publish
The plugin posts to `/api/revalidate/` with the header `x-revalidate-secret`. The site refetches the feed and rebuilds the affected pages. `REVALIDATE_SECRET` here must equal the secret in the plugin settings. As a safety net the feed is also refetched every hour.

## Environment
| Variable | Purpose |
| --- | --- |
| `WP_API_URL` | WordPress address. Empty means sample content. |
| `WP_API_TOKEN` | Bearer token, if the feed is protected. |
| `REVALIDATE_SECRET` | Shared secret for `/api/revalidate/`. |
| `SITE_URL` | Public address of this site, used for canonical URLs. |

## Structure
- `public/styles.css`, `design-tokens.css`, `assets/`, `portal.js`, `currency.js`: original CSS, fonts, photography and behaviours
- `content/seed.json`: sample content in the same shape as the WordPress feed
- `content/pages.json`, `content/chrome.json`: static page bodies, shared header and footer
- `lib/content.js`: resolves an address to a page (redirect, WordPress item, listing, static page)
- `app/[[...slug]]/page.js`: renders every route; `app/api/revalidate/route.js`: refresh webhook

## Checking markup against the original
`npm run fidelity` renders every item from data and compares it with the original page markup (`node scripts/fidelity.mjs destination london` for one page, `node scripts/fidelity.mjs lists` for listings).
`node scripts/mock-wp.mjs` serves the feed with extra content from `scripts/mock-extra.json`, for trying WordPress mode without WordPress.

## Notes
- Internal links are full page loads because `portal.js` initialises on load.
- Prices are stored in INR and converted in the browser. Fares, availability and prices are illustrative. Saved trips live in the browser only.
