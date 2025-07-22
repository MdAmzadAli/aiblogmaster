import { GetServerSideProps } from 'next'

function RobotsTxt() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional)
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin
Disallow: /api/

# Allow specific API endpoints for SEO
Allow: /api/posts/
Allow: /api/sitemap

# Block common bot traps
Disallow: /*?*utm_source=
Disallow: /*?*utm_medium=
Disallow: /*?*utm_campaign=

# Clean URLs
Disallow: /*?
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /*.txt$

# Allow search engines to index images
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.png$
Allow: /*.gif$
Allow: /*.webp$
Allow: /*.svg$
`

  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate') // Cache for 24 hours
  res.write(robotsTxt)
  res.end()

  return {
    props: {}
  }
}

export default RobotsTxt