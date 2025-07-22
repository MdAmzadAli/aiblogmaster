import Head from 'next/head'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { queryClient } from '@/lib/queryClient'
import { Settings, FileText, BarChart3, Bot, Users, Calendar, TrendingUp } from 'lucide-react'

interface Post {
  id: number
  title: string
  status: string
  category: string
  createdAt: string
  isAiGenerated: boolean
  seoScore: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/admin/posts'],
    queryFn: () => fetch('/api/admin/posts').then(res => res.json())
  })

  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/analytics'],
    queryFn: () => fetch('/api/admin/analytics').then(res => res.json()),
    retry: false
  })

  const publishedPosts = posts.filter((p: Post) => p.status === 'published')
  const draftPosts = posts.filter((p: Post) => p.status === 'draft')
  const pendingPosts = posts.filter((p: Post) => p.status === 'pending')

  return (
    <>
      <Head>
        <title>Admin Dashboard - AI Blog Platform</title>
        <meta name="description" content="Manage your AI blog platform - create posts, configure automation, and analyze performance." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <Button onClick={() => window.location.href = '/'}>
                View Blog
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'posts', label: 'Posts', icon: FileText },
                { id: 'automation', label: 'Automation', icon: Bot },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{posts.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {publishedPosts.length} published
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{publishedPosts.length}</div>
                    <p className="text-xs text-muted-foreground">Live on site</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Draft Posts</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{draftPosts.length}</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {posts.filter((p: Post) => p.isAiGenerated).length}
                    </div>
                    <p className="text-xs text-muted-foreground">Automated content</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.slice(0, 5).map((post: Post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <h3 className="font-medium">{post.title}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                  {post.status}
                                </Badge>
                                <span className="text-sm text-gray-500">{post.category}</span>
                                {post.isAiGenerated && (
                                  <Badge variant="outline">AI Generated</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-500">
                              SEO: {post.seoScore || 0}%
                            </div>
                            <Progress value={post.seoScore || 0} className="w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Posts Management</h2>
                <Button onClick={() => window.location.href = '/admin/post-editor'}>
                  Create New Post
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post: Post) => (
                        <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-medium">{post.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                {post.status}
                              </Badge>
                              <span className="text-sm text-gray-500">{post.category}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab !== 'overview' && activeTab !== 'posts' && (
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{activeTab}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">
                  {activeTab} functionality will be available soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}