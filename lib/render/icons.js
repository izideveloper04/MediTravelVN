// Inline icon paths used across the original design.
export const ICONS = {
 "chev": "<path d=\"m6 9 6 6 6-6\"/>",
 "arrow": "<path d=\"M5 12h14m-5-5 5 5-5 5\"/>",
 "globe": "<path d=\"m5 12 4 4L19 6\"/>",
 "check": "<path d=\"M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z\"/>",
 "hotel": "<path d=\"M3 19V8m18 11V8M3 16h18M3 12h18v4M6 12V8h5v4m2 0V8h5v4M5 8V5h14v3\"/>",
 "heart": "<path d=\"M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM14.5 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/>",
 "holidays": "<path d=\"M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z\"/>",
 "pin": "<path d=\"m5 7 2-4h10l2 4 2 3v8H3v-8l2-3Zm0 0h14M3 11h18M6 18v3m12-3v3M6 14h2m8 0h2\"/>",
 "search": "<path d=\"M4 7h16v14H4V7ZM9 7V3h6v4M8 11v6m8-6v6\"/>",
 "close": "<path d=\"m6 6 12 12M6 18 18 6\"/>",
 "arrowUp": "<path d=\"M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Zm-2 5.5 5 5\"/>",
 "pin2": "<path d=\"M6 18 18 6M6 6h12v12\"/>",
 "sun": "<path d=\"m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm-4 10 3 3 5-6\"/>",
 "calendar": "<path d=\"M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5\"/>",
 "shield": "<path d=\"M4 8h12v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm12 1h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3\"/>",
 "users": "<path d=\"M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z\"/>",
 "wifi": "<path d=\"M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM7 2v4m10-4v4M3 10h18\"/>",
 "mountain": "<path d=\"M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0m-4 4h.01\"/>",
 "cup": "<path d=\"M12 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3\"/>",
 "car": "<path d=\"m2 21 8-17 5 10 3-5 5 12H2ZM7 10l3 2 3-2\"/>",
 "clock": "<path d=\"M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2\"/>",
 "users2": "<path d=\"M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 21v-3a6 6 0 0 1 12 0v3M19 4a3 3 0 0 1 0 6m2 11v-3a5 5 0 0 0-2-4\"/>",
 "filter": "<path d=\"M3 5h18M6 12h12M9 19h6\"/>",
 "pool": "<path d=\"M7 17V5a2 2 0 0 1 4 0m2 12V5a2 2 0 0 1 4 0M7 9h6M7 13h6M2 18c2-2 4 2 6 0s4 2 6 0 4 2 8 0M2 22c2-2 4 2 6 0s4 2 6 0 4 2 8 0\"/>",
 "bag": "<path d=\"M6 6h12v14H6V6ZM9 6V2h6v4M9 10v6m6-6v6M8 20v2m8-2v2\"/>",
 "plane": "<path d=\"m21 3-7 7-9-2-2 2 8 4-4 4-3-1-2 2 5 3 3-5 4-4 4 8 2-2-2-9 7-7Z\"/>",
 "calendar2": "<path d=\"M3 5h18v16H3V5ZM7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2\"/>",
 "star": "<path d=\"m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z\"/>",
 "right": "<path d=\"M4 12h16M14 6l6 6-6 6\"/>",
 "building": "<path d=\"M3 21V4h18v17M7 8h2m6 0h2M7 12h2m6 0h2M10 21v-5h4v5\"/>"
};
export const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

// Button arrows carry their own stroke attributes in the original markup.
export const iconStroke = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
