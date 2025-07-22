import { storage } from "./storage";
import type { Post } from "@shared/schema";

interface SSRPageData {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  url: string;
  type: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  canonicalUrl: string;
}

export async function generatePostSSR(slug: string, baseUrl: string): Promise<string | null> {
  try {
    const post = await storage.getPostBySlug(slug);
    if (!post || post.status !== 'published') {
      return null;
    }

    const pageData: SSRPageData = {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      keywords: post.keywords || [],
      image: post.featuredImage || `${baseUrl}/og-default.jpg`,
      url: `${baseUrl}/post/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : 
                      post.createdAt ? new Date(post.createdAt).toISOString() : 
                      new Date().toISOString(),
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : 
                     post.createdAt ? new Date(post.createdAt).toISOString() : 
                     new Date().toISOString(),
      author: post.isAiGenerated ? "AI Assistant" : "Human Author",
      section: post.category,
      canonicalUrl: `${baseUrl}/post/${post.slug}`
    };

    return generateHTMLWithSEO(pageData, post);
  } catch (error) {
    console.error('Error generating SSR for post:', error);
    return null;
  }
}

export async function generateHomeSSR(baseUrl: string): Promise<string> {
  const pageData: SSRPageData = {
    title: "AI Blog Platform - Automated SEO-Optimized Content Generation",
    description: "Transform your content strategy with AI-powered blog automation. Generate SEO-optimized articles, track performance analytics, and boost your search rankings with our intelligent content platform.",
    keywords: ["AI blog", "SEO optimization", "content generation", "automated blogging", "artificial intelligence", "content marketing", "blog automation", "SEO tools"],
    image: `${baseUrl}/og-default.jpg`,
    url: baseUrl,
    type: 'website',
    canonicalUrl: baseUrl
  };

  return generateHTMLWithSEO(pageData);
}

function generateHTMLWithSEO(pageData: SSRPageData, post?: Post): string {
  const structuredData = post ? generateArticleStructuredData(pageData, post) : generateWebsiteStructuredData(pageData);
  
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    
    <!-- Primary Meta Tags -->
    <title>${pageData.title}</title>
    <meta name="title" content="${pageData.title}" />
    <meta name="description" content="${pageData.description}" />
    <meta name="keywords" content="${pageData.keywords.join(', ')}" />
    <meta name="author" content="${pageData.author || 'AI Blog Platform'}" />
    <meta name="robots" content="index, follow" />
    <meta name="language" content="en" />
    <meta name="theme-color" content="#3b82f6" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${pageData.type}" />
    <meta property="og:url" content="${pageData.url}" />
    <meta property="og:title" content="${pageData.title}" />
    <meta property="og:description" content="${pageData.description}" />
    <meta property="og:image" content="${pageData.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${pageData.title}" />
    <meta property="og:site_name" content="AI Blog Platform" />
    <meta property="og:locale" content="en_US" />
    
    ${pageData.type === 'article' ? `
    <meta property="article:author" content="${pageData.author}" />
    <meta property="article:published_time" content="${pageData.publishedTime}" />
    <meta property="article:modified_time" content="${pageData.modifiedTime}" />
    <meta property="article:section" content="${pageData.section}" />
    ${pageData.keywords.map(keyword => `<meta property="article:tag" content="${keyword}" />`).join('\n    ')}
    ` : ''}
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageData.url}" />
    <meta name="twitter:title" content="${pageData.title}" />
    <meta name="twitter:description" content="${pageData.description}" />
    <meta name="twitter:image" content="${pageData.image}" />
    <meta name="twitter:image:alt" content="${pageData.title}" />
    <meta name="twitter:creator" content="@AIBlogPlatform" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${pageData.canonicalUrl}" />
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    
    <!-- Preconnect to external domains for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- Structured Data -->
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <!-- This is a replit script which adds a banner on the top of the page when opened in development mode outside the replit environment -->
    <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  </body>
</html>`;
}

function generateArticleStructuredData(pageData: SSRPageData, post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": pageData.title,
    "description": pageData.description,
    "url": pageData.url,
    "image": {
      "@type": "ImageObject",
      "url": pageData.image,
      "width": 1200,
      "height": 630
    },
    "author": {
      "@type": "Person",
      "name": pageData.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog Platform",
      "logo": {
        "@type": "ImageObject",
        "url": `${new URL(pageData.url).origin}/logo.png`,
        "width": 200,
        "height": 60
      }
    },
    "datePublished": pageData.publishedTime,
    "dateModified": pageData.modifiedTime,
    "keywords": pageData.keywords.join(', '),
    "articleSection": pageData.section,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageData.url
    }
  };
}

function generateWebsiteStructuredData(pageData: SSRPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Blog Platform",
    "url": pageData.url,
    "description": pageData.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${pageData.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}