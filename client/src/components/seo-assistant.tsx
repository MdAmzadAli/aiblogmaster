import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Sparkles,
  TrendingUp,
  Eye,
  Target
} from "lucide-react";

interface SEOAnalysis {
  score: number;
  suggestions: string[];
  optimizedTitle?: string;
  optimizedMetaDescription?: string;
  recommendedKeywords: string[];
}

export default function SEOAssistant() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const analyzeSEOMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/analyze-seo", data);
      return response.json();
    },
    onSuccess: (data: SEOAnalysis) => {
      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "SEO analysis has been completed successfully.",
      });
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
        description: "Failed to analyze SEO. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getSEOSuggestionsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/seo-suggestions", data);
      return response.json();
    },
    onSuccess: (data: { suggestions: string[] }) => {
      setAnalysis(prev => prev ? {
        ...prev,
        suggestions: data.suggestions
      } : {
        score: 0,
        suggestions: data.suggestions,
        recommendedKeywords: []
      });
      toast({
        title: "Suggestions Generated",
        description: "AI-powered SEO suggestions are ready.",
      });
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
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!title || !content) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content for analysis.",
        variant: "destructive",
      });
      return;
    }

    analyzeSEOMutation.mutate({
      title,
      content,
      metaDescription,
      keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
    });
  };

  const handleGetSuggestions = () => {
    if (!content) {
      toast({
        title: "Missing Content",
        description: "Please provide content to get SEO suggestions.",
        variant: "destructive",
      });
      return;
    }

    getSEOSuggestionsMutation.mutate({
      content,
      keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Search className="w-5 h-5 mr-2" />
          SEO Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              placeholder="Enter post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <Textarea
              placeholder="Paste your content here..."
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description (Optional)
            </label>
            <Textarea
              placeholder="Meta description..."
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Keywords (Optional)
            </label>
            <Input
              placeholder="keyword1, keyword2, keyword3..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleAnalyze}
            disabled={analyzeSEOMutation.isPending || !title || !content}
            className="flex-1"
          >
            {analyzeSEOMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-2" />
                Analyze SEO
              </>
            )}
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleGetSuggestions}
            disabled={getSEOSuggestionsMutation.isPending || !content}
          >
            {getSEOSuggestionsMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Suggestions
              </>
            )}
          </Button>
        </div>

        {/* SEO Analysis Results */}
        {analysis && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* SEO Score */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  {getScoreIcon(analysis.score)}
                  <span className="ml-2">SEO Score</span>
                </span>
                <span className={`text-sm font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}/100
                </span>
              </div>
              <Progress value={analysis.score} className="h-2" />
            </div>

            {/* Optimized Suggestions */}
            {(analysis.optimizedTitle || analysis.optimizedMetaDescription) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">AI Optimizations:</h4>
                {analysis.optimizedTitle && (
                  <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-xs text-blue-700 font-medium">Optimized Title:</p>
                    <p className="text-sm text-blue-800">{analysis.optimizedTitle}</p>
                  </div>
                )}
                {analysis.optimizedMetaDescription && (
                  <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <p className="text-xs text-green-700 font-medium">Optimized Meta Description:</p>
                    <p className="text-sm text-green-800">{analysis.optimizedMetaDescription}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recommended Keywords */}
            {analysis.recommendedKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recommended Keywords:</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.recommendedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">SEO Suggestions:</h4>
                <div className="space-y-2">
                  {analysis.suggestions.slice(0, 5).map((suggestion, index) => {
                    const isPositive = suggestion.toLowerCase().includes('good') || suggestion.toLowerCase().includes('optimized');
                    const isWarning = suggestion.toLowerCase().includes('improve') || suggestion.toLowerCase().includes('consider');
                    
                    return (
                      <div key={index} className="flex items-start text-sm">
                        {isPositive ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        ) : isWarning ? (
                          <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-gray-700">{suggestion}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default SEO Tips */}
        {!analysis && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Quick SEO Tips:</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                <span className="text-gray-700">Keep titles under 60 characters</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                <span className="text-gray-700">Meta descriptions under 160 characters</span>
              </div>
              <div className="flex items-center text-sm">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-gray-700">Use target keywords naturally</span>
              </div>
              <div className="flex items-center text-sm">
                <Eye className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-gray-700">Include internal and external links</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4 text-blue-600 hover:text-blue-800"
              disabled={!content}
              onClick={handleGetSuggestions}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI-Powered Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
