import { storage } from "../storage";
import axios from "axios";
import { apiKeys } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@db";

export class YouTubeService {
  private baseUrl = "https://www.googleapis.com/youtube/v3";
  private currentApiKeyId: number | null = null;
  
  // Fetch best API key from database with rotation capability
  private async getApiKey(userId: number): Promise<string> {
    try {
      // Get YouTube API keys from database, ordered by lowest quota usage
      const availableKeys = await db.query.apiKeys.findMany({
        where: and(
          eq(apiKeys.userId, userId),
          eq(apiKeys.type, "youtube"),
          eq(apiKeys.isActive, true),
        ),
        orderBy: [
          // Order by quota used (ascending) to prioritize keys with most quota available
          { quotaUsed: "asc" }
        ],
      });
      
      // If no keys, try fallback to environment
      if (!availableKeys || availableKeys.length === 0) {
        return this.fallbackToEnvironmentKey();
      }
      
      // Find a key that has available quota
      const validKey = availableKeys.find(key => 
        key.quotaLimit === 0 || key.quotaUsed < key.quotaLimit
      );
      
      // If all keys are over quota, try fallback
      if (!validKey) {
        return this.fallbackToEnvironmentKey();
      }
      
      // Store the current key ID for tracking usage
      this.currentApiKeyId = validKey.id;
      
      return validKey.key;
    } catch (error) {
      console.error("Error getting YouTube API key:", error);
      return this.fallbackToEnvironmentKey();
    }
  }
  
  // Fallback to environment variable if no valid keys in database
  private fallbackToEnvironmentKey(): string {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      throw new Error("YouTube API key not found in environment variables or database");
    }
    
    this.currentApiKeyId = null;
    return apiKey;
  }
  
  // Fetch YouTube channel info
  async getChannelInfo(userId: number, channelId: string) {
    const apiKey = await this.getApiKey(userId);
    
    try {
      const response = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: "snippet,statistics,contentDetails",
          id: channelId,
          key: apiKey
        }
      });
      
      // Track API usage (50 units for channel request)
      await this.trackApiUsage(50);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching YouTube channel:", error);
      throw new Error("Failed to fetch YouTube channel data");
    }
  }
  
  // Fetch videos for a channel
  async getChannelVideos(userId: number, channelId: string, maxResults = 50) {
    const apiKey = await this.getApiKey(userId);
    
    try {
      // First get the uploads playlist ID from the channel
      const channelResponse = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: "contentDetails",
          id: channelId,
          key: apiKey
        }
      });
      
      const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
      
      // Now get the videos from the uploads playlist
      const videosResponse = await axios.get(`${this.baseUrl}/playlistItems`, {
        params: {
          part: "snippet,contentDetails",
          playlistId: uploadsPlaylistId,
          maxResults,
          key: apiKey
        }
      });
      
      // Get full video details for all videos
      const videoIds = videosResponse.data.items.map((item: any) => item.contentDetails.videoId).join(",");
      
      const videoDetailsResponse = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: "snippet,statistics,contentDetails",
          id: videoIds,
          key: apiKey
        }
      });
      
      // Track API usage (1 unit for channel, 1 unit for playlist, 1 unit for video list)
      await this.trackApiUsage(3);
      
      return videoDetailsResponse.data;
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      throw new Error("Failed to fetch YouTube videos");
    }
  }
  
  // Fetch analytics for a video (in a real implementation, this would use the YouTube Analytics API)
  async getVideoAnalytics(userId: number, videoId: string) {
    const apiKey = await this.getApiKey(userId);
    
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: "statistics",
          id: videoId,
          key: apiKey
        }
      });
      
      // Track API usage (1 unit for video request)
      await this.trackApiUsage(1);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching YouTube video analytics:", error);
      throw new Error("Failed to fetch YouTube video analytics");
    }
  }
  
  // Fetch video tags
  async getVideoTags(userId: number, videoId: string) {
    const apiKey = await this.getApiKey(userId);
    
    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: "snippet",
          id: videoId,
          key: apiKey
        }
      });
      
      // Track API usage (1 unit for video request)
      await this.trackApiUsage(1);
      
      return response.data.items[0].snippet.tags || [];
    } catch (error) {
      console.error("Error fetching YouTube video tags:", error);
      throw new Error("Failed to fetch YouTube video tags");
    }
  }
  
  // Track API usage and handle key rotation when quota limits are reached
  private async trackApiUsage(units: number) {
    try {
      // If using a database API key, track its usage
      if (this.currentApiKeyId) {
        await storage.incrementApiKeyUsage(this.currentApiKeyId, units);
        
        // Check if the key has exceeded its quota
        const apiKey = await storage.getApiKeyById(this.currentApiKeyId);
        if (apiKey && apiKey.quotaLimit > 0 && apiKey.quotaUsed >= apiKey.quotaLimit) {
          // Force a new key selection on next API call
          this.currentApiKeyId = null;
        }
      }
    } catch (error) {
      console.error("Error tracking YouTube API usage:", error);
      // Don't throw to avoid interrupting the main operation
    }
  }
  
  // Update video metadata (requires OAuth)
  async updateVideoMetadata(userId: number, videoId: string, data: {
    title?: string;
    description?: string;
    tags?: string[];
    categoryId?: string;
  }) {
    // In a real implementation, this would use the YouTube Data API with OAuth
    // to update the video metadata
    // For this demo, we'll just return success
    return { success: true };
  }
}
