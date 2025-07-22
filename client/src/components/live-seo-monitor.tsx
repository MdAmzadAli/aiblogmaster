import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface LiveMetrics {
  seoScore: number;
  performanceScore: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  lastUpdated: number;
}

export function LiveSEOMonitor() {
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  const analyzeCurrentPage = (): LiveMetrics => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let seoScore = 100;
    let performanceScore = 100;

    // SEO Analysis
    // 1. Title tag
    const title = document.querySelector('title');
    if (!title?.textContent) {
      errors.push('Missing title tag');
      seoScore -= 15;
    } else {
      const titleLength = title.textContent.length;
      if (titleLength < 30) {
        warnings.push(`Title too short: ${titleLength} chars (recommended: 30-60)`);
        seoScore -= 5;
      } else if (titleLength > 60) {
        warnings.push(`Title too long: ${titleLength} chars (recommended: 30-60)`);
        seoScore -= 3;
      }
    }

    // 2. Meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc?.getAttribute('content')) {
      errors.push('Missing meta description');
      seoScore -= 15;
    } else {
      const descLength = metaDesc.getAttribute('content')?.length || 0;
      if (descLength < 120) {
        warnings.push(`Meta description too short: ${descLength} chars`);
        seoScore -= 5;
      } else if (descLength > 160) {
        warnings.push(`Meta description too long: ${descLength} chars`);
        seoScore -= 3;
      }
    }

    // 3. H1 tag
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      errors.push('Missing H1 heading');
      seoScore -= 10;
    } else if (h1Elements.length > 1) {
      warnings.push(`Multiple H1 tags found: ${h1Elements.length}`);
      seoScore -= 5;
    }

    // 4. Images without alt text
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    images.forEach(img => {
      if (!img.getAttribute('alt')) imagesWithoutAlt++;
    });
    if (imagesWithoutAlt > 0) {
      warnings.push(`${imagesWithoutAlt} images without alt text`);
      seoScore -= imagesWithoutAlt * 2;
    }

    // 5. Open Graph tags
    const requiredOgTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const missingOgTags = requiredOgTags.filter(tag => 
      !document.querySelector(`meta[property="${tag}"]`)
    );
    if (missingOgTags.length > 0) {
      warnings.push(`Missing OG tags: ${missingOgTags.join(', ')}`);
      seoScore -= missingOgTags.length * 3;
    }

    // 6. Structured data
    const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonLd.length === 0) {
      warnings.push('No structured data found');
      seoScore -= 8;
    }

    // 7. Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      warnings.push('Missing canonical URL');
      seoScore -= 5;
    }

    // Performance Analysis
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      
      if (ttfb > 800) {
        warnings.push(`High TTFB: ${ttfb.toFixed(0)}ms`);
        performanceScore -= 20;
      } else if (ttfb > 600) {
        warnings.push(`Moderate TTFB: ${ttfb.toFixed(0)}ms`);
        performanceScore -= 10;
      }

      if (loadTime > 3000) {
        warnings.push(`Slow load time: ${loadTime.toFixed(0)}ms`);
        performanceScore -= 25;
      } else if (loadTime > 2000) {
        warnings.push(`Moderate load time: ${loadTime.toFixed(0)}ms`);
        performanceScore -= 10;
      }
    }

    // Generate recommendations
    if (seoScore < 90) {
      recommendations.push('Implement all missing SEO elements');
    }
    if (performanceScore < 90) {
      recommendations.push('Optimize page load performance');
    }
    if (images.length > imagesWithoutAlt) {
      recommendations.push('Add descriptive alt text to all images');
    }
    if (missingOgTags.length > 0) {
      recommendations.push('Complete Open Graph implementation for social media');
    }

    return {
      seoScore: Math.max(0, seoScore),
      performanceScore: Math.max(0, performanceScore),
      errors,
      warnings,
      recommendations,
      lastUpdated: Date.now()
    };
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setConnectionStatus('connecting');
    
    // Initial analysis
    setMetrics(analyzeCurrentPage());
    setConnectionStatus('connected');

    // Set up monitoring interval
    const interval = setInterval(() => {
      setMetrics(analyzeCurrentPage());
    }, 3000); // Update every 3 seconds

    return () => {
      clearInterval(interval);
      setConnectionStatus('disconnected');
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setConnectionStatus('disconnected');
  };

  useEffect(() => {
    if (isMonitoring) {
      const cleanup = startMonitoring();
      return cleanup;
    }
  }, [isMonitoring]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Live SEO Monitor</CardTitle>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {connectionStatus}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? 'Stop' : 'Start'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {metrics ? (
            <>
              {/* Scores */}
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className={`text-lg font-bold ${getScoreColor(metrics.seoScore)}`}>
                    {metrics.seoScore}/100
                  </div>
                  <div className="text-xs text-gray-500">SEO Score</div>
                  <Progress value={metrics.seoScore} className="h-1 mt-1" />
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${getScoreColor(metrics.performanceScore)}`}>
                    {metrics.performanceScore}/100
                  </div>
                  <div className="text-xs text-gray-500">Performance</div>
                  <Progress value={metrics.performanceScore} className="h-1 mt-1" />
                </div>
              </div>

              {/* Issues */}
              {metrics.errors.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-red-600 mb-1">Errors:</h4>
                  {metrics.errors.slice(0, 3).map((error, index) => (
                    <div key={index} className="text-xs text-red-700 bg-red-50 dark:bg-red-900/20 p-1 rounded mb-1">
                      • {error}
                    </div>
                  ))}
                </div>
              )}

              {metrics.warnings.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-yellow-600 mb-1">Warnings:</h4>
                  {metrics.warnings.slice(0, 3).map((warning, index) => (
                    <div key={index} className="text-xs text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-1 rounded mb-1">
                      • {warning}
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {metrics.recommendations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-blue-600 mb-1">Recommendations:</h4>
                  {metrics.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="text-xs text-blue-700 bg-blue-50 dark:bg-blue-900/20 p-1 rounded mb-1">
                      • {rec}
                    </div>
                  ))}
                </div>
              )}

              {/* Last updated */}
              <div className="text-xs text-gray-500 text-center">
                Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4">
              Click "Start" to begin monitoring
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}