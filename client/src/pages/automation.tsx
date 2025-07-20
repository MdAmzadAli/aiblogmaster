import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AnalyticsChart from "@/components/analytics-chart";
import SEOAssistant from "@/components/seo-assistant";
import { 
  Settings, 
  Bot, 
  Calendar, 
  FileText, 
  Eye, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  Save,
  Sparkles,
  TrendingUp
} from "lucide-react";

export default function Automation() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    metaDescription: "",
    keywords: "",
    category: "",
  });
  
  const [automationSettings, setAutomationSettings] = useState({
    isEnabled: true,
    frequency: "weekly",
    scheduledTime: "10:00",
    targetKeywords: "",
    contentType: "how-to",
    wordCount: 1200,
    categories: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Queries
  const { data: posts = [], isLoading: postsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/posts"],
    enabled: isAuthenticated,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    totalPosts: number;
    totalViews: number;
    avgSeoScore: number;
    aiGeneratedPercentage: number;
  }>({
    queryKey: ["/api/admin/analytics/summary"],
    enabled: isAuthenticated,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<{
    isEnabled?: boolean;
    frequency?: string;
    scheduledTime?: string;
    targetKeywords?: string[];
    contentType?: string;
    wordCount?: number;
    categories?: string[];
  }>({
    queryKey: ["/api/admin/automation"],
    enabled: isAuthenticated,
  });

  // Load automation settings when available
  useEffect(() => {
    if (settings) {
      setAutomationSettings({
        isEnabled: settings.isEnabled ?? true,
        frequency: settings.frequency ?? "weekly",
        scheduledTime: settings.scheduledTime ?? "10:00",
        targetKeywords: settings.targetKeywords?.join(", ") ?? "",
        contentType: settings.contentType ?? "how-to",
        wordCount: settings.wordCount ?? 1200,
        categories: settings.categories?.join(", ") ?? "",
      });
    }
  }, [settings]);

  // Mutations
  const generatePostMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/generate-post", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI post generated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post created successfully!",
      });
      setNewPost({
        title: "",
        content: "",
        excerpt: "",
        metaDescription: "",
        keywords: "",
        category: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/automation", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Automation settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/automation"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePost = () => {
    generatePostMutation.mutate({
      keywords: automationSettings.targetKeywords.split(",").map(k => k.trim()).filter(Boolean),
      contentType: automationSettings.contentType,
      wordCount: automationSettings.wordCount,
      category: automationSettings.categories.split(",")[0]?.trim() || "general",
    });
  };

  const handleCreatePost = () => {
    createPostMutation.mutate({
      ...newPost,
      keywords: newPost.keywords.split(",").map(k => k.trim()).filter(Boolean),
      status: "draft",
      isAiGenerated: false,
    });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      ...automationSettings,
      targetKeywords: automationSettings.targetKeywords.split(",").map(k => k.trim()).filter(Boolean),
      categories: automationSettings.categories.split(",").map(c => c.trim()).filter(Boolean),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Blog Admin</h1>
              <span className="ml-4 text-sm text-gray-500">Automation Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">AI Active</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/logout"}
                className="text-blue-600 hover:text-blue-800"
              >
                Exit Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : analytics ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Posts</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalPosts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Eye className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics.totalViews.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Bot className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500">AI Generated</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.aiGeneratedPercentage}%</p>
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
                      <p className="text-sm text-gray-500">Avg SEO Score</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.avgSeoScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Content Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  AI Content Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Automation Status</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        {automationSettings.isEnabled ? "Active - " + automationSettings.frequency + " Publishing" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Next post: Tomorrow at {automationSettings.scheduledTime}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Gemini AI</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Connected & Ready</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Response time: 2.3s avg</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Keywords
                    </label>
                    <Input
                      placeholder="Enter keywords for AI to target..."
                      value={automationSettings.targetKeywords}
                      onChange={(e) => setAutomationSettings({
                        ...automationSettings,
                        targetKeywords: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <Select 
                        value={automationSettings.contentType} 
                        onValueChange={(value) => setAutomationSettings({
                          ...automationSettings,
                          contentType: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="how-to">How-to Guide</SelectItem>
                          <SelectItem value="listicle">Listicle</SelectItem>
                          <SelectItem value="news">News Article</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Word Count
                      </label>
                      <Select 
                        value={automationSettings.wordCount.toString()} 
                        onValueChange={(value) => setAutomationSettings({
                          ...automationSettings,
                          wordCount: parseInt(value)
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="800">800-1200 words</SelectItem>
                          <SelectItem value="1200">1200-1800 words</SelectItem>
                          <SelectItem value="1800">1800+ words</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleGeneratePost}
                      disabled={generatePostMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {generatePostMutation.isPending ? "Generating..." : "Generate Post Now"}
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={handleSaveSettings}
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual Post Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-5 h-5 mr-2" />
                  Create Manual Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <Input
                      placeholder="Post title..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Input
                      placeholder="Category..."
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <Textarea
                    placeholder="Write your post content..."
                    rows={8}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <Textarea
                      placeholder="Brief summary..."
                      rows={3}
                      value={newPost.excerpt}
                      onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description
                    </label>
                    <Textarea
                      placeholder="SEO meta description..."
                      rows={3}
                      value={newPost.metaDescription}
                      onChange={(e) => setNewPost({ ...newPost, metaDescription: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma-separated)
                  </label>
                  <Input
                    placeholder="keyword1, keyword2, keyword3..."
                    value={newPost.keywords}
                    onChange={(e) => setNewPost({ ...newPost, keywords: e.target.value })}
                  />
                </div>

                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending || !newPost.title || !newPost.content}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createPostMutation.isPending ? "Creating..." : "Create Draft"}
                </Button>
              </CardContent>
            </Card>

            {/* Analytics Chart */}
            <AnalyticsChart />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Posts Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Posts</CardTitle>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-3">
                    {posts.slice(0, 5).map((post: any) => (
                      <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {post.status === "published" ? "Published" : 
                             post.status === "draft" ? "Draft" : "Scheduled"}
                            {post.publishedAt && ` • ${new Date(post.publishedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`status-dot ${
                            post.status === "published" ? "status-published" :
                            post.status === "draft" ? "status-draft" : "status-scheduled"
                          }`}></div>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No posts yet</p>
                )}
                
                <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-800">
                  View All Posts
                </Button>
              </CardContent>
            </Card>

            {/* SEO Assistant */}
            <SEOAssistant />

            {/* Automation Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Publishing Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Auto-Publish ({automationSettings.frequency})
                    </span>
                    <Switch
                      checked={automationSettings.isEnabled}
                      onCheckedChange={(checked) => setAutomationSettings({
                        ...automationSettings,
                        isEnabled: checked
                      })}
                    />
                  </div>
                  <p className="text-xs text-blue-700">
                    Every {automationSettings.frequency === "weekly" ? "Monday" : 
                           automationSettings.frequency === "daily" ? "day" : "month"} at {automationSettings.scheduledTime}
                  </p>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Upcoming Posts:</p>
                  <ul className="space-y-1">
                    <li>• Tomorrow: "AI Content Optimization"</li>
                    <li>• Next Week: "SEO Trends 2024"</li>
                    <li>• Dec 25: "Holiday Marketing Tips"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
