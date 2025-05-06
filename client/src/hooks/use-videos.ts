import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type VideoAnalytics = {
  views: number;
  watchTimeHours: number;
  likes: number;
  comments: number;
  ctr: string;
  avgViewDuration: string;
};

export type Video = {
  id: number;
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  publishedAt: string;
  status: 'published' | 'private' | 'unlisted';
  seoScore: number;
  optimizationNotes?: {
    issues: string[];
    suggestions?: {
      title?: string;
      description?: string;
      tags?: string[];
    };
  };
  analytics?: VideoAnalytics[];
};

export function useVideos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all videos
  const {
    data: videos,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
    onError: (err) => {
      toast({
        title: "Error loading videos",
        description: `Could not load video data: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Fetch a single video
  const fetchVideo = (id: number) => {
    return useQuery<Video>({
      queryKey: ['/api/videos', id],
      onError: (err) => {
        toast({
          title: "Error loading video",
          description: `Could not load video details: ${err.message}`,
          variant: "destructive",
        });
      },
      enabled: !!id
    });
  };

  // Fetch video analytics
  const fetchVideoAnalytics = (id: number) => {
    return useQuery<VideoAnalytics[]>({
      queryKey: ['/api/videos', id, 'analytics'],
      onError: (err) => {
        toast({
          title: "Error loading analytics",
          description: `Could not load video analytics: ${err.message}`,
          variant: "destructive",
        });
      },
      enabled: !!id
    });
  };

  // Generate optimizations for a video
  const generateOptimizations = useMutation({
    mutationFn: async (videoId: number) => {
      const res = await apiRequest('POST', `/api/videos/${videoId}/optimize`);
      return await res.json();
    },
    onSuccess: (data, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos', videoId] });
      toast({
        title: "Optimizations generated",
        description: "Video optimization suggestions have been generated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error generating optimizations",
        description: `Failed to generate optimizations: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Apply optimizations to a video
  const applyOptimizations = useMutation({
    mutationFn: async ({ videoId, data }: { videoId: number, data: Partial<Video> }) => {
      const res = await apiRequest('PUT', `/api/videos/${videoId}`, data);
      return await res.json();
    },
    onSuccess: (data, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos', videoId] });
      toast({
        title: "Optimizations applied",
        description: "Video optimizations have been applied successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error applying optimizations",
        description: `Failed to apply optimizations: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const getPendingOptimizations = () => {
    if (!videos) return [];
    return videos.filter(video => 
      video.optimizationNotes?.issues && video.optimizationNotes.issues.length > 0
    );
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-500";
    if (score >= 75) return "from-yellow-500 to-amber-500";
    if (score >= 60) return "from-orange-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  const getSeoScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    if (score >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSeoScoreTextColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 75) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return {
    videos,
    isLoading,
    isError,
    error,
    refetch,
    fetchVideo,
    fetchVideoAnalytics,
    generateOptimizations,
    applyOptimizations,
    getPendingOptimizations,
    getSeoScoreColor,
    getSeoScoreBgColor,
    getSeoScoreTextColor,
    formatPublishedDate
  };
}
