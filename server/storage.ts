import { db } from "@db";
import * as schema from "@shared/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { YouTubeService } from "./services/youtubeService";
import { OpenAIService } from "./services/openaiService";

// Initialize services
const youtubeService = new YouTubeService();
const openaiService = new OpenAIService();

export const storage = {
  // User operations
  async getUserById(id: number) {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      columns: {
        password: false,
      },
    });
  },

  async getUserByUsername(username: string) {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username),
    });
  },

  // API Keys operations
  async getApiKeysByUserId(userId: number) {
    return await db.query.apiKeys.findMany({
      where: eq(schema.apiKeys.userId, userId),
      columns: {
        key: false, // Don't return the actual API key for security
      },
    });
  },

  async getApiKeyById(id: number) {
    return await db.query.apiKeys.findFirst({
      where: eq(schema.apiKeys.id, id),
    });
  },

  async createApiKey(data: Omit<schema.ApiKey, "id" | "createdAt" | "updatedAt">) {
    const [apiKey] = await db.insert(schema.apiKeys).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    
    return apiKey;
  },

  async updateApiKey(id: number, data: Partial<schema.ApiKey>) {
    const [apiKey] = await db.update(schema.apiKeys)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.apiKeys.id, id))
      .returning();
    
    return apiKey;
  },

  async incrementApiKeyUsage(id: number, units: number) {
    const [apiKey] = await db.update(schema.apiKeys)
      .set({
        quotaUsed: sql`${schema.apiKeys.quotaUsed} + ${units}`,
        lastUsed: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.apiKeys.id, id))
      .returning();
    
    return apiKey;
  },
  
  async deleteApiKey(id: number) {
    await db.delete(schema.apiKeys)
      .where(eq(schema.apiKeys.id, id));
    
    return true;
  },

  // Videos operations
  async getVideosByUserId(userId: number) {
    return await db.query.videos.findMany({
      where: eq(schema.videos.userId, userId),
      orderBy: [desc(schema.videos.publishedAt)],
      with: {
        analytics: {
          limit: 1,
          orderBy: [desc(schema.videoAnalytics.date)],
        },
      },
    });
  },

  async getVideoById(id: number) {
    return await db.query.videos.findFirst({
      where: eq(schema.videos.id, id),
      with: {
        analytics: {
          limit: 1,
          orderBy: [desc(schema.videoAnalytics.date)],
        },
      },
    });
  },

  async createVideo(data: Omit<schema.Video, "id" | "createdAt" | "updatedAt">) {
    const [video] = await db.insert(schema.videos).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    
    return video;
  },

  async updateVideo(id: number, data: Partial<schema.Video>) {
    const [video] = await db.update(schema.videos)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.videos.id, id))
      .returning();
    
    return video;
  },

  // Video Analytics operations
  async getVideoAnalytics(videoId: number) {
    return await db.query.videoAnalytics.findMany({
      where: eq(schema.videoAnalytics.videoId, videoId),
      orderBy: [desc(schema.videoAnalytics.date)],
    });
  },

  async addVideoAnalytics(data: Omit<schema.VideoAnalytics, "id" | "createdAt">) {
    const [analytics] = await db.insert(schema.videoAnalytics).values(data).returning();
    return analytics;
  },

  // Keywords operations
  async getKeywordsByUserId(userId: number) {
    return await db.query.keywords.findMany({
      where: eq(schema.keywords.userId, userId),
      orderBy: [desc(schema.keywords.volume)],
    });
  },

  async createKeyword(data: Omit<schema.Keyword, "id" | "createdAt" | "updatedAt">) {
    const [keyword] = await db.insert(schema.keywords).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    
    return keyword;
  },

  // Settings operations
  async getSettingsByUserId(userId: number) {
    const settings = await db.query.settings.findMany({
      where: eq(schema.settings.userId, userId),
    });
    
    // Convert to a key-value object for easier consumption
    const settingsObj: Record<string, string> = {};
    settings.forEach(setting => {
      if (setting.key && setting.value) {
        settingsObj[setting.key] = setting.value;
      }
    });
    
    return settingsObj;
  },

  async getSetting(userId: number, key: string) {
    return await db.query.settings.findFirst({
      where: and(
        eq(schema.settings.userId, userId),
        eq(schema.settings.key, key),
      ),
    });
  },

  async updateSetting(userId: number, key: string, value: string) {
    // Check if setting exists
    const existingSetting = await this.getSetting(userId, key);
    
    if (existingSetting) {
      // Update existing setting
      const [setting] = await db.update(schema.settings)
        .set({
          value,
          updatedAt: new Date(),
        })
        .where(and(
          eq(schema.settings.userId, userId),
          eq(schema.settings.key, key),
        ))
        .returning();
      
      return setting;
    } else {
      // Create new setting
      const [setting] = await db.insert(schema.settings).values({
        userId,
        key,
        value,
        updatedAt: new Date(),
      }).returning();
      
      return setting;
    }
  },

  // API Quota tracking
  async getApiQuotasByUserId(userId: number) {
    const apiKeys = await db.query.apiKeys.findMany({
      where: eq(schema.apiKeys.userId, userId),
      columns: {
        id: true,
        type: true,
        name: true,
        quotaLimit: true,
        quotaUsed: true,
        isActive: true,
      },
    });
    
    return apiKeys;
  },

  // Dashboard stats
  async getDashboardStats(userId: number) {
    // Get total views for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const videosWithAnalytics = await db.query.videos.findMany({
      where: eq(schema.videos.userId, userId),
      with: {
        analytics: {
          where: sql`${schema.videoAnalytics.date} >= ${thirtyDaysAgo}`,
        },
      },
    });
    
    // Calculate total views, watch time, etc.
    let totalViews = 0;
    let totalWatchTimeHours = 0;
    let totalSubscribers = 0; // This would come from YouTube API in a real implementation
    let totalLikes = 0;
    let averageCTR = 0;
    let ctrValues: number[] = [];
    
    videosWithAnalytics.forEach(video => {
      video.analytics?.forEach(analytics => {
        totalViews += analytics.views || 0;
        totalWatchTimeHours += analytics.watchTimeHours || 0;
        totalLikes += analytics.likes || 0;
        
        // Parse CTR (remove % and convert to number)
        if (analytics.ctr) {
          const ctrValue = parseFloat(analytics.ctr.replace('%', ''));
          if (!isNaN(ctrValue)) {
            ctrValues.push(ctrValue);
          }
        }
      });
    });
    
    // Calculate average CTR
    if (ctrValues.length > 0) {
      averageCTR = ctrValues.reduce((sum, val) => sum + val, 0) / ctrValues.length;
    }
    
    // Get top keywords
    const topKeywords = await db.query.keywords.findMany({
      where: eq(schema.keywords.userId, userId),
      orderBy: [desc(schema.keywords.volume)],
      limit: 5,
    });
    
    // In a real application, the subscriber count would come from the YouTube API
    // For this demo, we'll use a simulated value
    totalSubscribers = 3721;
    
    return {
      totalViews,
      totalWatchTimeHours,
      totalSubscribers,
      totalLikes,
      averageCTR: averageCTR.toFixed(1) + '%',
      topKeywords,
      recentVideos: videosWithAnalytics.slice(0, 4),
    };
  },

  // Video optimization operations
  async getVideoOptimizations(videoId: number) {
    const video = await this.getVideoById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }
    
    return video.optimizationNotes || { issues: [] };
  },

  async generateVideoOptimizations(videoId: number) {
    const video = await this.getVideoById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }
    
    // In a real application, this would call the OpenAI service to analyze the video
    // and generate optimization suggestions
    
    // For now, simulate some optimization suggestions
    const optimizationNotes = {
      issues: [
        "Title lacks emotional trigger words",
        "Description too short (only " + (video.description?.split(' ').length || 0) + " words)",
        "Missing recommended tags: youtube tutorial, how-to guide, step by step",
        "Thumbnail contrast could be improved",
        "Missing call-to-action in the first paragraph"
      ],
      suggestions: {
        title: "Ultimate Guide: " + video.title + " [Step-by-Step Tutorial]",
        description: "This expanded description would include more keywords, a strong call-to-action, and better formatting with timestamps.",
        tags: [...(video.tags || []), "youtube tutorial", "how-to guide", "step by step"]
      }
    };
    
    // Update the video with optimization notes
    await this.updateVideo(videoId, {
      optimizationNotes,
      lastAnalyzed: new Date(),
    });
    
    return optimizationNotes;
  }
};
