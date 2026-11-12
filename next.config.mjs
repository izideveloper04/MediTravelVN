/** @type {import('next').NextConfig} */
const headers = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
const nextConfig = { output: 'standalone', trailingSlash: true, poweredByHeader: false, async headers() { return [{ source: '/:path*', headers }]; } };
export default nextConfig;
