import { useMemo } from 'react';
import type { Post } from '@shared/schema';

interface MetadataConfig {
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  twitterHandle?: string;
  facebookAppId?: string;
  author?: string;
}

interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url: string;
  type: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const DEFAULT_CONFIG: MetadataConfig = {
  siteName: 'AI Blog Platform',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
  defaultImage: '/og-default.jpg',
  twitterHandle: '@AIBlogPlatform',
  author: 'AI Blog Platform Team'
};

export function useMetadataGenerator(config: Partial<MetadataConfig> = {}) {
  const fullConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  // Generate metadata for home page
  const generateHomeMetadata = (): PageMetadata => ({
    title: `${fullConfig.siteName} - AI-Powered Content Generation & SEO Optimization`,
    description: 'Transform your content strategy with AI-powered blog automation. Generate SEO-optimized articles, track performance analytics, and boost your search rankings.',
    keywords: ['AI blog', 'content generation', 'SEO optimization', 'automated blogging', 'artificial intelligence'],
    image: `${fullConfig.siteUrl}${fullConfig.defaultImage}`,
    url: fullConfig.siteUrl,
    type: 'website'
  });

  // Generate metadata for blog listing page
  const generateBlogListingMetadata = (): PageMetadata => ({
    title: `Blog | ${fullConfig.siteName}`,
    description: 'Discover AI-generated articles, SEO tips, and content strategy insights. Stay updated with the latest in automated content creation.',
    keywords: ['blog', 'articles', 'AI content', 'SEO tips', 'content strategy'],
    image: `${fullConfig.siteUrl}${fullConfig.defaultImage}`,
    url: `${fullConfig.siteUrl}/blog`,
    type: 'website'
  });

  // Generate metadata for individual blog post
  const generatePostMetadata = (post: Post): PageMetadata => {
    const baseUrl = fullConfig.siteUrl;
    const postUrl = `${baseUrl}/post/${post.slug}`;
    
    return {
      title: `${post.title} | ${fullConfig.siteName}`,
      description: post.metaDescription || post.excerpt || `Read ${post.title} on ${fullConfig.siteName}`,
      keywords: post.keywords || [],
      image: post.featuredImage || `${baseUrl}${fullConfig.defaultImage}`,
      url: postUrl,
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : 
                     post.createdAt ? new Date(post.createdAt).toISOString() : 
                     new Date().toISOString(),
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : 
                    post.createdAt ? new Date(post.createdAt).toISOString() : 
                    new Date().toISOString(),
      author: post.isAiGenerated ? 'AI Assistant' : fullConfig.author,
      section: post.category,
      tags: post.keywords || []
    };
  };

  // Generate metadata for category pages
  const generateCategoryMetadata = (category: string): PageMetadata => ({
    title: `${category} Articles | ${fullConfig.siteName}`,
    description: `Explore ${category.toLowerCase()} articles and insights. Discover AI-generated content and expert tips in ${category.toLowerCase()}.`,
    keywords: [category.toLowerCase(), 'articles', 'AI content', fullConfig.siteName.toLowerCase()],
    image: `${fullConfig.siteUrl}${fullConfig.defaultImage}`,
    url: `${fullConfig.siteUrl}/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'website'
  });

  // Generate metadata for search results
  const generateSearchMetadata = (query: string): PageMetadata => ({
    title: `Search: "${query}" | ${fullConfig.siteName}`,
    description: `Search results for "${query}" on ${fullConfig.siteName}. Find relevant articles and content.`,
    keywords: [query, 'search', 'articles', fullConfig.siteName.toLowerCase()],
    image: `${fullConfig.siteUrl}${fullConfig.defaultImage}`,
    url: `${fullConfig.siteUrl}/search?q=${encodeURIComponent(query)}`,
    type: 'website'
  });

  // Generate Open Graph tags
  const generateOpenGraphTags = (metadata: PageMetadata) => ({
    'og:title': metadata.title,
    'og:description': metadata.description,
    'og:image': metadata.image,
    'og:url': metadata.url,
    'og:type': metadata.type,
    'og:site_name': fullConfig.siteName,
    'og:locale': 'en_US',
    ...(metadata.type === 'article' && {
      'article:author': metadata.author,
      'article:published_time': metadata.publishedTime,
      'article:modified_time': metadata.modifiedTime,
      'article:section': metadata.section,
      'article:tag': metadata.tags?.join(',')
    })
  });

  // Generate Twitter Card tags
  const generateTwitterTags = (metadata: PageMetadata) => ({
    'twitter:card': 'summary_large_image',
    'twitter:title': metadata.title,
    'twitter:description': metadata.description,
    'twitter:image': metadata.image,
    'twitter:image:alt': metadata.title,
    ...(fullConfig.twitterHandle && {
      'twitter:site': fullConfig.twitterHandle,
      'twitter:creator': fullConfig.twitterHandle
    })
  });

  // Generate JSON-LD structured data
  const generateStructuredData = (metadata: PageMetadata) => {
    const baseStructure = {
      "@context": "https://schema.org",
      "@type": metadata.type === 'article' ? 'Article' : 'WebPage',
      "name": metadata.title,
      "description": metadata.description,
      "url": metadata.url,
      "image": {
        "@type": "ImageObject",
        "url": metadata.image,
        "width": 1200,
        "height": 630
      }
    };

    if (metadata.type === 'article') {
      return {
        ...baseStructure,
        "@type": "Article",
        "headline": metadata.title,
        "author": {
          "@type": "Person",
          "name": metadata.author
        },
        "publisher": {
          "@type": "Organization",
          "name": fullConfig.siteName,
          "logo": {
            "@type": "ImageObject",
            "url": `${fullConfig.siteUrl}/logo.png`
          }
        },
        "datePublished": metadata.publishedTime,
        "dateModified": metadata.modifiedTime,
        "keywords": metadata.keywords?.join(', '),
        "articleSection": metadata.section,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": metadata.url
        }
      };
    }

    return baseStructure;
  };

  // Generate all meta tags for a page
  const generateAllMetaTags = (metadata: PageMetadata) => {
    const ogTags = generateOpenGraphTags(metadata);
    const twitterTags = generateTwitterTags(metadata);
    
    return {
      basic: {
        title: metadata.title,
        description: metadata.description,
        keywords: metadata.keywords?.join(', '),
        canonical: metadata.url,
        robots: 'index, follow'
      },
      openGraph: ogTags,
      twitter: twitterTags,
      structuredData: generateStructuredData(metadata)
    };
  };

  return {
    generateHomeMetadata,
    generateBlogListingMetadata,
    generatePostMetadata,
    generateCategoryMetadata,
    generateSearchMetadata,
    generateOpenGraphTags,
    generateTwitterTags,
    generateStructuredData,
    generateAllMetaTags,
    config: fullConfig
  };
}

// Metadata provider component
export function MetadataProvider({ 
  children, 
  config = {} 
}: { 
  children: React.ReactNode;
  config?: Partial<MetadataConfig>;
}) {
  const metadataGenerator = useMetadataGenerator(config);
  
  return (
    <MetadataContext.Provider value={metadataGenerator}>
      {children}
    </MetadataContext.Provider>
  );
}

// React context for metadata
import { createContext, useContext } from 'react';

const MetadataContext = createContext<ReturnType<typeof useMetadataGenerator> | null>(null);

export function useMetadata() {
  const context = useContext(MetadataContext);
  if (!context) {
    throw new Error('useMetadata must be used within MetadataProvider');
  }
  return context;
}