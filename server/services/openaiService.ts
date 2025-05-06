import { storage } from "../storage";
import OpenAI from "openai";
import { apiKeys } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@db";

export class OpenAIService {
  private openai: OpenAI | null = null;
  private currentApiKeyId: number | null = null;
  
  // Initialize OpenAI client with the best available API key
  private async initializeClient(userId: number): Promise<OpenAI> {
    try {
      // First try to get API keys from the database
      const availableKeys = await db.query.apiKeys.findMany({
        where: and(
          eq(apiKeys.userId, userId),
          eq(apiKeys.type, "openai"),
          eq(apiKeys.isActive, true),
        ),
        orderBy: [
          // Order by ratio of quota used to limit (ascending)
          // This will prioritize keys with the most available quota
          { quotaUsed: "asc" }
        ],
      });
      
      // If we have valid API keys, use the first one (lowest quota usage)
      if (availableKeys && availableKeys.length > 0) {
        const selectedKey = availableKeys[0];
        
        // Check if the key has exceeded its quota limit
        if (selectedKey.quotaLimit > 0 && selectedKey.quotaUsed >= selectedKey.quotaLimit) {
          // If all keys are exhausted, fall back to the environment variable
          if (availableKeys.every(key => key.quotaUsed >= key.quotaLimit)) {
            return this.fallbackToEnvironmentKey();
          }
          
          // Otherwise, try the next key
          const nextKey = availableKeys.find(key => key.quotaUsed < key.quotaLimit);
          if (nextKey) {
            this.currentApiKeyId = nextKey.id;
            this.openai = new OpenAI({ apiKey: nextKey.key });
            return this.openai;
          }
        }
        
        // Use the selected key
        this.currentApiKeyId = selectedKey.id;
        this.openai = new OpenAI({ apiKey: selectedKey.key });
        return this.openai;
      }
      
      // If no valid API keys in the database, fall back to environment variable
      return this.fallbackToEnvironmentKey();
    } catch (error) {
      console.error("Error initializing OpenAI client:", error);
      // Fall back to environment variable if there's an error
      return this.fallbackToEnvironmentKey();
    }
  }
  
  // Fall back to using the environment variable for the API key
  private fallbackToEnvironmentKey(): Promise<OpenAI> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OpenAI API key not found in environment variables or database");
    }
    
    this.currentApiKeyId = null;
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    this.openai = new OpenAI({ apiKey: apiKey });
    return Promise.resolve(this.openai);
  }
  
  // Generate optimized title based on original title and keywords
  async generateOptimizedTitle(userId: number, originalTitle: string, keywords: string[], stylePrompt: string = '') {
    const openai = await this.initializeClient(userId);
    
    try {
      const prompt = `
        Create a YouTube video title optimized for SEO that's engaging and clickable.
        Original title: "${originalTitle}"
        Target keywords: ${keywords.join(", ")}
        The title should be attention-grabbing, include important keywords, and be under 60 characters.
        ${stylePrompt}
        Only return the new title text without any explanations or quotes.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 60,
      });
      
      // Track API usage (approximate cost: $0.01)
      await this.trackApiUsage(userId, 0.01);
      
      return response.choices[0].message.content?.trim();
    } catch (error) {
      console.error("Error generating optimized title:", error);
      throw new Error("Failed to generate optimized title");
    }
  }
  
  // Generate optimized description based on original description and keywords
  async generateOptimizedDescription(
    userId: number, 
    originalDescription: string, 
    keywords: string[], 
    videoTitle: string = '', 
    includeTimestamps: boolean = true
  ) {
    const openai = await this.initializeClient(userId);
    
    try {
      const prompt = `
        Create a YouTube video description optimized for SEO.
        ${videoTitle ? `Video title: "${videoTitle}"` : ''}
        Original description: "${originalDescription}"
        Target keywords: ${keywords.join(", ")}
        
        The description should:
        1. Include target keywords naturally in the first 2-3 sentences
        2. Be 150-200 words in length
        ${includeTimestamps ? '3. Include timestamps for key sections (create 3-5 timestamps)' : '3. Do not include timestamps'}
        4. Have a clear call-to-action
        5. Include relevant hashtags at the end
        
        Only return the new description without any explanations.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
      });
      
      // Track API usage (approximate cost: $0.03)
      await this.trackApiUsage(userId, 0.03);
      
      return response.choices[0].message.content?.trim();
    } catch (error) {
      console.error("Error generating optimized description:", error);
      throw new Error("Failed to generate optimized description");
    }
  }
  
  // Generate tag suggestions based on video content and trending keywords
  async generateTagSuggestions(userId: number, videoTitle: string, videoDescription: string, existingTags: string[] = []) {
    const openai = await this.initializeClient(userId);
    
    try {
      const prompt = `
        Generate a list of 15 optimized YouTube tags/keywords for my video.
        
        Video title: "${videoTitle}"
        Video description: "${videoDescription}"
        Existing tags: ${existingTags.join(", ")}
        
        Rules for the tags:
        1. Include a mix of broad, medium, and specific long-tail keywords
        2. Each tag should be 1-5 words maximum
        3. Format as a JSON array of strings
        4. Don't repeat existing tags
        5. Focus on searchable terms related to the content
        6. Include some trending/popular related terms
        
        Return ONLY a valid JSON array of strings without any additional text or explanation.
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 300,
      });
      
      // Track API usage (approximate cost: $0.02)
      await this.trackApiUsage(userId, 0.02);
      
      const content = response.choices[0].message.content;
      if (!content) return [];
      
      try {
        const jsonResponse = JSON.parse(content);
        return jsonResponse.tags || [];
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        return [];
      }
    } catch (error) {
      console.error("Error generating tag suggestions:", error);
      throw new Error("Failed to generate tag suggestions");
    }
  }
  
  // Analyze video content for SEO suggestions
  async analyzeVideoContent(userId: number, videoTitle: string, videoDescription: string, tags: string[] = []) {
    const openai = await this.initializeClient(userId);
    
    try {
      const prompt = `
        Analyze this YouTube video content for SEO improvement opportunities.
        
        Video title: "${videoTitle}"
        Video description: "${videoDescription}"
        Tags: ${tags.join(", ")}
        
        Provide a detailed analysis with:
        1. SEO score (0-100)
        2. List of specific issues that should be improved
        3. Suggestions for title improvement
        4. Suggestions for description improvement
        5. Suggested tags to add
        
        Return the analysis as a JSON object with the following structure:
        {
          "score": number,
          "issues": string[],
          "suggestions": {
            "title": string,
            "description": string,
            "tags": string[]
          }
        }
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 700,
      });
      
      // Track API usage (approximate cost: $0.05)
      await this.trackApiUsage(userId, 0.05);
      
      const content = response.choices[0].message.content;
      if (!content) return null;
      
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        return null;
      }
    } catch (error) {
      console.error("Error analyzing video content:", error);
      throw new Error("Failed to analyze video content");
    }
  }
  
  // Track API usage for billing purposes
  private async trackApiUsage(userId: number, cost: number) {
    try {
      // If we're using a database API key, increment its usage
      if (this.currentApiKeyId) {
        // Convert cost to units (for simplicity, 1 unit = $0.01)
        const units = Math.ceil(cost * 100);
        await storage.incrementApiKeyUsage(this.currentApiKeyId, units);
        
        // Check if this key is now over its quota limit
        const apiKey = await storage.getApiKeyById(this.currentApiKeyId);
        if (apiKey && apiKey.quotaLimit > 0 && apiKey.quotaUsed >= apiKey.quotaLimit) {
          // Reset the client to force fetching a new key on next request
          this.openai = null;
          this.currentApiKeyId = null;
        }
        return;
      }
      
      // If we're using the environment variable (or no currentApiKeyId), 
      // try to find a database key to track usage
      const apiKeys = await storage.getApiKeysByUserId(userId);
      const openaiApiKey = apiKeys.find(key => key.type === "openai" && key.isActive);
      
      if (openaiApiKey) {
        // Convert cost to units (for simplicity, 1 unit = $0.01)
        const units = Math.ceil(cost * 100);
        await storage.incrementApiKeyUsage(openaiApiKey.id, units);
      }
    } catch (error) {
      console.error("Error tracking API usage:", error);
      // Don't throw here to avoid interrupting the main operation
    }
  }
}
