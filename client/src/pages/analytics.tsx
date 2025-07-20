import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  TrendingUp, 
  FileText, 
  Target,
  Calendar,
  BarChart3,
  Users,
  Clock
} from "lucide-react";

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth();

  // Fetch analytics summary
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics/summary"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/summary");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch posts with analytics
  const { data: posts = [] } = useQuery({
    queryKey: ["/api/admin/posts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your blog performance and content insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalViews?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Published Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {posts.filter((p: any) => p.status === 'published').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg SEO Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.avgSeoScore ? Math.round(analytics.avgSeoScore) : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.monthlyViews?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Top Performing Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts
              .filter((post: any) => post.status === 'published')
              .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
              .slice(0, 10)
              .map((post: any) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{post.title}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                      </span>
                      <span>Category: {post.category}</span>
                      {post.seoScore && (
                        <span>SEO: {post.seoScore}/100</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {(post.viewCount || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">views</div>
                  </div>
                </div>
              ))}
            
            {posts.filter((post: any) => post.status === 'published').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No published posts yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.reduce((acc: any, post: any) => {
                if (post.status === 'published' && post.category) {
                  acc[post.category] = (acc[post.category] || 0) + (post.viewCount || 0);
                }
                return acc;
              }, {}) && Object.entries(posts.reduce((acc: any, post: any) => {
                if (post.status === 'published' && post.category) {
                  acc[post.category] = (acc[post.category] || 0) + (post.viewCount || 0);
                }
                return acc;
              }, {})).map(([category, views]: [string, any]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{views.toLocaleString()}</span>
                    <Badge variant="secondary">{views}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI vs Manual Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const aiPosts = posts.filter((p: any) => p.isAiGenerated);
                const manualPosts = posts.filter((p: any) => !p.isAiGenerated);
                const total = posts.length;
                
                return (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">AI Generated</span>
                        <span className="font-medium">{aiPosts.length} posts ({total > 0 ? Math.round((aiPosts.length / total) * 100) : 0}%)</span>
                      </div>
                      <Progress value={total > 0 ? (aiPosts.length / total) * 100 : 0} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Manual</span>
                        <span className="font-medium">{manualPosts.length} posts ({total > 0 ? Math.round((manualPosts.length / total) * 100) : 0}%)</span>
                      </div>
                      <Progress value={total > 0 ? (manualPosts.length / total) * 100 : 0} className="h-2" />
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}