import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve Next.js build files and static assets
  app.use('/_next', express.static('.next'));
  app.use('/static', express.static('public'));
  
  // For development, we'll serve the React SPA as fallback for admin routes
  // but prioritize Next.js pages for public routes
  if (app.get("env") === "development") {
    // Serve Next.js dev server or static files for public routes
    app.use('/admin*', async (req, res, next) => {
      // Admin routes use the React SPA
      await setupVite(app, server);
      next();
    });
    
    // All other routes should be handled by Next.js
    app.get('*', (req, res) => {
      // In development, we'll proxy to Next.js dev server
      // For now, serve a basic optimized HTML for testing
      const optimizedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Blog Platform - Automated Content Generation & SEO Insights</title>
  <meta name="description" content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies. Stay ahead with our AI-powered blog platform.">
  <meta name="keywords" content="AI blog, automated content, SEO optimization, machine learning, artificial intelligence">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Open Graph -->
  <meta property="og:title" content="AI Blog Platform - Automated Content Generation & SEO Insights">
  <meta property="og:description" content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="AI Blog Platform - Automated Content Generation & SEO Insights">
  <meta name="twitter:description" content="Discover cutting-edge AI insights, automated content generation tutorials, and SEO optimization strategies.">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Blog Platform",
    "url": "${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'}",
    "description": "AI-powered blog platform with automated content generation and SEO optimization"
  }
  </script>
  
  <!-- Critical CSS -->
  <style>
    body { font-family: Inter, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .hero { text-align: center; padding: 4rem 0; }
    .title { font-size: 3rem; font-weight: 700; margin-bottom: 1rem; }
    .subtitle { font-size: 1.25rem; color: #666; margin-bottom: 2rem; }
    .cta { background: #2563eb; color: white; padding: 1rem 2rem; border: none; border-radius: 0.5rem; font-size: 1.1rem; cursor: pointer; }
  </style>
  
  <!-- Non-critical CSS -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
  
  <!-- Performance headers -->
  <meta http-equiv="Cache-Control" content="public, max-age=31536000">
  
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1 class="title">AI-Powered Content Creation</h1>
      <p class="subtitle">Discover the future of content generation with our AI-driven blog platform</p>
      <button class="cta" onclick="window.location.href='/admin'">Get Started</button>
    </div>
  </div>
  
  <!-- Deferred scripts -->
  <script defer>
    // Basic analytics and performance tracking
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>
</body>
</html>`;
      
      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN'
      });
      res.send(optimizedHtml);
    });
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
