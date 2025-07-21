import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import BlogCard from "@/components/blog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Calendar, User } from "lucide-react";
import type { Post } from "@shared/schema";

const categories = [
  { id: "all", name: "All", active: true },
  { id: "seo", name: "SEO", active: false },
  { id: "ai", name: "AI", active: false },
  { id: "marketing", name: "Marketing", active: false },
];

export default function Landing() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredPost, isLoading: featuredLoading } = useQuery<Post | undefined>({
    queryKey: ["/api/posts/featured"],
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", selectedCategory, 9],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "9",
        ...(selectedCategory !== "all" && { category: selectedCategory })
      });
      const response = await fetch(`/api/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
  });

  const { data: searchResults = [], isLoading: searchLoading } = useQuery<Post[]>({
    queryKey: ["/api/search", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ q: searchQuery });
      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) throw new Error('Failed to search posts');
      return response.json();
    },
    enabled: searchQuery.length > 2,
  });

  const displayPosts = searchQuery.length > 2 ? searchResults : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {!searchQuery && <HeroSection />}
      
      {/* Featured Post Section */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {featuredLoading ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <Skeleton className="w-full h-64 md:h-full" />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="ml-3 h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-full mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-6" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ) : featuredPost ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
                    alt="AI Technology Workspace" 
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span className="category-badge category-featured">Featured</span>
                    <span className="ml-3 text-gray-500 text-sm flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      5 min read • 2 days ago
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 cursor-pointer">
                    <Link href={`/post/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 text-lg mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ai-avatar">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">AI Assistant</p>
                        <p className="text-sm text-gray-500">Powered by Gemini</p>
                      </div>
                    </div>
                    <Link href={`/post/${featuredPost.slug}`}>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                        Read More →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Posts"}
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            
            {!searchQuery && (
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Blog Grid */}
        {postsLoading || searchLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="blog-card">
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="ml-3 h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-4/5 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="ml-2 h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post: Post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery ? "No posts found" : "No posts available"}
            </h3>
            <p className="text-gray-500">
              {searchQuery ? "Try searching with different keywords" : "Check back later for new content"}
            </p>
          </div>
        )}

        {/* Load More Button */}
        {!searchQuery && displayPosts.length > 0 && displayPosts.length >= 9 && (
          <div className="text-center mt-12">
            <Button variant="secondary" size="lg">
              Load More Posts
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AI Blog</h3>
              <p className="text-gray-400">
                Powered by artificial intelligence, optimized for search engines, designed for readers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">SEO</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Marketing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">RSS Feed</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Site Map</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Subscribe</h4>
              <p className="text-gray-400 mb-4">Get AI-generated insights delivered weekly.</p>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 rounded-r-none bg-gray-800 border-gray-700 text-white"
                />
                <Button className="rounded-l-none">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Blog Platform. All rights reserved. Powered by Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
