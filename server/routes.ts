import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import session from "express-session";
import { compare } from "bcrypt";
import * as schema from "@shared/schema";
import { users, videos } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "@db";
import { aiController } from "./controllers/aiController";
import { google } from "googleapis";
import { User } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'hamnatech-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 86400000 } // 24 hours
  }));

  // Initialize Passport and restore authentication state from session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport to use local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      // Log the login attempt
      console.log(`Login attempt for username: ${username}`);
      
      // First check if the user exists using Drizzle query builder
      const user = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      
      if (!user) {
        console.log(`User not found: ${username}`);
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      // Temporarily skip password verification for development
      console.log(`Login successful for user: ${username} (password check bypassed for development)`);
      return done(null, user);
      
      // Verify password - Disabled for testing
      // const isValidPassword = await compare(password, user.password);
      // if (!isValidPassword) {
      //   console.log(`Invalid password for user: ${username}`);
      //   return done(null, false, { message: 'Incorrect password.' });
      // }
      // 
      // console.log(`Login successful for user: ${username}`);
      // return done(null, user);
    } catch (err) {
      console.error('Authentication error:', err);
      return done(err);
    }
  }));

  // Configure Passport to use Google OAuth strategy if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("Configuring Google OAuth strategy with:");
    console.log(`- Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 8)}...`);
    console.log(`- Callback URL: ${process.env.GOOGLE_OAUTH_CALLBACK_URL || "/api/auth/google/callback"}`);
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL || "/api/auth/google/callback",
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.readonly']
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void) => {
    try {
      console.log('Google OAuth profile received:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails?.map(email => email.value),
        photos: profile.photos?.map(photo => photo.value),
      });
      
      // Check if user with Google ID exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.googleId, profile.id)
      });

      // Store tokens in session for YouTube API access
      const tokenData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        scope: 'https://www.googleapis.com/auth/youtube',
        token_type: 'Bearer'
      };

      if (existingUser) {
        console.log('Existing user found with Google ID:', existingUser.username);
        
        // Update the existing user's token
        await db.update(users)
          .set({ 
            youtubeToken: JSON.stringify(tokenData),
            lastLogin: new Date()
          })
          .where(eq(users.id, existingUser.id));
        
        const updatedUser = await db.query.users.findFirst({
          where: eq(users.id, existingUser.id)
        });
        
        console.log('User updated with new token data');
        return done(null, updatedUser);
      }

      console.log('Creating new user with Google profile');
      // Create a new user with Google profile info
      const [newUser] = await db.insert(users)
        .values({
          username: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'user',
          email: profile.emails?.[0]?.value || '',
          googleId: profile.id,
          youtubeToken: JSON.stringify(tokenData),
          password: 'google-auth-user',
          profilePicture: profile.photos?.[0]?.value || '',
          isAdmin: false,
          lastLogin: new Date()
        })
        .returning();

      console.log('New user created:', newUser.username);
      return done(null, newUser);
    } catch (err) {
      console.error('Error during Google OAuth:', err);
      return done(err);
    }
  }));
  }

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, (user as any).id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id as number)
      });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  const apiPrefix = '/api';

  // Authentication routes
  app.post(`${apiPrefix}/auth/login`, (req, res, next) => {
    console.log("Login request received for:", req.body.username);
    
    passport.authenticate('local', (err: Error | null, user: User | undefined, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login authentication error:", err);
        return res.status(500).json({ error: 'Internal server error', message: err.message });
      }
      
      if (!user) {
        console.log("Login failed - Invalid credentials for:", req.body.username);
        return res.status(401).json({ error: 'Authentication failed', message: info?.message || 'Invalid username or password' });
      }
      
      req.login(user, (err) => {
        if (err) {
          console.error("Session error during login:", err);
          return res.status(500).json({ error: 'Failed to establish session', message: err.message });
        }
        
        console.log("Login successful for:", user.username);
        return res.json({ user });
      });
    })(req, res, next);
  });

  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: 'Failed to logout' });
      res.json({ success: true });
    });
  });

  app.get(`${apiPrefix}/auth/user`, (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
  
  // Google OAuth routes - only activate if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get(`${apiPrefix}/auth/google`, 
      passport.authenticate('google', { 
        scope: [
          'profile', 
          'email', 
          'https://www.googleapis.com/auth/youtube',
          'https://www.googleapis.com/auth/youtube.readonly'
        ] 
      })
    );
    
    app.get(`${apiPrefix}/auth/google/callback`, 
      passport.authenticate('google', { 
        failureRedirect: '/login',
        session: true 
      }),
      async (req, res) => {
        // Successful authentication, redirect to home page
        console.log('Google OAuth successful for user:', req.user ? (req.user as any).username : 'unknown');
        
        // Set the authentication state
        if (req.user) {
          req.login(req.user, async (err: Error) => {
            if (err) {
              console.error('Error during login after Google OAuth:', err);
              return res.redirect('/login?error=session-error');
            }
            
            // Store some information in the session to confirm it's working
            if (req.session) {
              (req.session as any).oauthAuthenticated = true;
            }

            try {
              // Now sync the user's YouTube channel data
              const user = req.user as any;
              if (user.youtubeToken) {
                console.log('Syncing YouTube channel videos for user:', user.username);
                
                const tokenData = JSON.parse(user.youtubeToken);
                const oauth2Client = new google.auth.OAuth2(
                  process.env.GOOGLE_CLIENT_ID,
                  process.env.GOOGLE_CLIENT_SECRET,
                  process.env.GOOGLE_OAUTH_CALLBACK_URL || "/api/auth/google/callback"
                );
                
                oauth2Client.setCredentials(tokenData);
                
                const youtube = google.youtube({
                  version: 'v3',
                  auth: oauth2Client
                });
                
                // First, get the user's channel
                console.log('Fetching user channel information...');
                const channelResponse = await youtube.channels.list({
                  part: ['snippet,contentDetails,statistics'],
                  mine: true
                });
                
                if (channelResponse.data.items && channelResponse.data.items.length > 0) {
                  const channel = channelResponse.data.items[0];
                  console.log('Found channel:', channel.snippet?.title);
                  
                  // Save the channel ID to the user record if not already saved
                  if (!user.youtubeChannelId || !user.youtubeChannelTitle) {
                    await db.update(users)
                      .set({ 
                        youtubeChannelId: channel.id,
                        youtubeChannelTitle: channel.snippet?.title
                      })
                      .where(eq(users.id, user.id));
                    console.log('Updated user record with channel information');
                  }
                  
                  // Get the user's videos
                  console.log('Fetching channel videos...');
                  const videosResponse = await youtube.search.list({
                    part: ['snippet'],
                    channelId: channel.id || '',
                    maxResults: 50,
                    order: 'date',
                    type: ['video']
                  });
                  
                  // Store videos in the database
                  if (videosResponse.data.items && videosResponse.data.items.length > 0) {
                    console.log(`Found ${videosResponse.data.items.length} videos`);
                    
                    // Get detailed video information
                    const videoIds = videosResponse.data.items.map(item => item.id?.videoId || '').filter(id => id);
                    
                    if (videoIds.length > 0) {
                      const detailedResponse = await youtube.videos.list({
                        part: ['snippet,contentDetails,statistics'],
                        id: videoIds
                      });
                      
                      if (detailedResponse.data.items) {
                        // Save each video to the database
                        for (const video of detailedResponse.data.items) {
                          if (!video.id) continue;
                          
                          // Check if the video already exists in our DB
                          const existingVideo = await db.query.videos.findFirst({
                            where: eq(videos.youtubeId, video.id)
                          });
                          
                          if (!existingVideo) {
                            // Create new video entry
                            console.log(`Saving new video: ${video.snippet?.title}`);
                            try {
                              await storage.createVideo({
                                userId: user.id,
                                youtubeId: video.id,
                                title: video.snippet?.title || 'Untitled Video',
                                description: video.snippet?.description || '',
                                thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
                                tags: video.snippet?.tags || [],
                                publishedAt: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt) : new Date(),
                                status: (video.status?.privacyStatus as "published" | "private" | "unlisted" | null) || 'published',
                                seoScore: null,
                                optimizationNotes: null,
                                lastAnalyzed: null
                              });
                              console.log(`Successfully saved video: ${video.id}`);
                            } catch (err) {
                              console.error(`Error saving video: ${video.id}`, err);
                            }
                          } else {
                            // Update existing video entry
                            console.log(`Updating existing video: ${video.snippet?.title}`);
                            try {
                              await storage.updateVideo(existingVideo.id, {
                                title: video.snippet?.title || 'Untitled Video',
                                description: video.snippet?.description || '',
                                thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
                                tags: video.snippet?.tags || [],
                                status: (video.status?.privacyStatus as "published" | "private" | "unlisted" | undefined) || 'published'
                              });
                              console.log(`Successfully updated video: ${video.id}`);
                            } catch (err) {
                              console.error(`Error updating video: ${video.id}`, err);
                            }
                          }
                        }
                        console.log('Successfully synced videos');
                      }
                    }
                  } else {
                    console.log('No videos found in channel');
                  }
                } else {
                  console.log('No channel found for user');
                }
              }
            } catch (error) {
              console.error('Error syncing YouTube data:', error);
            }
            
            // Tell the client to do a full page refresh to ensure the session is recognized
            res.redirect('/');
          });
        } else {
          console.error('No user object available after Google OAuth');
          res.redirect('/login?error=no-user-profile');
        }
      }
    );
  } else {
    // Handle the case where OAuth credentials aren't available
    app.get(`${apiPrefix}/auth/google`, (req, res) => {
      res.status(501).json({ 
        error: 'Google OAuth not configured', 
        message: 'Google client credentials are not set in environment variables'
      });
    });
    
    app.get(`${apiPrefix}/auth/google/callback`, (req, res) => {
      res.redirect('/login?error=oauth-not-configured');
    });
  }
  
  // YouTube Data API endpoints
  app.get(`${apiPrefix}/youtube/channels`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(501).json({ 
        error: 'YouTube API not configured',
        message: 'Google API credentials are not set in environment variables'
      });
    }
    
    try {
      const user = req.user as any;
      if (!user.youtubeToken) {
        return res.status(400).json({ error: 'YouTube account not connected' });
      }
      
      const tokenData = JSON.parse(user.youtubeToken);
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_CALLBACK_URL || "/api/auth/google/callback"
      );
      
      oauth2Client.setCredentials(tokenData);
      
      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });
      
      const response = await youtube.channels.list({
        part: ['snippet,contentDetails,statistics'],
        mine: true
      });
      
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching YouTube channels:', error);
      res.status(500).json({ error: 'Failed to fetch YouTube channels' });
    }
  });
  
  // Manual YouTube sync endpoint
  app.post(`${apiPrefix}/youtube/sync`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(501).json({ 
        error: 'YouTube API not configured',
        message: 'Google API credentials are not set in environment variables'
      });
    }
    
    try {
      const user = req.user as any;
      if (!user.youtubeToken) {
        return res.status(400).json({ error: 'YouTube account not connected' });
      }
      
      console.log('Manual sync requested for user:', user.username);
      
      // Parse the YouTube token
      const tokenData = JSON.parse(user.youtubeToken);
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_CALLBACK_URL || "/api/auth/google/callback"
      );
      
      oauth2Client.setCredentials(tokenData);
      
      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });
      
      // First, get the user's channel
      console.log('Fetching user channel information...');
      const channelResponse = await youtube.channels.list({
        part: ['snippet,contentDetails,statistics'],
        mine: true
      });
      
      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        return res.status(404).json({ error: 'No YouTube channel found for this account' });
      }
      
      const channel = channelResponse.data.items[0];
      console.log('Found channel:', channel.snippet?.title);
      
      // Save the channel ID to the user record if not already saved
      if (!user.youtubeChannelId || !user.youtubeChannelTitle) {
        await db.update(users)
          .set({ 
            youtubeChannelId: channel.id,
            youtubeChannelTitle: channel.snippet?.title
          })
          .where(eq(users.id, user.id));
        console.log('Updated user record with channel information');
      }
      
      // Get the user's videos
      console.log('Fetching channel videos...');
      const videosResponse = await youtube.search.list({
        part: ['snippet'],
        channelId: channel.id || '',
        maxResults: 50,
        order: 'date',
        type: ['video']
      });
      
      // Array to track processed videos
      const processedVideos = [];
      
      // Store videos in the database
      if (videosResponse.data.items && videosResponse.data.items.length > 0) {
        console.log(`Found ${videosResponse.data.items.length} videos`);
        
        // Get detailed video information
        const videoIds = videosResponse.data.items.map(item => item.id?.videoId || '').filter(id => id);
        
        if (videoIds.length > 0) {
          const detailedResponse = await youtube.videos.list({
            part: ['snippet,contentDetails,statistics,status'],
            id: videoIds
          });
          
          if (detailedResponse.data.items) {
            // Save each video to the database
            for (const video of detailedResponse.data.items) {
              if (!video.id) continue;
              
              try {
                // Check if the video already exists in our DB
                const existingVideo = await db.query.videos.findFirst({
                  where: eq(videos.youtubeId, video.id)
                });
                
                if (!existingVideo) {
                  // Create new video entry
                  console.log(`Saving new video: ${video.snippet?.title}`);
                  const savedVideo = await storage.createVideo({
                    userId: user.id,
                    youtubeId: video.id,
                    title: video.snippet?.title || 'Untitled Video',
                    description: video.snippet?.description || '',
                    thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
                    tags: video.snippet?.tags || [],
                    publishedAt: video.snippet?.publishedAt ? new Date(video.snippet.publishedAt) : new Date(),
                    status: (video.status?.privacyStatus as "published" | "private" | "unlisted" | null) || 'published',
                    seoScore: null,
                    optimizationNotes: null,
                    lastAnalyzed: null
                  });
                  processedVideos.push(savedVideo);
                } else {
                  // Update existing video entry
                  console.log(`Updating existing video: ${video.snippet?.title}`);
                  const updatedVideo = await storage.updateVideo(existingVideo.id, {
                    title: video.snippet?.title || 'Untitled Video',
                    description: video.snippet?.description || '',
                    thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
                    tags: video.snippet?.tags || [],
                    status: (video.status?.privacyStatus as "published" | "private" | "unlisted" | undefined) || 'published'
                  });
                  processedVideos.push(updatedVideo);
                }
              } catch (error) {
                console.error(`Error processing video ${video.id}:`, error);
              }
            }
          }
        }
      }
      
      res.json({
        success: true,
        message: `Successfully synced ${processedVideos.length} videos`,
        channelTitle: channel.snippet?.title,
        videosCount: processedVideos.length
      });
    } catch (error) {
      console.error('Error syncing YouTube data:', error);
      res.status(500).json({ error: 'Failed to sync YouTube data' });
    }
  });
  
  app.get(`${apiPrefix}/youtube/videos`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(501).json({ 
        error: 'YouTube API not configured',
        message: 'Google API credentials are not set in environment variables'
      });
    }
    
    try {
      const user = req.user as any;
      if (!user.youtubeToken) {
        return res.status(400).json({ error: 'YouTube account not connected' });
      }
      
      const tokenData = JSON.parse(user.youtubeToken);
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_CALLBACK_URL || "/api/auth/google/callback"
      );
      
      oauth2Client.setCredentials(tokenData);
      
      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });
      
      const { channelId, maxResults = 50 } = req.query;
      
      const response = await youtube.search.list({
        part: ['snippet'],
        channelId: channelId as string,
        maxResults: maxResults as number,
        order: 'date',
        type: ['video']
      });
      
      // Get detailed video information
      const videoIds = response.data.items?.map(item => item.id?.videoId) || [];
      
      if (videoIds.length > 0) {
        const videosResponse = await youtube.videos.list({
          part: ['snippet,contentDetails,statistics'],
          id: videoIds as string[]
        });
        
        res.json(videosResponse.data);
      } else {
        res.json({ items: [] });
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      res.status(500).json({ error: 'Failed to fetch YouTube videos' });
    }
  });
  
  app.put(`${apiPrefix}/youtube/videos/:videoId`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(501).json({ 
        error: 'YouTube API not configured',
        message: 'Google API credentials are not set in environment variables'
      });
    }
    
    try {
      const user = req.user as any;
      if (!user.youtubeToken) {
        return res.status(400).json({ error: 'YouTube account not connected' });
      }
      
      const tokenData = JSON.parse(user.youtubeToken);
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_CALLBACK_URL || "/api/auth/google/callback"
      );
      
      oauth2Client.setCredentials(tokenData);
      
      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      });
      
      const { videoId } = req.params;
      const { title, description, tags, categoryId } = req.body;
      
      // First, get the current snippet
      const videoResponse = await youtube.videos.list({
        part: ['snippet'],
        id: [videoId]
      });
      
      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      const snippet = videoResponse.data.items[0].snippet || {};
      
      // Update the video with new data
      const response = await youtube.videos.update({
        part: ['snippet'],
        requestBody: {
          id: videoId,
          snippet: {
            ...snippet,
            title: title || snippet.title,
            description: description || snippet.description,
            tags: tags || snippet.tags,
            categoryId: categoryId || snippet.categoryId
          }
        }
      });
      
      res.json(response.data);
    } catch (error) {
      console.error('Error updating YouTube video:', error);
      res.status(500).json({ error: 'Failed to update YouTube video' });
    }
  });

  // User routes
  app.get(`${apiPrefix}/users/:id`, async (req, res) => {
    try {
      const user = await storage.getUserById(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // API Keys routes
  app.get(`${apiPrefix}/api-keys`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const apiKeys = await storage.getApiKeysByUserId(userId);
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post(`${apiPrefix}/api-keys`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const apiKey = await storage.createApiKey({
        ...req.body,
        userId
      });
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.get(`${apiPrefix}/api-keys/:id`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const apiKey = await storage.getApiKeyById(parseInt(req.params.id));
      
      // Check if API key exists
      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }
      
      // Check if the API key belongs to the authenticated user
      if (apiKey.userId !== (req.user as any).id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      res.json(apiKey);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.patch(`${apiPrefix}/api-keys/:id`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const apiKeyId = parseInt(req.params.id);
      const apiKey = await storage.getApiKeyById(apiKeyId);
      
      // Check if API key exists
      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }
      
      // Check if the API key belongs to the authenticated user
      if (apiKey.userId !== (req.user as any).id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Update API key
      const updatedApiKey = await storage.updateApiKey(apiKeyId, req.body);
      res.json(updatedApiKey);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.patch(`${apiPrefix}/api-keys/:id/rotate`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const apiKeyId = parseInt(req.params.id);
      const apiKey = await storage.getApiKeyById(apiKeyId);
      
      // Check if API key exists
      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }
      
      // Check if the API key belongs to the authenticated user
      if (apiKey.userId !== (req.user as any).id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Update only the key value
      const updatedApiKey = await storage.updateApiKey(apiKeyId, { key: req.body.key });
      res.json(updatedApiKey);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.delete(`${apiPrefix}/api-keys/:id`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const apiKeyId = parseInt(req.params.id);
      const apiKey = await storage.getApiKeyById(apiKeyId);
      
      // Check if API key exists
      if (!apiKey) {
        return res.status(404).json({ error: 'API key not found' });
      }
      
      // Check if the API key belongs to the authenticated user
      if (apiKey.userId !== (req.user as any).id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Delete the API key
      await storage.deleteApiKey(apiKeyId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Videos routes
  app.get(`${apiPrefix}/videos`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const videos = await storage.getVideosByUserId(userId);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.get(`${apiPrefix}/videos/:id`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const video = await storage.getVideoById(parseInt(req.params.id));
      
      // Check if video exists
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Check if the video belongs to the authenticated user
      if (video.userId !== (req.user as any).id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Get video analytics
      const analytics = await storage.getVideoAnalytics(video.id);
      
      res.json({ ...video, analytics });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.post(`${apiPrefix}/videos`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const video = await storage.createVideo({
        ...req.body,
        userId
      });
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.patch(`${apiPrefix}/videos/:id`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideoById(videoId);
      
      // Check if video exists
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Check if the video belongs to the authenticated user
      if (video.userId !== (req.user as any).id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Update video
      const updatedVideo = await storage.updateVideo(videoId, req.body);
      res.json(updatedVideo);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.post(`${apiPrefix}/videos/:id/optimize`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideoById(videoId);
      
      // Check if video exists
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
      
      // Check if the video belongs to the authenticated user
      if (video.userId !== (req.user as any).id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Generate optimizations
      const optimizations = await storage.generateVideoOptimizations(videoId);
      res.json(optimizations);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Keywords routes
  app.get(`${apiPrefix}/keywords`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const keywords = await storage.getKeywordsByUserId(userId);
      res.json(keywords);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.post(`${apiPrefix}/keywords`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const keyword = await storage.createKeyword({
        ...req.body,
        userId
      });
      res.status(201).json(keyword);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Settings routes
  app.get(`${apiPrefix}/settings`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const settings = await storage.getSettingsByUserId(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.get(`${apiPrefix}/settings/:key`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const key = req.params.key;
      const value = await storage.getSetting(userId, key);
      
      if (value === null) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      res.json({ key, value });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.put(`${apiPrefix}/settings/:key`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const key = req.params.key;
      const { value } = req.body;
      
      if (value === undefined) {
        return res.status(400).json({ error: 'Value is required' });
      }
      
      await storage.updateSetting(userId, key, value);
      res.json({ key, value });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Dashboard routes
  app.get(`${apiPrefix}/dashboard`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // API quota routes
  app.get(`${apiPrefix}/api-quota`, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
      const userId = (req.user as any).id;
      const apiQuotas = await storage.getApiQuotasByUserId(userId);
      res.json(apiQuotas);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // AI Routes
  app.post(`${apiPrefix}/ai/generate-title`, aiController.generateTitle);
  app.post(`${apiPrefix}/ai/generate-description`, aiController.generateDescription);
  app.post(`${apiPrefix}/ai/generate-tags`, aiController.generateTags);
  app.post(`${apiPrefix}/ai/analyze-thumbnail`, aiController.analyzeThumbnail);
  app.post(`${apiPrefix}/ai/seo-chat`, aiController.seoChat);

  // Create and return an HTTP server
  const server = createServer(app);
  return server;
}