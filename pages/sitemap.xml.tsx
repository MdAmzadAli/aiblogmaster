import { GetServerSideProps } from 'next'

interface Post {
  slug: string
  publishedAt: string
  category: string
}

function generateSiteMap(posts: Post[], categories: string[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static pages -->
     <url>
       <loc>${baseUrl}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${baseUrl}/blog</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
     </url>
     
     <!-- Category pages -->
     ${categories
       .map((category) => {
         return `
       <url>
         <loc>${baseUrl}/category/${category.toLowerCase()}</loc>
         <lastmod>${new Date().toISOString()}</lastmod>
         <changefreq>weekly</changefreq>
         <priority>0.8</priority>
       </url>`
       })
       .join('')}
     
     <!-- Dynamic post pages -->
     ${posts
       .map((post) => {
         return `
       <url>
         <loc>${baseUrl}/post/${post.slug}</loc>
         <lastmod>${new Date(post.publishedAt).toISOString()}</lastmod>
         <changefreq>monthly</changefreq>
         <priority>0.7</priority>
       </url>`
       })
       .join('')}
   </urlset>
 `
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    const response = await fetch(`${baseUrl}/api/posts?status=published`)
    const posts = response.ok ? await response.json() : []
    
    // Extract unique categories
    const categories = [...new Set(posts.map((post: Post) => post.category))].filter(Boolean) as string[]

    // Generate the XML sitemap
    const sitemap = generateSiteMap(posts, categories)

    res.setHeader('Content-Type', 'text/xml')
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate') // Cache for 24 hours
    res.write(sitemap)
    res.end()

    return {
      props: {}
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
    res.statusCode = 500
    res.end()
    return {
      props: {}
    }
  }
}

export default SiteMap