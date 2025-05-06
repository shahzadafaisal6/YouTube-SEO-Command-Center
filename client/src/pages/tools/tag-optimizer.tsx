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
  Badge
} from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Tag, 
  Copy, 
  Check, 
  Plus, 
  X, 
  Trash2, 
  TrendingUp, 
  Search, 
  BarChart4,
  ArrowRight
} from "lucide-react";

export default function TagOptimizer() {
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [wasCopied, setWasCopied] = useState(false);
  const { toast } = useToast();

  const addExistingTag = () => {
    if (!currentTag.trim()) return;
    
    if (existingTags.includes(currentTag.trim())) {
      toast({
        title: "Duplicate tag",
        description: "This tag has already been added",
        variant: "destructive",
      });
      return;
    }
    
    setExistingTags([...existingTags, currentTag.trim()]);
    setCurrentTag('');
  };

  const removeExistingTag = (tag: string) => {
    setExistingTags(existingTags.filter(t => t !== tag));
  };

  const addSelectedTag = (tag: string) => {
    if (selectedTags.includes(tag)) return;
    setSelectedTags([...selectedTags, tag]);
  };

  const removeSelectedTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const copyToClipboard = () => {
    if (selectedTags.length > 0) {
      navigator.clipboard.writeText(selectedTags.join(', '));
      setWasCopied(true);
      setTimeout(() => setWasCopied(false), 2000);
      toast({
        title: "Copied to clipboard",
        description: "The tags have been copied to your clipboard."
      });
    }
  };

  const generateTags = async () => {
    if (!videoTitle) {
      toast({
        title: "Missing information",
        description: "Please enter a video title",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedTags([]);
    setSelectedTags([]);

    try {
      // In a real implementation, we would call the API
      // const response = await apiRequest({
      //   url: "/api/ai/generate-tags",
      //   method: "POST",
      //   data: {
      //     videoTitle,
      //     description: videoDescription,
      //     existingTags,
      //   },
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - in real application this would come from the OpenAI API
      // Generate mock tags based on the title
      const titleWords = videoTitle.toLowerCase().split(' ').filter(word => word.length > 3);
      
      const mockTagPool = [
        "youtube seo", "video optimization", "content strategy", "keyword research", 
        "video ranking", "youtube algorithm", "thumbnail design", "title optimization",
        "metadata tips", "youtube growth", "youtube success", "content creation",
        "youtube analytics", "channel growth", "youtube marketing", "video seo",
        "youtube tips", "youtube strategy", "video engagement", "audience retention",
        "youtube studio", "youtube tutorial", "youtube secrets", "rank videos"
      ];
      
      // Include some tags from the title
      let generatedTagsList = titleWords.map(word => 
        word.length > 5 ? word : word + " optimization"
      );
      
      // Add tags from the mock pool that aren't in existing tags
      const remainingTags = mockTagPool.filter(tag => !existingTags.includes(tag));
      const randomTags = remainingTags.sort(() => 0.5 - Math.random()).slice(0, 10);
      
      generatedTagsList = [...generatedTagsList, ...randomTags];
      
      // Remove duplicates and limit to 15 tags
      const uniqueTags = Array.from(new Set(generatedTagsList)).slice(0, 15);
      
      setGeneratedTags(uniqueTags);
      // Pre-select all generated tags
      setSelectedTags(uniqueTags);
    } catch (error) {
      console.error("Error generating tags:", error);
      toast({
        title: "Error",
        description: "Failed to generate tags. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate total character count of all selected tags combined
  const totalCharacterCount = selectedTags.join(' ').length;
  
  // YouTube allows up to 500 characters for tags
  const characterLimit = 500;
  const remainingCharacters = characterLimit - totalCharacterCount;

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Tag Optimizer</h1>
            <p className="text-gray-400">Generate and optimize tags to improve video discoverability</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="bg-[#151827] border-[#1e2231] text-white">
                <CardHeader>
                  <CardTitle>Generate Tags</CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your video details to generate optimized tags
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Video Title</Label>
                    <Input
                      placeholder="E.g., How to Rank Videos on YouTube in 2025"
                      className="bg-[#1e2231] border-[#2a3146] text-white"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Video Description (Optional)</Label>
                    <Textarea
                      placeholder="Enter your video description for more relevant tag suggestions"
                      className="min-h-[100px] bg-[#1e2231] border-[#2a3146] text-white"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Existing Tags (Optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter an existing tag"
                        className="bg-[#1e2231] border-[#2a3146] text-white"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExistingTag();
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        className="border-[#2a3146] text-gray-300"
                        onClick={addExistingTag}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {existingTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {existingTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-[#1a1f2e] text-gray-300 border-[#2a3146] flex items-center gap-1 hover:bg-[#1a1f2e]"
                          >
                            {tag}
                            <button
                              className="ml-1 hover:text-white"
                              onClick={() => removeExistingTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {existingTags.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-gray-400 hover:text-white p-0"
                            onClick={() => setExistingTags([])}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Clear All
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="gradient-primary w-full"
                    disabled={isGenerating}
                    onClick={generateTags}
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Generating Tags...
                      </>
                    ) : (
                      <>
                        <Tag className="h-4 w-4 mr-2" /> Generate Tags
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {generatedTags.length > 0 && (
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader className="pb-2">
                    <CardTitle>Suggested Tags</CardTitle>
                    <CardDescription className="text-gray-400">
                      Click on tags to add them to your selection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {generatedTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`cursor-pointer transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-500/30'
                              : 'bg-[#1a1f2e] text-gray-300 border-[#2a3146] hover:bg-[#252a3a]'
                          }`}
                          onClick={() => 
                            selectedTags.includes(tag) 
                              ? removeSelectedTag(tag) 
                              : addSelectedTag(tag)
                          }
                        >
                          {tag}
                          {selectedTags.includes(tag) ? (
                            <Check className="h-3 w-3 ml-1 text-indigo-300" />
                          ) : (
                            <Plus className="h-3 w-3 ml-1 text-gray-400" />
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-4 bg-[#1a1f2e] p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <div className="text-gray-400">Tag Strategy:</div>
                        <div className="text-indigo-400">Strong</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your tags include a mix of broad (YouTube SEO), medium (video ranking), and specific (title optimization) keywords.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-[#151827] border-[#1e2231] text-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Selected Tags</CardTitle>
                    <CardDescription className="text-gray-400">
                      Review and copy your finalized tags
                    </CardDescription>
                  </div>
                  {selectedTags.length > 0 && (
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
                <CardContent>
                  {selectedTags.length > 0 ? (
                    <div className="space-y-3">
                      <div className="bg-[#1a1f2e] p-4 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {selectedTags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-[#252a3a] text-white border-[#2a3146] flex items-center gap-1 hover:bg-[#252a3a]"
                            >
                              {tag}
                              <button
                                className="ml-1 hover:text-red-400"
                                onClick={() => removeSelectedTag(tag)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Character count:</span>
                        <span className={remainingCharacters < 0 ? 'text-red-400' : 'text-gray-300'}>
                          {totalCharacterCount}/{characterLimit} 
                          ({remainingCharacters >= 0 ? `${remainingCharacters} remaining` : `${Math.abs(remainingCharacters)} too many`})
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#252a3a] rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            remainingCharacters < 0 ? 'bg-red-500' : 
                            remainingCharacters < 100 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${Math.min(100, (totalCharacterCount / characterLimit) * 100)}%` }}
                        ></div>
                      </div>
                      
                      {remainingCharacters < 0 && (
                        <div className="text-sm text-red-400">
                          You've exceeded the character limit. Please remove some tags.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[200px] flex flex-col items-center justify-center text-center">
                      <Tag className="h-12 w-12 text-gray-500 mb-3" />
                      <h3 className="text-lg text-gray-300 mb-1">No tags selected</h3>
                      <p className="text-sm text-gray-400">
                        Generate tags or click on suggested tags to add them to your selection
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#151827] border-[#1e2231] text-white">
                <CardHeader>
                  <CardTitle>Tag Performance Insights</CardTitle>
                  <CardDescription className="text-gray-400">
                    Research data about your selected tags
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTags.length > 0 ? (
                    <div className="space-y-4">
                      <div className="bg-[#1a1f2e] rounded-lg overflow-hidden">
                        <div className="p-3 border-b border-[#2a3146]">
                          <div className="text-sm font-medium">Top 3 Performing Tags</div>
                        </div>
                        <div className="p-4 space-y-3">
                          {selectedTags.slice(0, 3).map((tag, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-7 w-7 rounded-full bg-[#252a3a] flex items-center justify-center mr-2">
                                  {index === 0 && <TrendingUp className="h-4 w-4 text-green-400" />}
                                  {index === 1 && <Search className="h-4 w-4 text-blue-400" />}
                                  {index === 2 && <BarChart4 className="h-4 w-4 text-indigo-400" />}
                                </div>
                                <span className="text-sm">{tag}</span>
                              </div>
                              <div>
                                {index === 0 && <span className="text-xs text-green-400">High volume</span>}
                                {index === 1 && <span className="text-xs text-blue-400">Low competition</span>}
                                {index === 2 && <span className="text-xs text-indigo-400">Trending</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1a1f2e] p-3 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Ranking Potential</div>
                          <div className="flex items-center">
                            <div className="flex-1 h-2 bg-[#252a3a] rounded-full">
                              <div className="h-full w-[75%] bg-green-500 rounded-full"></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">High</span>
                          </div>
                        </div>
                        <div className="bg-[#1a1f2e] p-3 rounded-lg">
                          <div className="text-xs text-gray-400 mb-1">Optimal Tag Count</div>
                          <div className="flex items-center">
                            <div className="flex-1 h-2 bg-[#252a3a] rounded-full">
                              <div 
                                className={`h-full rounded-full ${
                                  selectedTags.length < 8 ? 'bg-red-500' : 
                                  selectedTags.length > 15 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, (selectedTags.length / 15) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">{selectedTags.length}/15</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1a1f2e] p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Recommended Actions:</div>
                        <ul className="text-sm text-gray-400 space-y-1">
                          <li className="flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 text-indigo-400" /> 
                            Ensure your first 2-3 tags are the most important keywords
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 text-indigo-400" /> 
                            Include some long-tail keyword variations
                          </li>
                          <li className="flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1 text-indigo-400" /> 
                            Use the same tags consistently across related videos
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart4 className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                      <h3 className="text-lg text-gray-300 mb-1">No tags to analyze</h3>
                      <p className="text-sm text-gray-400">
                        Select tags to see performance insights
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}