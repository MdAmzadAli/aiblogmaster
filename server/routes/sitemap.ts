import type { Express } from "express";
import { storage } from "../storage";

export function registerSitemapRoutes(app: Express) {
  // XML Sitemap
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const posts = await storage.getPublishedPosts(1000); // Get all published posts
      
      const staticPages = [
        { url: '', changefreq: 'daily' as const, priority: '1.0', lastmod: undefined as Date | undefined },
        { url: '/blog', changefreq: 'daily' as const, priority: '0.9', lastmod: undefined as Date | undefined },
      ];

      const postPages = posts.map(post => ({
        url: `/post/${post.slug}`,
        changefreq: 'weekly' as const,
        priority: '0.8',
        lastmod: post.updatedAt || post.publishedAt || post.createdAt || undefined
      }));

      const allPages = [...staticPages, ...postPages];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /post-editor

Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 1`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
  });
}