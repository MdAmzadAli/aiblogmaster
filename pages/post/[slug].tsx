import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Clock, Eye, Share2, ArrowLeft, Facebook, Twitter, Linkedin } from 'lucide-react'

interface Post {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  featuredImage?: string
  publishedAt: string
  metaDescription?: string
  keywords?: string[]
  seoScore?: number
  isAiGenerated?: boolean
}

interface PostPageProps {
  post: Post
  relatedPosts: Post[]
}

export default function PostPage({ 
  post, 
  relatedPosts 
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [readingTime, setReadingTime] = useState(0)
  const [isViewed, setIsViewed] = useState(false)

  useEffect(() => {
    // Calculate reading time (average 200 words per minute)
    const wordCount = post.content.split(/\s+/).length
    setReadingTime(Math.ceil(wordCount / 200))

    // Track page view
    if (!isViewed) {
      const trackView = async () => {
        try {
          await fetch(`/api/posts/${post.id}/view`, { method: 'POST' })
          setIsViewed(true)
        } catch (error) {
          console.error('Failed to track view:', error)
        }
      }
      trackView()
    }
  }, [post.content, post.id, isViewed])

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/post/${post.slug}`
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage ? [post.featuredImage] : [],
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "AI Blog Platform"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog Platform",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    },
    "articleSection": post.category,
    "keywords": post.keywords?.join(', ') || '',
    "wordCount": post.content.split(/\s+/).length,
    "timeRequired": `PT${readingTime}M`
  }

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.category,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/category/${post.category.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": post.title,
        "item": shareUrl
      }
    ]
  }

  return (
    <>
      <Head>
        <title>{post.title} - AI Blog Platform</title>
        <meta 
          name="description" 
          content={post.metaDescription || post.excerpt}
        />
        <meta 
          name="keywords" 
          content={post.keywords?.join(', ') || `${post.category}, AI, blog, tutorial`}
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:section" content={post.category} />
        {post.keywords?.map((keyword, index) => (
          <meta key={index} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        {post.featuredImage && <meta name="twitter:image" content={post.featuredImage} />}
        
        {/* Additional SEO */}
        <link rel="canonical" href={shareUrl} />
        <meta name="author" content="AI Blog Platform" />
        <meta name="article:author" content="AI Blog Platform" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Blog
              </Link>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Breadcrumbs */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400 mx-2">/</span>
                  <Link href="/blog" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    Blog
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400 mx-2">/</span>
                  <Link 
                    href={`/category/${post.category.toLowerCase()}`}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {post.category}
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {post.title.length > 30 ? `${post.title.substring(0, 30)}...` : post.title}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="py-12">
            <div className="flex items-center mb-6">
              <Badge variant="secondary" className="mr-4">
                {post.category}
              </Badge>
              {post.isAiGenerated && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  AI Generated
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                Published {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {readingTime} min read
              </div>
              {post.seoScore && (
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  SEO Score: {post.seoScore}%
                </div>
              )}
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-4 pb-8">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`, '_blank')}
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-64 md:h-96 mb-12 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Article Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            {post.keywords && post.keywords.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Related Articles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.slice(0, 2).map((relatedPost) => (
                    <div key={relatedPost.id} className="group">
                      <Link 
                        href={`/post/${relatedPost.slug}`}
                        className="block p-6 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Badge className="mb-3">{relatedPost.category}</Badge>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {relatedPost.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          {new Date(relatedPost.publishedAt).toLocaleDateString()}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </footer>
        </article>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    const response = await fetch(`${baseUrl}/api/posts?status=published`)
    const posts = response.ok ? await response.json() : []

    const paths = posts.map((post: Post) => ({
      params: { slug: post.slug }
    }))

    return {
      paths,
      fallback: 'blocking' // Enable ISR for new posts
    }
  } catch (error) {
    console.error('Error generating static paths:', error)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  try {
    const slug = params?.slug as string
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    
    const [postResponse, allPostsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/posts/slug/${slug}`),
      fetch(`${baseUrl}/api/posts?status=published&limit=10`)
    ])

    if (!postResponse.ok) {
      return {
        notFound: true
      }
    }

    const post = await postResponse.json()
    const allPosts = allPostsResponse.ok ? await allPostsResponse.json() : []
    
    // Find related posts (same category, excluding current post)
    const relatedPosts = allPosts
      .filter((p: Post) => p.category === post.category && p.id !== post.id)
      .slice(0, 4)

    return {
      props: {
        post,
        relatedPosts
      },
      revalidate: 3600 // Regenerate every hour
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return {
      notFound: true
    }
  }
}