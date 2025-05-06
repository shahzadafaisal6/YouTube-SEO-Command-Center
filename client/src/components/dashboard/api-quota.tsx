import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

type ApiQuota = {
  id: number;
  type: string;
  name: string;
  quotaLimit: number;
  quotaUsed: number;
  isActive: boolean;
};

export function ApiQuota() {
  const { toast } = useToast();
  
  const { data: apiQuotas, isLoading } = useQuery<ApiQuota[]>({
    queryKey: ['/api/quota'],
    onError: () => {
      toast({
        title: "Error loading API quota",
        description: "Could not load API quota data. Please try again later.",
        variant: "destructive",
      });
    }
  });

  const getQuotaPercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getProgressColor = (type: string) => {
    switch (type) {
      case 'youtube':
        return 'bg-primary';
      case 'openai':
        return 'bg-secondary';
      case 'vision':
        return 'bg-blue-500';
      default:
        return 'bg-muted-foreground';
    }
  };

  const formatQuotaDisplay = (type: string, used: number, limit: number) => {
    if (type === 'openai') {
      return `$${used.toFixed(2)} / $${limit.toFixed(2)}`;
    }
    return `${used.toLocaleString()} / ${limit.toLocaleString()} ${type === 'youtube' ? 'units' : 'requests'}`;
  };

  return (
    <Card className="widget flex-1">
      <CardHeader className="px-5 py-4 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="font-medium flex items-center text-base">
          <i className="ri-database-2-line mr-2 text-gray-400"></i> API Quota Usage
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <i className="ri-more-2-fill"></i>
        </Button>
      </CardHeader>
      
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-4">
            <div>
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-2" />
            </div>
            <div>
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-2" />
            </div>
            <div>
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-2" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {apiQuotas?.map(quota => (
              <div key={quota.id} className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm">{quota.name}</span>
                  <span className="text-xs text-gray-400">
                    {formatQuotaDisplay(quota.type, quota.quotaUsed, quota.quotaLimit)}
                  </span>
                </div>
                <Progress 
                  value={getQuotaPercentage(quota.quotaUsed, quota.quotaLimit)} 
                  className="h-2 bg-muted"
                  indicatorClassName={getProgressColor(quota.type)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 border-t border-border text-center">
        <Button 
          variant="link" 
          className="text-sm text-primary-400 hover:text-primary-300 mx-auto"
          onClick={() => window.location.href = '/settings?tab=api-keys'}
        >
          Manage API Keys <i className="ri-arrow-right-s-line align-middle"></i>
        </Button>
      </CardFooter>
    </Card>
  );
}
