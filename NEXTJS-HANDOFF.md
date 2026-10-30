# Next.js Handoff

Content lives in `data/content.js`. Add or edit countries, places, packages, hotels and blog posts there. Shared UI is in `components/` and global responsive styling is in `app/globals.css`.

Dynamic routes:
- `/destinations/[slug]`
- `/destinations/[slug]/[place]`
- `/holidays/[slug]`
- `/hotels/[slug]`
- `/blog/[slug]`

The currency selector stores the preference in localStorage. For production, replace configured reference rates with an exchange-rate API and hydrate prices from your booking backend.
