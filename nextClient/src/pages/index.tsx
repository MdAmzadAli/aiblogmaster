import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import HeroSection from '@/components/hero-section'
import BlogCard from '@/components/blog-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, Users, Clock } from 'lucide-react'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  featuredImage?: string
  publishedAt: string
  isAiGenerated: boolean
  views?: number
}

interface HomePageProps {
  featuredPost: Post | null
  recentPosts: Post[]
  totalPosts: number
  categories: string[]
}

export default function HomePage({ 
  featuredPost, 
  recentPosts, 
  totalPosts,
  categories 
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AI Blog Platform",
    "description": "Discover AI-generated insights, tutorials, and industry news on automated content creation and SEO optimization.",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog Platform",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/logo.png`
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": recentPosts.map((post, index) => ({
        "@type": "Article",
        "position": index + 1,
        "name": post.title,
        "description": post.excerpt,
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/post/${post.slug}`,
        "datePublished": post.publishedAt,
        "author": {
          "@type": "Organization",
          "name": "AI Blog Platform"
        }
      }))
    }
  }

  return (
    <>
      <Head>
        <title>AI Blog Platform - Automated Content Generation & SEO Optimization</title>
        <meta 
          name="description" 
          content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies. Join thousands exploring the future of content creation."
        />
        <meta name="keywords" content="AI blog, automated content, SEO optimization, machine learning, artificial intelligence, content generation" />
        
        {/* Open Graph */}
        <meta property="og:title" content="AI Blog Platform - Automated Content Generation & SEO Optimization" />
        <meta property="og:description" content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.jpg`} />
        <meta property="og:site_name" content="AI Blog Platform" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Blog Platform - Automated Content Generation & SEO Optimization" />
        <meta name="twitter:description" content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.jpg`} />
        
        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Post Section */}
        {featuredPost && (
          <section className="py-16 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Featured Article
                </Badge>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Latest Insights
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Dive into our most comprehensive analysis of AI-powered content creation
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <BlogCard 
                  post={featuredPost} 
                  className="shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                  showStats={true}
                />
              </div>
            </div>
          </section>
        )}

        {/* Recent Posts Grid */}
        <section id="latest-posts" className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Latest Articles
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Explore our collection of {totalPosts} AI-generated insights and tutorials
                </p>
              </div>
              <Button asChild size="lg" className="mt-6 lg:mt-0">
                <Link href="/blog">
                  View All Posts
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  showStats={true}
                />
              ))}
            </div>

            {recentPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Our AI is working on creating amazing content for you. Check back soon!
                  </p>
                  <Button asChild>
                    <Link href="/admin">
                      Create First Post
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Categories & Stats Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Categories */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Explore Topics
                </h3>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      href={`/category/${encodeURIComponent(category.toLowerCase())}`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {category}
                        </span>
                        <Badge variant="secondary">
                          {recentPosts.filter(p => p.category === category).length} posts
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Platform Stats */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Platform Insights
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {totalPosts}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Articles
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {recentPosts.filter(p => p.isAiGenerated).length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        AI Generated
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {categories.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Categories
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        24/7
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        AI Active
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Users className="mx-auto h-12 w-12 text-white mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated with AI Insights
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get the latest articles, AI developments, and content creation tips delivered directly to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 px-6 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white text-gray-900"
              />
              <Button variant="secondary" size="lg" className="px-8">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-blue-100 mt-4">
              Join 10,000+ readers exploring the future of AI content
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-xl font-bold mb-4">AI Blog Platform</h3>
                <p className="text-gray-400 mb-4 max-w-md">
                  Revolutionizing content creation with artificial intelligence. 
                  Discover insights, tutorials, and the future of automated publishing.
                </p>
                <div className="flex space-x-4">
                  <Link href="/admin" className="text-blue-400 hover:text-blue-300">
                    Admin Dashboard
                  </Link>
                  <Link href="/blog" className="text-blue-400 hover:text-blue-300">
                    All Posts
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Categories</h4>
                <ul className="space-y-2">
                  {categories.slice(0, 4).map((category) => (
                    <li key={category}>
                      <Link 
                        href={`/category/${encodeURIComponent(category.toLowerCase())}`}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Platform</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 AI Blog Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  try {
    // Fetch data from the API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    const [postsRes, featuredRes] = await Promise.all([
      fetch(`${apiUrl}/api/posts`),
      fetch(`${apiUrl}/api/posts/featured`)
    ])
    
    const posts = postsRes.ok ? await postsRes.json() : []
    const featuredPost = featuredRes.ok ? await featuredRes.json() : null
    
    // Extract unique categories
    const categories = [...new Set(posts.map((post: Post) => post.category))].filter(Boolean)
    
    return {
      props: {
        featuredPost,
        recentPosts: posts.slice(0, 6), // Show first 6 posts
        totalPosts: posts.length,
        categories: categories.slice(0, 8) // Limit categories
      },
      revalidate: 300 // Revalidate every 5 minutes
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    
    return {
      props: {
        featuredPost: null,
        recentPosts: [],
        totalPosts: 0,
        categories: []
      },
      revalidate: 60 // Retry more frequently on error
    }
  }
}