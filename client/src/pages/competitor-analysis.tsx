import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Users, 
  BarChart4, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Plus,
  ExternalLink,
  Youtube,
  Calendar,
  Eye,
  Clock,
  ThumbsUp,
  MessageSquare
} from "lucide-react";

type Competitor = {
  id: number;
  name: string;
  channelId: string;
  thumbnailUrl: string;
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  averageViews: number;
  engagementRate: number;
  lastAnalyzed: string;
  performanceScore: number;
};

type CompetitorVideo = {
  id: number;
  title: string;
  videoId: string;
  thumbnailUrl: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  watchTimeHours: number;
  performanceScore: number;
};

export default function CompetitorAnalysis() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [channelUrl, setChannelUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  // Fetch competitors (mock data for now)
  const { data: competitors = [], isLoading } = useQuery<Competitor[]>({
    queryKey: ['/api/competitors'],
    // This is just a placeholder until we implement the backend
    queryFn: async () => {
      // In a real implementation, this would call the backend API
      return [
        {
          id: 1,
          name: "Brian Dean (Backlinko)",
          channelId: "backlinko",
          thumbnailUrl: "https://yt3.googleusercontent.com/ytc/APkrFKaZhfciSaOi9SvaE7kmAMGGQRSpRhkGXLKAF8u7=s176-c-k-c0x00ffffff-no-rj",
          subscriberCount: 820000,
          totalViews: 15400000,
          videoCount: 86,
          averageViews: 108000,
          engagementRate: 7.8,
          lastAnalyzed: "2025-05-01",
          performanceScore: 93
        },
        {
          id: 2,
          name: "Income School",
          channelId: "incomeschool",
          thumbnailUrl: "https://yt3.googleusercontent.com/ytc/APkrFKbz7EMI9mONKJfQQi5I4lMhQRcQxmzTRkXiRyY9=s176-c-k-c0x00ffffff-no-rj",
          subscriberCount: 347000,
          totalViews: 21000000,
          videoCount: 630,
          averageViews: 33300,
          engagementRate: 5.4,
          lastAnalyzed: "2025-05-02",
          performanceScore: 85
        },
        {
          id: 3,
          name: "Neil Patel",
          channelId: "neilpatel",
          thumbnailUrl: "https://yt3.googleusercontent.com/ytc/APkrFKYwb-EPJ9jIKkrC23VWkTheFi6DP45K9iPjMvOH=s176-c-k-c0x00ffffff-no-rj",
          subscriberCount: 1120000,
          totalViews: 38000000,
          videoCount: 1230,
          averageViews: 30800,
          engagementRate: 4.9,
          lastAnalyzed: "2025-05-01",
          performanceScore: 81
        },
        {
          id: 4,
          name: "Ahrefs",
          channelId: "ahrefs",
          thumbnailUrl: "https://yt3.googleusercontent.com/RDxN3Ek2hcwPfjXwYmw8_cVp9vHcNQPo5TS0K-K2aKPJMZCaEZIa4jMFKbOG6I53sCsKJcRxTQ=s176-c-k-c0x00ffffff-no-rj",
          subscriberCount: 494000,
          totalViews: 25000000,
          videoCount: 570,
          averageViews: 43800,
          engagementRate: 6.2,
          lastAnalyzed: "2025-05-03",
          performanceScore: 89
        }
      ];
    }
  });

  // Fetch competitor videos (mock data for now)
  const { data: competitorVideos = [] } = useQuery<CompetitorVideo[]>({
    queryKey: ['/api/competitors/videos', selectedCompetitor?.id],
    enabled: !!selectedCompetitor,
    // This is just a placeholder until we implement the backend
    queryFn: async () => {
      // In a real implementation, this would call the backend API
      return [
        {
          id: 1,
          title: "The 7 YouTube SEO Tips That Grew My Channel From 0 to 500k+ Subscribers",
          videoId: "video-1",
          thumbnailUrl: "https://i.ytimg.com/vi/5Mgs3jbvW5Q/maxresdefault.jpg",
          publishedAt: "2025-04-20",
          views: 548302,
          likes: 32105,
          comments: 1837,
          watchTimeHours: 25400,
          performanceScore: 96
        },
        {
          id: 2,
          title: "YouTube SEO: How to Rank Videos #1 in 2025 (Complete Guide)",
          videoId: "video-2",
          thumbnailUrl: "https://i.ytimg.com/vi/5Mgs3jbvW5Q/maxresdefault.jpg",
          publishedAt: "2025-03-15",
          views: 321798,
          likes: 18923,
          comments: 982,
          watchTimeHours: 15200,
          performanceScore: 89
        },
        {
          id: 3,
          title: "How to Find Low Competition Keywords That Actually Rank",
          videoId: "video-3",
          thumbnailUrl: "https://i.ytimg.com/vi/5Mgs3jbvW5Q/maxresdefault.jpg",
          publishedAt: "2025-02-28",
          views: 217654,
          likes: 12345,
          comments: 743,
          watchTimeHours: 10300,
          performanceScore: 83
        },
        {
          id: 4,
          title: "The PERFECT YouTube Video Formula (with Templates)",
          videoId: "video-4",
          thumbnailUrl: "https://i.ytimg.com/vi/5Mgs3jbvW5Q/maxresdefault.jpg",
          publishedAt: "2025-02-10",
          views: 289754,
          likes: 15890,
          comments: 876,
          watchTimeHours: 13500,
          performanceScore: 91
        }
      ];
    }
  });

  // Filter competitors based on search term
  const filteredCompetitors = competitors.filter(competitor => 
    competitor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to analyze a new competitor
  const analyzeCompetitor = async () => {
    // Validate input
    if (!channelUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube channel URL",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);

    try {
      // In a real implementation, this would call the backend API
      // await apiRequest({
      //   url: "/api/competitors/analyze",
      //   method: "POST",
      //   data: {
      //     channelUrl,
      //   },
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAddDialogOpen(false);
      setChannelUrl('');
      
      toast({
        title: "Analysis started",
        description: "The competitor analysis has been queued and will be available shortly.",
      });
      
      // In a real implementation, we would refetch the competitors list
      // queryClient.invalidateQueries(['/api/competitors']);
    } catch (error) {
      console.error("Error analyzing competitor:", error);
      toast({
        title: "Error",
        description: "Failed to analyze competitor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Competitor Analysis</h1>
              <p className="text-gray-400">Monitor and learn from your top YouTube competitors</p>
            </div>
            <div className="flex gap-3">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search competitors..."
                  className="pl-9 bg-[#1e2231] border-[#2a3146] text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" /> Add Competitor
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#151827] border-[#1e2231] text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Competitor</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter a YouTube channel URL to analyze a new competitor.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">YouTube Channel URL</Label>
                      <Input
                        placeholder="https://youtube.com/@channelname"
                        className="bg-[#1e2231] border-[#2a3146] text-white"
                        value={channelUrl}
                        onChange={(e) => setChannelUrl(e.target.value)}
                      />
                      <p className="text-xs text-gray-400">
                        Enter the full URL of the YouTube channel you want to analyze
                      </p>
                    </div>

                    <div className="bg-[#1a1f2e] p-3 rounded text-gray-300 text-sm">
                      <p className="flex items-center gap-2">
                        <Youtube className="h-4 w-4 text-red-400" />
                        Analyzing a channel will use YouTube API quota
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setAddDialogOpen(false)}
                      className="border-[#2a3146] text-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="gradient-primary"
                      onClick={analyzeCompetitor}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze Competitor
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#1a1f2e] border-[#2a3146]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                Top Videos
              </TabsTrigger>
              <TabsTrigger value="keywords" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                Keywords
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompetitors.map((competitor) => {
                  // Determine performance color
                  let performanceColor = "";
                  if (competitor.performanceScore >= 90) {
                    performanceColor = "bg-green-500";
                  } else if (competitor.performanceScore >= 75) {
                    performanceColor = "bg-yellow-500";
                  } else {
                    performanceColor = "bg-red-500";
                  }
                  
                  return (
                    <Card 
                      key={competitor.id} 
                      className="bg-[#151827] border-[#1e2231] text-white overflow-hidden cursor-pointer hover:bg-[#1a1f2e] transition-colors"
                      onClick={() => setSelectedCompetitor(competitor)}
                    >
                      <div className={`h-1 w-full ${performanceColor}`}></div>
                      <CardHeader className="pb-2">
                        <div className="flex gap-4 items-center">
                          <img 
                            src={competitor.thumbnailUrl} 
                            alt={competitor.name} 
                            className="rounded-full h-14 w-14"
                          />
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {competitor.name}
                            </CardTitle>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <Users className="h-3 w-3 mr-1" />
                              {competitor.subscriberCount.toLocaleString()} subscribers
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-[#1a1f2e] p-3 rounded-lg">
                              <div className="text-xs text-gray-400 mb-1">Videos</div>
                              <div className="text-lg font-semibold">
                                {competitor.videoCount.toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-[#1a1f2e] p-3 rounded-lg">
                              <div className="text-xs text-gray-400 mb-1">Avg. Views</div>
                              <div className="text-lg font-semibold">
                                {competitor.averageViews.toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-[#1a1f2e] p-3 rounded-lg">
                              <div className="text-xs text-gray-400 mb-1">Engagement</div>
                              <div className="text-lg font-semibold">
                                {competitor.engagementRate}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between mb-1">
                              <div className="text-sm text-gray-400">
                                Performance Score
                              </div>
                              <div className="text-sm font-medium">
                                {competitor.performanceScore}/100
                              </div>
                            </div>
                            <Progress 
                              value={competitor.performanceScore} 
                              className="h-2 bg-[#252a3a]"
                              indicatorClassName={performanceColor}
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button 
                          variant="link" 
                          className="text-indigo-400 p-0 h-auto flex items-center gap-1 hover:text-indigo-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompetitor(competitor);
                          }}
                        >
                          View detailed analysis <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
              
              {filteredCompetitors.length === 0 && (
                <div className="bg-[#151827] border-[#1e2231] rounded-lg p-8 text-center">
                  <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg text-white mb-2">No competitors found</h3>
                  <p className="text-gray-400 mb-4">
                    Add a competitor to start analyzing their content strategy
                  </p>
                  <Button 
                    className="gradient-primary"
                    onClick={() => setAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Competitor
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="videos">
              {!selectedCompetitor ? (
                <div className="bg-[#151827] border-[#1e2231] rounded-lg p-8 text-center">
                  <BarChart4 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg text-white mb-2">No competitor selected</h3>
                  <p className="text-gray-400 mb-4">
                    Select a competitor from the overview to see their top-performing videos
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-[#151827] border-[#1e2231] p-4 rounded-lg">
                    <img 
                      src={selectedCompetitor.thumbnailUrl} 
                      alt={selectedCompetitor.name} 
                      className="rounded-full h-14 w-14"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {selectedCompetitor.name}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2 h-8 border-[#2a3146] text-gray-400"
                          onClick={() => window.open(`https://youtube.com/@${selectedCompetitor.channelId}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" /> Visit Channel
                        </Button>
                      </h3>
                      <div className="text-sm text-gray-400 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {selectedCompetitor.subscriberCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {selectedCompetitor.totalViews.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last analyzed: {selectedCompetitor.lastAnalyzed}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Card className="bg-[#151827] border-[#1e2231] text-white">
                    <CardHeader>
                      <CardTitle>Top Performing Videos</CardTitle>
                      <CardDescription className="text-gray-400">
                        Based on views, engagement, and watch time
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {competitorVideos.map((video) => (
                        <div 
                          key={video.id} 
                          className="bg-[#1a1f2e] rounded-lg p-4 hover:bg-[#252a3a] transition-colors cursor-pointer"
                        >
                          <div className="flex gap-4">
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title} 
                              className="w-[180px] h-[100px] rounded object-cover"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-white text-lg mb-2">{video.title}</h4>
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <div className="text-xs text-gray-400">Views</div>
                                  <div className="text-white flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-gray-400" />
                                    {video.views.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400">Engagement</div>
                                  <div className="text-white flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3 text-gray-400" />
                                    {video.likes.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400">Comments</div>
                                  <div className="text-white flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3 text-gray-400" />
                                    {video.comments.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-400">Watch Time</div>
                                  <div className="text-white flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    {video.watchTimeHours.toLocaleString()} hrs
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <div className="flex justify-between mb-1">
                                  <div className="text-xs text-gray-400">
                                    Performance Score
                                  </div>
                                  <div className="text-xs font-medium">
                                    {video.performanceScore}/100
                                  </div>
                                </div>
                                <Progress 
                                  value={video.performanceScore} 
                                  className="h-1.5 bg-[#252a3a]"
                                  indicatorClassName={
                                    video.performanceScore >= 90 ? "bg-green-500" : 
                                    video.performanceScore >= 75 ? "bg-yellow-500" : 
                                    "bg-red-500"
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="border-t border-[#1e2231] px-6 py-4">
                      <div className="text-sm text-gray-400">
                        What's working for this channel: High-quality thumbnails, clear value in titles, and consistent upload schedule.
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="keywords">
              {!selectedCompetitor ? (
                <div className="bg-[#151827] border-[#1e2231] rounded-lg p-8 text-center">
                  <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg text-white mb-2">No competitor selected</h3>
                  <p className="text-gray-400 mb-4">
                    Select a competitor from the overview to analyze their keyword strategy
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-[#151827] border-[#1e2231] text-white">
                    <CardHeader>
                      <CardTitle>Top Keywords</CardTitle>
                      <CardDescription className="text-gray-400">
                        Most frequently used keywords in titles and descriptions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-[#1a1f2e] rounded-lg p-3 flex items-center justify-between">
                        <div className="font-medium">Youtube SEO</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Usage: 28 videos</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-[#1a1f2e] rounded-lg p-3 flex items-center justify-between">
                        <div className="font-medium">Video Ranking</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Usage: 21 videos</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-[#1a1f2e] rounded-lg p-3 flex items-center justify-between">
                        <div className="font-medium">Keyword Research</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Usage: 19 videos</span>
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                      </div>
                      <div className="bg-[#1a1f2e] rounded-lg p-3 flex items-center justify-between">
                        <div className="font-medium">Traffic Growth</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Usage: 16 videos</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                      <div className="bg-[#1a1f2e] rounded-lg p-3 flex items-center justify-between">
                        <div className="font-medium">Content Strategy</div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">Usage: 12 videos</span>
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#151827] border-[#1e2231] text-white">
                    <CardHeader>
                      <CardTitle>Keyword Analysis</CardTitle>
                      <CardDescription className="text-gray-400">
                        Extract insights from competitor's keyword strategy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea 
                        className="min-h-[250px] bg-[#1e2231] border-[#2a3146] text-white"
                        placeholder="Enter a video title or topic to analyze"
                      />
                      <Button className="w-full gradient-primary mt-4">
                        Generate Keyword Insights
                      </Button>
                      
                      <div className="mt-6 text-sm text-gray-400">
                        <p className="mb-2">This tool will:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Identify keyword opportunities based on competitor content</li>
                          <li>Suggest related keywords and topics</li>
                          <li>Show search volume and competition levels</li>
                          <li>Recommend title and description structure</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Details Dialog */}
      <Dialog 
        open={!!selectedCompetitor} 
        onOpenChange={(open) => !open && setSelectedCompetitor(null)}
      >
        <DialogContent className="bg-[#151827] border-[#1e2231] text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{selectedCompetitor?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed competitor analysis and insights
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-[#1a1f2e] border-[#2a3146] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subscribers</span>
                  <span className="font-medium">{selectedCompetitor?.subscriberCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Views</span>
                  <span className="font-medium">{selectedCompetitor?.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Videos</span>
                  <span className="font-medium">{selectedCompetitor?.videoCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Views</span>
                  <span className="font-medium">{selectedCompetitor?.averageViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Engagement Rate</span>
                  <span className="font-medium">{selectedCompetitor?.engagementRate}%</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1a1f2e] border-[#2a3146] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Content Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Upload Frequency</span>
                  <span className="font-medium">2 videos / week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Duration</span>
                  <span className="font-medium">12:18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Most Videos Type</span>
                  <span className="font-medium">Tutorials</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Primary Category</span>
                  <span className="font-medium">Education</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Most Successful Format</span>
                  <span className="font-medium">List-based content</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-[#1a1f2e] border-[#2a3146] text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#151827] rounded-lg p-4 text-sm leading-relaxed">
                <p className="mb-2"><strong>What's working:</strong></p>
                <ul className="list-disc list-inside space-y-1 mb-3">
                  <li>Consistent thumbnail style with clear text overlay and high contrast colors</li>
                  <li>Titles follow a clear format: specific benefit + number (when applicable)</li>
                  <li>First 15 seconds hook viewers with a clear promise/outcome</li>
                  <li>Strong call-to-actions at multiple points in videos</li>
                </ul>
                
                <p className="mb-2"><strong>Keyword strategy:</strong></p>
                <ul className="list-disc list-inside space-y-1 mb-3">
                  <li>Focuses on "YouTube SEO" as the primary pillar topic</li>
                  <li>Uses related terms like "video ranking" and "YouTube growth" consistently</li>
                  <li>Descriptions contain comprehensive keyword sets (20+ relevant terms)</li>
                </ul>
                
                <p className="mb-2"><strong>Engagement tactics:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Asks questions to viewers every 3-4 minutes</li>
                  <li>Creates custom timestamps for all videos</li>
                  <li>Responds to top comments within 24 hours</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <DialogFooter>
            <Button 
              variant="outline"
              className="border-[#2a3146] text-gray-400"
              onClick={() => setSelectedCompetitor(null)}
            >
              Close
            </Button>
            <Button 
              className="gradient-primary"
              onClick={() => window.open(`https://youtube.com/@${selectedCompetitor?.channelId}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Visit Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}