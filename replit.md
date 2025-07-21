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
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Tailwind CSS with Radix UI components (shadcn/ui)
- **Build Tool**: Vite for fast development and optimized builds

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

### Key Features Added
- **Inline Editing**: Full rich text editor with formatting tools, link insertion, and image embedding
- **Post Preview**: Click on post titles in pending approval to view formatted posts
- **Real-time Updates**: Dashboard automatically refreshes every 10 seconds for live data
- **Enhanced UX**: Improved workflow for content review and approval process
- **Error Resilience**: Graceful handling of AI service limitations with clear user feedback

### Security and Performance
- Proper client/server separation maintained
- Database queries optimized with connection pooling
- Authentication secured with proper session management
- Real-time polling implemented efficiently to minimize server load
- Robust error handling prevents application crashes from external service failures