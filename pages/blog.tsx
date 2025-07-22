import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Search } from 'lucide-react'

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

interface BlogPageProps {
  posts: Post[]
  categories: string[]
  currentCategory?: string
  currentPage: number
  totalPages: number
  totalPosts: number
}

export default function BlogPage({ 
  posts, 
  categories, 
  currentCategory,
  currentPage,
  totalPages,
  totalPosts
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || '')

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AI Blog Platform - All Articles",
    "description": "Browse all AI-generated articles, tutorials, and insights",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalPosts,
      "itemListElement": posts.map((post, index) => ({
        "@type": "Article",
        "position": (currentPage - 1) * 12 + index + 1,
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
        <title>
          {currentCategory 
            ? `${currentCategory} Articles - AI Blog Platform`
            : `All Articles - AI Blog Platform (Page ${currentPage})`
          }
        </title>
        <meta 
          name="description" 
          content={currentCategory 
            ? `Explore ${currentCategory} articles on AI Blog Platform. Discover AI-powered insights and tutorials.`
            : `Browse all AI-generated articles and tutorials. Page ${currentPage} of ${totalPages} - ${totalPosts} total articles.`
          }
        />
        <meta 
          name="keywords" 
          content={`AI blog, ${categories.join(', ')}, artificial intelligence, tutorials, insights`}
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${currentCategory || 'All'} Articles - AI Blog Platform`} />
        <meta property="og:description" content={`Browse ${currentCategory || 'all'} AI-generated articles and tutorials on our platform.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`} />
        
        {/* Pagination */}
        {currentPage > 1 && (
          <link rel="prev" href={currentPage === 2 ? '/blog' : `/blog?page=${currentPage - 1}`} />
        )}
        {currentPage < totalPages && (
          <link rel="next" href={`/blog?page=${currentPage + 1}`} />
        )}
        
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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
                <Link href="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/admin" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {currentCategory ? `${currentCategory} Articles` : 'All Articles'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {totalPosts} {totalPosts === 1 ? 'article' : 'articles'} 
              {currentCategory && ` in ${currentCategory}`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredPosts.map((post) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  {currentPage > 1 && (
                    <Button variant="outline" asChild>
                      <Link href={currentPage === 2 ? '/blog' : `/blog?page=${currentPage - 1}`}>
                        Previous
                      </Link>
                    </Button>
                  )}
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i
                    if (page > totalPages) return null
                    
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        asChild
                      >
                        <Link href={page === 1 ? '/blog' : `/blog?page=${page}`}>
                          {page}
                        </Link>
                      </Button>
                    )
                  })}
                  
                  {currentPage < totalPages && (
                    <Button variant="outline" asChild>
                      <Link href={`/blog?page=${currentPage + 1}`}>
                        Next
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async ({ query }) => {
  try {
    const page = parseInt(query.page as string) || 1
    const category = query.category as string
    const limit = 12
    const offset = (page - 1) * limit

    const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000'
    
    // Build query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...(category && { category })
    })

    const [postsResponse, allPostsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/posts?${params}`),
      fetch(`${baseUrl}/api/posts?status=published`)
    ])

    const posts = postsResponse.ok ? await postsResponse.json() : []
    const allPosts = allPostsResponse.ok ? await allPostsResponse.json() : []
    
    // Calculate pagination
    const totalPosts = allPosts.length
    const totalPages = Math.ceil(totalPosts / limit)
    
    // Extract unique categories
    const categories = [...new Set(allPosts.map((post: Post) => post.category))].filter(Boolean) as string[]

    return {
      props: {
        posts: posts.slice(0, limit),
        categories,
        currentCategory: category || undefined,
        currentPage: page,
        totalPages,
        totalPosts
      }
    }
  } catch (error) {
    console.error('Error fetching blog data:', error)
    return {
      props: {
        posts: [],
        categories: [],
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0
      }
    }
  }
}