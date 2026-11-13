# meditravelvn front end

Next.js 15 app that reproduces the original meditravelvn design page for page. Styling, fonts, images and behaviours come from the original prototype. Content comes from WordPress, or from bundled sample data when WordPress is not connected.

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
- Flight routes (`/flights/<route>/`) are content too (type `flight`): the airports, estimated USD fare, tagline and ideas come from WordPress, and the search form, results and enquiry flow read the same routes. Cabin classes and journey options are shared and live in `content/flight-config.json`. When two airports have no direct route, the results page estimates up to three one-connection journeys through any airport that has routes to both (the two route fares added, plus a layover and a through-ticket factor from `connection` in `content/flight-config.json`). Every results page ends with a "Get expert booking help" block that opens the quote form with the search filled in. Nothing is live data, and the pages say so.
- Designed pages live in this app (`content/pages.json`): the home page, About and Help (`SITE_PAGES` in `lib/content.js`, never asked of WordPress), and the interactive pages (flight search, plan a trip, saved trips). Listing pages keep their authored markup and get their cards from WordPress. Any other WordPress page is served at its own address: its featured image and opening paragraphs make the top, and each heading opens a card. The photo credits page is not in the app; create a WordPress page with the slug `photo-credits` to publish it. The home page shows six country cards in a 3 by 2 grid, each with a one-line text from the country's "Home page card line".
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
- `app/[[...slug]]/route.js`: serves every address as plain HTML (`lib/html.js` builds the document, no React runtime is sent); `app/api/revalidate/route.js`: refresh webhook

## Checking markup against the original
`npm run fidelity` renders every item from data and compares it with the original page markup (`node scripts/fidelity.mjs destination london` for one page, `node scripts/fidelity.mjs lists` for listings, `node scripts/fidelity.mjs live http://localhost:3000` to check running pages).
`node scripts/mock-wp.mjs` serves the plugin API with extra content from `scripts/mock-extra.json`, for trying WordPress mode without WordPress.

## Notes
- Internal links are full page loads because `portal.js` initialises on load.
- All prices are USD only; there is no currency switch. Fares, availability and prices are illustrative. Saved trips live in the browser only.

## Phone number
The phone number shown in the header, footer and flight pages is one setting: edit \phone\ in \content/site.json\, or set \SITE_PHONE\ on the host (no code change; \.env.example\ lists it). Pages use \{{phone}}\, \{{phone_href}}\ and \{{phone_link}}\ where it should appear. A real number becomes a click-to-call link; the placeholder \+1-xxx-xxxx-xxx\ shows as text and the phone icon opens the quote form instead. Pages pick up a change on their next refresh (within an hour, or on a new deploy).

## Security
- No secrets are in the repository. `.env`, `.env.local` and logs are git-ignored; `.env.example` holds names only. Set `WP_API_URL`, `WP_API_TOKEN`, `REVALIDATE_SECRET` and `SITE_URL` in the host's environment settings (Hostinger).
- `/api/revalidate/` needs the secret in the `x-revalidate-secret` header (compared in constant time; a query-string secret is not accepted, so it never lands in logs). Tags and paths are validated and capped.
- Redirects from WordPress are followed only when the target is a path on this site, never a full or protocol-relative address.
- Data embedded in script tags (JSON-LD, the flight catalogue) escapes `<`, so content cannot close the tag. Titles and card text are HTML-escaped.
- Responses carry `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`; the `X-Powered-By` header is off. `/api/` is disallowed in `robots.txt`.
- The WordPress feed holds published public content only. Set a feed token in the plugin and `WP_API_TOKEN` here to make it private. Keep the WordPress admin behind a strong password and two-factor sign-in.
- Not yet in place: a Content-Security-Policy (the original scripts use inline code), rate limiting (do this at the CDN once the real domain is connected), and the CDN cache rules.
