# Architecture Documentation

## Overview

This application is a YouTube SEO and content optimization platform named "Hamna Tec". It's designed to help content creators optimize their YouTube videos for better search visibility and engagement. The system combines video management, keyword research, analytics, and AI-powered content optimization tools in a unified dashboard.

The application follows a modern full-stack architecture with a clear separation between client and server components. It uses React for the frontend, Express for the backend API, and PostgreSQL (via Neon's serverless Postgres) for data storage.

## System Architecture

The system follows a client-server architecture with the following key components:

1. **Client**: A React-based single-page application (SPA) that provides the user interface.
2. **Server**: An Express.js server that handles API requests, authentication, and business logic.
3. **Database**: A PostgreSQL database (via Neon serverless) for persistent data storage.
4. **External Services**: Integration with YouTube API and OpenAI API for content analysis and generation.

### Architectural Patterns

- **API-first design**: Backend exposes RESTful endpoints consumed by the frontend.
- **Component-based frontend**: UI built with reusable React components using the Shadcn UI library.
- **Service-oriented backend**: Server logic organized into focused service modules (YouTube, OpenAI).
- **Repository pattern**: Database access abstracted through a storage layer.

## Key Components

### Frontend

1. **UI Framework**
   - Built with React using TypeScript
   - Uses Shadcn UI components (built on Radix UI primitives)
   - Styled with Tailwind CSS for responsive design
   - Dark mode support with theme switching capability

2. **State Management & Data Fetching**
   - TanStack React Query for server state management and data fetching
   - Local state using React hooks
   - Typed API interfaces for type safety

3. **Routing**
   - Uses Wouter for client-side routing
   - Protected routes for authenticated content

4. **Key Pages**
   - Dashboard: Overview of user's YouTube metrics
   - Videos: Management of YouTube videos
   - Analytics: Detailed performance metrics
   - Keyword Research: SEO keyword discovery
   - Competitor Analysis: Analysis of competing channels
   - AI Assistant: AI-powered content optimization tools
   - Tools: 
     - Title Generator
     - Description Writer
     - Tag Optimizer
     - Thumbnail Analyzer
   - Settings: User, API key, and application settings

### Backend

1. **API Server**
   - Express.js server with TypeScript
   - RESTful API design
   - Request logging and error handling middleware

2. **Authentication**
   - Passport.js for authentication strategies
   - Local strategy (username/password)
   - Google OAuth integration (configured but potentially not fully implemented)
   - Session-based authentication with express-session

3. **Service Layer**
   - YouTubeService: Handles YouTube API interactions
   - OpenAIService: Manages OpenAI API calls for AI features
   - API key rotation and quota management for both services

4. **Controllers**
   - aiController: Handles AI-related endpoints for content optimization

5. **Storage Layer**
   - Abstract data access through a storage module
   - CRUD operations for users, API keys, videos, etc.

### Database

1. **Schema**
   - Users: Stores user accounts and preferences
   - API Keys: Manages external service API keys and quotas
   - YouTube Videos: Stores video metadata and analytics

2. **ORM**
   - Uses Drizzle ORM for type-safe database interactions
   - Migrations and schema definitions

### External Integrations

1. **YouTube API**
   - Fetches video analytics
   - Manages video metadata
   - Implements quota management and key rotation

2. **OpenAI API**
   - Content generation for titles, descriptions, and tags
   - Optimizes content for SEO and engagement
   - Implements quota management and key rotation

## Data Flow

### Authentication Flow

1. User logs in via username/password or Google OAuth
2. Server validates credentials and creates a session
3. Session ID is stored in a cookie on the client
4. Subsequent requests include the session cookie for authentication

### Content Optimization Flow

1. User selects a video or enters content to optimize
2. Frontend sends the content to the relevant API endpoint
3. Backend processes the request, potentially calling external APIs
4. Results are returned to the frontend for display
5. User can apply the optimized content to their videos

### API Key Management Flow

1. User adds API keys for YouTube or OpenAI
2. Keys are stored securely in the database
3. Backend services select the appropriate key based on quota usage
4. If a key reaches its quota limit, the system rotates to the next available key
5. If all keys are exhausted, the system falls back to environment variable keys

## External Dependencies

### Frontend Dependencies

- **UI Components**: Radix UI, Shadcn UI
- **State Management**: TanStack React Query
- **Forms**: React Hook Form, Zod for validation
- **Routing**: Wouter
- **Data Visualization**: Recharts
- **HTTP Client**: Axios

### Backend Dependencies

- **Web Framework**: Express
- **Authentication**: Passport, bcrypt
- **Database**: Neon serverless Postgres, Drizzle ORM
- **External APIs**: YouTube Data API, OpenAI API
- **Utilities**: Zod for validation

## Deployment Strategy

The application is configured for deployment on Replit with the following strategy:

1. **Build Process**:
   - Vite builds the frontend into static assets
   - ESBuild bundles the server code
   - Output is stored in the `dist` directory

2. **Runtime Configuration**:
   - Production mode sets Node environment to "production"
   - Environment variables control database connection, API keys, etc.

3. **Scaling**:
   - The application is configured for autoscaling deployment on Replit
   - Port 5000 is mapped to external port 80

4. **Database**:
   - Uses Neon's serverless PostgreSQL
   - Connection string provided via environment variables

5. **Development Workflow**:
   - Development server runs with `npm run dev`
   - Database migrations with `drizzle-kit push`
   - Seeding with `npm run db:seed`

## Security Considerations

1. **Authentication**: 
   - Password hashing with bcrypt
   - Session-based authentication with secure cookies
   - Optional two-factor authentication support (schema defined)

2. **API Keys**:
   - API keys stored securely in the database
   - Keys never exposed in API responses
   - Quota management to prevent abuse

3. **Data Protection**:
   - Sensitive data like passwords are never returned in API responses
   - API key values are hidden when listing keys