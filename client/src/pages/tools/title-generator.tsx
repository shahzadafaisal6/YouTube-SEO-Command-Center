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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";

export default function TitleGenerator() {
  const [originalTitle, setOriginalTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [style, setStyle] = useState('curiosity');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [wasCopied, setWasCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setWasCopied(true);
    setTimeout(() => setWasCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "The title has been copied to your clipboard."
    });
  };

  const generateTitles = async () => {
    if (!originalTitle) {
      toast({
        title: "Missing information",
        description: "Please enter an original title or topic",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedTitles([]);
    setSelectedTitle('');

    try {
      // In a real implementation, we would call the API
      // const response = await apiRequest({
      //   url: "/api/ai/generate-title",
      //   method: "POST",
      //   data: {
      //     originalTitle,
      //     keywords: keywords.split(',').map(k => k.trim()),
      //     style,
      //   },
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response based on style
      let mockTitles: string[] = [];
      
      if (style === 'curiosity') {
        mockTitles = [
          `The Hidden Truth About ${originalTitle} - YouTube Experts Won't Tell You This`,
          `I Discovered Why ${originalTitle} Actually Works (Surprising Results)`,
          `What Really Happens When You Try ${originalTitle}? The Answer Will Shock You`,
          `Is ${originalTitle} a Myth? Here's What We Found Out`,
          `The ${originalTitle} Secret That Changed Everything`,
        ];
      } else if (style === 'howto') {
        mockTitles = [
          `How to Master ${originalTitle} in 5 Simple Steps (Complete Guide 2025)`,
          `The Step-by-Step Process to ${originalTitle} That Actually Works`,
          `How to ${originalTitle} Like a Pro: Actionable Tutorial for Beginners`,
          `The Ultimate Guide to ${originalTitle}: From Beginner to Expert`,
          `How I ${originalTitle} to Get Amazing Results (Proven Method)`,
        ];
      } else if (style === 'list') {
        mockTitles = [
          `7 Proven Ways to ${originalTitle} That Will Transform Your Results`,
          `10 ${originalTitle} Hacks That Will Save You Hours Every Week`,
          `5 Powerful ${originalTitle} Techniques the Pros Use`,
          `8 Common ${originalTitle} Mistakes (And How to Avoid Them)`,
          `12 Essential ${originalTitle} Tips for Faster Growth`,
        ];
      } else if (style === 'question') {
        mockTitles = [
          `Is ${originalTitle} Really Worth It in 2025? Here's My Honest Answer`,
          `How Does ${originalTitle} Actually Work? (Finally Explained)`,
          `Why Isn't Your ${originalTitle} Strategy Working? Here's The Solution`,
          `What Makes ${originalTitle} So Effective? I Tested It To Find Out`,
          `Can Anyone Master ${originalTitle}? The Truth Revealed`,
        ];
      } else if (style === 'emotional') {
        mockTitles = [
          `I Tried ${originalTitle} for 30 Days and It Changed My Life`,
          `The Shocking Truth About ${originalTitle} Nobody Talks About`,
          `You Won't Believe What Happened When I Mastered ${originalTitle}`,
          `Stop Wasting Time with ${originalTitle} Until You Watch This`,
          `Why I'll Never Go Back After Discovering This ${originalTitle} Method`,
        ];
      }
      
      setGeneratedTitles(mockTitles);
    } catch (error) {
      console.error("Error generating titles:", error);
      toast({
        title: "Error",
        description: "Failed to generate titles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectTitle = (title: string) => {
    setSelectedTitle(title);
  };

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">YouTube Title Generator</h1>
            <p className="text-gray-400">Create high-performing, SEO-optimized video titles</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#151827] border-[#1e2231] text-white">
              <CardHeader>
                <CardTitle>Generate Title</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your video topic and keywords to generate optimized titles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Original Title or Topic</Label>
                  <Textarea
                    placeholder="E.g., How to rank videos on YouTube"
                    className="min-h-[100px] bg-[#1e2231] border-[#2a3146] text-white"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Enter your current title or a description of your video topic
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Target Keywords</Label>
                  <Input
                    placeholder="youtube seo, video ranking, seo optimization, etc."
                    className="bg-[#1e2231] border-[#2a3146] text-white"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Enter keywords separated by commas
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Title Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-[#1e2231] border-[#2a3146] text-white">
                      <SelectValue placeholder="Select a title style" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                      <SelectItem value="curiosity">Curiosity-Driven</SelectItem>
                      <SelectItem value="howto">How-To / Tutorial</SelectItem>
                      <SelectItem value="list">List-Based (Top 10, etc.)</SelectItem>
                      <SelectItem value="question">Question-Based</SelectItem>
                      <SelectItem value="emotional">Emotional Appeal</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Choose a style that best fits your content type
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="gradient-primary w-full"
                  disabled={isGenerating}
                  onClick={generateTitles}
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Generating Titles...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" /> Generate Titles
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              {selectedTitle && (
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader className="pb-2">
                    <CardTitle>Selected Title</CardTitle>
                    <CardDescription className="text-gray-400">
                      Ready to use for your video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#1a1f2e] p-4 rounded-lg relative group">
                      <p className="text-lg font-medium text-white">{selectedTitle}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#252a3a] hover:bg-[#313a52] text-gray-300"
                        onClick={() => copyToClipboard(selectedTitle)}
                      >
                        {wasCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-4 bg-[#1a1f2e] p-3 rounded-lg">
                      <div className="text-sm text-gray-300 mb-2">Title Analysis:</div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Length: {selectedTitle.length} characters (Optimal: 40-60)</li>
                        <li>• Contains main keyword: {keywords.split(',')[0] ? (selectedTitle.toLowerCase().includes(keywords.split(',')[0].trim().toLowerCase()) ? 'Yes ✓' : 'No ✗') : 'N/A'}</li>
                        <li>• Hook strength: Strong</li>
                        <li>• CTR potential: High</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-[#151827] border-[#1e2231] text-white">
                <CardHeader>
                  <CardTitle>Generated Titles</CardTitle>
                  <CardDescription className="text-gray-400">
                    Click on a title to select it
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {generatedTitles.length === 0 ? (
                    <div className="text-center py-8">
                      <Wand2 className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                      <h3 className="text-lg text-gray-300 mb-1">No titles generated yet</h3>
                      <p className="text-sm text-gray-400">
                        Fill in the form and click "Generate Titles" to see results
                      </p>
                    </div>
                  ) : (
                    generatedTitles.map((title, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedTitle === title 
                            ? 'bg-indigo-500/20 border border-indigo-500/50' 
                            : 'bg-[#1a1f2e] hover:bg-[#252a3a] border border-transparent'
                        }`}
                        onClick={() => selectTitle(title)}
                      >
                        <p className="font-medium text-white">{title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-400">
                            {title.length} characters
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <ThumbsUp className="h-4 w-4 text-gray-400 hover:text-green-400" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                              <ThumbsDown className="h-4 w-4 text-gray-400 hover:text-red-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
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