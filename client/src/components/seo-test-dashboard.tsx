import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SEOTestResult {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
  }>;
  recommendations: string[];
}

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  score: number;
}

export function SEOTestDashboard() {
  const [seoResults, setSeoResults] = useState<SEOTestResult | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Real-time SEO testing
  const runSEOTest = async () => {
    setIsLoading(true);
    
    try {
      const issues: SEOTestResult['issues'] = [];
      const recommendations: string[] = [];
      let score = 100;

      // Test 1: Title tag
      const titleElement = document.querySelector('title');
      if (!titleElement?.textContent) {
        issues.push({
          type: 'error',
          message: 'Missing title tag',
          element: '<title>'
        });
        score -= 15;
      } else if (titleElement.textContent.length < 30) {
        issues.push({
          type: 'warning',
          message: 'Title tag is too short (recommended: 30-60 characters)',
          element: '<title>'
        });
        score -= 5;
        recommendations.push('Expand title tag to include more descriptive keywords');
      } else if (titleElement.textContent.length > 60) {
        issues.push({
          type: 'warning',
          message: 'Title tag is too long (recommended: 30-60 characters)',
          element: '<title>'
        });
        score -= 3;
        recommendations.push('Shorten title tag to prevent truncation in search results');
      }

      // Test 2: Meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription?.getAttribute('content')) {
        issues.push({
          type: 'error',
          message: 'Missing meta description',
          element: '<meta name="description">'
        });
        score -= 15;
        recommendations.push('Add meta description to improve search result snippets');
      } else {
        const descLength = metaDescription.getAttribute('content')?.length || 0;
        if (descLength < 120) {
          issues.push({
            type: 'warning',
            message: 'Meta description is too short (recommended: 120-160 characters)',
            element: '<meta name="description">'
          });
          score -= 5;
          recommendations.push('Expand meta description to provide more context');
        } else if (descLength > 160) {
          issues.push({
            type: 'warning',
            message: 'Meta description is too long (recommended: 120-160 characters)',
            element: '<meta name="description">'
          });
          score -= 3;
        }
      }

      // Test 3: Heading structure
      const h1Elements = document.querySelectorAll('h1');
      if (h1Elements.length === 0) {
        issues.push({
          type: 'error',
          message: 'Missing H1 heading',
          element: '<h1>'
        });
        score -= 10;
        recommendations.push('Add H1 heading to establish page topic');
      } else if (h1Elements.length > 1) {
        issues.push({
          type: 'warning',
          message: `Multiple H1 headings found (${h1Elements.length})`,
          element: '<h1>'
        });
        score -= 5;
        recommendations.push('Use only one H1 heading per page');
      }

      // Test 4: Images with alt text
      const images = document.querySelectorAll('img');
      let imagesWithoutAlt = 0;
      images.forEach(img => {
        if (!img.getAttribute('alt')) {
          imagesWithoutAlt++;
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push({
          type: 'warning',
          message: `${imagesWithoutAlt} images without alt text`,
          element: '<img>'
        });
        score -= imagesWithoutAlt * 2;
        recommendations.push('Add descriptive alt text to all images');
      }

      // Test 5: Open Graph tags
      const ogTags = ['og:title', 'og:description', 'og:image', 'og:url'];
      const missingOgTags = ogTags.filter(tag => 
        !document.querySelector(`meta[property="${tag}"]`)
      );

      if (missingOgTags.length > 0) {
        issues.push({
          type: 'warning',
          message: `Missing Open Graph tags: ${missingOgTags.join(', ')}`,
          element: '<meta property="og:*">'
        });
        score -= missingOgTags.length * 3;
        recommendations.push('Add Open Graph tags for better social media sharing');
      }

      // Test 6: Twitter Card tags
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        issues.push({
          type: 'info',
          message: 'Missing Twitter Card tags',
          element: '<meta name="twitter:*">'
        });
        score -= 3;
        recommendations.push('Add Twitter Card tags for enhanced Twitter sharing');
      }

      // Test 7: Structured Data (JSON-LD)
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      if (jsonLdScripts.length === 0) {
        issues.push({
          type: 'warning',
          message: 'No structured data (JSON-LD) found',
          element: '<script type="application/ld+json">'
        });
        score -= 8;
        recommendations.push('Add structured data to help search engines understand content');
      }

      // Test 8: Canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        issues.push({
          type: 'warning',
          message: 'Missing canonical URL',
          element: '<link rel="canonical">'
        });
        score -= 5;
        recommendations.push('Add canonical URL to prevent duplicate content issues');
      }

      // Test 9: Meta viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        issues.push({
          type: 'error',
          message: 'Missing viewport meta tag',
          element: '<meta name="viewport">'
        });
        score -= 10;
        recommendations.push('Add viewport meta tag for mobile optimization');
      }

      // Test 10: Robots meta tag
      const robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        issues.push({
          type: 'info',
          message: 'No robots meta tag (using default: index, follow)',
          element: '<meta name="robots">'
        });
        recommendations.push('Consider adding robots meta tag for explicit crawling instructions');
      }

      setSeoResults({
        score: Math.max(0, score),
        issues,
        recommendations
      });

    } catch (error) {
      console.error('SEO test failed:', error);
      setSeoResults({
        score: 0,
        issues: [{ type: 'error', message: 'Failed to run SEO test' }],
        recommendations: ['Check console for errors']
      });
    }

    setIsLoading(false);
  };

  // Real-time performance monitoring
  const measurePerformance = () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return;

    const metrics: PerformanceMetrics = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: navigation.responseStart - navigation.requestStart,
      score: 0
    };

    // Get paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }

    // Get LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    // Calculate performance score
    let score = 100;
    
    // TTFB scoring
    if (metrics.ttfb > 800) score -= 20;
    else if (metrics.ttfb > 600) score -= 10;
    
    // FCP scoring
    if (metrics.fcp > 3000) score -= 25;
    else if (metrics.fcp > 1800) score -= 10;
    
    // LCP scoring (will be 0 initially)
    if (metrics.lcp > 4000) score -= 30;
    else if (metrics.lcp > 2500) score -= 15;

    metrics.score = Math.max(0, score);
    setPerformanceMetrics(metrics);
  };

  // Real-time monitoring
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      measurePerformance();
      runSEOTest();
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [realTimeMode]);

  // Initial load
  useEffect(() => {
    if (document.readyState === 'complete') {
      measurePerformance();
      runSEOTest();
    } else {
      window.addEventListener('load', () => {
        measurePerformance();
        runSEOTest();
      });
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SEO & Performance Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setRealTimeMode(!realTimeMode)}
            variant={realTimeMode ? 'default' : 'outline'}
          >
            {realTimeMode ? 'Stop Real-time' : 'Start Real-time'}
          </Button>
          <Button onClick={() => { runSEOTest(); measurePerformance(); }} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Run Test'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seo">SEO Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          {seoResults && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    SEO Score
                    <Badge variant={getScoreBadgeVariant(seoResults.score)} className="text-lg px-3 py-1">
                      {seoResults.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={seoResults.score} className="mb-4" />
                  
                  {seoResults.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Issues Found:</h4>
                      {seoResults.issues.map((issue, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 rounded border">
                          <Badge 
                            variant={issue.type === 'error' ? 'destructive' : issue.type === 'warning' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {issue.type}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm">{issue.message}</p>
                            {issue.element && (
                              <code className="text-xs text-gray-500">{issue.element}</code>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {seoResults.recommendations.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {seoResults.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          {performanceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getScoreColor(performanceMetrics.score)}`}>
                    {performanceMetrics.score}/100
                  </div>
                  <Progress value={performanceMetrics.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">TTFB</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.ttfb.toFixed(0)}ms
                  </div>
                  <p className="text-xs text-gray-500">Time to First Byte</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">FCP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.fcp.toFixed(0)}ms
                  </div>
                  <p className="text-xs text-gray-500">First Contentful Paint</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">LCP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.lcp > 0 ? `${performanceMetrics.lcp.toFixed(0)}ms` : 'Measuring...'}
                  </div>
                  <p className="text-xs text-gray-500">Largest Contentful Paint</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">FID</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.fid > 0 ? `${performanceMetrics.fid.toFixed(0)}ms` : 'N/A'}
                  </div>
                  <p className="text-xs text-gray-500">First Input Delay</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CLS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceMetrics.cls.toFixed(3)}
                  </div>
                  <p className="text-xs text-gray-500">Cumulative Layout Shift</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="realtime">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span>Status:</span>
                <Badge variant={realTimeMode ? 'default' : 'secondary'}>
                  {realTimeMode ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {realTimeMode && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Monitoring SEO and performance metrics every 2 seconds...
                  </p>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              )}
              
              {!realTimeMode && (
                <p className="text-sm text-gray-600">
                  Click "Start Real-time" to begin continuous monitoring
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}