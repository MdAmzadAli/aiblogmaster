import { Request, Response } from 'express';
import { storage } from './storage';
import type { Post } from '../shared/schema';

// Handler for blog home page with SEO optimization
export async function handleBlogHome(req: Request, res: Response) {
  try {
    const posts = await storage.posts.getAll();
    const featuredPosts = posts.filter((p: Post) => p.status === 'published').slice(0, 3);
    
    const optimizedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Blog Platform - Latest Insights on Artificial Intelligence & Automation</title>
  <meta name="description" content="Stay updated with the latest AI trends, machine learning insights, and automation technologies. Expert analysis and tutorials on artificial intelligence.">
  <meta name="keywords" content="AI blog, artificial intelligence, machine learning, automation, technology insights">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Open Graph -->
  <meta property="og:title" content="AI Blog Platform - Latest Insights on Artificial Intelligence">
  <meta property="og:description" content="Stay updated with the latest AI trends, machine learning insights, and automation technologies.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}">
  <meta property="og:image" content="${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}/og-image.jpg">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="AI Blog Platform - Latest Insights on Artificial Intelligence">
  <meta name="twitter:description" content="Stay updated with the latest AI trends, machine learning insights, and automation technologies.">
  <meta name="twitter:image" content="${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}/og-image.jpg">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AI Blog Platform",
    "url": "${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}",
    "description": "AI-powered blog platform with latest insights on artificial intelligence and automation",
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog Platform"
    },
    "blogPost": [
      ${featuredPosts.map(post => `{
        "@type": "BlogPosting",
        "headline": "${post.title}",
        "description": "${post.excerpt || post.metaDescription}",
        "url": "${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}/blog/${post.slug}",
        "datePublished": "${post.publishedAt}",
        "author": {
          "@type": "Person",
          "name": "AI Content Team"
        }
      }`).join(',')}
    ]
  }
  </script>
  
  <!-- Critical CSS -->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background: #fff;
    }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; 
      padding: 4rem 0; 
      text-align: center; 
    }
    .hero-title { 
      font-size: clamp(2rem, 5vw, 4rem); 
      font-weight: 700; 
      margin-bottom: 1rem; 
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .hero-subtitle { 
      font-size: clamp(1rem, 3vw, 1.5rem); 
      opacity: 0.9; 
      margin-bottom: 2rem; 
    }
    .cta-button { 
      background: rgba(255,255,255,0.2); 
      color: white; 
      padding: 1rem 2rem; 
      border: 2px solid rgba(255,255,255,0.3); 
      border-radius: 0.5rem; 
      font-size: 1.1rem; 
      font-weight: 600;
      cursor: pointer; 
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
    }
    .cta-button:hover { 
      background: rgba(255,255,255,0.3); 
      border-color: rgba(255,255,255,0.5);
      transform: translateY(-2px);
    }
    .featured-posts { padding: 4rem 0; }
    .section-title { 
      font-size: 2.5rem; 
      font-weight: 700; 
      text-align: center; 
      margin-bottom: 3rem; 
      color: #2d3748;
    }
    .posts-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
      gap: 2rem; 
    }
    .post-card { 
      background: white; 
      border-radius: 1rem; 
      overflow: hidden; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .post-card:hover { 
      transform: translateY(-5px); 
      box-shadow: 0 12px 20px rgba(0,0,0,0.15);
    }
    .post-content { padding: 1.5rem; }
    .post-title { 
      font-size: 1.25rem; 
      font-weight: 600; 
      margin-bottom: 0.5rem; 
      color: #2d3748;
      line-height: 1.4;
    }
    .post-excerpt { 
      color: #718096; 
      margin-bottom: 1rem; 
      line-height: 1.5;
    }
    .post-meta { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      font-size: 0.875rem; 
      color: #a0aec0; 
    }
    .read-more { 
      color: #667eea; 
      font-weight: 600; 
      text-decoration: none;
    }
    .read-more:hover { color: #764ba2; }
    .footer { 
      background: #2d3748; 
      color: white; 
      text-align: center; 
      padding: 2rem 0; 
      margin-top: 4rem; 
    }
    @media (max-width: 768px) {
      .posts-grid { grid-template-columns: 1fr; }
      .hero-title { font-size: 2.5rem; }
      .container { padding: 0 1rem; }
    }
  </style>
  
  <!-- Non-critical CSS -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
  
</head>
<body>
  <header class="header">
    <div class="container">
      <h1 class="hero-title">AI Blog Platform</h1>
      <p class="hero-subtitle">Discover the latest insights in artificial intelligence, machine learning, and automation technology</p>
      <a href="/admin" class="cta-button">Access Admin Dashboard</a>
    </div>
  </header>
  
  <main>
    <section class="featured-posts">
      <div class="container">
        <h2 class="section-title">Latest Articles</h2>
        <div class="posts-grid">
          ${featuredPosts.map((post: Post) => `
            <article class="post-card">
              <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${(post.excerpt || post.metaDescription || '').substring(0, 120)}...</p>
                <div class="post-meta">
                  <span>${new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  <a href="/blog/${post.slug}" class="read-more">Read More</a>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
        ${featuredPosts.length === 0 ? '<p style="text-align: center; color: #718096; font-size: 1.1rem;">No published posts yet. Visit the admin dashboard to create your first post!</p>' : ''}
      </div>
    </section>
  </main>
  
  <footer class="footer">
    <div class="container">
      <p>&copy; 2025 AI Blog Platform. Powered by advanced AI technology.</p>
    </div>
  </footer>
  
  <!-- Deferred scripts -->
  <script defer>
    // Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    
    // Basic analytics
    window.addEventListener('load', () => {
      // Track page load performance
      const perfData = performance.getEntriesByType('navigation')[0];
      if (perfData) {
        console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
      }
    });
  </script>
</body>
</html>`;

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    
    res.send(optimizedHtml);
  } catch (error) {
    console.error('Error rendering blog home:', error);
    res.status(500).send('Internal Server Error');
  }
}

// Handler for individual blog posts with SEO optimization
export async function handleBlogPost(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const post = await storage.posts.getBySlug(slug);
    
    if (!post || post.status !== 'published') {
      return res.status(404).send('Post not found');
    }
    
    const optimizedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${post.title} | AI Blog Platform</title>
  <meta name="description" content="${post.metaDescription || post.excerpt || post.title}">
  <meta name="keywords" content="${post.tags?.join(', ') || 'AI, technology, innovation'}">
  <link rel="canonical" href="${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}/blog/${post.slug}">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Open Graph -->
  <meta property="og:title" content="${post.title}">
  <meta property="og:description" content="${post.metaDescription || post.excerpt || post.title}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}/blog/${post.slug}">
  <meta property="article:published_time" content="${post.publishedAt}">
  <meta property="article:author" content="AI Content Team">
  ${post.tags ? post.tags.map((tag: string) => `<meta property="article:tag" content="${tag}">`).join('\n  ') : ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${post.title}">
  <meta name="twitter:description" content="${post.metaDescription || post.excerpt || post.title}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "${post.title}",
    "description": "${post.metaDescription || post.excerpt || post.title}",
    "url": "${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}/blog/${post.slug}",
    "datePublished": "${post.publishedAt}",
    "dateModified": "${post.updatedAt || post.publishedAt}",
    "author": {
      "@type": "Person",
      "name": "AI Content Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog Platform"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${process.env.NEXT_PUBLIC_SITE_URL || req.protocol + '://' + req.get('host')}/blog/${post.slug}"
    }
  }
  </script>
  
  <!-- Critical CSS for post pages -->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; 
      line-height: 1.7; 
      color: #2d3748; 
      background: #f7fafc;
    }
    .container { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
    .header { 
      background: white; 
      padding: 1rem 0; 
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .nav { display: flex; justify-content: space-between; align-items: center; }
    .logo { font-size: 1.5rem; font-weight: 700; color: #667eea; text-decoration: none; }
    .back-link { color: #718096; text-decoration: none; }
    .back-link:hover { color: #667eea; }
    .article { 
      background: white; 
      margin: 2rem 0; 
      padding: 3rem; 
      border-radius: 1rem; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .article-header { text-align: center; margin-bottom: 3rem; padding-bottom: 2rem; border-bottom: 1px solid #e2e8f0; }
    .article-title { 
      font-size: clamp(1.75rem, 4vw, 3rem); 
      font-weight: 700; 
      margin-bottom: 1rem; 
      line-height: 1.2;
      color: #1a202c;
    }
    .article-meta { 
      color: #718096; 
      font-size: 0.9rem; 
      margin-bottom: 1rem;
    }
    .article-excerpt { 
      font-size: 1.1rem; 
      color: #4a5568; 
      font-style: italic; 
    }
    .article-content { 
      font-size: 1.1rem; 
      line-height: 1.8;
    }
    .article-content h1, .article-content h2, .article-content h3 { 
      margin: 2rem 0 1rem 0; 
      color: #1a202c; 
    }
    .article-content h2 { font-size: 1.75rem; }
    .article-content h3 { font-size: 1.5rem; }
    .article-content p { margin-bottom: 1.5rem; }
    .article-content ul, .article-content ol { margin: 1.5rem 0; padding-left: 2rem; }
    .article-content li { margin-bottom: 0.5rem; }
    .article-content blockquote { 
      border-left: 4px solid #667eea; 
      padding-left: 1.5rem; 
      margin: 2rem 0; 
      font-style: italic; 
      color: #4a5568;
    }
    .article-content code { 
      background: #f1f5f9; 
      padding: 0.2rem 0.4rem; 
      border-radius: 0.25rem; 
      font-size: 0.9em; 
    }
    .article-content pre { 
      background: #1a202c; 
      color: #e2e8f0; 
      padding: 1.5rem; 
      border-radius: 0.5rem; 
      overflow-x: auto; 
      margin: 2rem 0;
    }
    .tags { 
      margin-top: 3rem; 
      padding-top: 2rem; 
      border-top: 1px solid #e2e8f0;
    }
    .tag { 
      display: inline-block; 
      background: #edf2f7; 
      color: #4a5568; 
      padding: 0.25rem 0.75rem; 
      border-radius: 1rem; 
      font-size: 0.875rem; 
      margin: 0 0.5rem 0.5rem 0;
    }
    .footer { 
      background: #2d3748; 
      color: white; 
      text-align: center; 
      padding: 2rem 0; 
      margin-top: 4rem; 
    }
    @media (max-width: 768px) {
      .article { padding: 2rem 1.5rem; margin: 1rem 0; }
      .container { padding: 0 1rem; }
    }
  </style>
  
</head>
<body>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <a href="/" class="logo">AI Blog Platform</a>
        <a href="/" class="back-link">← Back to Blog</a>
      </nav>
    </div>
  </header>
  
  <main>
    <div class="container">
      <article class="article">
        <header class="article-header">
          <h1 class="article-title">${post.title}</h1>
          <div class="article-meta">
            Published on ${new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          ${post.excerpt ? `<p class="article-excerpt">${post.excerpt}</p>` : ''}
        </header>
        
        <div class="article-content">
          ${post.content}
        </div>
        
        ${post.tags && post.tags.length > 0 ? `
          <div class="tags">
            ${post.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        ` : ''}
      </article>
    </div>
  </main>
  
  <footer class="footer">
    <div class="container">
      <p>&copy; 2025 AI Blog Platform. Powered by advanced AI technology.</p>
    </div>
  </footer>
  
  <script defer>
    // Track article reading time
    window.addEventListener('load', () => {
      const startTime = Date.now();
      window.addEventListener('beforeunload', () => {
        const readingTime = Date.now() - startTime;
        // You can send this to analytics
        console.log('Reading time:', Math.round(readingTime / 1000), 'seconds');
      });
    });
  </script>
</body>
</html>`;

    res.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN'
    });
    
    res.send(optimizedHtml);
  } catch (error) {
    console.error('Error rendering blog post:', error);
    res.status(500).send('Internal Server Error');
  }
}