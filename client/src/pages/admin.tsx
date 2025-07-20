import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Switch as WouterSwitch, Route, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Bot, 
  FileText, 
  BarChart3,
  Edit,
  Trash2,
  Plus,
  Eye,
  Home,
  Calendar,
  Target,
  Mail,
  Search,
  Filter,
  CheckCircle,
  Clock,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Textarea
} from "lucide-react";

// Import remaining page components  
import PostEditor from "./post-editor";
import AnalyticsPage from "./analytics";

export default function AdminLayout() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

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

  const sidebarItems = [
    { href: "/admin", icon: Home, label: "Dashboard", exact: true },
    { href: "/admin/automation", icon: Bot, label: "Post Automation" },
    { href: "/admin/approval", icon: CheckCircle, label: "Pending Approval" },
    { href: "/admin/seo", icon: Target, label: "SEO Analyzer" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                  AI Blog Admin
                </h1>
              </Link>
              <span className="ml-4 text-sm text-gray-500">Management Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">AI Active</span>
              </div>
              <Link href="/">
                <Button variant="outline" className="text-blue-600 hover:text-blue-800">
                  View Blog
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/api/logout"}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = item.exact 
                    ? location === item.href 
                    : location.startsWith(item.href);
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <div className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <WouterSwitch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/automation" component={PostAutomation} />
              <Route path="/admin/approval" component={PendingApproval} />
              <Route path="/admin/seo" component={SEOAnalyzer} />
              <Route path="/admin/posts/edit/:id" component={PostEditor} />
              <Route path="/admin/posts/new" component={PostEditor} />
              <Route path="/admin/analytics" component={AnalyticsPage} />
              <Route path="/admin/settings" component={AdminSettings} />
              <Route>
                <AdminDashboard />
              </Route>
            </WouterSwitch>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Component with Search and Pagination
function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Fetch all posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/admin/posts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch analytics summary
  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics/summary"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics/summary");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest("DELETE", `/api/admin/posts/${postId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    },
  });

  // Filter posts based on search and status
  const filteredPosts = posts.filter((post: any) => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const aiGeneratedCount = posts.filter((p: any) => p.isAiGenerated).length;
  const aiPercentage = posts.length > 0 ? Math.round((aiGeneratedCount / posts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
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
                  {analytics?.totalViews?.toLocaleString() || "0"}
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
                <p className="text-2xl font-bold text-gray-900">{aiPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
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
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search posts by title, excerpt, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link href="/admin/posts/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Posts List with Pagination */}
      <div className="space-y-4">
        {postsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FileText className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "No posts match your current filters. Try adjusting your search or filter criteria."
                  : "You haven't created any posts yet. Create your first post to get started."
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/admin/posts/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {paginatedPosts.map((post: any) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          <Link href={`/admin/posts/edit/${post.id}`}>
                            {post.title}
                          </Link>
                        </h3>
                        <Badge className={getStatusColor(post.status)}>
                          {post.status}
                        </Badge>
                        {post.isAiGenerated && (
                          <Badge variant="outline" className="text-purple-600">
                            <Bot className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span>Category: {post.category}</span>
                        {post.seoScore && (
                          <span>SEO Score: {post.seoScore}/100</span>
                        )}
                        <span>Views: {post.viewCount || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {post.status === "published" && (
                        <Link href={`/post/${post.slug}`}>
                          <Button variant="ghost" size="sm" title="View Post">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      
                      <Link href={`/admin/posts/edit/${post.id}`}>
                        <Button variant="ghost" size="sm" title="Edit Post">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" title="Delete Post" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePostMutation.mutate(post.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + postsPerPage, filteredPosts.length)} of {filteredPosts.length} posts
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Post Automation Component
function PostAutomation() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    keywords: "",
    contentType: "how-to",
    wordCount: 1200,
    category: ""
  });

  // Fetch automation settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/automation"],
    queryFn: async () => {
      const response = await fetch("/api/admin/automation");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Generate post mutation
  const generatePostMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/admin/generate-post", data);
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `AI post "${data.title}" generated successfully!`,
      });
      setFormData({ keywords: "", contentType: "how-to", wordCount: 1200, category: "" });
      setIsGenerating(false);
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to generate post.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    const keywords = formData.keywords.split(",").map(k => k.trim()).filter(Boolean);
    generatePostMutation.mutate({
      keywords,
      contentType: formData.contentType,
      wordCount: formData.wordCount,
      category: formData.category
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post Automation</h1>
        <p className="text-gray-600 mt-1">Generate AI-powered content and manage automation settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Post */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              Generate New Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <Input
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="SEO, content marketing, AI tools"
              />
              <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <Select 
                value={formData.contentType} 
                onValueChange={(value) => setFormData({ ...formData, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="how-to">How-to Guide</SelectItem>
                  <SelectItem value="listicle">Listicle</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Count
              </label>
              <Input
                type="number"
                min="500"
                max="3000"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: parseInt(e.target.value) || 1200 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Technology, Marketing, AI"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !formData.keywords}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Generate Post
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Current Automation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : settings ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={settings.isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {settings.isEnabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Frequency:</span>
                  <span className="text-sm font-medium">{settings.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Scheduled Time:</span>
                  <span className="text-sm font-medium">{settings.scheduledTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Keywords:</span>
                  <span className="text-sm font-medium">{settings.targetKeywords?.join(", ") || "None"}</span>
                </div>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full mt-4">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Settings
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">No settings found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Pending Approval Component
function PendingApproval() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch draft posts (pending approval)
  const { data: draftPosts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/posts", "draft"],
    queryFn: async () => {
      const response = await fetch("/api/admin/posts?status=draft");
      if (!response.ok) throw new Error("Failed to fetch draft posts");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Approve post mutation
  const approvePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await apiRequest("PUT", `/api/admin/posts/${postId}`, { status: "published" });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post approved and published!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve post.",
        variant: "destructive",
      });
    },
  });

  const aiGeneratedDrafts = draftPosts.filter((post: any) => post.isAiGenerated);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Approval</h1>
        <p className="text-gray-600 mt-1">Review and approve AI-generated posts before publishing</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : aiGeneratedDrafts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Awaiting Approval</h3>
              <p className="text-gray-600 mb-6">
                All AI-generated posts have been reviewed. New posts will appear here when generated.
              </p>
              <Link href="/admin/automation">
                <Button>
                  <Bot className="w-4 h-4 mr-2" />
                  Generate New Post
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          aiGeneratedDrafts.map((post: any) => (
            <Card key={post.id} className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                    {post.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-orange-600">
                    <Bot className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Excerpt:</h4>
                    <p className="text-gray-600">{post.excerpt}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{post.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">SEO Score:</span>
                      <span className="ml-2 font-medium">{post.seoScore}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Word Count:</span>
                      <span className="ml-2 font-medium">~{post.content.split(' ').length}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Keywords:</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.keywords?.map((keyword: string, index: number) => (
                        <Badge key={index} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 border-t">
                    <Link href={`/admin/posts/edit/${post.id}`}>
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Post
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => approvePostMutation.mutate(post.id)}
                      disabled={approvePostMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Publish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// SEO Analyzer Component
function SEOAnalyzer() {
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState({
    title: "",
    content: "",
    metaDescription: "",
    keywords: ""
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSEO = async () => {
    if (!analysisData.title || !analysisData.content) {
      toast({
        title: "Error",
        description: "Please provide both title and content for analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiRequest("POST", "/api/admin/analyze-seo", {
        title: analysisData.title,
        content: analysisData.content,
        metaDescription: analysisData.metaDescription,
        keywords: analysisData.keywords.split(",").map(k => k.trim()).filter(Boolean)
      });
      setAnalysis(response);
      toast({
        title: "Success",
        description: "SEO analysis completed!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze SEO.",
        variant: "destructive",
      });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SEO Analyzer</h1>
        <p className="text-gray-600 mt-1">Analyze and optimize your content for search engines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Content Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                value={analysisData.title}
                onChange={(e) => setAnalysisData({ ...analysisData, title: e.target.value })}
                placeholder="Enter your post title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Textarea
                value={analysisData.content}
                onChange={(e) => setAnalysisData({ ...analysisData, content: e.target.value })}
                placeholder="Paste your content here..."
                rows={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <Input
                value={analysisData.metaDescription}
                onChange={(e) => setAnalysisData({ ...analysisData, metaDescription: e.target.value })}
                placeholder="Optional meta description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keywords
              </label>
              <Input
                value={analysisData.keywords}
                onChange={(e) => setAnalysisData({ ...analysisData, keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            <Button 
              onClick={analyzeSEO}
              disabled={isAnalyzing || !analysisData.title || !analysisData.content}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analyze SEO
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!analysis ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Run an analysis to see SEO recommendations</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {analysis.score}/100
                  </div>
                  <div className="text-sm text-gray-500">SEO Score</div>
                </div>

                <div className="space-y-3">
                  {analysis.suggestions?.map((suggestion: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>

                {analysis.keywords && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Keyword Analysis:</h4>
                    <div className="space-y-2">
                      {analysis.keywords.map((kw: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{kw.keyword}</span>
                          <span className="text-gray-500">{kw.count} times</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Admin Settings Component (from admin-settings.tsx)
function AdminSettings() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    isEnabled: true,
    frequency: "twice-daily",
    scheduledTime: "10:00",
    targetKeywords: "",
    contentType: "how-to",
    wordCount: 1200,
    categories: "",
    adminEmail: "",
  });

  // Fetch automation settings
  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/automation"],
    queryFn: async () => {
      const response = await fetch("/api/admin/automation");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Load existing settings
  useEffect(() => {
    if (existingSettings) {
      setSettings({
        isEnabled: existingSettings.isEnabled ?? true,
        frequency: existingSettings.frequency || "twice-daily",
        scheduledTime: existingSettings.scheduledTime || "10:00",
        targetKeywords: existingSettings.targetKeywords?.join(", ") || "",
        contentType: existingSettings.contentType || "how-to",
        wordCount: existingSettings.wordCount || 1200,
        categories: existingSettings.categories?.join(", ") || "",
        adminEmail: existingSettings.adminEmail || "",
      });
    }
  }, [existingSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/automation", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/automation"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const settingsData = {
      ...settings,
      targetKeywords: settings.targetKeywords
        .split(",")
        .map(k => k.trim())
        .filter(Boolean),
      categories: settings.categories
        .split(",")
        .map(c => c.trim())
        .filter(Boolean),
    };

    saveSettingsMutation.mutate(settingsData);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure AI automation and platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Automation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              AI Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Automation</label>
                <p className="text-xs text-gray-500">Automatically generate posts using AI</p>
              </div>
              <Switch
                checked={settings.isEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, isEnabled: checked })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posting Frequency
              </label>
              <Select 
                value={settings.frequency} 
                onValueChange={(value) => setSettings({ ...settings, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twice-daily">Twice Daily (10 AM & 4 PM)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Scheduled Time
              </label>
              <Input
                type="time"
                value={settings.scheduledTime}
                onChange={(e) => setSettings({ ...settings, scheduledTime: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <Select 
                value={settings.contentType} 
                onValueChange={(value) => setSettings({ ...settings, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="how-to">How-to Guides</SelectItem>
                  <SelectItem value="listicle">Listicles</SelectItem>
                  <SelectItem value="tutorial">Tutorials</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Word Count
              </label>
              <Input
                type="number"
                min="500"
                max="3000"
                step="100"
                value={settings.wordCount}
                onChange={(e) => setSettings({ ...settings, wordCount: parseInt(e.target.value) || 1200 })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content & SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Content & SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keywords
              </label>
              <Textarea
                value={settings.targetKeywords}
                onChange={(e) => setSettings({ ...settings, targetKeywords: e.target.value })}
                placeholder="SEO, content marketing, AI tools, automation"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate keywords with commas. AI will use these for content generation.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <Input
                value={settings.categories}
                onChange={(e) => setSettings({ ...settings, categories: e.target.value })}
                placeholder="Technology, Marketing, AI, Business"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Admin Email
              </label>
              <Input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="your@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address to receive approval notifications for AI-generated posts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg border">
        <div>
          <h3 className="font-semibold text-gray-900">Save Configuration</h3>
          <p className="text-sm text-gray-600">Apply all changes to automation settings</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}