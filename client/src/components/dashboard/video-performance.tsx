import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Video = {
  id: number;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  seoScore: number;
  analytics: {
    views: number;
    watchTimeHours: number;
    ctr: string;
    avgViewDuration: string;
  }[];
};

export function VideoPerformance() {
  const { toast } = useToast();
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
    onError: () => {
      toast({
        title: "Error loading videos",
        description: "Could not load video data. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const formatDate = (dateString: string) => {
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

  const getSeoScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-500";
    if (score >= 75) return "from-yellow-500 to-amber-500";
    if (score >= 60) return "from-orange-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  return (
    <Card className="lg:col-span-4 widget">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="font-medium flex items-center text-base">
          <i className="ri-video-line mr-2 text-gray-400"></i> 
          Recent Video Performance
        </CardTitle>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <i className="ri-refresh-line"></i>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <i className="ri-more-2-fill"></i>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-14" />
              <Skeleton className="w-full h-14" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-border">
                  <th className="pb-3 text-left">Video</th>
                  <th className="pb-3 text-right">Views</th>
                  <th className="pb-3 text-right">Watch Time</th>
                  <th className="pb-3 text-right">CTR</th>
                  <th className="pb-3 text-right">Avg. View</th>
                  <th className="pb-3 text-right">SEO Score</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos?.slice(0, 4).map(video => (
                  <tr key={video.id} className="border-b border-border/50 text-sm">
                    <td className="py-3 pr-4">
                      <div className="flex items-center">
                        <div className="w-24 h-14 bg-muted rounded-md overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={`Thumbnail for ${video.title}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium mb-0.5 line-clamp-1">{video.title}</p>
                          <p className="text-xs text-gray-400">Published {formatDate(video.publishedAt)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      {video.analytics?.[0]?.views?.toLocaleString() || 0}
                    </td>
                    <td className="py-3 text-right">
                      {video.analytics?.[0]?.watchTimeHours || 0}h
                    </td>
                    <td className="py-3 text-right">
                      {video.analytics?.[0]?.ctr || '0%'}
                    </td>
                    <td className="py-3 text-right">
                      {video.analytics?.[0]?.avgViewDuration || '0:00'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getSeoScoreColor(video.seoScore)} flex items-center justify-center text-xs font-medium`}>
                          {video.seoScore}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs bg-muted hover:bg-primary-700 text-gray-300 hover:text-white"
                        onClick={() => window.location.href = `/videos?edit=${video.id}`}
                      >
                        Optimize
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t border-border text-center">
        <Button 
          variant="link" 
          className="text-sm text-primary-400 hover:text-primary-300 mx-auto"
          onClick={() => window.location.href = '/videos'}
        >
          View All Videos <i className="ri-arrow-right-s-line align-middle"></i>
        </Button>
      </CardFooter>
    </Card>
  );
}
