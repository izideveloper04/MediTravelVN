import { icon, iconStroke } from './icons.js';

export const ic = icon;
export const icBtn = iconStroke;
export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
export const enc = (s) => encodeURIComponent(s ?? '');
export const NBSP = ' ';

// Prices are stored in the base currency (INR). currency.js converts at runtime;
// the text below is the server-rendered USD fallback.
export const USD_RATE = 0.012;
export const usdText = (inr) => `USD${NBSP}${Math.round(Number(inr) * USD_RATE).toLocaleString('en-US')}`;
export const money = (inr) => `<span data-money="${inr}">${usdText(inr)}</span>`;

export const imgTag = (im, { cls = '', lazy = true, width, height, extra = '', sizes = '(max-width: 760px) 100vw, 33vw' } = {}) => {
  if (!im || !im.url) return '';
  const w = width ?? im.w ?? 0;
  const h = height ?? im.h ?? 0;
  return `<img${cls !== null ? ` class="${cls}"` : ''} src="${esc(im.url)}"${im.srcset ? ` srcset="${esc(im.srcset)}" sizes="${sizes}"` : ''} alt="${esc(im.alt)}"${w ? ` width="${w}"` : ''}${h ? ` height="${h}"` : ''}${lazy ? ' loading="lazy" decoding="async"' : ''}${extra}>`;
};
export const assetName = (url) => (url || '').split('/').pop();

export const breadcrumb = (trail) => {
  const parts = ['<a href="/">Home</a>'];
  trail.forEach(([label, href], i) => {
    parts.push(ic('chev'));
    parts.push(i === trail.length - 1 && !href ? `<span aria-current="page">${esc(label)}</span>` : `<a href="${href}">${esc(label)}</a>`);
  });
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join('')}</nav>`;
};

export const countOptions = (n, word, selected = 2, singular = word, withBlank = false) =>
  Array.from({ length: n }, (_, i) => i + 1)
    .map((v) => `<option value="${v}"${v === selected ? ' selected' : ''}>${v} ${v === 1 ? singular : word}</option>`)
    .join('');

// "1,2,3" style helpers
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
export const longDate = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// Icon per amenity label; unknown labels fall back to a tick.
const AMENITY_ICON = {
  Pool: 'pool', 'Wi-Fi': 'mountain', Breakfast: 'shield', Beach: 'calendar', 'Room for two': 'globe',
  'Luggage assistance': 'globe', Workspace: 'search', Lounge: 'hotel', Garden: 'calendar', 'City view': 'check',
  'Breakfast concept': 'shield',
};
export const amenityIcon = (label) => icon(AMENITY_ICON[label] || 'check');
