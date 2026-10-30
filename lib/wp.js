import { cache } from 'react';
import seed from '../content/seed.json';
import { buildSite } from './site.js';

// WordPress mode: set WP_API_URL (for example https://cms.example.com). Without it the
// bundled sample content in content/seed.json is used, so the site still renders.
const WP = (process.env.WP_API_URL || '').replace(/\/$/, '');

export const usingWordPress = () => Boolean(WP);

async function fetchRaw() {
  if (!WP) return seed;
  const res = await fetch(`${WP}/wp-json/travora/v1/site`, {
    headers: process.env.WP_API_TOKEN ? { Authorization: `Bearer ${process.env.WP_API_TOKEN}` } : undefined,
    // Refreshed instantly by /api/revalidate; the timer is only a safety net.
    next: { tags: ['wp'], revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`WordPress responded ${res.status}`);
  return res.json();
}

export const getSite = cache(async () => buildSite(await fetchRaw()));
