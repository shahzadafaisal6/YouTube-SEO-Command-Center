import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart4, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ThumbsUp, 
  Eye,
  BarChart2
} from "lucide-react";

// Types
type AnalyticsOverview = {
  totalViews: number;
  totalWatchTimeHours: number;
  totalVideos: number;
  averageWatchTime: string;
  averageViews: number;
  engagementRate: number;
  subscribersGained: number;
  subscribersLost: number;
  netSubscriberGain: number;
  topVideosPerformance: {
    title: string;
    views: number;
    engagementRate: number;
  }[];
  viewsChange: {
    percentage: number;
    direction: "up" | "down";
  };
  subscribersChange: {
    percentage: number;
    direction: "up" | "down";
  };
  watchTimeChange: {
    percentage: number;
    direction: "up" | "down";
  };
};

// Mock data
const overviewData: AnalyticsOverview = {
  totalViews: 1254786,
  totalWatchTimeHours: 68427,
  totalVideos: 142,
  averageWatchTime: "4:23",
  averageViews: 8836,
  engagementRate: 7.2,
  subscribersGained: 8942,
  subscribersLost: 1203,
  netSubscriberGain: 7739,
  topVideosPerformance: [
    {
      title: "How to Rank #1 in YouTube Search (Step-by-Step)",
      views: 124853,
      engagementRate: 9.7
    },
    {
      title: "7 Advanced YouTube SEO Tips That Actually Work",
      views: 98452,
      engagementRate: 8.5
    },
    {
      title: "YouTube Algorithm Explained (2025 Update)",
      views: 87251,
      engagementRate: 10.3
    }
  ],
  viewsChange: {
    percentage: 18.3,
    direction: "up"
  },
  subscribersChange: {
    percentage: 14.2,
    direction: "up"
  },
  watchTimeChange: {
    percentage: 21.7,
    direction: "up"
  }
};

// Chart data
const viewsData = [
  { day: "Mon", views: 32400 },
  { day: "Tue", views: 38700 },
  { day: "Wed", views: 35200 },
  { day: "Thu", views: 41500 },
  { day: "Fri", views: 46800 },
  { day: "Sat", views: 53200 },
  { day: "Sun", views: 58300 }
];

const engagementData = [
  { day: "Mon", likes: 1870, comments: 432, shares: 215 },
  { day: "Tue", likes: 2140, comments: 512, shares: 243 },
  { day: "Wed", likes: 1960, comments: 487, shares: 198 },
  { day: "Thu", likes: 2310, comments: 543, shares: 267 },
  { day: "Fri", likes: 2680, comments: 612, shares: 308 },
  { day: "Sat", likes: 3120, comments: 734, shares: 387 },
  { day: "Sun", likes: 3290, comments: 821, shares: 412 }
];

const audienceData = [
  { name: "18-24", value: 28 },
  { name: "25-34", value: 42 },
  { name: "35-44", value: 18 },
  { name: "45-54", value: 8 },
  { name: "55+", value: 4 }
];

const trafficSourceData = [
  { name: "Search", value: 45 },
  { name: "Direct", value: 18 },
  { name: "Suggested", value: 25 },
  { name: "External", value: 7 },
  { name: "Browse", value: 5 }
];

const audienceColors = ["#4F46E5", "#7C74EF", "#A8A3F6", "#D4D1FA", "#EEEEFF"];
const trafficColors = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"];

const watchTimeData = [
  { day: "Mon", hours: 1640 },
  { day: "Tue", hours: 1820 },
  { day: "Wed", hours: 1720 },
  { day: "Thu", hours: 1950 },
  { day: "Fri", hours: 2180 },
  { day: "Sat", hours: 2350 },
  { day: "Sun", hours: 2580 }
];

const retentionData = [
  { minute: "0:30", retention: 100 },
  { minute: "1:00", retention: 92 },
  { minute: "1:30", retention: 85 },
  { minute: "2:00", retention: 76 },
  { minute: "2:30", retention: 70 },
  { minute: "3:00", retention: 65 },
  { minute: "3:30", retention: 61 },
  { minute: "4:00", retention: 58 },
  { minute: "4:30", retention: 54 },
  { minute: "5:00", retention: 52 },
  { minute: "5:30", retention: 50 },
  { minute: "6:00", retention: 47 },
  { minute: "6:30", retention: 45 },
  { minute: "7:00", retention: 43 },
  { minute: "7:30", retention: 41 },
  { minute: "8:00", retention: 40 }
];

const generateMonthlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map(month => ({
    month,
    subscribers: Math.floor(Math.random() * 1000) + 500,
    views: Math.floor(Math.random() * 50000) + 20000,
    watchTime: Math.floor(Math.random() * 5000) + 1000
  }));
};

const monthlyData = generateMonthlyData();

export default function Analytics() {
  const [timeframe, setTimeframe] = useState("7d");
  const { toast } = useToast();
  
  const downloadReport = () => {
    toast({
      title: "Report Generated",
      description: "Your analytics report has been generated and downloaded.",
    });
  };

  // In a real implementation, this would call the backend API
  const { data: overview = overviewData, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview', timeframe],
    enabled: false // Disabled since we're using mock data
  });

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
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-gray-400">Comprehensive insights into your YouTube performance</p>
            </div>
            <div className="flex gap-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px] bg-[#1e2231] border-[#2a3146] text-white">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e2231] border-[#2a3146] text-white">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="28d">Last 28 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="12m">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="gradient-primary"
                onClick={downloadReport}
              >
                Download Report
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-[#1a1f2e] border-[#2a3146]">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="audience" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                Audience
              </TabsTrigger>
              <TabsTrigger value="engagement" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                Engagement
              </TabsTrigger>
              <TabsTrigger value="retention" className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white">
                Retention
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader className="pb-2 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Total Views</CardTitle>
                      <CardDescription className="text-gray-400">
                        Last {timeframe === "7d" ? "7 days" : timeframe === "28d" ? "28 days" : timeframe === "90d" ? "90 days" : "12 months"}
                      </CardDescription>
                    </div>
                    <div className="bg-[#1a1f2e] p-2 rounded-lg">
                      <Eye className="h-5 w-5 text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {overview.totalViews.toLocaleString()}
                    </div>
                    <div className={`flex items-center text-sm ${
                      overview.viewsChange.direction === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {overview.viewsChange.direction === "up" ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {overview.viewsChange.percentage}% from previous period
                      </span>
                    </div>
                    
                    <div className="mt-4 h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={viewsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="day" 
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            axisLine={{ stroke: '#1F2937' }}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1E293B', 
                              border: 'none',
                              borderRadius: '4px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="views" 
                            stroke="#4F46E5" 
                            fillOpacity={1} 
                            fill="url(#colorViews)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader className="pb-2 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Watch Time</CardTitle>
                      <CardDescription className="text-gray-400">
                        Total hours watched
                      </CardDescription>
                    </div>
                    <div className="bg-[#1a1f2e] p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-indigo-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {overview.totalWatchTimeHours.toLocaleString()}
                    </div>
                    <div className={`flex items-center text-sm ${
                      overview.watchTimeChange.direction === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {overview.watchTimeChange.direction === "up" ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {overview.watchTimeChange.percentage}% from previous period
                      </span>
                    </div>
                    
                    <div className="mt-4 h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={watchTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="day" 
                            tick={{ fill: '#6B7280', fontSize: 10 }}
                            axisLine={{ stroke: '#1F2937' }}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1E293B', 
                              border: 'none',
                              borderRadius: '4px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="hours" 
                            stroke="#8B5CF6" 
                            fillOpacity={1} 
                            fill="url(#colorHours)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader className="pb-2 flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Subscribers</CardTitle>
                      <CardDescription className="text-gray-400">
                        Net growth this period
                      </CardDescription>
                    </div>
                    <div className="bg-[#1a1f2e] p-2 rounded-lg">
                      <Users className="h-5 w-5 text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      +{overview.netSubscriberGain.toLocaleString()}
                    </div>
                    <div className={`flex items-center text-sm ${
                      overview.subscribersChange.direction === "up" ? "text-green-400" : "text-red-400"
                    }`}>
                      {overview.subscribersChange.direction === "up" ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span>
                        {overview.subscribersChange.percentage}% from previous period
                      </span>
                    </div>
                    
                    <div className="mt-4 flex">
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">Gained</div>
                        <div className="text-lg font-semibold text-green-400">
                          {overview.subscribersGained.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">Lost</div>
                        <div className="text-lg font-semibold text-red-400">
                          {overview.subscribersLost.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-xs text-gray-400 mb-1">Conversion rate</div>
                      <div className="flex items-center">
                        <Progress value={72} className="h-2 flex-1 bg-[#252a3a]" indicatorClassName="bg-green-500" />
                        <span className="ml-2 text-sm">7.2%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <Card className="bg-[#151827] border-[#1e2231] text-white lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Performance Over Time</CardTitle>
                    <CardDescription className="text-gray-400">
                      Monthly views, watch time, and subscribers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a3146" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fill: '#9CA3AF' }}
                            axisLine={{ stroke: '#2a3146' }}
                          />
                          <YAxis 
                            yAxisId="left"
                            tick={{ fill: '#9CA3AF' }}
                            axisLine={{ stroke: '#2a3146' }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fill: '#9CA3AF' }}
                            axisLine={{ stroke: '#2a3146' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1a1f2e', 
                              border: 'none',
                              borderRadius: '4px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            formatter={(value) => (
                              <span style={{ color: '#D1D5DB' }}>{value}</span>
                            )}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="views"
                            stroke="#4F46E5"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="watchTime"
                            stroke="#10B981"
                            strokeWidth={2}
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="subscribers"
                            stroke="#F59E0B"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Top Performing Videos</CardTitle>
                    <CardDescription className="text-gray-400">
                      Based on views and engagement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {overview.topVideosPerformance.map((video, index) => (
                      <div key={index} className="bg-[#1a1f2e] rounded-lg p-3">
                        <div className="font-medium mb-2 line-clamp-1">{video.title}</div>
                        <div className="flex justify-between text-sm text-gray-400">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1 text-blue-400" />
                            {video.views.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1 text-green-400" />
                            {video.engagementRate}%
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress 
                            value={video.engagementRate * 10} 
                            className="h-1 bg-[#252a3a]"
                            indicatorClassName={
                              video.engagementRate > 9 ? "bg-green-500" : 
                              video.engagementRate > 7 ? "bg-blue-500" : 
                              "bg-yellow-500"
                            }
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-[#2a3146] text-gray-400"
                    >
                      View All Videos
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="audience">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Age Demographics</CardTitle>
                    <CardDescription className="text-gray-400">
                      Age distribution of your audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={audienceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {audienceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={audienceColors[index % audienceColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1a1f2e', 
                              border: 'none',
                              borderRadius: '4px',
                              color: '#F9FAFB'
                            }}
                            formatter={(value) => [`${value}%`, 'Percentage']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {audienceData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: audienceColors[index % audienceColors.length] }}
                          />
                          <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription className="text-gray-400">
                      How viewers are finding your content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={trafficSourceData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {trafficSourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={trafficColors[index % trafficColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1a1f2e', 
                              border: 'none',
                              borderRadius: '4px',
                              color: '#F9FAFB'
                            }}
                            formatter={(value) => [`${value}%`, 'Percentage']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {trafficSourceData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: trafficColors[index % trafficColors.length] }}
                          />
                          <span className="text-sm text-gray-300">{item.name}: {item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Audience Insights</CardTitle>
                    <CardDescription className="text-gray-400">
                      Key metrics about your audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#1a1f2e] rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Average View Duration</div>
                      <div className="text-lg font-semibold">{overview.averageWatchTime}</div>
                      <div className="text-xs text-gray-500">Per video</div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Engagement Rate</div>
                      <div className="text-lg font-semibold">{overview.engagementRate}%</div>
                      <div className="text-xs text-gray-500">Likes + comments / views</div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Subscriber Conversion</div>
                      <div className="text-lg font-semibold">2.8%</div>
                      <div className="text-xs text-gray-500">Views that lead to new subscribers</div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Returning Viewers</div>
                      <div className="text-lg font-semibold">43%</div>
                      <div className="text-xs text-gray-500">Percentage of repeat viewers</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="engagement">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Engagement Metrics</CardTitle>
                    <CardDescription className="text-gray-400">
                      Likes, comments and shares over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={engagementData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a3146" />
                          <XAxis 
                            dataKey="day"
                            tick={{ fill: '#9CA3AF' }} 
                            axisLine={{ stroke: '#2a3146' }}
                          />
                          <YAxis 
                            tick={{ fill: '#9CA3AF' }}
                            axisLine={{ stroke: '#2a3146' }}
                          />
                          <Tooltip
                            contentStyle={{ 
                              backgroundColor: '#1a1f2e', 
                              border: 'none',
                              borderRadius: '4px',
                              color: '#F9FAFB'
                            }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            formatter={(value) => (
                              <span style={{ color: '#D1D5DB' }}>{value}</span>
                            )}
                          />
                          <Bar dataKey="likes" stackId="a" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="comments" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="shares" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Engagement Breakdown</CardTitle>
                    <CardDescription className="text-gray-400">
                      Analysis of user interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Like Ratio</span>
                        <span className="text-sm font-medium">8.4%</span>
                      </div>
                      <Progress value={8.4} max={10} className="h-2 bg-[#252a3a]" indicatorClassName="bg-blue-500" />
                      <div className="mt-1 text-xs text-gray-500">Industry average: 5.7%</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Comment Rate</span>
                        <span className="text-sm font-medium">1.9%</span>
                      </div>
                      <Progress value={1.9} max={10} className="h-2 bg-[#252a3a]" indicatorClassName="bg-green-500" />
                      <div className="mt-1 text-xs text-gray-500">Industry average: 0.8%</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Share Rate</span>
                        <span className="text-sm font-medium">0.7%</span>
                      </div>
                      <Progress value={0.7} max={10} className="h-2 bg-[#252a3a]" indicatorClassName="bg-yellow-500" />
                      <div className="mt-1 text-xs text-gray-500">Industry average: 0.4%</div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Click-Through Rate</span>
                        <span className="text-sm font-medium">5.2%</span>
                      </div>
                      <Progress value={5.2} max={10} className="h-2 bg-[#252a3a]" indicatorClassName="bg-purple-500" />
                      <div className="mt-1 text-xs text-gray-500">Industry average: 3.8%</div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] p-4 rounded-lg">
                      <div className="text-sm font-medium mb-2">Key Insights:</div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Your engagement rates are 47% above industry average</li>
                        <li>• Comments have increased 23% compared to last period</li>
                        <li>• Likes peak on weekend uploads (Sat-Sun)</li>
                        <li>• Videos longer than 12 minutes get 31% more engagement</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="retention">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#151827] border-[#1e2231] text-white lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Audience Retention</CardTitle>
                    <CardDescription className="text-gray-400">
                      Average viewer retention across all videos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={retentionData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#2a3146" />
                          <XAxis 
                            dataKey="minute" 
                            tick={{ fill: '#9CA3AF' }}
                            axisLine={{ stroke: '#2a3146' }}
                          />
                          <YAxis 
                            tick={{ fill: '#9CA3AF' }}
                            axisLine={{ stroke: '#2a3146' }}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1a1f2e', 
                              border: 'none',
                              borderRadius: '4px',
                              color: '#F9FAFB'
                            }}
                            formatter={(value) => [`${value}%`, 'Retention']}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={36}
                            formatter={(value) => (
                              <span style={{ color: '#D1D5DB' }}>{value}</span>
                            )}
                          />
                          <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#4F46E5" />
                              <stop offset="100%" stopColor="#10B981" />
                            </linearGradient>
                          </defs>
                          <Line
                            type="monotone"
                            dataKey="retention"
                            stroke="url(#colorRetention)"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, fill: "#151827" }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-[#1a1f2e] p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Average Retention</div>
                        <div className="text-xl font-semibold">63.2%</div>
                        <div className="text-xs text-gray-500">Industry average: 48.6%</div>
                      </div>
                      
                      <div className="bg-[#1a1f2e] p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Drop-off Points</div>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span>1:30 - Introduction ends (15% drop)</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span>5:45 - Mid-roll ad (12% drop)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Retention Comparison</CardTitle>
                    <CardDescription className="text-gray-400">
                      How your videos compare to others
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Your Videos</div>
                        <div className="text-lg font-semibold text-blue-400">63.2%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Category Average</div>
                        <div className="text-lg font-semibold text-gray-400">48.6%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Top Performers</div>
                        <div className="text-lg font-semibold text-green-400">72.1%</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] p-4 rounded-lg">
                      <div className="text-sm font-medium mb-2">Retention Analysis:</div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Your videos hold audience 30% better than category average</li>
                        <li>• Opening hook (0:00-0:30) has 98% retention (excellent)</li>
                        <li>• Videos with clear chapters retain 18% more viewers</li>
                        <li>• Videos under 10 minutes have 11% better completion rate</li>
                      </ul>
                    </div>
                    
                    <div className="bg-[#1a1f2e] p-4 rounded-lg">
                      <div className="text-sm font-medium mb-2">Improvement Opportunities:</div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Reduce mid-video drop-offs by adding pattern interrupts</li>
                        <li>• Create stronger call-to-actions at the 75% mark</li>
                        <li>• Shorter intros (under 20s) lead to better retention</li>
                        <li>• Add visual elements every 30-45 seconds</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#151827] border-[#1e2231] text-white">
                  <CardHeader>
                    <CardTitle>Top Retention Moments</CardTitle>
                    <CardDescription className="text-gray-400">
                      Points where viewers engage most
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#1a1f2e] p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 p-1.5 bg-blue-500/20 text-blue-400 rounded" />
                        <div>
                          <div className="font-medium">Beginning Hook (0:00-0:30)</div>
                          <div className="flex items-center text-sm text-gray-400">
                            <span className="text-blue-400 mr-1">98% retention</span> • Very strong opening
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 p-1.5 bg-green-500/20 text-green-400 rounded" />
                        <div>
                          <div className="font-medium">Tutorial Section (2:15-4:30)</div>
                          <div className="flex items-center text-sm text-gray-400">
                            <span className="text-green-400 mr-1">82% retention</span> • High value content
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 p-1.5 bg-yellow-500/20 text-yellow-400 rounded" />
                        <div>
                          <div className="font-medium">Results Demo (6:45-7:30)</div>
                          <div className="flex items-center text-sm text-gray-400">
                            <span className="text-yellow-400 mr-1">76% retention</span> • Proof point section
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1f2e] p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <BarChart2 className="h-8 w-8 p-1.5 bg-red-500/20 text-red-400 rounded" />
                        <div>
                          <div className="font-medium">Case Study (5:30-6:30)</div>
                          <div className="flex items-center text-sm text-gray-400">
                            <span className="text-red-400 mr-1">68% retention</span> • Some viewers skip this
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-[#2a3146] text-gray-400"
                    >
                      View Full Retention Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}