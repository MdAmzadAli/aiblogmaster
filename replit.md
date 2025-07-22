# AI Blog Platform

## Overview

This is a full-stack AI-powered blog platform built with React, Express.js, and PostgreSQL. The application features automated content generation using Google's Gemini AI, SEO optimization tools, and comprehensive analytics. The platform includes both a public blog interface and an admin dashboard for content management and automation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with separate client and server directories, sharing common types and schemas through a shared directory. The architecture is designed for scalability and maintainability with clear separation between frontend, backend, and shared utilities.

### Directory Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript schemas and types
- `/migrations` - Database migration files

## Key Components

### Frontend Architecture
- **Framework**: Next.js 14 with React 18 and TypeScript (Pages Router for maximum SEO control)
- **Rendering**: Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
- **Server-Side Rendering**: getServerSideProps for dynamic content like blog listings
- **Static Generation**: getStaticProps with revalidation for posts and categories
- **State Management**: TanStack Query (React Query) for client-side state and API calls
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **Image Optimization**: Next.js Image component with WebP/AVIF formats and responsive sizing
- **SEO**: Comprehensive SEO with JSON-LD structured data, Open Graph, Twitter Cards
- **Performance**: Core Web Vitals optimization with preloading and caching strategies
- **PWA**: Progressive Web App features with manifest and service worker support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit OIDC authentication with Passport.js
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **AI Integration**: Google Gemini AI for content generation and SEO analysis

### Database Design
- **Primary Database**: PostgreSQL via Neon serverless
- **Schema Management**: Drizzle Kit for migrations
- **Key Tables**:
  - `users` - User authentication and profile data
  - `posts` - Blog posts with SEO metadata
  - `postAnalytics` - View tracking and performance metrics
  - `automationSettings` - AI automation configuration
  - `sessions` - User session storage

## Data Flow

### Content Generation Flow
1. Admin configures automation settings (keywords, frequency, content type)
2. Scheduler triggers AI content generation based on configured frequency
3. Gemini AI generates SEO-optimized content with title, body, meta description, and keywords
4. Content is stored as draft posts with SEO scores
5. Posts can be reviewed and published manually or automatically

### Analytics Flow
1. Public blog posts track unique and total views
2. Analytics data aggregates performance metrics
3. Admin dashboard displays charts and summaries
4. SEO scores help optimize content performance

### Authentication Flow
1. Replit OIDC handles user authentication
2. Sessions are stored in PostgreSQL
3. Protected routes require authentication middleware
4. Public routes serve blog content without authentication

## External Dependencies

### AI Services
- **Google Gemini AI**: Content generation, SEO analysis, and optimization suggestions
- **API Configuration**: Requires `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY`

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: Via `@neondatabase/serverless` with connection pooling

### Authentication
- **Replit OIDC**: Integrated authentication system
- **Session Storage**: PostgreSQL-backed session management

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Chart.js**: Analytics visualization (loaded via CDN)

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with nodemon-like behavior
- **Database**: Drizzle migrations with push commands

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: esbuild bundles server code to `dist`
- **Static Serving**: Express serves built frontend files
- **Environment**: NODE_ENV=production optimizations

### Key Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI**: `GEMINI_API_KEY` for content generation
- **Auth**: `SESSION_SECRET` and `REPLIT_DOMAINS` for authentication
- **Scheduling**: Node-cron for automated content posting

### Scalability Considerations
- Connection pooling for database efficiency
- Memoized OIDC configuration for auth performance
- Automated content scheduling to reduce manual overhead
- Comprehensive analytics for performance monitoring

The platform is designed to be self-maintaining through AI automation while providing manual override capabilities for content review and customization.

## Recent Changes (January 2025)

### Migration to Replit Environment
- ✓ Successfully migrated from Replit Agent to standard Replit environment
- ✓ Configured PostgreSQL database with proper connection pooling
- ✓ Fixed authentication system to work with Replit OIDC
- ✓ Implemented real-time dashboard updates using query invalidation
- ✓ Fixed Gemini AI API integration with proper error handling for quota limits
- ✓ Enhanced rich text editor with inline heading support and persistent selection
- ✓ Resolved AI post generation crashes caused by API quota exceeded errors

### Enhanced Pending Approval Section
- ✓ Added inline rich text editing with full WYSIWYG capabilities
- ✓ Implemented clickable post headings that open full post preview
- ✓ Added comprehensive editing toolbar with link insertion, image embedding, formatting
- ✓ Created seamless preview mode for reviewing posts before approval
- ✓ Integrated real-time updates across admin dashboard sections

### AI Integration Improvements (January 21, 2025)
- ✓ Fixed Gemini AI API integration to work with latest @google/genai package
- ✓ Implemented robust error handling for API quota limits and authentication errors
- ✓ Added specific user feedback for different types of AI service failures
- ✓ Improved application stability by preventing crashes during AI generation errors
- ✓ Fixed database constraint violations by adding automatic content truncation for meta descriptions (160 char limit)
- ✓ Added validation to all content creation routes to ensure database integrity
- ✓ Fixed database constraint violations by adding automatic content truncation for meta descriptions (160 character limit)
- ✓ Added validation to both AI-generated and manually created content to prevent database errors

### Key Features Added
- **Inline Editing**: Full rich text editor with formatting tools, link insertion, and image embedding
- **Post Preview**: Click on post titles in pending approval to view formatted posts
- **Real-time Updates**: Dashboard automatically refreshes every 5 seconds for live data
- **Enhanced UX**: Improved workflow for content review and approval process
- **Error Resilience**: Graceful handling of AI service limitations with clear user feedback
- **Automated Content Generation**: Fully functional scheduled AI post creation with email approval workflow
- **Email Approval System**: Secure token-based approval system with 24-hour expiration

### Security and Performance
- Proper client/server separation maintained
- Database queries optimized with connection pooling
- Authentication secured with proper session management
- Real-time polling implemented efficiently to minimize server load
- Robust error handling prevents application crashes from external service failures
- Database constraints enforced at application level to prevent data corruption
- Secure token-based email approval system with automatic cleanup of expired tokens

### Complete Automation System Testing (January 21, 2025)
- ✓ **Automated Post Generation**: AI generates high-quality, SEO-optimized blog posts on schedule
- ✓ **Content Validation**: All generated content respects database constraints (160 char meta descriptions)
- ✓ **Scheduling System**: Node-cron properly configured for daily, weekly, monthly, and twice-daily posting
- ✓ **Email Approval Workflow**: Brevo integration sends styled approval emails with secure tokens
- ✓ **Pending Approval Section**: Admin dashboard displays draft posts awaiting approval
- ✓ **Token Security**: 24-hour expiring approval tokens with automatic cleanup after use
- ✓ **One-Click Approval**: Email links directly approve and publish posts
- ✓ **Database Integrity**: All automation respects database schema and prevents data issues

### Admin Dashboard Fixes (January 21, 2025)
- ✓ **Post Creation**: Fixed slug generation with server-side auto-generation for robust post creation
- ✓ **Post Editor**: Fixed query parameter handling for proper post data prefilling when editing
- ✓ **Navigation**: Replaced problematic Link components with direct window.location.href for reliable routing
- ✓ **Table Format**: Converted card-based posts display to professional table with columns: Title, Status, Category, Views, Date, Actions
- ✓ **CRUD Operations**: All create, read, update, delete operations working seamlessly
- ✓ **Foreign Key Handling**: Post deletion properly cascades to remove approval tokens
- ✓ **Pagination**: Clean pagination with page numbers, previous/next buttons, and post count display
- ✓ **Action Buttons**: Edit (opens post editor), View (opens published posts in new tab), Delete (with confirmation dialog)

### Next.js Conversion (January 22, 2025)
- ✓ **Framework Migration**: Converted entire frontend from React SPA to Next.js with SSR/SSG
- ✓ **SEO Optimization**: Implemented comprehensive SEO with structured data, meta tags, and Open Graph
- ✓ **Performance**: Added static generation (getStaticProps), server-side rendering (getServerSideProps)
- ✓ **Image Optimization**: Next.js Image component with lazy loading and automatic format optimization
- ✓ **Routing**: File-based routing with dynamic routes for posts and categories
- ✓ **Static Assets**: Automated sitemap.xml and robots.txt generation
- ✓ **Error Pages**: Custom 404 and 500 error pages with proper SEO
- ✓ **Category Pages**: Dynamic category pages with static generation
- ✓ **Blog Listing**: Optimized blog listing with pagination and filtering
- ✓ **Incremental Static Regeneration**: ISR configured for dynamic content updates
- ✓ **Meta Tags**: Complete Open Graph, Twitter Cards, and JSON-LD structured data
- ✓ **PWA Support**: Manifest.json and service worker ready configuration
- ✓ **Core Web Vitals**: Optimized for LCP, FID, and CLS performance metrics
- ✓ **Breadcrumbs**: SEO-friendly breadcrumb navigation with structured data
- ✓ **Canonical URLs**: Proper canonical URL configuration for all pages
- ✓ **Advanced Caching**: HTTP headers for optimal caching strategies