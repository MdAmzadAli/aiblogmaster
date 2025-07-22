import { useEffect } from 'react';

interface WebsiteStructuredDataProps {
  siteName: string;
  siteUrl: string;
  description: string;
}

interface ArticleStructuredDataProps {
  title: string;
  description: string;
  url: string;
  image: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  keywords: string[];
  category: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

export function WebsiteStructuredData({ siteName, siteUrl, description }: WebsiteStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteName,
      "url": siteUrl,
      "description": description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    };

    let script = document.querySelector('#website-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'website-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, [siteName, siteUrl, description]);

  return null;
}

export function ArticleStructuredData({
  title,
  description,
  url,
  image,
  author,
  publishedDate,
  modifiedDate,
  keywords,
  category
}: ArticleStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "url": url,
      "image": {
        "@type": "ImageObject",
        "url": image,
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Person",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "AI Blog Platform",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`,
          "width": 200,
          "height": 60
        }
      },
      "datePublished": publishedDate,
      "dateModified": modifiedDate || publishedDate,
      "keywords": keywords.join(', '),
      "articleSection": category,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      }
    };

    let script = document.querySelector('#article-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'article-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, [title, description, url, image, author, publishedDate, modifiedDate, keywords, category]);

  return null;
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    let script = document.querySelector('#breadcrumb-structured-data') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'breadcrumb-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, [items]);

  return null;
}