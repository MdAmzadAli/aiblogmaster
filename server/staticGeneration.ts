import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { storage } from './storage';
import type { Post } from '@shared/schema';

interface StaticProps {
  props: {
    post?: Post;
    posts?: Post[];
    lastGenerated: string;
  };
  revalidate?: number;
}

interface StaticPaths {
  paths: Array<{ params: { slug: string } }>;
  fallback: boolean | 'blocking';
}

export class StaticSiteGenerator {
  private distPath = join(process.cwd(), 'dist', 'static');

  constructor() {
    // Ensure static directory exists
    if (!existsSync(this.distPath)) {
      mkdirSync(this.distPath, { recursive: true });
    }
  }

  // Next.js getStaticProps equivalent for blog posts
  async getStaticProps(context?: { params?: { slug: string } }): Promise<StaticProps> {
    try {
      const lastGenerated = new Date().toISOString();

      if (context?.params?.slug) {
        // Generate individual post page
        const post = await storage.getPostBySlug(context.params.slug);
        
        if (!post || post.status !== 'published') {
          return {
            props: {
              lastGenerated,
            },
          };
        }

        // Track view for analytics (but don't increment for static generation)
        return {
          props: {
            post,
            lastGenerated,
          },
          revalidate: 3600, // Revalidate every hour
        };
      } else {
        // Generate blog listing page
        const posts = await storage.getPublishedPosts(20);
        return {
          props: {
            posts,
            lastGenerated,
          },
          revalidate: 1800, // Revalidate every 30 minutes
        };
      }
    } catch (error) {
      console.error('Error in getStaticProps:', error);
      return {
        props: {
          lastGenerated: new Date().toISOString(),
        },
      };
    }
  }

  // Next.js getStaticPaths equivalent
  async getStaticPaths(): Promise<StaticPaths> {
    try {
      const posts = await storage.getPublishedPosts();
      const paths = posts.map(post => ({
        params: { slug: post.slug }
      }));

      return {
        paths,
        fallback: 'blocking', // Generate missing pages on-demand
      };
    } catch (error) {
      console.error('Error in getStaticPaths:', error);
      return {
        paths: [],
        fallback: 'blocking',
      };
    }
  }

  // Generate static HTML for a blog post
  async generatePostHTML(post: Post): Promise<string> {
    const canonicalUrl = `${process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : 'http://localhost:5000'}/post/${post.slug}`;
    const imageUrl = post.featuredImage || `${canonicalUrl}/images/default-blog.jpg`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO Meta Tags -->
  <title>${post.title} | AI Blog Platform</title>
  <meta name="description" content="${post.metaDescription || post.excerpt}" />
  <meta name="keywords" content="${post.keywords?.join(', ') || ''}" />
  <meta name="author" content="AI Blog Platform" />
  <meta name="robots" content="index, follow" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.metaDescription || post.excerpt}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:site_name" content="AI Blog Platform" />
  <meta property="article:published_time" content="${post.publishedAt || post.createdAt}" />
  <meta property="article:author" content="AI Blog Platform" />
  <meta property="article:section" content="${post.category}" />
  ${post.keywords?.map(keyword => `<meta property="article:tag" content="${keyword}" />`).join('\n  ') || ''}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${post.title}" />
  <meta name="twitter:description" content="${post.metaDescription || post.excerpt}" />
  <meta name="twitter:image" content="${imageUrl}" />
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${canonicalUrl}" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${post.title}",
    "description": "${post.metaDescription || post.excerpt}",
    "image": "${imageUrl}",
    "author": {
      "@type": "Organization",
      "name": "AI Blog Platform"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog Platform",
      "logo": {
        "@type": "ImageObject",
        "url": "${canonicalUrl}/logo.png"
      }
    },
    "datePublished": "${post.publishedAt || post.createdAt}",
    "dateModified": "${post.updatedAt}",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${canonicalUrl}"
    },
    "articleSection": "${post.category}",
    "keywords": [${post.keywords?.map(k => `"${k}"`).join(', ') || ''}]
  }
  </script>
  
  <!-- Critical CSS -->
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; margin: 0; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .title { font-size: 2.5rem; margin-bottom: 1rem; color: #1a202c; }
    .meta { color: #718096; margin-bottom: 2rem; }
    .content { line-height: 1.8; }
    .content h2 { margin-top: 2rem; margin-bottom: 1rem; color: #2d3748; }
    .content p { margin-bottom: 1rem; }
    .category-badge { display: inline-block; padding: 0.25rem 0.75rem; background: #e2e8f0; color: #2d3748; border-radius: 9999px; font-size: 0.875rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <article>
    <header class="header">
      <div class="category-badge">${post.category}</div>
      <h1 class="title">${post.title}</h1>
      <div class="meta">
        Published on ${new Date(post.publishedAt || post.createdAt).toLocaleDateString()} 
        ${post.isAiGenerated ? '• AI-Generated Content' : ''}
        ${post.seoScore ? `• SEO Score: ${post.seoScore}/100` : ''}
      </div>
    </header>
    
    <div class="content">
      ${post.content}
    </div>
  </article>
  
  <!-- Minimal JavaScript for analytics -->
  <script>
    // Track page view
    fetch('/api/posts/${post.id}/view', { method: 'POST' }).catch(() => {});
    
    // Reading progress
    let ticking = false;
    function updateProgress() {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      document.documentElement.style.setProperty('--scroll-progress', scrolled + '%');
      ticking = false;
    }
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    });
  </script>
</body>
</html>`;
  }

  // Generate static HTML for blog listing
  async generateBlogListHTML(posts: Post[]): Promise<string> {
    const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS}` : 'http://localhost:5000';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <title>Blog Posts | AI Blog Platform</title>
  <meta name="description" content="Latest AI-powered blog posts covering web development, SEO, performance optimization, and technology trends." />
  <meta name="keywords" content="blog, AI content, web development, SEO, performance, technology" />
  <meta name="robots" content="index, follow" />
  
  <link rel="canonical" href="${baseUrl}/blog" />
  
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 3rem; }
    .title { font-size: 3rem; margin-bottom: 1rem; }
    .posts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }
    .post-card { border: 1px solid #e2e8f0; border-radius: 0.5rem; overflow: hidden; transition: transform 0.2s; }
    .post-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .post-content { padding: 1.5rem; }
    .post-title { font-size: 1.5rem; margin-bottom: 1rem; }
    .post-title a { color: #2d3748; text-decoration: none; }
    .post-excerpt { color: #718096; margin-bottom: 1rem; line-height: 1.6; }
    .post-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: #a0aec0; }
    .category-badge { padding: 0.25rem 0.75rem; background: #e2e8f0; color: #2d3748; border-radius: 9999px; }
  </style>
</head>
<body>
  <header class="header">
    <h1 class="title">Latest Blog Posts</h1>
    <p>AI-powered content covering technology, development, and digital trends</p>
  </header>
  
  <main class="posts-grid">
    ${posts.map(post => `
      <article class="post-card">
        <div class="post-content">
          <div class="category-badge">${post.category}</div>
          <h2 class="post-title">
            <a href="/post/${post.slug}">${post.title}</a>
          </h2>
          <p class="post-excerpt">${post.excerpt}</p>
          <div class="post-meta">
            <span>${new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
            <span>SEO: ${post.seoScore}/100</span>
          </div>
        </div>
      </article>
    `).join('')}
  </main>
</body>
</html>`;
  }

  // Build all static pages
  async buildStaticSite(): Promise<{ generated: number; errors: number; pages: string[] }> {
    console.log('🏗️  Starting static site generation...');
    
    let generated = 0;
    let errors = 0;
    const pages: string[] = [];

    try {
      // Generate blog listing page
      const { props: blogProps } = await this.getStaticProps();
      if (blogProps.posts) {
        const blogHTML = await this.generateBlogListHTML(blogProps.posts);
        const blogPath = join(this.distPath, 'blog.html');
        writeFileSync(blogPath, blogHTML, 'utf8');
        pages.push('/blog');
        generated++;
        console.log(`✅ Generated: /blog`);
      }

      // Generate individual post pages
      const { paths } = await this.getStaticPaths();
      
      for (const path of paths) {
        try {
          const { props } = await this.getStaticProps({ params: path.params });
          if (props.post) {
            const postHTML = await this.generatePostHTML(props.post);
            const postPath = join(this.distPath, `post-${path.params.slug}.html`);
            writeFileSync(postPath, postHTML, 'utf8');
            pages.push(`/post/${path.params.slug}`);
            generated++;
            console.log(`✅ Generated: /post/${path.params.slug}`);
          }
        } catch (error) {
          console.error(`❌ Error generating /post/${path.params.slug}:`, error);
          errors++;
        }
      }

      console.log(`🎉 Static generation complete: ${generated} pages generated, ${errors} errors`);
      
      return { generated, errors, pages };
    } catch (error) {
      console.error('❌ Static generation failed:', error);
      return { generated, errors, pages };
    }
  }

  // Serve pre-generated static content
  async serveStaticContent(slug: string): Promise<string | null> {
    try {
      const staticPath = join(this.distPath, `post-${slug}.html`);
      if (existsSync(staticPath)) {
        const { readFileSync } = await import('fs');
        return readFileSync(staticPath, 'utf8');
      }
      return null;
    } catch (error) {
      console.error('Error serving static content:', error);
      return null;
    }
  }

  // Generate static page for a single post (incremental generation)
  async generateSinglePost(postId: number): Promise<{ success: boolean; slug?: string; error?: string }> {
    try {
      const post = await storage.getPost(postId);
      
      if (!post || post.status !== 'published') {
        return { success: false, error: 'Post not found or not published' };
      }

      // Generate the static HTML
      const postHTML = await this.generatePostHTML(post);
      const postPath = join(this.distPath, `post-${post.slug}.html`);
      writeFileSync(postPath, postHTML, 'utf8');
      
      console.log(`✅ Generated static page: /post/${post.slug}`);
      return { success: true, slug: post.slug };
    } catch (error) {
      console.error('Error generating single post:', error);
      return { success: false, error: String(error) };
    }
  }

  // Regenerate blog listing page (when new posts are published)
  async regenerateBlogListing(): Promise<{ success: boolean; error?: string }> {
    try {
      const { props } = await this.getStaticProps();
      if (props.posts) {
        const blogHTML = await this.generateBlogListHTML(props.posts);
        const blogPath = join(this.distPath, 'blog.html');
        writeFileSync(blogPath, blogHTML, 'utf8');
        console.log(`✅ Regenerated blog listing page`);
        return { success: true };
      }
      return { success: false, error: 'No posts found' };
    } catch (error) {
      console.error('Error regenerating blog listing:', error);
      return { success: false, error: String(error) };
    }
  }

  // Auto-generate static content when post is published
  async onPostPublished(postId: number): Promise<void> {
    try {
      console.log(`🔄 Auto-generating static content for post ID: ${postId}`);
      
      // Generate static page for the new post
      const postResult = await this.generateSinglePost(postId);
      
      // Regenerate blog listing to include the new post
      const listingResult = await this.regenerateBlogListing();
      
      if (postResult.success && listingResult.success) {
        console.log(`🎉 Auto-generated static content successfully for post: ${postResult.slug}`);
      } else {
        console.error(`❌ Auto-generation failed:`, { postResult, listingResult });
      }
    } catch (error) {
      console.error('Error in auto-generation:', error);
    }
  }
}

export const staticGenerator = new StaticSiteGenerator();