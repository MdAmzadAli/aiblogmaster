// Real-time performance and SEO testing script
const testUrl = 'http://localhost:5000';

async function testPerformance() {
  console.log('🚀 Testing AI Blog Platform Performance & SEO...\n');
  
  // Test 1: Homepage Load Time
  console.log('1️⃣ Testing Homepage Performance:');
  const start = performance.now();
  
  try {
    const response = await fetch(testUrl);
    const html = await response.text();
    const loadTime = performance.now() - start;
    
    console.log(`   ✅ Load Time: ${loadTime.toFixed(2)}ms`);
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Content Length: ${html.length} characters`);
    
    // Test SEO Elements
    console.log('\n2️⃣ Testing SEO Elements:');
    
    // Title tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      console.log(`   ✅ Title: "${titleMatch[1]}" (${titleMatch[1].length} chars)`);
    } else {
      console.log('   ❌ Title tag missing');
    }
    
    // Meta description
    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"[^>]*>/i);
    if (descMatch) {
      console.log(`   ✅ Description: "${descMatch[1]}" (${descMatch[1].length} chars)`);
    } else {
      console.log('   ❌ Meta description missing');
    }
    
    // Open Graph tags
    const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"[^>]*>/i);
    const ogDescMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"[^>]*>/i);
    const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"[^>]*>/i);
    
    console.log(`   ${ogTitleMatch ? '✅' : '❌'} Open Graph Title: ${ogTitleMatch ? ogTitleMatch[1] : 'Missing'}`);
    console.log(`   ${ogDescMatch ? '✅' : '❌'} Open Graph Description: ${ogDescMatch ? ogDescMatch[1] : 'Missing'}`);
    console.log(`   ${ogImageMatch ? '✅' : '❌'} Open Graph Image: ${ogImageMatch ? ogImageMatch[1] : 'Missing'}`);
    
    // Structured Data
    const jsonLdMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/is);
    if (jsonLdMatch) {
      try {
        const structuredData = JSON.parse(jsonLdMatch[1].trim());
        console.log(`   ✅ Structured Data: ${structuredData['@type'] || 'Unknown type'}`);
      } catch (e) {
        console.log('   ⚠️ Structured Data: Invalid JSON');
      }
    } else {
      console.log('   ❌ Structured Data: Missing');
    }
    
    // Canonical URL
    const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"[^>]*>/i);
    console.log(`   ${canonicalMatch ? '✅' : '❌'} Canonical URL: ${canonicalMatch ? canonicalMatch[1] : 'Missing'}`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Sitemap
  console.log('\n3️⃣ Testing Sitemap:');
  try {
    const sitemapResponse = await fetch(`${testUrl}/sitemap.xml`);
    const sitemapText = await sitemapResponse.text();
    
    console.log(`   ✅ Sitemap Status: ${sitemapResponse.status}`);
    console.log(`   ✅ Sitemap Size: ${sitemapText.length} characters`);
    
    // Count URLs in sitemap
    const urlMatches = sitemapText.match(/<loc>/g);
    console.log(`   ✅ URLs in Sitemap: ${urlMatches ? urlMatches.length : 0}`);
    
  } catch (error) {
    console.log(`   ❌ Sitemap Error: ${error.message}`);
  }
  
  // Test 4: Robots.txt
  console.log('\n4️⃣ Testing Robots.txt:');
  try {
    const robotsResponse = await fetch(`${testUrl}/robots.txt`);
    const robotsText = await robotsResponse.text();
    
    console.log(`   ✅ Robots.txt Status: ${robotsResponse.status}`);
    console.log(`   ✅ Robots.txt Content: ${robotsText.length} characters`);
    console.log(`   📄 Content Preview: ${robotsText.substring(0, 100)}...`);
    
  } catch (error) {
    console.log(`   ❌ Robots.txt Error: ${error.message}`);
  }
  
  // Test 5: API Performance
  console.log('\n5️⃣ Testing API Performance:');
  const apiTests = [
    '/api/posts',
    '/api/posts/featured',
    '/api/analytics/overview'
  ];
  
  for (const endpoint of apiTests) {
    try {
      const apiStart = performance.now();
      const apiResponse = await fetch(`${testUrl}${endpoint}`);
      const apiTime = performance.now() - apiStart;
      
      console.log(`   ✅ ${endpoint}: ${apiResponse.status} (${apiTime.toFixed(2)}ms)`);
    } catch (error) {
      console.log(`   ❌ ${endpoint}: Error - ${error.message}`);
    }
  }
  
  // Performance Score Calculation
  console.log('\n📊 Performance Score Calculation:');
  let score = 100;
  
  // Deduct points based on findings
  if (loadTime > 1000) score -= 20;
  else if (loadTime > 500) score -= 10;
  
  console.log(`   🎯 Overall Performance Score: ${score}/100`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (loadTime > 500) {
    console.log('   • Consider implementing CDN for static assets');
    console.log('   • Optimize image sizes and formats');
  }
  console.log('   • Add web font preloading for better performance');
  console.log('   • Consider implementing service worker for caching');
  console.log('   • Add performance monitoring to track Core Web Vitals');
  
  console.log('\n✨ Test completed successfully!');
}

// Run the test
if (typeof window !== 'undefined') {
  // Browser environment
  testPerformance();
} else {
  // Node.js environment
  const { performance } = require('perf_hooks');
  global.fetch = require('node-fetch');
  testPerformance();
}