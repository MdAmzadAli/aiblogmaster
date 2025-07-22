import { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/navigation'
import BlogCard from '@/components/blog-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, Clock, Eye, User, Share2, ArrowLeft, Tag } from 'lucide-react'
import { formatDate, calculateReadingTime } from '@/lib/utils'

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
  keywords?: string[]
  metaDescription: string
}

interface PostPageProps {
  post: Post
  relatedPosts: Post[]
}

export default function PostPage({ 
  post, 
  relatedPosts 
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const readingTime = calculateReadingTime(post.content)
  const publishedDate = new Date(post.publishedAt)
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.featuredImage || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.jpg`,
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "AI Blog Platform",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
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
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/post/${post.slug}`
    },
    "articleSection": post.category,
    "keywords": post.keywords?.join(', ') || post.category,
    "wordCount": post.content.split(/\s+/).length,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/post/${post.slug}`
  }

  // Simple HTML content renderer (in a real app, you'd use a proper markdown parser)
  const renderContent = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.slug}`
    const text = `Check out this article: ${post.title}`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text, url })
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url)
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <>
      <Head>
        <title>{post.title} - AI Blog Platform</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.keywords?.join(', ') || `${post.category}, AI blog, automated content`} />
        <meta name="author" content="AI Blog Platform" />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/post/${post.slug}`} />
        <meta property="og:image" content={post.featuredImage || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.jpg`} />
        <meta property="og:site_name" content="AI Blog Platform" />
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:author" content="AI Blog Platform" />
        <meta property="article:section" content={post.category} />
        {post.keywords?.map((keyword, index) => (
          <meta key={index} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        <meta name="twitter:image" content={post.featuredImage || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.jpg`} />
        
        {/* Additional SEO */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/post/${post.slug}`} />
        <meta name="robots" content="index, follow" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </div>

          {/* Article Header */}
          <article className="mb-12">
            {/* Category and AI Badge */}
            <div className="flex items-center gap-3 mb-4">
              <Link href={`/category/${encodeURIComponent(post.category.toLowerCase())}`}>
                <Badge className="hover:bg-blue-600 transition-colors cursor-pointer">
                  {post.category}
                </Badge>
              </Link>
              {post.isAiGenerated && (
                <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                  AI Generated
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8 text-sm">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                AI Blog Platform
              </div>
              
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                {formatDate(publishedDate)}
              </div>
              
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {readingTime} min read
              </div>
              
              {post.views !== undefined && (
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  {post.views.toLocaleString()} views
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
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
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
              dangerouslySetInnerHTML={renderContent(post.content)}
            />

            {/* Keywords */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center flex-wrap gap-2">
                  <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Tags:</span>
                  {post.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Author/AI Info Card */}
          <Card className="mb-12">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AI</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {post.isAiGenerated ? 'AI-Generated Content' : 'AI Blog Platform'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {post.isAiGenerated 
                      ? 'This article was automatically generated using advanced AI technology to provide you with high-quality, SEO-optimized content on the latest trends and insights.'
                      : 'Human-curated content crafted with expertise and enhanced by AI insights for the best reading experience.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard
                    key={relatedPost.id}
                    post={relatedPost}
                    showStats={true}
                    showExcerpt={false}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Call to Action */}
          <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Enjoyed this article?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Discover more AI insights and automated content creation strategies
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/blog">
                  Read More Articles
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">
                  Create Your Own
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${apiUrl}/api/posts`)
    const posts = response.ok ? await response.json() : []
    
    const paths = posts.map((post: Post) => ({
      params: { slug: post.slug }
    }))
    
    return {
      paths,
      fallback: 'blocking' // Enable ISR for new posts
    }
  } catch (error) {
    console.error('Error in getStaticPaths:', error)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export const getStaticProps: GetStaticProps<PostPageProps> = async ({ params }) => {
  try {
    if (!params?.slug) {
      return { notFound: true }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    // Fetch the specific post
    const postResponse = await fetch(`${apiUrl}/api/posts/${params.slug}`)
    if (!postResponse.ok) {
      return { notFound: true }
    }
    
    const post = await postResponse.json()
    
    // Fetch all posts to find related ones
    const allPostsResponse = await fetch(`${apiUrl}/api/posts`)
    const allPosts = allPostsResponse.ok ? await allPostsResponse.json() : []
    
    // Find related posts (same category, excluding current post)
    const relatedPosts = allPosts
      .filter((p: Post) => p.id !== post.id && p.category === post.category)
      .slice(0, 2)
    
    return {
      props: {
        post,
        relatedPosts
      },
      revalidate: 3600 // Revalidate every hour
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return { notFound: true }
  }
}