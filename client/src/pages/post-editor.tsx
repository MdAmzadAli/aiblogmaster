import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RichEditor from "@/components/rich-editor";
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Send,
  Calendar,
  Globe,
  FileText
} from "lucide-react";

export default function PostEditor() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Support both URL params (/post-editor/:id) and query params (/post-editor?edit=id)
  const urlSearchParams = new URLSearchParams(window.location.search);
  const editPostId = urlSearchParams.get('edit');
  const postId = params.id ? parseInt(params.id) : (editPostId ? parseInt(editPostId) : null);
  const isEditing = !!postId;
  
  const [post, setPost] = useState({
    title: "",
    content: "",
    excerpt: "",
    metaDescription: "",
    keywords: "",
    category: "",
    status: "draft" as "draft" | "published" | "scheduled",
    featuredImage: "",
    scheduledAt: "",
  });

  // Fetch post data if editing
  const { data: existingPost, isLoading } = useQuery({
    queryKey: ["/api/admin/posts", postId],
    queryFn: async () => {
      if (!postId) return null;
      const response = await fetch(`/api/admin/posts/${postId}`);
      if (!response.ok) throw new Error("Failed to fetch post");
      return response.json();
    },
    enabled: !!postId && isAuthenticated,
  });

  // Load existing post data
  useEffect(() => {
    if (existingPost) {
      setPost({
        title: existingPost.title || "",
        content: existingPost.content || "",
        excerpt: existingPost.excerpt || "",
        metaDescription: existingPost.metaDescription || "",
        keywords: existingPost.keywords?.join(", ") || "",
        category: existingPost.category || "",
        status: existingPost.status || "draft",
        featuredImage: existingPost.featuredImage || "",
        scheduledAt: existingPost.scheduledAt ? new Date(existingPost.scheduledAt).toISOString().slice(0, 16) : "",
      });
    }
  }, [existingPost]);

  // Save/Update post mutation
  const savePostMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isEditing ? `/api/admin/posts/${postId}` : "/api/admin/posts";
      const method = isEditing ? "PUT" : "POST";
      const response = await apiRequest(method, endpoint, data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Post ${isEditing ? 'updated' : 'created'} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/posts"] });
      if (!isEditing) {
        navigate(`/admin/posts/edit/${data.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} post.`,
        variant: "destructive",
      });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSave = (status?: string) => {
    const slug = generateSlug(post.title);
    const postData = {
      ...post,
      slug,
      keywords: post.keywords.split(",").map(k => k.trim()).filter(Boolean),
      status: status || post.status,
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : null,
    };

    savePostMutation.mutate(postData);
  };

  const handlePublish = () => {
    handleSave("published");
  };

  const handleSchedule = () => {
    if (!post.scheduledAt) {
      toast({
        title: "Error",
        description: "Please set a scheduled date and time.",
        variant: "destructive",
      });
      return;
    }
    handleSave("scheduled");
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
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/posts")}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Post" : "Create New Post"}
            </h1>
            {existingPost && (
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={existingPost.status === "published" ? "default" : "secondary"}>
                  {existingPost.status}
                </Badge>
                {existingPost.isAiGenerated && (
                  <Badge variant="outline">AI Generated</Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handleSave()}
            disabled={savePostMutation.isPending || !post.title || !post.content}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          {post.status !== "published" && (
            <Button
              onClick={handlePublish}
              disabled={savePostMutation.isPending || !post.title || !post.content}
              className="bg-green-600 hover:bg-green-700"
            >
              <Globe className="w-4 h-4 mr-2" />
              Publish Now
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <RichEditor
                title={post.title}
                content={post.content}
                onTitleChange={(title) => setPost({ ...post, title })}
                onChange={(content) => setPost({ ...post, content })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Post Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <Input
                  value={post.category}
                  onChange={(e) => setPost({ ...post, category: e.target.value })}
                  placeholder="Post category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select value={post.status} onValueChange={(value: any) => setPost({ ...post, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {post.status === "scheduled" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={post.scheduledAt}
                    onChange={(e) => setPost({ ...post, scheduledAt: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <Button
                    onClick={handleSchedule}
                    disabled={savePostMutation.isPending || !post.scheduledAt}
                    className="w-full mt-2"
                    variant="outline"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Post
                  </Button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <Input
                  value={post.featuredImage}
                  onChange={(e) => setPost({ ...post, featuredImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <Textarea
                  value={post.excerpt}
                  onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                  placeholder="Brief post summary..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <Textarea
                  value={post.metaDescription}
                  onChange={(e) => setPost({ ...post, metaDescription: e.target.value })}
                  placeholder="SEO meta description..."
                  rows={3}
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {post.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <Input
                  value={post.keywords}
                  onChange={(e) => setPost({ ...post, keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}