// SITE_URL is the public address of this site. It is used for canonical URLs and social tags.
export const metadata = process.env.SITE_URL ? { metadataBase: new URL(process.env.SITE_URL) } : {};
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#175CFF' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/assets/fonts.css" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/design-tokens.css" />
        <script src="/currency.js" defer />
        <script src="/portal.js" defer />
      </head>
      <body>{children}</body>
    </html>
  );
}
