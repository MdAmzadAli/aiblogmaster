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
import { SEOHead } from "@/components/seo-head";
import { WebsiteStructuredData } from "@/components/structured-data";
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
      <SEOHead
        title="AI Blog Platform - Smart SEO Content Generation"
        description="Transform your content strategy with AI-powered blog automation. Generate SEO-optimized articles, track performance analytics, and boost your search rankings with our intelligent content platform designed for modern marketers and content creators. Get started today!"
        keywords={["AI blog", "SEO optimization", "content generation", "automated blogging", "artificial intelligence", "content marketing", "blog automation", "SEO tools"]}
        url={typeof window !== 'undefined' && window.location.pathname === '/blog' ? "/blog" : "/"}
        canonicalUrl={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname === '/blog' ? '/blog' : '/'}` : undefined}
        type="website"
      />
      <WebsiteStructuredData
        siteName="AI Blog Platform"
        siteUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        description="AI-powered blog platform with automated SEO optimization and content generation"
      />
      <Navigation />
      
      {!searchQuery && <HeroSection />}
      
      {/* Featured Post Section */}
      {!searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {featuredLoading ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2">
                  <Skeleton className="w-full h-48 sm:h-64 lg:h-full" />
                </div>
                <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="sm:ml-3 h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 sm:h-8 w-full mb-4" />
                  <Skeleton className="h-4 sm:h-6 w-full mb-2" />
                  <Skeleton className="h-4 sm:h-6 w-3/4 mb-4 sm:mb-6" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-3 sm:h-4 w-20 mb-1" />
                        <Skeleton className="h-2 sm:h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
                  </div>
                </div>
              </div>
            </div>
          ) : featuredPost ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
                    alt="AI-powered content creation workspace with analytics and SEO optimization tools"
                    loading="eager"
                    decoding="async" 
                    className="w-full h-48 sm:h-64 lg:h-full object-cover"
                  />
                </div>
                <div className="lg:w-1/2 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
                    <span className="category-badge category-featured">Featured</span>
                    <span className="sm:ml-3 text-gray-500 text-xs sm:text-sm flex items-center">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      5 min read • 2 days ago
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 hover:text-blue-600 cursor-pointer leading-tight">
                    <Link href={`/post/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <div className="ai-avatar">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">AI Assistant</p>
                        <p className="text-xs sm:text-sm text-gray-500">Powered by Gemini</p>
                      </div>
                    </div>
                    <Link href={`/post/${featuredPost.slug}`}>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-800 text-sm sm:text-base w-full sm:w-auto">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="text-center lg:text-left">
            {!searchQuery && !featuredPost && (
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Latest AI-Generated Content
              </h1>
            )}
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-700">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Discover Our Latest SEO-Optimized Articles"}
            </h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
            
            {/* Category Filters */}
            {!searchQuery && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="text-xs sm:text-sm"
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Blog Grid */}
        <div id="latest-posts">
          {postsLoading || searchLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="blog-card">
                  <Skeleton className="w-full h-40 sm:h-48" />
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-2 sm:gap-0">
                      <Skeleton className="h-4 sm:h-5 w-16 rounded-full" />
                      <Skeleton className="sm:ml-3 h-3 sm:h-4 w-20" />
                    </div>
                    <Skeleton className="h-5 sm:h-6 w-full mb-2" />
                    <Skeleton className="h-5 sm:h-6 w-4/5 mb-3 sm:mb-4" />
                    <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-3/4 mb-3 sm:mb-4" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="flex items-center">
                        <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                        <Skeleton className="ml-2 h-3 sm:h-4 w-16" />
                      </div>
                      <Skeleton className="h-3 sm:h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {displayPosts.map((post: Post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                {searchQuery ? "No posts found" : "No posts available"}
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {searchQuery ? "Try searching with different keywords" : "Check back later for new content"}
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {!searchQuery && displayPosts.length > 0 && displayPosts.length >= 9 && (
          <div className="text-center mt-8 sm:mt-12">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Load More Posts
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">AI Blog</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Powered by artificial intelligence, optimized for search engines, designed for readers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Categories</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">SEO</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Marketing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">RSS Feed</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Site Map</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Subscribe</h4>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">Get AI-generated insights delivered weekly.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 bg-gray-800 border-gray-700 text-white text-sm sm:text-base sm:rounded-r-none"
                />
                <Button className="sm:rounded-l-none text-sm sm:text-base">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2024 AI Blog Platform. All rights reserved. Powered by Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
