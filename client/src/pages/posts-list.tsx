import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Calendar,
  Search,
  Filter,
  Bot,
  User,
  FileText
} from "lucide-react";

export default function PostsList() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/posts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/posts");
      if (!response.ok) throw new Error("Failed to fetch posts");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
          <p className="text-gray-600 mt-1">Manage all your blog posts and content</p>
        </div>
        <Link href="/admin/posts/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
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
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
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
          filteredPosts.map((post: any) => (
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
          ))
        )}
      </div>
    </div>
  );
}