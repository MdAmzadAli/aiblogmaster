import { GoogleGenAI } from "@google/genai";
import type { InsertPost } from "@shared/schema";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  seoScore: number;
}

export interface SEOAnalysis {
  score: number;
  suggestions: string[];
  optimizedTitle?: string;
  optimizedMetaDescription?: string;
  recommendedKeywords: string[];
}

export async function generateBlogPost(
  targetKeywords: string[] = [],
  contentType: string = "how-to",
  wordCount: number = 1200,
  category: string = "general"
): Promise<GeneratedContent> {
  try {
    const keywordPrompt = targetKeywords.length > 0 
      ? `Target keywords: ${targetKeywords.join(", ")}`
      : "Choose relevant SEO keywords";

    const prompt = `You are an expert SEO content writer. Create a high-quality, SEO-optimized blog post with the following requirements:

${keywordPrompt}
Content Type: ${contentType}
Target Word Count: ${wordCount} words
Category: ${category}

The blog post should:
1. Have an engaging, SEO-friendly title (under 60 characters)
2. Include a compelling meta description (under 160 characters)
3. Be well-structured with proper headings (H1, H2, H3)
4. Naturally incorporate target keywords
5. Provide genuine value to readers
6. Include actionable advice and insights
7. Be original and engaging

Respond with JSON in this exact format:
{
  "title": "SEO-optimized title",
  "content": "Full article content with proper HTML formatting",
  "excerpt": "Brief summary (150-200 characters)",
  "metaDescription": "SEO meta description (under 160 characters)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "${category}",
  "seoScore": 85
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
            excerpt: { type: "string" },
            metaDescription: { type: "string" },
            keywords: {
              type: "array",
              items: { type: "string" }
            },
            category: { type: "string" },
            seoScore: { type: "number" }
          },
          required: ["title", "content", "excerpt", "metaDescription", "keywords", "category", "seoScore"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const generatedContent: GeneratedContent = JSON.parse(rawJson);
    
    // Validate and ensure proper formatting
    if (!generatedContent.title || !generatedContent.content) {
      throw new Error("Invalid response structure from Gemini");
    }

    // Ensure meta description doesn't exceed database limit (160 characters)
    if (generatedContent.metaDescription && generatedContent.metaDescription.length > 160) {
      generatedContent.metaDescription = generatedContent.metaDescription.substring(0, 157) + "...";
    }

    // Ensure title doesn't exceed reasonable SEO limits (60 characters)
    if (generatedContent.title && generatedContent.title.length > 60) {
      generatedContent.title = generatedContent.title.substring(0, 57) + "...";
    }

    // Ensure excerpt is reasonable length
    if (generatedContent.excerpt && generatedContent.excerpt.length > 300) {
      generatedContent.excerpt = generatedContent.excerpt.substring(0, 297) + "...";
    }

    return generatedContent;
  } catch (error: any) {
    console.error("Error generating blog post:", error);
    
    // Check for quota exceeded error
    if (error.status === 429 || (error.message && error.message.includes('quota'))) {
      throw new Error("Gemini API quota exceeded. Please check your billing details or try again later.");
    }
    
    // Check for other API errors
    if (error.status >= 400 && error.status < 500) {
      throw new Error(`Gemini API error: ${error.message || 'Authentication or request error'}`);
    }
    
    throw new Error(`Failed to generate blog post: ${error.message || error}`);
  }
}

export async function analyzeSEO(
  title: string,
  content: string,
  metaDescription?: string,
  targetKeywords: string[] = []
): Promise<SEOAnalysis> {
  try {
    const prompt = `You are an SEO expert. Analyze the following blog post content and provide detailed SEO recommendations:

Title: ${title}
Meta Description: ${metaDescription || "Not provided"}
Target Keywords: ${targetKeywords.join(", ") || "None specified"}
Content: ${content.substring(0, 2000)}...

Analyze for:
1. Title optimization (length, keyword usage, engagement)
2. Meta description quality
3. Keyword density and placement
4. Content structure and readability
5. Internal linking opportunities
6. Overall SEO score (0-100)

Provide specific, actionable suggestions for improvement.

Respond with JSON in this format:
{
  "score": 85,
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "optimizedTitle": "Improved title if needed",
  "optimizedMetaDescription": "Improved meta description if needed",
  "recommendedKeywords": ["keyword1", "keyword2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            suggestions: {
              type: "array",
              items: { type: "string" }
            },
            optimizedTitle: { type: "string" },
            optimizedMetaDescription: { type: "string" },
            recommendedKeywords: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["score", "suggestions", "recommendedKeywords"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const analysis: SEOAnalysis = JSON.parse(rawJson);
    
    // Ensure optimized meta description doesn't exceed database limit
    if (analysis.optimizedMetaDescription && analysis.optimizedMetaDescription.length > 160) {
      analysis.optimizedMetaDescription = analysis.optimizedMetaDescription.substring(0, 157) + "...";
    }
    
    // Ensure optimized title doesn't exceed reasonable SEO limits
    if (analysis.optimizedTitle && analysis.optimizedTitle.length > 60) {
      analysis.optimizedTitle = analysis.optimizedTitle.substring(0, 57) + "...";
    }

    return analysis;
  } catch (error: any) {
    console.error("Error analyzing SEO:", error);
    
    // Check for quota exceeded error
    if (error.status === 429 || (error.message && error.message.includes('quota'))) {
      throw new Error("Gemini API quota exceeded. Please check your billing details or try again later.");
    }
    
    // Check for other API errors
    if (error.status >= 400 && error.status < 500) {
      throw new Error(`Gemini API error: ${error.message || 'Authentication or request error'}`);
    }
    
    throw new Error(`Failed to analyze SEO: ${error.message || error}`);
  }
}

export async function generateSEOSuggestions(
  content: string,
  targetKeywords: string[] = []
): Promise<string[]> {
  try {
    const prompt = `As an SEO copywriting assistant, analyze this content and provide 5-10 specific suggestions to improve SEO performance:

Content: ${content.substring(0, 1500)}...
Target Keywords: ${targetKeywords.join(", ") || "None specified"}

Focus on:
- Keyword optimization
- Content structure improvements
- Meta tag recommendations
- Internal linking opportunities
- Readability enhancements

Provide specific, actionable suggestions in JSON format:
{
  "suggestions": ["Suggestion 1", "Suggestion 2", ...]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["suggestions"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const result = JSON.parse(rawJson);
    return result.suggestions || [];
  } catch (error: any) {
    console.error("Error generating SEO suggestions:", error);
    
    // Check for quota exceeded error
    if (error.status === 429 || (error.message && error.message.includes('quota'))) {
      throw new Error("Gemini API quota exceeded. Please check your billing details or try again later.");
    }
    
    // Check for other API errors
    if (error.status >= 400 && error.status < 500) {
      throw new Error(`Gemini API error: ${error.message || 'Authentication or request error'}`);
    }
    
    throw new Error(`Failed to generate SEO suggestions: ${error.message || error}`);
  }
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createOptimizedPost(
  targetKeywords: string[] = [],
  contentType: string = "how-to",
  wordCount: number = 1200,
  category: string = "general"
): Promise<InsertPost> {
  const generatedContent = await generateBlogPost(targetKeywords, contentType, wordCount, category);
  
  return {
    title: generatedContent.title,
    slug: createSlug(generatedContent.title),
    content: generatedContent.content,
    excerpt: generatedContent.excerpt,
    metaDescription: generatedContent.metaDescription,
    keywords: generatedContent.keywords,
    category: generatedContent.category,
    status: "draft",
    isAiGenerated: true,
    seoScore: generatedContent.seoScore,
  };
}
