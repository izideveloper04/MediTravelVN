// Site-wide settings. Change the phone number in content/site.json, or set SITE_PHONE on the host
// (no code change needed). It is read when a page is built, so pages pick it up on their next refresh.
import settings from '../content/site.json' with { type: 'json' };

const FALLBACK_HREF = '/plan-trip/?service=flights';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

export const phone = () => (process.env.SITE_PHONE || settings.phone || '').trim();

// A real number becomes a tel: link; a placeholder (too few digits) sends the visitor to the quote form instead.
export function phoneHref() {
  const digits = phone().replace(/\D/g, '');
  return digits.length >= 7 ? `tel:${phone().startsWith('+') ? '+' : ''}${digits}` : FALLBACK_HREF;
}

// {{phone}} is the number as written, {{phone_href}} an address for a link, {{phone_link}} a ready-made link.
export function applySite(html) {
  if (!html.includes('{{phone')) return html;
  const text = esc(phone());
  const href = phoneHref();
  const link = href.startsWith('tel:') ? `<a class="phone-link" href="${href}">${text}</a>` : `<span class="phone-link">${text}</span>`;
  return html.replaceAll('{{phone_link}}', link).replaceAll('{{phone_href}}', href).replaceAll('{{phone}}', text);
}
