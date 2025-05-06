#!/bin/bash

# Script to start the development server with all required environment variables
echo "Starting YouTube SEO Command Center development server..."

# Set PostgreSQL database connection
export DATABASE_URL="postgresql://postgres:password@localhost:5432/youtube_seo_db"

# Set session secret
export SESSION_SECRET="your-secret-key"

# Set Google OAuth credentials
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"
export GOOGLE_OAUTH_CALLBACK_URL="http://localhost:5000/api/auth/google/callback"

# Set API Keys
export YOUTUBE_API_KEY="your-youtube-api-key"
export OPENAI_API_KEY="your-openai-api-key"

# Set Node environment
export NODE_ENV="development"

# Display environment info
echo "Environment variables set successfully."
echo "Google OAuth configured for callback URL: $GOOGLE_OAUTH_CALLBACK_URL"

# Start development server
echo "Starting development server..."
npm run dev 