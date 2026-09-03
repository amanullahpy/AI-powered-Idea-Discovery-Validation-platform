/** @type {import('next-sitemap').IConfig} */
function getSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000';

  return siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
}

module.exports = {
  siteUrl: getSiteUrl(),
  generateRobotsTxt: false, // We use native Next.js 16 app/robots.ts
  generateIndexSitemap: false,
  exclude: [
    '/dashboard*',
    '/onboarding*',
    '/settings*',
    '/ai*',
    '/ideas/*',
    '/saved*',
    '/auth/*',
    '/private-item*',
  ],
};
