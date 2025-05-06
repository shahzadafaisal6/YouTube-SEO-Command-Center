import { db } from "./index";
import * as schema from "@shared/schema";
import { hash } from "bcrypt";

async function seed() {
  try {
    // Create a demo user
    const hashedPassword = await hash("password123", 10);
    const [user] = await db.insert(schema.users).values({
      username: "faisal",
      password: hashedPassword,
      email: "faisal@hamnatec.com",
      fullName: "Faisal",
      company: "Hamna Tec",
      phone: "+92 336 7866994",
      timezone: "UTC",
      emailNotifications: true,
      darkMode: true,
      twoFactorEnabled: false,
    }).returning().catch(e => {
      console.log("User already exists, skipping...");
      return [{ id: 1 }];
    });

    // API Keys
    await db.insert(schema.apiKeys).values([
      // YouTube API Keys
      {
        userId: user.id,
        type: "youtube",
        name: "YouTube Data API v3 - Primary",
        key: process.env.YOUTUBE_API_KEY || "mock-youtube-api-key-1",
        isActive: true,
        quotaLimit: 10000,
        quotaUsed: 9950, // Almost at limit
      },
      {
        userId: user.id,
        type: "youtube",
        name: "YouTube Data API v3 - Secondary",
        key: process.env.YOUTUBE_API_KEY || "mock-youtube-api-key-2",
        isActive: true,
        quotaLimit: 10000,
        quotaUsed: 5500, // Mid usage
      },
      {
        userId: user.id,
        type: "youtube",
        name: "YouTube Data API v3 - Backup",
        key: process.env.YOUTUBE_API_KEY || "mock-youtube-api-key-3",
        isActive: true,
        quotaLimit: 10000,
        quotaUsed: 10, // Almost unused
      },
      {
        userId: user.id,
        type: "youtube",
        name: "YouTube Data API v3 - Emergency",
        key: process.env.YOUTUBE_API_KEY || "mock-youtube-api-key-4",
        isActive: true,
        quotaLimit: 10000,
        quotaUsed: 0, // Unused
      },
      {
        userId: user.id,
        type: "youtube",
        name: "YouTube Data API v3 - Disabled",
        key: process.env.YOUTUBE_API_KEY || "mock-youtube-api-key-5",
        isActive: false, // Inactive key
        quotaLimit: 10000,
        quotaUsed: 8500,
      },
      
      // OpenAI API Keys
      {
        userId: user.id,
        type: "openai",
        name: "OpenAI API - Primary",
        key: process.env.OPENAI_API_KEY || "mock-openai-api-key-1",
        isActive: true,
        quotaLimit: 50,
        quotaUsed: 48, // Almost at limit
      },
      {
        userId: user.id,
        type: "openai",
        name: "OpenAI API - Secondary",
        key: process.env.OPENAI_API_KEY || "mock-openai-api-key-2",
        isActive: true,
        quotaLimit: 50,
        quotaUsed: 25, // Mid usage
      },
      {
        userId: user.id,
        type: "openai",
        name: "OpenAI API - Backup",
        key: process.env.OPENAI_API_KEY || "mock-openai-api-key-3",
        isActive: true,
        quotaLimit: 50,
        quotaUsed: 0, // Unused
      },
      {
        userId: user.id,
        type: "openai",
        name: "OpenAI API - Inactive",
        key: process.env.OPENAI_API_KEY || "mock-openai-api-key-4",
        isActive: false, // Inactive key
        quotaLimit: 50,
        quotaUsed: 10,
      },
      
      // Vision API (keeping one for now)
      {
        userId: user.id,
        type: "vision",
        name: "Vision API",
        key: process.env.VISION_API_KEY || "mock-vision-api-key",
        isActive: true,
        quotaLimit: 1000,
        quotaUsed: 583,
      }
    ]).onConflictDoNothing();

    // Videos
    const videos = [
      {
        userId: user.id,
        youtubeId: "video-1",
        title: "Complete YouTube API Guide: Setup & Best Practices",
        description: "Learn how to set up and use the YouTube API in this comprehensive guide...",
        thumbnailUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=240&h=135&fit=crop&q=80",
        tags: ["youtube api", "api tutorial", "javascript", "nodejs"],
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        seoScore: 92,
      },
      {
        userId: user.id,
        youtubeId: "video-2",
        title: "10 SEO Hacks for Better YouTube Rankings in 2023",
        description: "Discover the top SEO strategies to boost your YouTube rankings...",
        thumbnailUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=240&h=135&fit=crop&q=80",
        tags: ["youtube seo", "seo tips", "youtube growth"],
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        seoScore: 78,
      },
      {
        userId: user.id,
        youtubeId: "video-3",
        title: "How to Integrate OpenAI with YouTube Analytics",
        description: "Learn how to combine OpenAI's powerful models with YouTube Analytics data...",
        thumbnailUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=240&h=135&fit=crop&q=80",
        tags: ["openai", "youtube analytics", "ai integration"],
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        seoScore: 96,
      },
      {
        userId: user.id,
        youtubeId: "video-4",
        title: "Vision API Tutorial: Analyze YouTube Thumbnails",
        description: "Discover how to use Google's Vision API to analyze and optimize YouTube thumbnails...",
        thumbnailUrl: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=240&h=135&fit=crop&q=80",
        tags: ["vision api", "thumbnail optimization", "youtube thumbnails"],
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        seoScore: 65,
      },
      {
        userId: user.id,
        youtubeId: "video-5",
        title: "Getting Started with YouTube Analytics & Data API",
        description: "A beginner-friendly guide to YouTube Analytics and the Data API...",
        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=250&fit=crop&q=80",
        tags: ["youtube analytics", "data api", "beginner tutorial"],
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        seoScore: 71,
        optimizationNotes: {
          issues: [
            "Title lacks emotional trigger words",
            "Description too short (84 words)",
            "Missing 6 recommended tags"
          ]
        }
      },
      {
        userId: user.id,
        youtubeId: "video-6",
        title: "How to Code a Basic YouTube Data Extractor",
        description: "Build your own YouTube data extraction tool with this step-by-step guide...",
        thumbnailUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=250&fit=crop&q=80",
        tags: ["coding tutorial", "data extraction", "youtube data"],
        publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
        seoScore: 58,
        optimizationNotes: {
          issues: [
            "Keyword \"YouTube API\" missing from title",
            "Too few timestamps in description",
            "Thumbnail lacks contrast (Vision API)"
          ]
        }
      },
      {
        userId: user.id,
        youtubeId: "video-7",
        title: "Debugging Common YouTube API Authentication Errors",
        description: "Solve the most common authentication problems with the YouTube API...",
        thumbnailUrl: "https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&h=250&fit=crop&q=80",
        tags: ["api errors", "debugging", "authentication", "oauth"],
        publishedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        seoScore: 68,
        optimizationNotes: {
          issues: [
            "CTA missing from first 100 words",
            "Competing with 4 similar videos",
            "Top competitor using better hashtags"
          ]
        }
      }
    ];

    // Insert videos
    for (const video of videos) {
      try {
        const [insertedVideo] = await db.insert(schema.videos).values(video).returning();
        
        // Add video analytics
        if (insertedVideo && insertedVideo.id) {
          const now = new Date();
          const analytics = {
            videoId: insertedVideo.id,
            date: now,
            views: Math.floor(Math.random() * 25000),
            watchTimeHours: Math.floor(Math.random() * 1500),
            likes: Math.floor(Math.random() * 2000),
            comments: Math.floor(Math.random() * 500),
            ctr: (Math.random() * 8 + 4).toFixed(1) + "%", // between 4% and 12%
            avgViewDuration: `${Math.floor(Math.random() * 8) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`, // between 3:00 and 10:59
          };

          await db.insert(schema.videoAnalytics).values(analytics);
        }
      } catch (e) {
        console.log(`Video ${video.youtubeId} already exists, skipping...`);
      }
    }

    // Keywords
    const keywordsData = [
      {
        userId: user.id,
        keyword: "youtube seo tutorial",
        volume: 38200,
        trend: "+12%"
      },
      {
        userId: user.id,
        keyword: "api tutorial",
        volume: 24500,
        trend: "+8%"
      },
      {
        userId: user.id,
        keyword: "openai integration",
        volume: 21700,
        trend: "+15%"
      },
      {
        userId: user.id,
        keyword: "vision api examples",
        volume: 18300,
        trend: "-3%"
      },
      {
        userId: user.id,
        keyword: "youtube ranking tips",
        volume: 15900,
        trend: "+5%"
      }
    ];

    await db.insert(schema.keywords).values(keywordsData).onConflictDoNothing();

    // User settings
    const userSettings = [
      {
        userId: user.id,
        key: "dashboard_layout",
        value: JSON.stringify({
          widgets: ["overview", "performance", "keywords", "quota", "optimizations"]
        })
      },
      {
        userId: user.id,
        key: "api_settings",
        value: JSON.stringify({
          throttling: true,
          caching: true,
          cache_ttl: 3600
        })
      }
    ];

    await db.insert(schema.settings).values(userSettings).onConflictDoNothing();

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
