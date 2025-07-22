import { GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, Eye, ArrowRight } from 'lucide-react'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  featuredImage?: string
  publishedAt: string
  metaDescription?: string
  keywords?: string[]
}

interface HomePageProps {
  featuredPost: Post | null
  recentPosts: Post[]
  categories: string[]
}

export default function HomePage({ 
  featuredPost, 
  recentPosts, 
  categories 
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AI Blog Platform",
    "description": "Discover AI-generated insights, tutorials, and industry news",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
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
        <title>AI Blog Platform - Automated Content Generation & SEO Insights</title>
        <meta 
          name="description" 
          content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies. Stay ahead with our AI-powered blog platform."
        />
        <meta name="keywords" content="AI blog, automated content, SEO optimization, machine learning, artificial intelligence" />
        
        {/* Open Graph */}
        <meta property="og:title" content="AI Blog Platform - Automated Content Generation & SEO Insights" />
        <meta property="og:description" content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Blog Platform - Automated Content Generation & SEO Insights" />
        <meta name="twitter:description" content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies." />
        <meta name="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.jpg`} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"} />
        <meta name="author" content="AI Blog Platform" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                  AI Blog
                </Link>
                <div className="hidden md:flex space-x-6">
                  <Link href="/blog" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                    Blog
                  </Link>
                  {categories.slice(0, 4).map((category) => (
                    <Link 
                      key={category}
                      href={`/category/${category.toLowerCase()}`}
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors capitalize"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
              <Button asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                AI-Powered
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Content Creation</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                Discover the future of content generation with our AI-driven blog platform. 
                Get insights, tutorials, and industry news powered by cutting-edge artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/blog">
                    Explore Articles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/admin">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-16 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Featured Article
              </h2>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    {featuredPost.featuredImage && (
                      <div className="relative h-64 md:h-full">
                        <Image
                          src={featuredPost.featuredImage}
                          alt={featuredPost.title}
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/2 p-8">
                    <Badge className="mb-4">{featuredPost.category}</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      <Link 
                        href={`/post/${featuredPost.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      {new Date(featuredPost.publishedAt).toLocaleDateString()}
                    </div>
                    <Button asChild>
                      <Link href={`/post/${featuredPost.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* Recent Posts Grid */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Latest Articles
              </h2>
              <Button variant="outline" asChild>
                <Link href="/blog">View All</Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  {post.featuredImage && (
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <Badge className="mb-3">{post.category}</Badge>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      <Link 
                        href={`/post/${post.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </div>
                      <Link 
                        href={`/post/${post.slug}`}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        Read more →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-blue-600 dark:bg-blue-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Stay Updated with AI Insights
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the latest articles and AI industry news delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
              />
              <Button variant="secondary" size="lg">
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">AI Blog Platform</h3>
                <p className="text-gray-400">
                  Revolutionizing content creation with artificial intelligence
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Categories</h4>
                <ul className="space-y-2">
                  {categories.slice(0, 4).map((category) => (
                    <li key={category}>
                      <Link 
                        href={`/category/${category.toLowerCase()}`}
                        className="text-gray-400 hover:text-white transition-colors capitalize"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                  <li><Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Admin</Link></li>
                  <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API</Link></li>
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
    // Fetch data from your API
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    
    const [featuredResponse, postsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/posts/featured`),
      fetch(`${baseUrl}/api/posts?limit=6`)
    ])

    const featuredPost = featuredResponse.ok ? await featuredResponse.json() : null
    const posts = postsResponse.ok ? await postsResponse.json() : []
    
    // Extract unique categories
    const categories = [...new Set(posts.map((post: Post) => post.category))].filter(Boolean) as string[]

    return {
      props: {
        featuredPost,
        recentPosts: posts.slice(0, 6),
        categories
      },
      revalidate: 60 // Regenerate every minute
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    return {
      props: {
        featuredPost: null,
        recentPosts: [],
        categories: []
      },
      revalidate: 60
    }
  }
}