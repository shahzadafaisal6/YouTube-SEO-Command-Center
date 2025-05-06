import React, { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch
} from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { File, Copy, Check, MessageSquare, Hash, Clock } from "lucide-react";

export default function DescriptionWriter() {
  const [videoTitle, setVideoTitle] = useState('');
  const [contentSummary, setContentSummary] = useState('');
  const [keywords, setKeywords] = useState('');
  const [includeTimestamps, setIncludeTimestamps] = useState('yes');
  const [includeLinks, setIncludeLinks] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [wasCopied, setWasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    if (generatedDescription) {
      navigator.clipboard.writeText(generatedDescription);
      setWasCopied(true);
      setTimeout(() => setWasCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "The description has been copied to your clipboard."
      });
    }
  };

  const generateDescription = async () => {
    if (!videoTitle || !contentSummary) {
      toast({
        title: "Missing information",
        description: "Please enter a video title and content summary",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedDescription('');

    try {
      // In a real implementation, we would call the API
      // const response = await apiRequest({
      //   url: "/api/ai/generate-description",
      //   method: "POST",
      //   data: {
      //     videoTitle,
      //     content: contentSummary,
      //     keywords: keywords.split(',').map(k => k.trim()),
      //     includeTimestamps,
      //   },
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response
      const mockDescription = `🔍 ${videoTitle} 🔍

In this comprehensive guide, I'm breaking down exactly how to optimize your YouTube videos for maximum visibility and engagement. Whether you're just starting out or looking to take your channel to the next level, these proven strategies will help you climb the YouTube rankings.

${includeTimestamps === 'yes' ? `📋 TIMESTAMPS:
0:00 - Introduction
1:35 - Why YouTube SEO Matters
4:12 - Keyword Research Techniques
8:47 - Title Optimization Strategies
12:23 - Description Best Practices
17:05 - Thumbnail Design Tips
21:44 - Engagement Tactics That Work
25:38 - Analytics Interpretation
29:15 - Conclusion and Next Steps

` : ''}${contentSummary}

${includeLinks ? `🔗 RESOURCES MENTIONED:
→ YouTube Studio Analytics: https://studio.youtube.com
→ TubeBuddy SEO Extension: https://tubebuddy.com
→ VidIQ Keyword Tool: https://vidiq.com
→ My Free SEO Checklist: https://yourwebsite.com/checklist

` : ''}${includeHashtags ? `#YouTubeSEO #VideoOptimization #ContentCreator ${keywords.split(',').map(k => `#${k.trim().replace(/\s+/g, '')}`).join(' ')}` : ''}`;
      
      setGeneratedDescription(mockDescription);
    } catch (error) {
      console.error("Error generating description:", error);
      toast({
        title: "Error",
        description: "Failed to generate description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Description Writer</h1>
            <p className="text-gray-400">Create SEO-optimized video descriptions with perfect formatting</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#151827] border-[#1e2231] text-white">
              <CardHeader>
                <CardTitle>Generate Description</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your video details to create an optimized description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Video Title</Label>
                  <Input
                    placeholder="E.g., YouTube SEO: Complete Guide (2025)"
                    className="bg-[#1e2231] border-[#2a3146] text-white"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Content Summary</Label>
                  <Textarea
                    placeholder="Briefly describe what your video covers, main points, etc."
                    className="min-h-[120px] bg-[#1e2231] border-[#2a3146] text-white"
                    value={contentSummary}
                    onChange={(e) => setContentSummary(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Provide details about your video content to generate a relevant description
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Target Keywords</Label>
                  <Input
                    placeholder="youtube seo, video ranking, keyword research, etc."
                    className="bg-[#1e2231] border-[#2a3146] text-white"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Enter keywords separated by commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Include Timestamps</Label>
                  <Select value={includeTimestamps} onValueChange={setIncludeTimestamps}>
                    <SelectTrigger className="bg-[#1e2231] border-[#2a3146] text-white">
                      <SelectValue placeholder="Include timestamps?" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                      <SelectItem value="yes">Yes, generate timestamps</SelectItem>
                      <SelectItem value="no">No timestamps needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Timestamps help viewers navigate your video and improve retention
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-300">Include Resource Links</Label>
                      <p className="text-xs text-gray-500">
                        Add relevant links mentioned in the video
                      </p>
                    </div>
                    <Switch
                      checked={includeLinks}
                      onCheckedChange={setIncludeLinks}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-gray-300">Include Hashtags</Label>
                      <p className="text-xs text-gray-500">
                        Add hashtags at the end of the description
                      </p>
                    </div>
                    <Switch
                      checked={includeHashtags}
                      onCheckedChange={setIncludeHashtags}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="gradient-primary w-full"
                  disabled={isGenerating}
                  onClick={generateDescription}
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Generating Description...
                    </>
                  ) : (
                    <>
                      <File className="h-4 w-4 mr-2" /> Generate Description
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#151827] border-[#1e2231] text-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Generated Description</CardTitle>
                  <CardDescription className="text-gray-400">
                    Ready to copy and use for your video
                  </CardDescription>
                </div>
                {generatedDescription && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#2a3146] text-gray-300 hover:text-white"
                    onClick={copyToClipboard}
                  >
                    {wasCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" /> Copy All
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="min-h-[500px]">
                {generatedDescription ? (
                  <div className="bg-[#1a1f2e] p-4 rounded-lg relative">
                    <pre className="text-white whitespace-pre-wrap font-sans text-sm">
                      {generatedDescription}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <File className="h-12 w-12 text-gray-500 mb-3" />
                    <h3 className="text-lg text-gray-300 mb-1">No description generated yet</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-md">
                      Fill in the form and click "Generate Description" to create an optimized YouTube description
                    </p>
                    
                    <div className="grid grid-cols-3 gap-6 w-full max-w-md">
                      <div className="flex flex-col items-center">
                        <div className="bg-[#252a3a] h-10 w-10 rounded-full flex items-center justify-center mb-2">
                          <MessageSquare className="h-5 w-5 text-indigo-400" />
                        </div>
                        <p className="text-xs text-gray-400 text-center">Engaging <br/>Copy</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-[#252a3a] h-10 w-10 rounded-full flex items-center justify-center mb-2">
                          <Clock className="h-5 w-5 text-indigo-400" />
                        </div>
                        <p className="text-xs text-gray-400 text-center">Clickable <br/>Timestamps</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-[#252a3a] h-10 w-10 rounded-full flex items-center justify-center mb-2">
                          <Hash className="h-5 w-5 text-indigo-400" />
                        </div>
                        <p className="text-xs text-gray-400 text-center">Optimized <br/>Hashtags</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              
              {generatedDescription && (
                <CardFooter className="border-t border-[#1e2231] pt-4">
                  <div className="w-full">
                    <div className="text-sm text-gray-300 mb-2">Description Analysis:</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#1a1f2e] p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Character Count</div>
                        <div className="text-sm font-medium">{generatedDescription.length} / 5000</div>
                        <div className="w-full h-1.5 bg-[#252a3a] rounded-full mt-1.5">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${Math.min(100, (generatedDescription.length / 5000) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-[#1a1f2e] p-3 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Keyword Density</div>
                        <div className="text-sm font-medium">Optimal ✓</div>
                        <div className="w-full h-1.5 bg-[#252a3a] rounded-full mt-1.5">
                          <div className="h-full bg-green-500 rounded-full w-[75%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}