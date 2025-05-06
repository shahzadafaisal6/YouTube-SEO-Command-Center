import React, { useState } from 'react';
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Image, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  X,
  BarChart4,
  ExternalLink,
  Eye,
  LineChart
} from "lucide-react";

export default function ThumbnailAnalyzer() {
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    analysis: {
      textVisibility: { score: number; feedback: string };
      colorContrast: { score: number; feedback: string };
      visualHierarchy: { score: number; feedback: string };
      branding: { score: number; feedback: string };
      relevance: { score: number; feedback: string };
    };
    recommendations: string[];
  } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      // Clear the URL input since we're using a file
      setThumbnailUrl('');
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  const clearImage = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const analyzeThumbnail = async () => {
    if (!thumbnailUrl && !previewUrl) {
      toast({
        title: "Missing image",
        description: "Please enter a thumbnail URL or upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // In a real implementation, we would call the API
      // const formData = new FormData();
      // if (file) {
      //   formData.append('file', file);
      // } else {
      //   formData.append('thumbnailUrl', thumbnailUrl);
      // }
      // if (videoTitle) {
      //   formData.append('videoTitle', videoTitle);
      // }
      
      // const response = await apiRequest({
      //   url: "/api/ai/analyze-thumbnail",
      //   method: "POST",
      //   data: formData,
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response with thumbnail analysis
      const mockResult = {
        score: 72,
        analysis: {
          textVisibility: { 
            score: 60, 
            feedback: "Text is present but may be difficult to read on mobile devices. Consider using larger font sizes and improving contrast behind text."
          },
          colorContrast: { 
            score: 85, 
            feedback: "Good color contrast between elements. The bright colors stand out against darker backgrounds, creating visual appeal."
          },
          visualHierarchy: { 
            score: 75, 
            feedback: "Clear focal point exists, but competing elements may distract viewers. Consider simplifying the composition."
          },
          branding: { 
            score: 55, 
            feedback: "Limited brand consistency. Consider adding a logo or consistent visual elements that match your channel identity."
          },
          relevance: { 
            score: 85, 
            feedback: "The thumbnail appears relevant to the video title, which helps set accurate viewer expectations."
          }
        },
        recommendations: [
          "Increase text size by at least 20% to improve readability on mobile devices",
          "Add your channel logo or brand elements for better recognition",
          "Reduce the number of elements to create a clearer focal point",
          "Test a version with a human face showing emotion to increase CTR",
          "Ensure text accurately represents video content to maintain viewer trust"
        ]
      };
      
      setAnalysisResult(mockResult);
    } catch (error) {
      console.error("Error analyzing thumbnail:", error);
      toast({
        title: "Error",
        description: "Failed to analyze thumbnail. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Thumbnail Analyzer</h1>
            <p className="text-gray-400">Optimize your thumbnails for better click-through rates</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#151827] border-[#1e2231] text-white">
              <CardHeader>
                <CardTitle>Analyze Thumbnail</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload or enter the URL of your thumbnail to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="url" className="space-y-4">
                  <TabsList className="bg-[#1a1f2e] border-[#2a3146]">
                    <TabsTrigger value="url" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                      Image URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                      Upload Image
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="url">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Thumbnail URL</Label>
                      <Input
                        placeholder="https://example.com/thumbnail.jpg"
                        className="bg-[#1e2231] border-[#2a3146] text-white"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Enter the direct URL to your thumbnail image
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload">
                    <div className="space-y-4">
                      <Label className="text-gray-300">Upload Thumbnail</Label>
                      <div className="border-2 border-dashed border-[#2a3146] rounded-lg p-4 text-center cursor-pointer relative"
                        onClick={() => document.getElementById('thumbnail-upload')?.click()}
                      >
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        
                        {previewUrl ? (
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="Thumbnail preview"
                              className="max-h-52 mx-auto rounded"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-7 w-7 p-0 bg-black/50 text-white hover:bg-black/70"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearImage();
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="py-6">
                            <Upload className="h-12 w-12 mx-auto text-gray-500 mb-3" />
                            <p className="text-sm text-gray-300 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 2MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label className="text-gray-300">Video Title (Optional)</Label>
                  <Input
                    placeholder="Enter your video title for context"
                    className="bg-[#1e2231] border-[#2a3146] text-white"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Providing the video title helps analyze thumbnail-title alignment
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="gradient-primary w-full"
                  disabled={isAnalyzing || (!thumbnailUrl && !previewUrl)}
                  onClick={analyzeThumbnail}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Analyzing Thumbnail...
                    </>
                  ) : (
                    <>
                      <Image className="h-4 w-4 mr-2" /> Analyze Thumbnail
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              {!analysisResult ? (
                <Card className="bg-[#151827] border-[#1e2231] text-white h-full">
                  <CardContent className="h-full flex flex-col items-center justify-center text-center p-8">
                    <BarChart4 className="h-12 w-12 text-gray-500 mb-3" />
                    <h3 className="text-lg text-gray-300 mb-1">No analysis yet</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-md">
                      Upload a thumbnail or enter its URL and click "Analyze Thumbnail" to get optimization insights
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                      <div className="bg-[#1a1f2e] p-4 rounded-lg flex flex-col items-center">
                        <Eye className="h-8 w-8 text-indigo-400 mb-2" />
                        <p className="text-sm text-white">Click-through Rate</p>
                        <p className="text-xs text-gray-400 mt-1">We analyze what makes viewers click</p>
                      </div>
                      <div className="bg-[#1a1f2e] p-4 rounded-lg flex flex-col items-center">
                        <LineChart className="h-8 w-8 text-indigo-400 mb-2" />
                        <p className="text-sm text-white">Performance Score</p>
                        <p className="text-xs text-gray-400 mt-1">Compare with high-performing thumbnails</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="bg-[#151827] border-[#1e2231] text-white">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle>Analysis Score</CardTitle>
                        <div className={`px-2 py-1 rounded text-sm ${
                          analysisResult.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          analysisResult.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {analysisResult.score}/100
                        </div>
                      </div>
                      <CardDescription className="text-gray-400">
                        Overall thumbnail performance assessment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">Text Visibility</span>
                            <span className="text-sm font-medium">
                              {analysisResult.analysis.textVisibility.score}/100
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#252a3a] rounded-full">
                            <div 
                              className={`h-full rounded-full ${
                                analysisResult.analysis.textVisibility.score >= 80 ? 'bg-green-500' :
                                analysisResult.analysis.textVisibility.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${analysisResult.analysis.textVisibility.score}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {analysisResult.analysis.textVisibility.feedback}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">Color Contrast</span>
                            <span className="text-sm font-medium">
                              {analysisResult.analysis.colorContrast.score}/100
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#252a3a] rounded-full">
                            <div 
                              className={`h-full rounded-full ${
                                analysisResult.analysis.colorContrast.score >= 80 ? 'bg-green-500' :
                                analysisResult.analysis.colorContrast.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${analysisResult.analysis.colorContrast.score}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {analysisResult.analysis.colorContrast.feedback}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">Visual Hierarchy</span>
                            <span className="text-sm font-medium">
                              {analysisResult.analysis.visualHierarchy.score}/100
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#252a3a] rounded-full">
                            <div 
                              className={`h-full rounded-full ${
                                analysisResult.analysis.visualHierarchy.score >= 80 ? 'bg-green-500' :
                                analysisResult.analysis.visualHierarchy.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${analysisResult.analysis.visualHierarchy.score}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {analysisResult.analysis.visualHierarchy.feedback}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">Branding</span>
                            <span className="text-sm font-medium">
                              {analysisResult.analysis.branding.score}/100
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#252a3a] rounded-full">
                            <div 
                              className={`h-full rounded-full ${
                                analysisResult.analysis.branding.score >= 80 ? 'bg-green-500' :
                                analysisResult.analysis.branding.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${analysisResult.analysis.branding.score}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {analysisResult.analysis.branding.feedback}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">Title Relevance</span>
                            <span className="text-sm font-medium">
                              {analysisResult.analysis.relevance.score}/100
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#252a3a] rounded-full">
                            <div 
                              className={`h-full rounded-full ${
                                analysisResult.analysis.relevance.score >= 80 ? 'bg-green-500' :
                                analysisResult.analysis.relevance.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${analysisResult.analysis.relevance.score}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {analysisResult.analysis.relevance.feedback}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#151827] border-[#1e2231] text-white">
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription className="text-gray-400">
                        Actionable tips to improve your thumbnail
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.recommendations.map((recommendation, index) => (
                          <div key={index} className="bg-[#1a1f2e] p-3 rounded-lg flex items-start gap-3">
                            {index < 2 ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                            )}
                            <p className="text-sm text-gray-300">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-[#1e2231] pt-4">
                      <Button 
                        variant="outline" 
                        className="w-full border-[#2a3146] text-gray-300"
                        onClick={() => window.open('https://www.canva.com/create/youtube-thumbnails/', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" /> Create New Thumbnail
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}