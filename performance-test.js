#!/usr/bin/env node
import { performance } from 'perf_hooks';
import fetch from 'node-fetch';
import { storage } from './server/storage.ts';

class PerformanceTester {
  constructor() {
    this.baseUrl = 'http://localhost:5000';
    this.results = {};
  }

  // Measure response time and transfer metrics
  async measureEndpoint(url, name, type = 'GET', body = null) {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    console.log(`🔍 Testing ${name}: ${fullUrl}`);
    
    const results = {
      name,
      url: fullUrl,
      type,
      measurements: []
    };

    // Run multiple measurements for accuracy
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      
      try {
        const options = {
          method: type,
          headers: {
            'User-Agent': 'Performance-Test-Bot/1.0',
            'Accept': 'text/html,application/json,*/*',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          }
        };

        if (body && type !== 'GET') {
          options.body = JSON.stringify(body);
          options.headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(fullUrl, options);
        const end = performance.now();
        
        const responseTime = end - start;
        const contentLength = parseInt(response.headers.get('content-length') || '0');
        const contentType = response.headers.get('content-type') || 'unknown';
        const cacheControl = response.headers.get('cache-control') || 'no-cache';
        const etag = response.headers.get('etag') || 'none';
        const staticGenerated = response.headers.get('x-static-generation') === 'true';

        let content = '';
        let actualSize = 0;
        
        if (response.ok) {
          content = await response.text();
          actualSize = Buffer.byteLength(content, 'utf8');
        }

        results.measurements.push({
          run: i + 1,
          status: response.status,
          responseTime: Math.round(responseTime * 100) / 100,
          reportedSize: contentLength,
          actualSize,
          contentType,
          cacheControl,
          etag,
          staticGenerated,
          isCompressed: response.headers.get('content-encoding') === 'gzip',
          success: response.ok
        });

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.measurements.push({
          run: i + 1,
          error: error.message,
          responseTime: null,
          success: false
        });
      }
    }

    return results;
  }

  // Calculate statistics from measurements
  calculateStats(measurements) {
    const successful = measurements.filter(m => m.success);
    
    if (successful.length === 0) {
      return {
        avgResponseTime: null,
        minResponseTime: null,
        maxResponseTime: null,
        avgSize: null,
        successRate: 0
      };
    }

    const responseTimes = successful.map(m => m.responseTime);
    const sizes = successful.map(m => m.actualSize || m.reportedSize || 0);

    return {
      avgResponseTime: Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      avgSize: Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length),
      successRate: (successful.length / measurements.length) * 100,
      cacheHeaders: successful[0]?.cacheControl || 'none',
      isStatic: successful[0]?.staticGenerated || false,
      isCompressed: successful[0]?.isCompressed || false
    };
  }

  // Test SEO metrics by parsing HTML
  analyzeSEO(content, url) {
    if (!content || typeof content !== 'string') {
      return { seoScore: 0, issues: ['No content to analyze'] };
    }

    const seoChecks = {
      hasTitle: /<title[^>]*>(.+?)<\/title>/i.test(content),
      hasMetaDescription: /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i.test(content),
      hasH1: /<h1[^>]*>/i.test(content),
      hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(content),
      hasOpenGraph: /<meta[^>]+property=["']og:title["']/i.test(content),
      hasStructuredData: /<script[^>]+type=["']application\/ld\+json["']/i.test(content),
      hasMetaKeywords: /<meta[^>]+name=["']keywords["']/i.test(content),
      hasTwitterCard: /<meta[^>]+name=["']twitter:card["']/i.test(content),
      hasViewport: /<meta[^>]+name=["']viewport["']/i.test(content),
      hasRobots: /<meta[^>]+name=["']robots["']/i.test(content)
    };

    const passedChecks = Object.values(seoChecks).filter(Boolean).length;
    const totalChecks = Object.keys(seoChecks).length;
    const seoScore = Math.round((passedChecks / totalChecks) * 100);

    const issues = [];
    if (!seoChecks.hasTitle) issues.push('Missing title tag');
    if (!seoChecks.hasMetaDescription) issues.push('Missing meta description');
    if (!seoChecks.hasH1) issues.push('Missing H1 tag');
    if (!seoChecks.hasCanonical) issues.push('Missing canonical URL');
    if (!seoChecks.hasOpenGraph) issues.push('Missing Open Graph tags');
    if (!seoChecks.hasStructuredData) issues.push('Missing structured data');

    // Extract title and description for analysis
    const titleMatch = content.match(/<title[^>]*>(.+?)<\/title>/i);
    const descMatch = content.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    
    return {
      seoScore,
      issues,
      title: titleMatch ? titleMatch[1] : null,
      description: descMatch ? descMatch[1] : null,
      checks: seoChecks
    };
  }

  // Get all published posts for testing
  async getTestUrls() {
    const posts = await storage.getPublishedPosts();
    
    const urls = [
      // Public pages
      { url: '/', name: 'Homepage', type: 'page' },
      { url: '/blog', name: 'Blog Listing', type: 'page' },
      
      // API endpoints
      { url: '/api/posts', name: 'Posts API', type: 'api' },
      { url: '/api/posts/featured', name: 'Featured Post API', type: 'api' },
      { url: '/sitemap.xml', name: 'Sitemap', type: 'seo' },
      { url: '/robots.txt', name: 'Robots.txt', type: 'seo' },
    ];

    // Add individual blog posts (both dynamic and static)
    for (const post of posts.slice(0, 5)) { // Test first 5 posts
      urls.push({
        url: `/post/${post.slug}`,
        name: `Post: ${post.title}`,
        type: 'post-dynamic'
      });
      
      urls.push({
        url: `/static/post/${post.slug}`,
        name: `Static Post: ${post.title}`,
        type: 'post-static'
      });
    }

    return urls;
  }

  // Main performance test runner
  async runPerformanceTests() {
    console.log('🚀 Starting Comprehensive Performance Tests...\n');
    
    const testUrls = await this.getTestUrls();
    const results = [];

    for (const testCase of testUrls) {
      const result = await this.measureEndpoint(testCase.url, testCase.name, 'GET');
      const stats = this.calculateStats(result.measurements);
      
      // For HTML content, analyze SEO
      let seoAnalysis = null;
      if (result.measurements[0]?.success && 
          result.measurements[0]?.contentType?.includes('text/html')) {
        const content = await fetch(`${this.baseUrl}${testCase.url}`).then(r => r.text()).catch(() => '');
        seoAnalysis = this.analyzeSEO(content, testCase.url);
      }

      results.push({
        ...result,
        testType: testCase.type,
        stats,
        seo: seoAnalysis
      });

      console.log(`✅ ${testCase.name}: ${stats.avgResponseTime}ms avg, ${this.formatBytes(stats.avgSize)} avg size`);
    }

    return results;
  }

  // Format bytes into human readable format
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Generate comprehensive performance report
  generateReport(results) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE PERFORMANCE TEST RESULTS');
    console.log('='.repeat(80));

    // Group results by type
    const groupedResults = {};
    results.forEach(result => {
      const type = result.testType;
      if (!groupedResults[type]) groupedResults[type] = [];
      groupedResults[type].push(result);
    });

    // Performance summary by type
    console.log('\n📈 PERFORMANCE SUMMARY BY TYPE:');
    console.log('-'.repeat(60));
    
    Object.keys(groupedResults).forEach(type => {
      const typeResults = groupedResults[type];
      const avgResponseTime = typeResults.reduce((sum, r) => sum + (r.stats.avgResponseTime || 0), 0) / typeResults.length;
      const avgSize = typeResults.reduce((sum, r) => sum + (r.stats.avgSize || 0), 0) / typeResults.length;
      const successRate = typeResults.reduce((sum, r) => sum + r.stats.successRate, 0) / typeResults.length;

      console.log(`\n${type.toUpperCase()}:`);
      console.log(`  Average Response Time: ${Math.round(avgResponseTime * 100) / 100}ms`);
      console.log(`  Average Size: ${this.formatBytes(avgSize)}`);
      console.log(`  Success Rate: ${Math.round(successRate)}%`);
      console.log(`  Pages Tested: ${typeResults.length}`);
    });

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    console.log('-'.repeat(80));

    results.forEach(result => {
      console.log(`\n🔍 ${result.name}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Type: ${result.testType}`);
      
      if (result.stats.successRate === 100) {
        console.log(`   ✅ Response Time: ${result.stats.avgResponseTime}ms (${result.stats.minResponseTime}-${result.stats.maxResponseTime}ms)`);
        console.log(`   📦 Size: ${this.formatBytes(result.stats.avgSize)}`);
        console.log(`   🗂️  Cache: ${result.stats.cacheHeaders}`);
        console.log(`   ⚡ Static: ${result.stats.isStatic ? 'Yes' : 'No'}`);
        console.log(`   🗜️  Compressed: ${result.stats.isCompressed ? 'Yes' : 'No'}`);

        if (result.seo) {
          console.log(`   🔍 SEO Score: ${result.seo.seoScore}/100`);
          if (result.seo.issues.length > 0) {
            console.log(`   ⚠️  SEO Issues: ${result.seo.issues.join(', ')}`);
          }
        }
      } else {
        console.log(`   ❌ Failed: ${100 - result.stats.successRate}% failure rate`);
        const errors = result.measurements.filter(m => m.error).map(m => m.error);
        if (errors.length > 0) {
          console.log(`   🐛 Errors: ${[...new Set(errors)].join(', ')}`);
        }
      }
    });

    // Performance rankings
    console.log('\n🏆 PERFORMANCE RANKINGS:');
    console.log('-'.repeat(50));

    const successfulResults = results.filter(r => r.stats.successRate === 100);
    
    // Fastest pages
    console.log('\n⚡ FASTEST PAGES:');
    successfulResults
      .sort((a, b) => a.stats.avgResponseTime - b.stats.avgResponseTime)
      .slice(0, 5)
      .forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name}: ${result.stats.avgResponseTime}ms`);
      });

    // Smallest pages
    console.log('\n📦 SMALLEST PAGES:');
    successfulResults
      .sort((a, b) => a.stats.avgSize - b.stats.avgSize)
      .slice(0, 5)
      .forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name}: ${this.formatBytes(result.stats.avgSize)}`);
      });

    // Best SEO scores
    const seoResults = successfulResults.filter(r => r.seo);
    if (seoResults.length > 0) {
      console.log('\n🔍 BEST SEO SCORES:');
      seoResults
        .sort((a, b) => b.seo.seoScore - a.seo.seoScore)
        .slice(0, 5)
        .forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.name}: ${result.seo.seoScore}/100`);
        });
    }

    // Static vs Dynamic comparison
    const staticResults = successfulResults.filter(r => r.testType === 'post-static');
    const dynamicResults = successfulResults.filter(r => r.testType === 'post-dynamic');

    if (staticResults.length > 0 && dynamicResults.length > 0) {
      console.log('\n⚖️  STATIC vs DYNAMIC COMPARISON:');
      console.log('-'.repeat(40));

      const staticAvgTime = staticResults.reduce((sum, r) => sum + r.stats.avgResponseTime, 0) / staticResults.length;
      const dynamicAvgTime = dynamicResults.reduce((sum, r) => sum + r.stats.avgResponseTime, 0) / dynamicResults.length;
      const staticAvgSize = staticResults.reduce((sum, r) => sum + r.stats.avgSize, 0) / staticResults.length;
      const dynamicAvgSize = dynamicResults.reduce((sum, r) => sum + r.stats.avgSize, 0) / dynamicResults.length;

      console.log(`   Static Average: ${Math.round(staticAvgTime * 100) / 100}ms, ${this.formatBytes(staticAvgSize)}`);
      console.log(`   Dynamic Average: ${Math.round(dynamicAvgTime * 100) / 100}ms, ${this.formatBytes(dynamicAvgSize)}`);
      
      const timeImprovement = ((dynamicAvgTime - staticAvgTime) / dynamicAvgTime * 100);
      const sizeImprovement = ((dynamicAvgSize - staticAvgSize) / dynamicAvgSize * 100);
      
      console.log(`   ⚡ Speed Improvement: ${Math.round(timeImprovement)}% faster`);
      console.log(`   📦 Size Improvement: ${Math.round(sizeImprovement)}% smaller`);
    }

    // Overall summary
    console.log('\n📊 OVERALL SUMMARY:');
    console.log('-'.repeat(30));
    console.log(`   Total Pages Tested: ${results.length}`);
    console.log(`   Successful Tests: ${successfulResults.length}`);
    console.log(`   Average Response Time: ${Math.round((successfulResults.reduce((sum, r) => sum + r.stats.avgResponseTime, 0) / successfulResults.length) * 100) / 100}ms`);
    console.log(`   Average Page Size: ${this.formatBytes(successfulResults.reduce((sum, r) => sum + r.stats.avgSize, 0) / successfulResults.length)}`);
    
    const staticPages = successfulResults.filter(r => r.stats.isStatic).length;
    const compressedPages = successfulResults.filter(r => r.stats.isCompressed).length;
    console.log(`   Static Pages: ${staticPages}/${successfulResults.length}`);
    console.log(`   Compressed Pages: ${compressedPages}/${successfulResults.length}`);

    if (seoResults.length > 0) {
      const avgSeoScore = seoResults.reduce((sum, r) => sum + r.seo.seoScore, 0) / seoResults.length;
      console.log(`   Average SEO Score: ${Math.round(avgSeoScore)}/100`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ PERFORMANCE TESTING COMPLETE!');
    console.log('='.repeat(80));

    return {
      summary: {
        totalTests: results.length,
        successful: successfulResults.length,
        avgResponseTime: successfulResults.reduce((sum, r) => sum + r.stats.avgResponseTime, 0) / successfulResults.length,
        avgSize: successfulResults.reduce((sum, r) => sum + r.stats.avgSize, 0) / successfulResults.length,
        staticPages: staticPages,
        compressedPages: compressedPages,
        avgSeoScore: seoResults.length > 0 ? seoResults.reduce((sum, r) => sum + r.seo.seoScore, 0) / seoResults.length : null
      },
      results: results
    };
  }
}

// Run the performance tests
async function main() {
  const tester = new PerformanceTester();
  
  try {
    const results = await tester.runPerformanceTests();
    const report = tester.generateReport(results);
    
    // Save results to file
    const fs = await import('fs');
    fs.writeFileSync('performance-test-results.json', JSON.stringify(report, null, 2));
    console.log('\n💾 Results saved to performance-test-results.json');
    
  } catch (error) {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  }
}

main();