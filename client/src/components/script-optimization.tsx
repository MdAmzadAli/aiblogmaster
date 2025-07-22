import { useEffect } from 'react';

interface ScriptOptimizationProps {
  scripts?: Array<{
    src?: string;
    content?: string;
    strategy: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
    id?: string;
    type?: string;
  }>;
  analyticsId?: string;
  structuredData?: Record<string, any>;
}

export function ScriptOptimization({ 
  scripts = [], 
  analyticsId,
  structuredData 
}: ScriptOptimizationProps) {
  useEffect(() => {
    const loadedScripts = new Set<string>();

    // Load scripts based on strategy
    scripts.forEach(script => {
      if (script.strategy === 'afterInteractive') {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => loadScript(script));
        } else {
          loadScript(script);
        }
      } else if (script.strategy === 'lazyOnload') {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loadScript(script);
              observer.disconnect();
            }
          });
        });
        
        // Observe the footer or last element
        const footer = document.querySelector('footer') || document.body.lastElementChild;
        if (footer) observer.observe(footer);
      }
    });

    function loadScript(script: typeof scripts[0]) {
      const scriptId = script.id || script.src || 'inline-script';
      
      if (loadedScripts.has(scriptId)) return;
      loadedScripts.add(scriptId);

      const scriptElement = document.createElement('script');
      
      if (script.src) {
        scriptElement.src = script.src;
        scriptElement.async = true;
      }
      
      if (script.content) {
        scriptElement.textContent = script.content;
      }
      
      if (script.type) {
        scriptElement.type = script.type;
      }
      
      if (script.id) {
        scriptElement.id = script.id;
      }

      document.head.appendChild(scriptElement);
    }

    // Load Google Analytics if provided
    if (analyticsId) {
      loadScript({
        src: `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`,
        strategy: 'afterInteractive',
        id: 'gtag-script'
      });

      loadScript({
        content: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}', {
            page_title: document.title,
            page_location: window.location.href
          });
        `,
        strategy: 'afterInteractive',
        id: 'gtag-config'
      });
    }

    // Add structured data if provided
    if (structuredData) {
      const structuredDataScript = document.createElement('script');
      structuredDataScript.type = 'application/ld+json';
      structuredDataScript.textContent = JSON.stringify(structuredData);
      document.head.appendChild(structuredDataScript);
    }
  }, [scripts, analyticsId, structuredData]);

  return null; // This component doesn't render anything
}

// Performance monitoring utilities
export const performanceMonitoring = {
  // Track Core Web Vitals
  trackWebVitals: () => {
    if (typeof window !== 'undefined') {
      // Dynamic import of web-vitals library
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS(console.log);
        onFID(console.log);
        onFCP(console.log);
        onLCP(console.log);
        onTTFB(console.log);
      }).catch(() => {
        console.log('Web Vitals library not available');
      });
    }
  },

  // Track page load performance
  trackPageLoad: () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        
        console.log('Page Load Performance:', {
          loadTime,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
        });
      });
    }
  }
};