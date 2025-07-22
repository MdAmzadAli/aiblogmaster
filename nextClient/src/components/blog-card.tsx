"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Eye } from "lucide-react"
import { formatDate, calculateReadingTime } from "@/lib/utils"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content?: string
  category: string
  featuredImage?: string
  publishedAt: string
  views?: number
  isAiGenerated?: boolean
}

interface BlogCardProps {
  post: BlogPost
  className?: string
  showImage?: boolean
  showExcerpt?: boolean
  showStats?: boolean
}

export default function BlogCard({ 
  post, 
  className = "",
  showImage = true,
  showExcerpt = true,
  showStats = true
}: BlogCardProps) {
  const readingTime = post.content ? calculateReadingTime(post.content) : 3

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${className}`}>
      {showImage && post.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {post.isAiGenerated && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                AI Generated
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="text-xs">{post.category}</Badge>
          {!showImage && post.isAiGenerated && (
            <Badge variant="outline" className="text-xs">
              AI Generated
            </Badge>
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
          <Link 
            href={`/post/${post.slug}`}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {post.title}
          </Link>
        </h3>
        
        {showExcerpt && (
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1" />
              {formatDate(post.publishedAt)}
            </div>
            
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {readingTime} min read
            </div>
            
            {showStats && post.views !== undefined && (
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {post.views} views
              </div>
            )}
          </div>
          
          <Link 
            href={`/post/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Read more →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}