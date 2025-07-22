"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Search, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  TrendingUp,
  Target,
  Eye,
  Hash
} from "lucide-react"

interface SEOAnalysis {
  score: number
  title: {
    length: number
    optimal: boolean
    suggestion?: string
  }
  description: {
    length: number
    optimal: boolean
    suggestion?: string
  }
  keywords: {
    density: number
    primary: string[]
    suggestions: string[]
  }
  readability: {
    score: number
    grade: string
    suggestions: string[]
  }
  structure: {
    headings: boolean
    paragraphs: boolean
    links: boolean
  }
}

interface SEOAssistantProps {
  title: string
  content: string
  metaDescription: string
  keywords: string[]
  onSuggestionApply?: (field: string, value: string) => void
}

export default function SEOAssistant({
  title,
  content,
  metaDescription,
  keywords,
  onSuggestionApply
}: SEOAssistantProps) {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeContent = () => {
    setIsAnalyzing(true)
    
    // Simulate analysis delay
    setTimeout(() => {
      const wordCount = content.split(/\s+/).length
      const primaryKeyword = keywords[0] || ''
      const keywordDensity = primaryKeyword ? 
        (content.toLowerCase().split(primaryKeyword.toLowerCase()).length - 1) / wordCount * 100 : 0

      const hasHeadings = /#{1,6}\s/.test(content) || /<h[1-6]/.test(content)
      const hasParagraphs = content.split('\n\n').length > 1
      const hasLinks = /\[.*?\]\(.*?\)/.test(content) || /<a\s/.test(content)

      const titleScore = title.length >= 30 && title.length <= 60 ? 100 : 
        title.length < 30 ? 60 : 40
      const descriptionScore = metaDescription.length >= 120 && metaDescription.length <= 160 ? 100 :
        metaDescription.length < 120 ? 70 : 50
      const keywordScore = keywordDensity >= 1 && keywordDensity <= 3 ? 100 : 60
      const structureScore = (hasHeadings ? 33 : 0) + (hasParagraphs ? 33 : 0) + (hasLinks ? 34 : 0)
      
      const overallScore = Math.round((titleScore + descriptionScore + keywordScore + structureScore) / 4)

      setAnalysis({
        score: overallScore,
        title: {
          length: title.length,
          optimal: title.length >= 30 && title.length <= 60,
          suggestion: title.length < 30 ? 'Consider making your title longer (30-60 characters)' :
            title.length > 60 ? 'Consider making your title shorter (30-60 characters)' : undefined
        },
        description: {
          length: metaDescription.length,
          optimal: metaDescription.length >= 120 && metaDescription.length <= 160,
          suggestion: metaDescription.length < 120 ? 'Add more detail to your meta description (120-160 characters)' :
            metaDescription.length > 160 ? 'Shorten your meta description (120-160 characters)' : undefined
        },
        keywords: {
          density: keywordDensity,
          primary: keywords,
          suggestions: [
            'AI blog automation',
            'Content generation tools',
            'SEO optimization',
            'Automated publishing'
          ]
        },
        readability: {
          score: 75,
          grade: 'B',
          suggestions: [
            'Use shorter sentences for better readability',
            'Add more subheadings to break up content',
            'Include bullet points or numbered lists'
          ]
        },
        structure: {
          headings: hasHeadings,
          paragraphs: hasParagraphs,
          links: hasLinks
        }
      })
      
      setIsAnalyzing(false)
    }, 1500)
  }

  useEffect(() => {
    if (title && content) {
      analyzeContent()
    }
  }, [title, content, metaDescription, keywords])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: 'default' as const, text: 'Excellent' }
    if (score >= 60) return { variant: 'secondary' as const, text: 'Good' }
    return { variant: 'destructive' as const, text: 'Needs Work' }
  }

  const getStatusIcon = (optimal: boolean) => {
    return optimal ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-yellow-600" />
    )
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 animate-spin" />
            SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Analyzing your content...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            SEO Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Add content to see SEO analysis</p>
            <Button onClick={analyzeContent} className="mt-4">
              Analyze Content
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const scoreBadge = getScoreBadge(analysis.score)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            SEO Analysis
          </div>
          <Badge variant={scoreBadge.variant}>
            {scoreBadge.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}/100
          </div>
          <Progress value={analysis.score} className="mt-2" />
          <p className="text-sm text-gray-500 mt-2">Overall SEO Score</p>
        </div>

        {/* Title Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              <span className="font-medium">Title</span>
              {getStatusIcon(analysis.title.optimal)}
            </div>
            <span className="text-sm text-gray-500">
              {analysis.title.length}/60 characters
            </span>
          </div>
          {analysis.title.suggestion && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              {analysis.title.suggestion}
            </p>
          )}
        </div>

        {/* Meta Description Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              <span className="font-medium">Meta Description</span>
              {getStatusIcon(analysis.description.optimal)}
            </div>
            <span className="text-sm text-gray-500">
              {analysis.description.length}/160 characters
            </span>
          </div>
          {analysis.description.suggestion && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              {analysis.description.suggestion}
            </p>
          )}
        </div>

        {/* Keywords Analysis */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2" />
            <span className="font-medium">Keyword Density</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Primary keywords</span>
            <span className="text-sm font-medium">
              {analysis.keywords.density.toFixed(1)}%
            </span>
          </div>
          {analysis.keywords.density < 1 && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              Consider using your target keywords more frequently (1-3% density is optimal)
            </p>
          )}
        </div>

        {/* Content Structure */}
        <div className="space-y-2">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            <span className="font-medium">Content Structure</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Headings</span>
              {analysis.structure.headings ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Paragraphs</span>
              {analysis.structure.paragraphs ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Links</span>
              {analysis.structure.links ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Keyword Suggestions */}
        {analysis.keywords.suggestions.length > 0 && (
          <div className="space-y-2">
            <span className="font-medium text-sm">Keyword Suggestions</span>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.suggestions.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => onSuggestionApply?.('keywords', keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <Button 
          onClick={analyzeContent} 
          className="w-full mt-4"
          variant="outline"
        >
          Re-analyze Content
        </Button>
      </CardContent>
    </Card>
  )
}