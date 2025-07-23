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
        className={`w-full ${compact ? 'h-24 sm:h-32' : 'h-40 sm:h-48'} object-cover`}
      />
      <div className={`${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center mb-3 gap-2 sm:gap-0">
          <Badge className={`category-badge ${getCategoryColor(post.category)} text-xs sm:text-sm w-fit`}>
            {post.category}
          </Badge>
          <span className={`sm:ml-3 text-gray-500 ${compact ? 'text-xs' : 'text-xs sm:text-sm'} flex items-center`}>
            <Clock className="w-3 h-3 mr-1" />
            {readingTime} min read
          </span>
        </div>
        
        <h3 className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} font-semibold text-gray-900 mb-2 sm:mb-3 hover:text-blue-600 cursor-pointer line-clamp-2 leading-tight`}>
          <Link href={`/post/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        
        <p className={`text-gray-600 mb-3 sm:mb-4 ${compact ? 'text-xs sm:text-sm line-clamp-2' : 'text-sm sm:text-base line-clamp-3'} leading-relaxed`}>
          {post.excerpt}
        </p>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex items-center">
            <div className="ai-avatar">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
            <div className="ml-2">
              <span className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} text-gray-500`}>
                {post.isAiGenerated ? "AI Writer" : "Human Author"}
              </span>
            </div>
          </div>
          <div className="flex items-center text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
              {publishedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {!compact && (
          <div className="mt-3 sm:mt-4">
            <Link href={`/post/${post.slug}`}>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800 p-0 text-sm sm:text-base">
                Read More →
              </Button>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
