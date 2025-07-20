import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import type { Post } from "@shared/schema";

interface BlogCardProps {
  post: Post;
  compact?: boolean;
}

export default function BlogCard({ post, compact = false }: BlogCardProps) {
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date();
  const readingTime = Math.ceil(post.content.length / 1000); // Rough estimate

  const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('seo')) return 'category-seo';
    if (lowerCategory.includes('ai')) return 'category-ai';
    if (lowerCategory.includes('analytics')) return 'category-analytics';
    if (lowerCategory.includes('marketing')) return 'category-marketing';
    return 'category-seo'; // default
  };

  const getImageUrl = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('seo')) {
      return "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
    }
    if (lowerCategory.includes('analytics')) {
      return "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
    }
    if (lowerCategory.includes('ai')) {
      return "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
    }
    // Default marketing/business image
    return "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250";
  };

  return (
    <article className={`blog-card ${compact ? 'h-fit' : ''}`}>
      <img 
        src={post.featuredImage || getImageUrl(post.category)} 
        alt={post.title}
        className={`w-full ${compact ? 'h-32' : 'h-48'} object-cover`}
      />
      <div className={`${compact ? 'p-4' : 'p-6'}`}>
        <div className="flex items-center mb-3">
          <Badge className={`category-badge ${getCategoryColor(post.category)}`}>
            {post.category}
          </Badge>
          <span className={`ml-3 text-gray-500 ${compact ? 'text-xs' : 'text-sm'} flex items-center`}>
            <Clock className="w-3 h-3 mr-1" />
            {readingTime} min read
          </span>
        </div>
        
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer line-clamp-2`}>
          <Link href={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        
        <p className={`text-gray-600 mb-4 ${compact ? 'text-sm line-clamp-2' : 'line-clamp-3'}`}>
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="ai-avatar">
              <User className="w-4 h-4" />
            </div>
            <div className="ml-2">
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
                {post.isAiGenerated ? "AI Writer" : "Human Author"}
              </span>
            </div>
          </div>
          <div className="flex items-center text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span className={`${compact ? 'text-xs' : 'text-sm'}`}>
              {publishedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {!compact && (
          <div className="mt-4">
            <Link href={`/post/${post.slug}`}>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800 p-0">
                Read More →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
