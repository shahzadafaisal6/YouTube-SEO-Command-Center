import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Video = {
  id: number;
  title: string;
  thumbnailUrl: string;
  seoScore: number;
  optimizationNotes: {
    issues: string[];
  };
};

export function PendingTasks() {
  const { toast } = useToast();
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
    onError: () => {
      toast({
        title: "Error loading videos",
        description: "Could not load video data. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const pendingOptimizations = videos?.filter(video => 
    video.optimizationNotes?.issues && video.optimizationNotes.issues.length > 0
  );

  const getSeoScoreColor = (score: number) => {
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

  const handleOptimizeAll = () => {
    toast({
      title: "Optimization started",
      description: "Optimizing all videos. This may take a few minutes.",
    });
    
    // Navigate to videos page with bulk optimize parameter
    window.location.href = `/videos?bulk_optimize=true`;
  };

  const handleOptimizeVideo = (videoId: number) => {
    toast({
      title: "Generating optimizations",
      description: `Optimizing video ${videoId}. This may take a few moments.`,
    });
    
    // Navigate to the video edit page with optimization tab
    window.location.href = `/videos?edit=${videoId}&tab=optimize`;
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-medium">Pending Optimizations</h3>
        <Button className="bg-primary-700 hover:bg-primary-600" onClick={handleOptimizeAll}>
          <i className="ri-magic-line mr-1"></i> Optimize All
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <>
            <Card>
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-4/5 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
            <Card>
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-4/5 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
            <Card>
              <Skeleton className="h-32 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-4/5 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          pendingOptimizations?.map(video => (
            <div key={video.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden widget">
              <div className="h-32 bg-muted relative">
                <img 
                  src={video.thumbnailUrl} 
                  alt={`Thumbnail for ${video.title}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex items-center">
                  <div className={`w-7 h-7 rounded-full ${getSeoScoreColor(video.seoScore)} flex items-center justify-center text-xs font-medium`}>
                    {video.seoScore}
                  </div>
                  <span className="ml-2 text-sm font-medium">Current SEO Score</span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-medium mb-2 line-clamp-1">{video.title}</h4>
                
                <div className="space-y-2 mb-4">
                  {video.optimizationNotes?.issues.slice(0, 3).map((issue, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <i className={`ri-alert-line ${getSeoScoreTextColor(video.seoScore)} mr-2`}></i>
                      <span className="text-gray-300">{issue}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-primary-700 hover:bg-primary-600"
                  onClick={() => handleOptimizeVideo(video.id)}
                >
                  <i className="ri-magic-line mr-1"></i> Generate Optimizations
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
