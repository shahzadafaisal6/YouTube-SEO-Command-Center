import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Keyword = {
  id: number;
  keyword: string;
  volume: number;
  trend: string;
};

export function KeywordInsights() {
  const { toast } = useToast();
  
  const { data: keywords, isLoading } = useQuery<Keyword[]>({
    queryKey: ['/api/keywords'],
    onError: () => {
      toast({
        title: "Error loading keywords",
        description: "Could not load keyword data. Please try again later.",
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="widget flex-1 mb-6">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="font-medium flex items-center text-base">
          <i className="ri-hashtag mr-2 text-gray-400"></i> Top Keywords
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <i className="ri-more-2-fill"></i>
        </Button>
      </CardHeader>
      
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
        ) : (
          <ul className="space-y-3">
            {keywords?.map(keyword => (
              <li key={keyword.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium">{keyword.keyword}</span>
                  {keyword.trend.startsWith('+') ? (
                    <span className="ml-2 text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">{keyword.trend}</span>
                  ) : (
                    <span className="ml-2 text-xs bg-red-900/30 text-red-400 px-1.5 py-0.5 rounded">{keyword.trend}</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{keyword.volume.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t border-border text-center">
        <Button 
          variant="link" 
          className="text-sm text-primary-400 hover:text-primary-300 mx-auto"
          onClick={() => window.location.href = '/keyword-research'}
        >
          View All Keywords <i className="ri-arrow-right-s-line align-middle"></i>
        </Button>
      </CardFooter>
    </Card>
  );
}
