import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { blogScheduler } from "./services/scheduler";
import { 
  generateBlogPost, 
  analyzeSEO, 
  generateSEOSuggestions,
  createOptimizedPost 
} from "./services/gemini";
import { insertPostSchema, insertAutomationSettingsSchema } from "@shared/schema";
import { registerSitemapRoutes } from "./routes/sitemap";
import { generatePostSSR, generateHomeSSR } from "./ssr";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication
  await setupAuth(app);

  // Initialize automated posting scheduler
  await blogScheduler.initializeScheduler();

  // Register SEO routes (sitemap, robots.txt)
  registerSitemapRoutes(app);

  // Server-side rendering for SEO (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.get('/post/:slug', async (req, res, next) => {
      try {
        const { slug } = req.params;
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const ssrHtml = await generatePostSSR(slug, baseUrl);
        
        if (ssrHtml) {
          res.setHeader('Content-Type', 'text/html');
          res.send(ssrHtml);
        } else {
          // Fall back to SPA routing
          next();
        }
      } catch (error) {
        console.error('SSR error:', error);
        next();
      }
    });

    app.get('/', async (req, res, next) => {
      try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const ssrHtml = await generateHomeSSR(baseUrl);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(ssrHtml);
      } catch (error) {
        console.error('SSR error:', error);
        next();
      }
    });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Public blog routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { limit, category } = req.query;
      const posts = await storage.getPublishedPosts(Number(limit) || 10);
      
      let filteredPosts = posts;
      if (category && category !== "all") {
        filteredPosts = posts.filter(post => 
          post.category.toLowerCase() === String(category).toLowerCase()
        );
      }
      
      res.json(filteredPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/featured", async (req, res) => {
    try {
      const featuredPost = await storage.getFeaturedPost();
      res.json(featuredPost);
    } catch (error) {
      console.error("Error fetching featured post:", error);
      res.status(500).json({ message: "Failed to fetch featured post" });
    }
  });

  // View tracking route
  app.post("/api/posts/:slug/view", async (req, res) => {
    try {
      const { slug } = req.params;
      const { postId } = req.body;
      
      if (!postId) {
        return res.status(400).json({ message: "Post ID is required" });
      }
      
      await storage.incrementPostViews(postId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      const query = String(q || "").toLowerCase();
      
      if (!query || query.length < 3) {
        return res.json([]);
      }
      
      const posts = await storage.getPublishedPosts(50);
      const searchResults = posts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        (post.keywords && post.keywords.some(keyword => 
          keyword.toLowerCase().includes(query)
        ))
      );
      
      res.json(searchResults.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ message: "Failed to search posts" });
    }
  });

  app.get("/api/posts/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Record view for published posts
      if (post.status === "published") {
        await storage.recordPostView(post.id, true); // Simplified - assume all views are unique for now
      }

      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Protected admin routes  
  app.get("/api/admin/posts", async (req, res) => {
    try {
      const { status, limit } = req.query;
      const posts = await storage.getPosts(Number(limit) || 50, String(status) || undefined);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.get("/api/admin/posts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/admin/posts", async (req, res) => {
    try {
      const generateSlug = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      };

      const validatedData = insertPostSchema.parse(req.body);
      
      // Auto-generate slug if not provided
      if (!validatedData.slug && validatedData.title) {
        validatedData.slug = generateSlug(validatedData.title);
      }
      
      // Ensure database constraints are respected
      if (validatedData.metaDescription && validatedData.metaDescription.length > 160) {
        validatedData.metaDescription = validatedData.metaDescription.substring(0, 157) + "...";
      }
      
      const post = await storage.createPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/admin/posts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const validatedData = insertPostSchema.partial().parse(req.body);
      
      // Ensure database constraints are respected
      if (validatedData.metaDescription && validatedData.metaDescription.length > 160) {
        validatedData.metaDescription = validatedData.metaDescription.substring(0, 157) + "...";
      }
      
      // Set publishedAt when publishing
      if (validatedData.status === "published" && !validatedData.publishedAt) {
        validatedData.publishedAt = new Date();
      }
      
      const post = await storage.updatePost(id, validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/admin/posts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deletePost(id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // AI content generation routes
  app.post("/api/admin/generate-post", async (req, res) => {
    try {
      const { keywords, contentType, wordCount, category } = req.body;
      
      const post = await createOptimizedPost(
        keywords || [],
        contentType || "how-to",
        wordCount || 1200,
        category || "general"
      );
      
      // Create as draft for immediate editing/approval
      const createdPost = await storage.createPost({
        ...post,
        status: "draft"
      });
      
      res.json(createdPost);
    } catch (error: any) {
      console.error("Error generating post:", error);
      
      // Provide specific error messages for different types of failures
      if (error.message.includes('quota exceeded')) {
        return res.status(429).json({ 
          message: "AI service quota exceeded. Please try again later or check your billing settings.",
          type: "quota_exceeded"
        });
      }
      
      if (error.message.includes('Authentication') || error.message.includes('API key')) {
        return res.status(401).json({ 
          message: "AI service authentication failed. Please check your API configuration.",
          type: "auth_error"
        });
      }
      
      res.status(500).json({ 
        message: error.message || "Failed to generate post. Please try again.",
        type: "generation_error"
      });
    }
  });

  app.post("/api/admin/analyze-seo", async (req, res) => {
    try {
      const { title, content, metaDescription, keywords } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required" });
      }
      
      const analysis = await analyzeSEO(title, content, metaDescription, keywords || []);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing SEO:", error);
      res.status(500).json({ message: "Failed to analyze SEO" });
    }
  });

  app.post("/api/admin/seo-suggestions", async (req, res) => {
    try {
      const { content, keywords } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const suggestions = await generateSEOSuggestions(content, keywords || []);
      res.json({ suggestions });
    } catch (error) {
      console.error("Error generating SEO suggestions:", error);
      res.status(500).json({ message: "Failed to generate SEO suggestions" });
    }
  });

  // Analytics routes
  app.get("/api/admin/analytics/summary", async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/analytics/posts/:id", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const analytics = await storage.getPostAnalytics(postId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching post analytics:", error);
      res.status(500).json({ message: "Failed to fetch post analytics" });
    }
  });

  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalyticsSummary();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Automation settings routes
  app.get("/api/admin/automation", async (req, res) => {
    try {
      const settings = await storage.getAutomationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching automation settings:", error);
      res.status(500).json({ message: "Failed to fetch automation settings" });
    }
  });

  app.put("/api/admin/automation", async (req, res) => {
    try {
      const validatedData = insertAutomationSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateAutomationSettings(validatedData);
      
      // Update scheduler with new settings
      await blogScheduler.updateSchedule(settings);
      
      res.json(settings);
    } catch (error) {
      console.error("Error updating automation settings:", error);
      res.status(500).json({ message: "Failed to update automation settings" });
    }
  });

  // Email approval routes
  app.get("/api/admin/approve/:id", async (req, res) => {
    try {
      const postId = Number(req.params.id);
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ message: "Approval token required" });
      }

      // Use approval service to validate and approve
      const { approveAndPublishPost } = await import('./services/approvalService');
      const post = await approveAndPublishPost(postId, String(token));
      
      if (!post) {
        return res.status(404).json({ message: "Post not found or token invalid" });
      }

      // Redirect to admin with success message
      res.redirect('/admin/posts?approved=true');
    } catch (error) {
      console.error("Error approving post:", error);
      res.status(500).json({ message: "Failed to approve post" });
    }
  });

  // Manual trigger for testing automation
  app.post("/api/admin/trigger-automation", async (req, res) => {
    try {
      const settings = await storage.getAutomationSettings();
      if (!settings || !settings.isEnabled) {
        return res.status(400).json({ message: "Automation not enabled" });
      }

      // Import scheduler methods
      const { blogScheduler } = await import('./services/scheduler');
      
      // Manually trigger post generation
      await blogScheduler.generateAndSchedulePost(settings);
      
      res.json({ message: "Automated post generation triggered successfully" });
    } catch (error) {
      console.error("Error triggering automation:", error);
      res.status(500).json({ message: "Failed to trigger automation" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.json([]);
      }
      
      const posts = await storage.getPublishedPosts(50);
      const searchTerm = String(q).toLowerCase();
      
      const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        (post.keywords && post.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm)
        ))
      );
      
      res.json(filteredPosts);
    } catch (error) {
      console.error("Error searching posts:", error);
      res.status(500).json({ message: "Failed to search posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
