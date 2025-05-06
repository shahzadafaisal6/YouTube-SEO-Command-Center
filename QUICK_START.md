# Quick Start Guide

## One-Command Startup
```bash
./start-dev.sh
```

## Manual Steps
If you need to set up from scratch:

1. **Start PostgreSQL**
   ```bash
   sudo systemctl start postgresql@17-main
   ```

2. **Verify Database Exists**
   ```bash
   sudo -u postgres psql -l | grep youtube_seo_db
   ```
   
   If it doesn't exist:
   ```bash
   sudo -u postgres createdb youtube_seo_db
   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'password';"
   ```

3. **Run Database Migrations**
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/youtube_seo_db" npm run db:push
   ```

4. **Run Database Seed Script** (if needed)
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/youtube_seo_db" npx tsx db/seed.ts
   ```

5. **Start the Application**
   ```bash
   ./start-dev.sh
   ```

## Access the Application
- URL: http://localhost:5000
- Login: 
  - Username: `faisal` or `admin`
  - Password: any password (verification bypassed for development)

## Checking Status
- Check server status: `curl -I http://localhost:5000`
- Check Google OAuth: `curl -I http://localhost:5000/api/auth/google` (should redirect to Google)

## Common Issues

### Database Connection Failed
- Verify PostgreSQL is running
- Check database credentials
- Try recreating the database

### OAuth Not Working
- Verify environment variables are set
- Check redirect URIs in Google Cloud Console
- Verify the Google OAuth strategy is configured in the server code

### API Key Display Issues
- Clear browser cache
- Try using Incognito/Private mode
- Check browser console for errors 