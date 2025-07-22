import { useEffect } from 'react';

interface WebVital {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}

interface PerformanceMonitoringProps {
  analyticsId?: string;
  reportWebVitals?: boolean;
  reportToConsole?: boolean;
}

export function PerformanceMonitoring({
  analyticsId,
  reportWebVitals = true,
  reportToConsole = true
}: PerformanceMonitoringProps) {
  useEffect(() => {
    if (!reportWebVitals) return;

    // Core Web Vitals tracking without external library
    const trackWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const vital: WebVital = {
          name: 'LCP',
          value: lastEntry.startTime,
          id: `LCP-${Date.now()}`,
          delta: lastEntry.startTime,
          entries: [lastEntry]
        };

        reportVital(vital);
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // First Input Delay (FID) / Interaction to Next Paint (INP)
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          const vital: WebVital = {
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            id: `FID-${Date.now()}`,
            delta: entry.processingStart - entry.startTime,
            entries: [entry]
          };

          reportVital(vital);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        const vital: WebVital = {
          name: 'CLS',
          value: clsValue,
          id: `CLS-${Date.now()}`,
          delta: clsValue,
          entries: list.getEntries()
        };

        reportVital(vital);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          const vital: WebVital = {
            name: 'FCP',
            value: fcpEntry.startTime,
            id: `FCP-${Date.now()}`,
            delta: fcpEntry.startTime,
            entries: [fcpEntry]
          };

          reportVital(vital);
        }
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // FCP not supported
      }

      // Time to First Byte (TTFB)
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        
        const vital: WebVital = {
          name: 'TTFB',
          value: ttfb,
          id: `TTFB-${Date.now()}`,
          delta: ttfb,
          entries: [navigation]
        };

        reportVital(vital);
      }
    };

    const reportVital = (vital: WebVital) => {
      if (reportToConsole) {
        console.log(`${vital.name}:`, vital.value.toFixed(2));
      }

      // Report to Google Analytics
      if (analyticsId && (window as any).gtag) {
        (window as any).gtag('event', vital.name, {
          event_category: 'Web Vitals',
          event_label: vital.id,
          value: Math.round(vital.value),
          non_interaction: true,
        });
      }

      // Report to custom analytics endpoint
      fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vital.name,
          value: vital.value,
          url: window.location.href,
          timestamp: Date.now()
        })
      }).catch(() => {
        // Ignore errors for analytics
      });
    };

    // Start tracking after page load
    if (document.readyState === 'loading') {
      window.addEventListener('load', trackWebVitals);
    } else {
      trackWebVitals();
    }

    // Track page navigation performance
    const trackPagePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          load: navigation.loadEventEnd - navigation.navigationStart
        };

        if (reportToConsole) {
          console.log('Page Performance:', metrics);
        }

        // Report to analytics
        if (analyticsId && (window as any).gtag) {
          Object.entries(metrics).forEach(([key, value]) => {
            (window as any).gtag('event', 'page_performance', {
              event_category: 'Performance',
              event_label: key,
              value: Math.round(value),
              non_interaction: true,
            });
          });
        }
      }
    };

    window.addEventListener('load', trackPagePerformance);

    return () => {
      window.removeEventListener('load', trackWebVitals);
      window.removeEventListener('load', trackPagePerformance);
    };
  }, [analyticsId, reportWebVitals, reportToConsole]);

  return null; // This component doesn't render anything
}

// Performance utilities
export const performanceUtils = {
  // Get page load metrics
  getPageMetrics: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      load: navigation.loadEventEnd - navigation.navigationStart,
      redirects: navigation.redirectEnd - navigation.redirectStart
    };
  },

  // Get resource metrics
  getResourceMetrics: () => {
    return performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as PerformanceResourceTiming).transferSize || 0,
      type: (entry as PerformanceResourceTiming).initiatorType
    }));
  },

  // Calculate performance score
  calculatePerformanceScore: () => {
    const metrics = performanceUtils.getPageMetrics();
    if (!metrics) return 0;

    // Simple scoring algorithm (0-100)
    let score = 100;
    
    // Deduct points based on metrics
    if (metrics.ttfb > 800) score -= 20;
    else if (metrics.ttfb > 600) score -= 10;
    
    if (metrics.load > 3000) score -= 30;
    else if (metrics.load > 2000) score -= 15;
    
    if (metrics.domContentLoaded > 1500) score -= 20;
    else if (metrics.domContentLoaded > 1000) score -= 10;

    return Math.max(0, score);
  }
};