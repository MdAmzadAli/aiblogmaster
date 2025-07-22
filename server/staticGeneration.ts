import fs from 'fs/promises';
import { join } from 'path';
import { storage } from "./storage";
import { generatePostSSR, generateHomeSSR } from "./ssr";

/**
 * Static Site Generation - Similar to Next.js getStaticProps
 * Pre-generates HTML files at build time for optimal SEO and performance
 */

interface StaticGenerationConfig {
  baseUrl: string;
  outputDir: string;
}

export class StaticGenerator {
  private config: StaticGenerationConfig;

  constructor(config: StaticGenerationConfig) {
    this.config = config;
  }

  /**
   * Generate all static pages - equivalent to Next.js build process
   */
  async generateAllPages(): Promise<void> {
    console.log('🚀 Starting static site generation...');
    
    try {
      // Ensure output directory exists
      await fs.mkdir(this.config.outputDir, { recursive: true });

      // Generate home page
      await this.generateHomePage();

      // Generate all blog post pages
      await this.generateBlogPages();

      // Generate blog listing page
      await this.generateBlogListingPage();

      console.log('✅ Static site generation completed!');
    } catch (error) {
      console.error('❌ Static generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate static paths - equivalent to Next.js getStaticPaths
   */
  async getStaticPaths(): Promise<string[]> {
    try {
      const posts = await storage.getPublishedPosts(1000);
      return posts.map(post => `/post/${post.slug}`);
    } catch (error) {
      console.error('Error getting static paths:', error);
      return [];
    }
  }

  /**
   * Generate props for a specific page - equivalent to Next.js getStaticProps
   */
  async getStaticProps(path: string): Promise<{ html: string; revalidate?: number }> {
    if (path === '/') {
      const html = await generateHomeSSR(this.config.baseUrl);
      return { 
        html, 
        revalidate: 3600 // Regenerate every hour
      };
    }

    if (path.startsWith('/post/')) {
      const slug = path.replace('/post/', '');
      const html = await generatePostSSR(slug, this.config.baseUrl);
      
      if (!html) {
        throw new Error(`Post not found: ${slug}`);
      }

      return { 
        html,
        revalidate: 86400 // Regenerate daily
      };
    }

    throw new Error(`Unknown path: ${path}`);
  }

  /**
   * Generate home page
   */
  private async generateHomePage(): Promise<void> {
    console.log('📄 Generating home page...');
    
    const { html } = await this.getStaticProps('/');
    const filePath = join(this.config.outputDir, 'index.html');
    
    await fs.writeFile(filePath, html, 'utf-8');
    console.log('✅ Home page generated');
  }

  /**
   * Generate all blog post pages
   */
  private async generateBlogPages(): Promise<void> {
    console.log('📚 Generating blog posts...');
    
    const paths = await this.getStaticPaths();
    
    for (const blogPath of paths) {
      try {
        const { html } = await this.getStaticProps(blogPath);
        const slug = blogPath.replace('/post/', '');
        const dirPath = join(this.config.outputDir, 'post', slug);
        const filePath = join(dirPath, 'index.html');
        
        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(filePath, html, 'utf-8');
        
        console.log(`✅ Generated: ${blogPath}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${blogPath}:`, error);
      }
    }
  }

  /**
   * Generate blog listing page
   */
  private async generateBlogListingPage(): Promise<void> {
    console.log('📋 Generating blog listing...');
    
    // For now, we'll use the same home page logic
    // In a real implementation, you'd create a dedicated blog listing template
    const { html } = await this.getStaticProps('/');
    const dirPath = join(this.config.outputDir, 'blog');
    const filePath = join(dirPath, 'index.html');
    
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, html, 'utf-8');
    console.log('✅ Blog listing generated');
  }

  /**
   * Incremental Static Regeneration - equivalent to Next.js ISR
   * Regenerates a page when data changes
   */
  async regeneratePage(path: string): Promise<void> {
    try {
      console.log(`🔄 Regenerating page: ${path}`);
      
      const { html } = await this.getStaticProps(path);
      
      let filePath: string;
      if (path === '/') {
        filePath = join(this.config.outputDir, 'index.html');
      } else if (path.startsWith('/post/')) {
        const slug = path.replace('/post/', '');
        const dirPath = join(this.config.outputDir, 'post', slug);
        filePath = join(dirPath, 'index.html');
        await fs.mkdir(dirPath, { recursive: true });
      } else {
        throw new Error(`Unknown path: ${path}`);
      }
      
      await fs.writeFile(filePath, html, 'utf-8');
      console.log(`✅ Regenerated: ${path}`);
    } catch (error) {
      console.error(`❌ Failed to regenerate ${path}:`, error);
      throw error;
    }
  }

  /**
   * Build-time generation command
   */
  static async build(baseUrl: string = 'https://your-domain.com'): Promise<void> {
    const generator = new StaticGenerator({
      baseUrl,
      outputDir: './dist/static'
    });

    await generator.generateAllPages();
  }
}

// CLI command for build process
if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  StaticGenerator.build(baseUrl)
    .then(() => {
      console.log('🎉 Build completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Build failed:', error);
      process.exit(1);
    });
}