import { Request, Response } from "express";
import { OpenAIService } from "../services/openaiService";

const openaiService = new OpenAIService();

export const aiController = {
  // Generate optimized title
  async generateTitle(req: Request, res: Response) {
    try {
      const { originalTitle, keywords, style } = req.body;
      
      if (!originalTitle) {
        return res.status(400).json({ error: "Original title is required" });
      }
      
      // Parse keywords if provided as string
      const keywordsArray = Array.isArray(keywords) 
        ? keywords 
        : typeof keywords === 'string' 
          ? keywords.split(',').map(k => k.trim()) 
          : [];
      
      // Get user ID from session
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Additional information based on style
      let stylePrompt = "";
      if (style === "curiosity") {
        stylePrompt = "Use curiosity-driven phrasing that makes viewers want to click to find out more.";
      } else if (style === "howto") {
        stylePrompt = "Format as a clear how-to tutorial title that promises specific actionable steps.";
      } else if (style === "list") {
        stylePrompt = "Format as a numbered list (e.g. 10 Ways to..., 5 Tips for...).";
      } else if (style === "question") {
        stylePrompt = "Format as an engaging question that viewers want answered.";
      } else if (style === "emotional") {
        stylePrompt = "Use emotional trigger words that create a strong reaction.";
      }
      
      // Generate optimized title with OpenAI
      const optimizedTitle = await openaiService.generateOptimizedTitle(
        userId, 
        originalTitle, 
        keywordsArray,
        stylePrompt
      );
      
      res.json({ result: optimizedTitle });
    } catch (error) {
      console.error("Error generating title:", error);
      res.status(500).json({ error: "Failed to generate optimized title" });
    }
  },
  
  // Generate optimized description
  async generateDescription(req: Request, res: Response) {
    try {
      const { videoTitle, content, keywords, includeTimestamps } = req.body;
      
      if (!videoTitle || !content) {
        return res.status(400).json({ 
          error: "Video title and content summary are required" 
        });
      }
      
      // Parse keywords if provided as string
      const keywordsArray = Array.isArray(keywords) 
        ? keywords 
        : typeof keywords === 'string' 
          ? keywords.split(',').map(k => k.trim()) 
          : [];
      
      // Get user ID from session
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Generate optimized description with OpenAI
      const optimizedDescription = await openaiService.generateOptimizedDescription(
        userId,
        content,
        keywordsArray,
        videoTitle,
        includeTimestamps === 'yes'
      );
      
      res.json({ result: optimizedDescription });
    } catch (error) {
      console.error("Error generating description:", error);
      res.status(500).json({ error: "Failed to generate optimized description" });
    }
  },
  
  // Generate tag suggestions
  async generateTags(req: Request, res: Response) {
    try {
      const { videoTitle, description, existingTags } = req.body;
      
      if (!videoTitle) {
        return res.status(400).json({ error: "Video title is required" });
      }
      
      // Parse existing tags if provided as string
      const existingTagsArray = Array.isArray(existingTags) 
        ? existingTags 
        : typeof existingTags === 'string' 
          ? existingTags.split(',').map(t => t.trim())
          : [];
      
      // Get user ID from session
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Generate tag suggestions with OpenAI
      const tagSuggestions = await openaiService.generateTagSuggestions(
        userId,
        videoTitle,
        description || "",
        existingTagsArray
      );
      
      res.json({ result: tagSuggestions });
    } catch (error) {
      console.error("Error generating tags:", error);
      res.status(500).json({ error: "Failed to generate tag suggestions" });
    }
  },
  
  // Analyze thumbnail
  async analyzeThumbnail(req: Request, res: Response) {
    try {
      const { thumbnailUrl, videoTitle } = req.body;
      
      if (!thumbnailUrl) {
        return res.status(400).json({ error: "Thumbnail URL is required" });
      }
      
      // Get user ID from session
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // For now, return a simulated analysis
      // In a real implementation, this would use the Vision API to analyze the thumbnail
      const analysis = `
Analysis of thumbnail for "${videoTitle || 'your video'}":

1. Text Visibility: ⚠️ The text may be difficult to read on smaller screens. Consider increasing the font size or reducing the amount of text.

2. Visual Hierarchy: ✅ Good use of focal point that draws the viewer's attention.

3. Color Contrast: ✅ Strong contrast between elements makes the thumbnail stand out in search results.

4. Branding: ⚠️ Missing consistent brand elements that would make your content recognizable.

5. Click-worthiness: ⚠️ Medium. The thumbnail could benefit from more emotional appeal or curiosity triggers.

Recommendations:
- Increase text size by at least 20%
- Add your channel logo or brand elements for consistency
- Consider using more vibrant colors to stand out
- Add a human face or expression to increase emotional connection
- Test a version with fewer words but more impact
      `;
      
      res.json({ result: analysis });
    } catch (error) {
      console.error("Error analyzing thumbnail:", error);
      res.status(500).json({ error: "Failed to analyze thumbnail" });
    }
  },
  
  // SEO Chat
  async seoChat(req: Request, res: Response) {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }
      
      // Get user ID from session
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // In a real implementation, this would use the OpenAI service to
      // generate a response to the SEO question
      // For now, simulate a response
      
      // Detect common SEO questions and respond accordingly
      let response = '';
      
      const questionLower = question.toLowerCase();
      
      if (questionLower.includes('algorithm') || questionLower.includes('ranking')) {
        response = `The YouTube algorithm weighs several factors including:

1. Watch time and engagement metrics (likes, comments, shares)
2. Click-through rate from impressions
3. Audience retention (what percentage of your video people watch)
4. Upload frequency and consistency
5. Topical relevance to viewer interests

To improve rankings, focus on increasing watch time by creating content that keeps viewers engaged throughout. Also optimize your titles, descriptions and tags with relevant keywords.`;
      } 
      else if (questionLower.includes('tags') || questionLower.includes('hashtag')) {
        response = `YouTube tags and hashtags serve different purposes:

Tags: These are hidden keywords that help YouTube understand your content. Include a mix of specific and broad tags, with the most important ones first. Limit to 10-15 relevant tags.

Hashtags: These appear above your title and in search results. Use 3-5 highly relevant hashtags. The first 3 will show above your title.

Best practices:
- Research competitors' tags using browser extensions
- Include common misspellings of key terms
- Use some long-tail keyword phrases
- Update tags on older videos to keep them relevant`;
      }
      else if (questionLower.includes('title') || questionLower.includes('headline')) {
        response = `Effective YouTube titles should:

1. Include primary keyword near the beginning
2. Be 50-60 characters long (to avoid truncation)
3. Create curiosity or promise clear value
4. Use numbers when relevant (e.g., "7 Ways to...")
5. Include emotional trigger words when appropriate

Avoid:
- Misleading clickbait that doesn't deliver
- All caps (except for emphasis on 1-2 words)
- Overused phrases that make your content seem generic

Research shows that titles with clear benefits and emotional triggers can increase CTR by 15-25%.`;
      }
      else {
        response = `Thank you for your YouTube SEO question. While I don't have a specific pre-programmed answer for this exact query, here's what I can tell you:

SEO success on YouTube comes down to understanding both user intent and the algorithm. Focus on creating high-quality content that delivers on the promise of your title and thumbnail, while also optimizing the technical aspects (metadata, tags, etc.).

Remember that engagement metrics like watch time, click-through rate, and audience retention have the biggest impact on rankings. Work on improving those metrics through better content rather than trying to "trick" the algorithm.

Would you like more specific information about a particular aspect of YouTube SEO?`;
      }
      
      res.json({ result: response });
    } catch (error) {
      console.error("Error with SEO chat:", error);
      res.status(500).json({ error: "Failed to process SEO question" });
    }
  }
};