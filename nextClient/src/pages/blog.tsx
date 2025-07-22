import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Navigation from '@/components/navigation'
import BlogCard from '@/components/blog-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, Calendar, TrendingUp } from 'lucide-react'

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

interface BlogPageProps {
  posts: Post[]
  categories: string[]
  totalPosts: number
  currentPage: number
  totalPages: number
  searchQuery: string
  selectedCategory: string
}

export default function BlogPage({ 
  posts, 
  categories, 
  totalPosts,
  currentPage,
  totalPages,
  searchQuery: initialSearch,
  selectedCategory: initialCategory
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
    const queryString = params.toString()
    window.location.href = `/blog${queryString ? `?${queryString}` : ''}`
  }

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (category !== 'all') params.set('category', category)
    const queryString = params.toString()
    window.location.href = `/blog${queryString ? `?${queryString}` : ''}`
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
    if (page > 1) params.set('page', page.toString())
    const queryString = params.toString()
    window.location.href = `/blog${queryString ? `?${queryString}` : ''}`
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AI Blog Platform - All Posts",
    "description": "Browse all AI-generated articles, tutorials, and insights on automated content creation, SEO optimization, and machine learning.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "AI Blog Platform"
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/post/${post.slug}`,
      "datePublished": post.publishedAt,
      "author": {
        "@type": "Organization",
        "name": "AI Blog Platform"
      },
      "publisher": {
        "@type": "Organization",
        "name": "AI Blog Platform"
      }
    }))
  }

  const pageTitle = searchQuery 
    ? `Search Results for "${searchQuery}" - AI Blog Platform`
    : selectedCategory && selectedCategory !== 'all'
    ? `${selectedCategory} Articles - AI Blog Platform`
    : 'All Articles - AI Blog Platform'

  const pageDescription = searchQuery
    ? `Found ${totalPosts} articles matching "${searchQuery}". Discover AI insights, tutorials, and automation strategies.`
    : selectedCategory && selectedCategory !== 'all'
    ? `Browse ${totalPosts} articles in ${selectedCategory}. Learn about AI-powered content creation and SEO optimization.`
    : `Browse all ${totalPosts} AI-generated articles, tutorials, and industry insights on automated content creation.`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="AI blog, machine learning, automated content, SEO optimization, artificial intelligence articles" />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`} />
        
        {/* Pagination */}
        {currentPage > 1 && (
          <link rel="prev" href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog?page=${currentPage - 1}`} />
        )}
        {currentPage < totalPages && (
          <link rel="next" href={`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog?page=${currentPage + 1}`} />
        )}
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {searchQuery ? `Search Results` : selectedCategory && selectedCategory !== 'all' ? `${selectedCategory} Articles` : 'All Articles'}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {searchQuery 
                ? `Found ${totalPosts} articles matching "${searchQuery}"`
                : `Discover ${totalPosts} AI-generated insights and tutorials`
              }
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-white text-gray-900"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                Search
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              {/* Category Filter */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Categories
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryFilter('all')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        (!selectedCategory || selectedCategory === 'all')
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      All Articles
                      <Badge variant="secondary" className="ml-2">
                        {totalPosts}
                      </Badge>
                    </button>
                    {categories.map((category) => {
                      const categoryPosts = posts.filter(p => p.category === category).length
                      return (
                        <button
                          key={category}
                          onClick={() => handleCategoryFilter(category)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          {category}
                          <Badge variant="secondary" className="ml-2">
                            {categoryPosts}
                          </Badge>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Popular */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Most Popular
                  </h3>
                  <div className="space-y-3">
                    {posts
                      .filter(p => p.views && p.views > 0)
                      .sort((a, b) => (b.views || 0) - (a.views || 0))
                      .slice(0, 5)
                      .map((post) => (
                        <div key={post.id}>
                          <Link href={`/post/${post.slug}`} className="block">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">
                              {post.title}
                            </h4>
                            <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(post.publishedAt).toLocaleDateString()}
                              {post.views && (
                                <>
                                  <span className="mx-2">•</span>
                                  {post.views} views
                                </>
                              )}
                            </div>
                          </Link>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Active Filters */}
              {(searchQuery || (selectedCategory && selectedCategory !== 'all')) && (
                <div className="mb-6 flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="outline" className="gap-1">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="ml-1 text-xs">×</button>
                    </Badge>
                  )}
                  {selectedCategory && selectedCategory !== 'all' && (
                    <Badge variant="outline" className="gap-1">
                      Category: {selectedCategory}
                      <button onClick={() => handleCategoryFilter('all')} className="ml-1 text-xs">×</button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Posts Grid */}
              {posts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {posts.map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        showStats={true}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                      {currentPage > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </Button>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      {currentPage < totalPages && (
                        <Button
                          variant="outline"
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchQuery ? `No articles match "${searchQuery}"` : 'No articles in this category'}
                  </p>
                  <Button onClick={() => window.location.href = '/blog'}>
                    View All Articles
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async ({ query }) => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const page = parseInt(query.page as string) || 1
    const search = query.search as string || ''
    const category = query.category as string || ''
    const limit = 12

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    if (search) params.set('search', search)
    if (category && category !== 'all') params.set('category', category)

    // Fetch posts
    const postsRes = await fetch(`${apiUrl}/api/posts?${params.toString()}`)
    const postsData = postsRes.ok ? await postsRes.json() : { posts: [], total: 0, totalPages: 0 }

    // Get all posts for categories (this could be optimized with a dedicated endpoint)
    const allPostsRes = await fetch(`${apiUrl}/api/posts`)
    const allPosts = allPostsRes.ok ? await allPostsRes.json() : []
    
    // Extract unique categories
    const categories = [...new Set(allPosts.map((post: Post) => post.category))].filter(Boolean)

    return {
      props: {
        posts: postsData.posts || postsData || [],
        categories: categories.slice(0, 10), // Limit categories
        totalPosts: postsData.total || postsData.length || 0,
        currentPage: page,
        totalPages: postsData.totalPages || Math.ceil((postsData.length || 0) / limit),
        searchQuery: search,
        selectedCategory: category
      }
    }
  } catch (error) {
    console.error('Error fetching blog data:', error)
    
    return {
      props: {
        posts: [],
        categories: [],
        totalPosts: 0,
        currentPage: 1,
        totalPages: 0,
        searchQuery: '',
        selectedCategory: ''
      }
    }
  }
}