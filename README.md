# YouTube SEO Command Center

A comprehensive dashboard for optimizing YouTube videos, managing API keys, and analyzing SEO performance.

## Features

- **Google OAuth Integration**: Connect with your YouTube channel directly
- **Video Management**: Sync and manage all your YouTube videos in one place
- **SEO Optimization Tools**:
  - Title Generator with click-worthy suggestions
  - Description Optimizer with keyword placement
  - Tag Generator for maximum discoverability
  - Thumbnail Analysis for higher CTR
- **AI-Powered Recommendations**: Get intelligent suggestions to improve your content
- **Performance Tracking**: Monitor your videos' performance metrics
- **API Key Management**: Securely store and manage your API keys
- **Modern UI**: Beautiful, responsive dashboard with dark mode support

## Setup & Configuration

### Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql@17-main

# Create database
sudo -u postgres createdb youtube_seo_db

# Set postgres user password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"
```

### Environment Variables
Required environment variables for the application:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for express-session
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `YOUTUBE_API_KEY`: YouTube Data API key
- `OPENAI_API_KEY`: OpenAI API key
- `NODE_ENV`: Development or production environment

These are set in the `start-dev.sh` script for convenience.

## Running the Application

### Using the Start Script
```bash
# Make the script executable if not already
chmod +x start-dev.sh

# Run the application
./start-dev.sh
```

### Manual Start
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/youtube_seo_db" \
SESSION_SECRET="your-secret-key" \
GOOGLE_CLIENT_ID="your-google-client-id" \
GOOGLE_CLIENT_SECRET="your-google-client-secret" \
YOUTUBE_API_KEY="your-youtube-api-key" \
OPENAI_API_KEY="your-openai-api-key" \
NODE_ENV="development" \
npm run dev
```

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js, Google OAuth
- **APIs**: YouTube Data API, OpenAI API

## Project Structure

- `server/`: Express.js backend
  - `routes.ts`: API endpoints and authentication
  - `controllers/`: Business logic
  - `storage.ts`: Database access layer
  
- `client/`: React frontend
  - `src/components/`: UI components
  - `src/pages/`: Page components
  - `src/lib/`: Utility functions
  
- `shared/`: Shared code between client and server
  - `schema.ts`: Database schema definitions
  
- `db/`: Database configuration
  - `index.ts`: Database connection setup
  - `seed.ts`: Database seed script

## Troubleshooting

If the application cannot connect to the database:
1. Check that PostgreSQL is running: `sudo systemctl status postgresql@17-main`
2. Verify database exists: `sudo -u postgres psql -l | grep youtube_seo_db`
3. Check database credentials in `.env` or startup script

For Google OAuth issues:
1. Verify credentials are set in environment variables
2. Ensure redirect URI in Google Cloud Console matches: `http://localhost:5000/api/auth/google/callback`

## License

MIT 