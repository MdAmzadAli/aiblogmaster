import { GetServerSideProps } from 'next';
import { Post } from '@shared/schema';

function generateSiteMap(posts: Post[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.replit.app';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static pages -->
     <url>
       <loc>${siteUrl}</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${siteUrl}/blog</loc>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
     </url>
     <!-- Dynamic blog posts -->
     ${posts
       .map((post) => {
         return `
       <url>
           <loc>${siteUrl}/post/${post.slug}</loc>
           <lastmod>${post.updatedAt}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000' 
      : process.env.NEXT_PUBLIC_API_URL || '';

    const response = await fetch(`${baseUrl}/api/posts?status=published&limit=1000`);
    const data = response.ok ? await response.json() : { posts: [] };
    const posts = data.posts || [];

    // Generate the XML sitemap
    const sitemap = generateSiteMap(posts);

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
      props: {},
    };
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.statusCode = 500;
    res.end();
    return {
      props: {},
    };
  }
};

export default SiteMap;