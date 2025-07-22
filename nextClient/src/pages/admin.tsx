import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navigation from '@/components/navigation'
import AnalyticsChart from '@/components/analytics-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  PlusCircle, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  Clock,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  status: 'draft' | 'published'
  publishedAt?: string
  views?: number
  isAiGenerated: boolean
}

interface Analytics {
  totalViews: number
  totalPosts: number
  publishedPosts: number
  draftPosts: number
}

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ['admin', 'posts'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/posts', {
        credentials: 'include'
      })
      return response
    },
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  })

  // Fetch analytics
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/analytics/summary', {
        credentials: 'include'
      })
      return response
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] })
      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
    }
  })

  const handleDeletePost = (postId: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePostMutation.mutate(postId)
    }
  }

  const handleEditPost = (slug: string) => {
    window.location.href = `/admin/post-editor?slug=${slug}`
  }

  const handleViewPost = (slug: string) => {
    window.open(`/post/${slug}`, '_blank')
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  const publishedPosts = posts.filter(p => p.status === 'published')
  const draftPosts = posts.filter(p => p.status === 'draft')
  const totalViews = analytics?.totalViews || posts.reduce((sum, post) => sum + (post.views || 0), 0)

  return (
    <>
      <Head>
        <title>Admin Dashboard - AI Blog Platform</title>
        <meta name="description" content="Manage your AI blog content, analytics, and settings" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your AI-powered blog content and analytics
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Button onClick={() => window.location.href = '/admin/post-editor'}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Post
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/admin/settings'}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Posts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {posts.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Published
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {publishedPosts.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Drafts
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {draftPosts.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Views
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Posts Management */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Recent Posts
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/admin/posts'}
                    >
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {postsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-4">
                      {posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {post.title}
                            </h3>
                            <div className="flex items-center mt-1 space-x-2">
                              <Badge variant={getStatusBadgeVariant(post.status)}>
                                {post.status}
                              </Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {post.category}
                              </span>
                              {post.views !== undefined && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {post.views} views
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(post.slug)}
                              className="p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {post.status === 'published' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPost(post.slug)}
                                className="p-2"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No posts yet
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Get started by creating your first blog post
                      </p>
                      <Button onClick={() => window.location.href = '/admin/post-editor'}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            <div className="space-y-6">
              <AnalyticsChart />
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin/post-editor'}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Post
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin/automation'}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Automation Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/admin/analytics'}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/'}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Site
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}