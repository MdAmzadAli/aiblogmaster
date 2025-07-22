import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, ArrowLeft } from 'lucide-react'

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

interface CategoryPageProps {
  posts: Post[]
  category: string
  totalPosts: number
}

export default function CategoryPage({ 
  posts, 
  category,
  totalPosts
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category} Articles - AI Blog Platform`,
    "description": `Browse all ${category} articles on AI Blog Platform. Discover AI-powered insights and tutorials.`,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/category/${category.toLowerCase()}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalPosts,
      "itemListElement": posts.map((post, index) => ({
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
        "name": category,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/category/${category.toLowerCase()}`
      }
    ]
  }

  return (
    <>
      <Head>
        <title>{category} Articles - AI Blog Platform</title>
        <meta 
          name="description" 
          content={`Explore ${category} articles on AI Blog Platform. Discover AI-powered insights, tutorials, and industry news in the ${category} category.`}
        />
        <meta 
          name="keywords" 
          content={`${category}, AI blog, artificial intelligence, tutorials, insights, ${category.toLowerCase()} articles`}
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${category} Articles - AI Blog Platform`} />
        <meta property="og:description" content={`Browse ${category} AI-generated articles and tutorials on our platform.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/category/${category.toLowerCase()}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${category} Articles - AI Blog Platform`} />
        <meta name="twitter:description" content={`Browse ${category} AI-generated articles and tutorials.`} />
        
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/category/${category.toLowerCase()}`} />
        
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
                AI Blog
              </Link>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/blog">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    All Articles
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  <span className="text-gray-900 dark:text-white font-medium">
                    {category}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {category} Articles
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Discover {totalPosts} {totalPosts === 1 ? 'article' : 'articles'} in the {category} category
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We haven't published any articles in the {category} category yet.
              </p>
              <Button asChild>
                <Link href="/blog">Browse All Articles</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      <Link 
                        href={`/post/${post.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h2>
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
          )}
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    const response = await fetch(`${baseUrl}/api/posts?status=published`)
    const posts = response.ok ? await response.json() : []
    
    // Extract unique categories
    const categories = [...new Set(posts.map((post: Post) => post.category))].filter(Boolean)
    
    const paths = categories.map((category: string) => ({
      params: { category: category.toLowerCase() }
    }))

    return {
      paths,
      fallback: 'blocking' // Enable ISR for new categories
    }
  } catch (error) {
    console.error('Error generating category paths:', error)
    return {
      paths: [],
      fallback: 'blocking'
    }
  }
}

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params }) => {
  try {
    const category = params?.category as string
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    
    const response = await fetch(`${baseUrl}/api/posts?status=published`)
    const allPosts = response.ok ? await response.json() : []
    
    // Filter posts by category (case insensitive)
    const categoryPosts = allPosts.filter((post: Post) => 
      post.category.toLowerCase() === category.toLowerCase()
    )
    
    if (categoryPosts.length === 0) {
      return {
        notFound: true
      }
    }

    // Get the actual category name (with proper casing) from the first post
    const actualCategoryName = categoryPosts[0].category

    return {
      props: {
        posts: categoryPosts,
        category: actualCategoryName,
        totalPosts: categoryPosts.length
      },
      revalidate: 3600 // Regenerate every hour
    }
  } catch (error) {
    console.error('Error fetching category posts:', error)
    return {
      notFound: true
    }
  }
}