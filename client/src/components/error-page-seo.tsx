import React from 'react';
import { SEOHead } from './seo-head';
import { ArticleStructuredData } from './structured-data';

interface ErrorPageSEOProps {
  statusCode: number;
  title?: string;
  description?: string;
  canonical?: string;
}

export function ErrorPageSEO({ 
  statusCode, 
  title,
  description,
  canonical
}: ErrorPageSEOProps) {
  const getErrorContent = (code: number) => {
    switch (code) {
      case 404:
        return {
          title: title || 'Page Not Found | AI Blog Platform',
          description: description || 'Sorry, the page you are looking for does not exist. Please check the URL or navigate to our homepage.',
          robotsContent: 'noindex, nofollow'
        };
      case 500:
        return {
          title: title || 'Server Error | AI Blog Platform',
          description: description || 'We are experiencing technical difficulties. Please try again later.',
          robotsContent: 'noindex, nofollow'
        };
      case 403:
        return {
          title: title || 'Access Forbidden | AI Blog Platform',
          description: description || 'You do not have permission to access this page.',
          robotsContent: 'noindex, nofollow'
        };
      default:
        return {
          title: title || 'Error | AI Blog Platform',
          description: description || 'An error has occurred. Please try again.',
          robotsContent: 'noindex, nofollow'
        };
    }
  };

  const errorContent = getErrorContent(statusCode);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : canonical || '';

  // Error page structured data
  const errorStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": errorContent.title,
    "description": errorContent.description,
    "url": currentUrl,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": currentUrl.replace(/\/[^\/]*$/, '') || "/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `Error ${statusCode}`,
          "item": currentUrl
        }
      ]
    },
    "mainEntity": {
      "@type": "Thing",
      "name": `HTTP ${statusCode} Error`,
      "description": errorContent.description
    }
  };

  return (
    <>
      <SEOHead
        title={errorContent.title}
        description={errorContent.description}
        url={currentUrl}
        type="website"
        robots={errorContent.robotsContent}
        canonicalUrl={canonical}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(errorStructuredData) }}
      />
    </>
  );
}

// Error boundary with SEO
export function ErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
}) {
  return (
    <ErrorBoundaryComponent fallback={fallback}>
      {children}
    </ErrorBoundaryComponent>
  );
}

// Error boundary component
class ErrorBoundaryComponent extends React.Component<
  { children: React.ReactNode; fallback?: (error: Error) => React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report error to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <ErrorPageSEO statusCode={500} />
          <div className="max-w-md w-full text-center">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white">500</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              We are experiencing technical difficulties. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 404 Page Component
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <ErrorPageSEO statusCode={404} />
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}