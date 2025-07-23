import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Eye, User } from "lucide-react";
import { SEOHead } from "@/components/seo-head";
import { ArticleStructuredData, BreadcrumbStructuredData } from "@/components/structured-data";
import { SocialSharing } from "@/components/social-sharing";
import { ReadingProgress } from "@/components/reading-progress";
import { Breadcrumb } from "@/components/breadcrumb";
import { useViewTracker } from "@/hooks/use-view-tracker";
import type { Post as PostType } from "@shared/schema";

export default function Post() {
  const { slug } = useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["/api/posts", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <Skeleton className="w-full h-48 sm:h-64" />
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-2 sm:gap-0">
                <Skeleton className="h-5 sm:h-6 w-20 rounded-full" />
                <Skeleton className="sm:ml-4 h-3 sm:h-4 w-32" />
              </div>
              <Skeleton className="h-8 sm:h-10 w-full mb-3 sm:mb-4" />
              <Skeleton className="h-5 sm:h-6 w-3/4 mb-6 sm:mb-8" />
              
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-3 sm:mb-4">
                  <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-5/6 mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-4/5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Post Not Found</h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">The post you're looking for doesn't exist or has been moved.</p>
            <Button onClick={() => window.history.back()} className="w-full sm:w-auto">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const typedPost = post as PostType;
  const publishedDate = typedPost.publishedAt ? new Date(typedPost.publishedAt) : new Date();
  const readingTime = Math.ceil(typedPost.content.length / 1000); // Rough estimate

  // Track page view for analytics
  useViewTracker(typedPost.id, typedPost.slug);

  const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('seo')) return 'category-seo';
    if (lowerCategory.includes('ai')) return 'category-ai';
    if (lowerCategory.includes('analytics')) return 'category-analytics';
    if (lowerCategory.includes('marketing')) return 'category-marketing';
    return 'category-seo'; // default
  };

  const shareUrl = window.location.href;
  const shareTitle = typedPost.title;

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const postUrl = `${siteUrl}/post/${typedPost.slug}`;
  const imageUrl = typedPost.featuredImage || `${siteUrl}/og-default.jpg`;

  return (
    <div className="min-h-screen bg-gray-50">
      <ReadingProgress />
      <SEOHead
        title={typedPost.title.length > 55 ? typedPost.title.substring(0, 52) + '...' : typedPost.title}
        description={typedPost.metaDescription || typedPost.excerpt}
        keywords={typedPost.keywords || []}
        image={imageUrl}
        url={`/post/${typedPost.slug}`}
        canonicalUrl={postUrl}
        type="article"
        author={typedPost.isAiGenerated ? "AI Assistant" : "Human Author"}
        publishedTime={typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : 
                      typedPost.createdAt ? new Date(typedPost.createdAt).toISOString() : 
                      new Date().toISOString()}
        modifiedTime={typedPost.updatedAt ? new Date(typedPost.updatedAt).toISOString() : 
                     typedPost.createdAt ? new Date(typedPost.createdAt).toISOString() : 
                     new Date().toISOString()}
        section={typedPost.category}
        tags={typedPost.keywords || []}
      />
      <ArticleStructuredData
        title={typedPost.title}
        description={typedPost.metaDescription || typedPost.excerpt}
        url={postUrl}
        image={imageUrl}
        author={typedPost.isAiGenerated ? "AI Assistant" : "Human Author"}
        publishedDate={typedPost.publishedAt ? new Date(typedPost.publishedAt).toISOString() : 
                       typedPost.createdAt ? new Date(typedPost.createdAt).toISOString() : 
                       new Date().toISOString()}
        modifiedDate={typedPost.updatedAt ? new Date(typedPost.updatedAt).toISOString() : 
                      typedPost.createdAt ? new Date(typedPost.createdAt).toISOString() : 
                      new Date().toISOString()}
        keywords={typedPost.keywords || []}
        category={typedPost.category}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Blog", url: `${siteUrl}/#blog` },
          { name: typedPost.title, url: postUrl }
        ]}
      />
      <Navigation />
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <Breadcrumb
          items={[
            { name: "Blog", href: "/#blog" },
            { name: typedPost.category, href: `/?category=${typedPost.category.toLowerCase()}` },
            { name: typedPost.title, current: true }
          ]}
        />
      </div>
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Featured Image */}
          <div className="w-full h-48 sm:h-56 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{typedPost.title}</h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-blue-100">
                <Badge className={`category-badge ${getCategoryColor(typedPost.category)} text-xs sm:text-sm`}>
                  {typedPost.category}
                </Badge>
                <span className="flex items-center text-xs sm:text-sm">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Article Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 gap-4 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="ai-avatar">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {typedPost.isAiGenerated ? "AI Assistant" : "Human Author"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {typedPost.isAiGenerated ? "Powered by Gemini AI" : "Human Written"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-500">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">
                    {publishedDate.toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">{typedPost.totalViews || 0} views</span>
                </div>
                {typedPost.seoScore && (
                  <div className="flex items-center">
                    <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm">SEO: {typedPost.seoScore}/100</span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Sharing */}
            <div className="mb-6 sm:mb-8">
              <SocialSharing
                url={shareUrl}
                title={shareTitle}
                description={typedPost.metaDescription || typedPost.excerpt}
              />
            </div>

            {/* Article Excerpt */}
            <div className="mb-6 sm:mb-8">
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-light">
                {typedPost.excerpt}
              </p>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
              dangerouslySetInnerHTML={{ __html: typedPost.content }}
            />

            {/* Keywords */}
            {typedPost.keywords && typedPost.keywords.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {typedPost.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs sm:text-sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Score */}
            {typedPost.seoScore && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">SEO Score:</span>
                  <div className="flex items-center">
                    <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${typedPost.seoScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600">{typedPost.seoScore}/100</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back to Blog */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mr-4"
          >
            ← Back to Blog
          </Button>
          <Button onClick={() => window.location.href = '/'}>
            View All Posts
          </Button>
        </div>
      </article>
    </div>
  );
}
