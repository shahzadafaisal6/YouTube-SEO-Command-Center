import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type StatCardProps = {
  title: string;
  value: string;
  previousValue: string;
  percentChange: number;
  chartData: number[];
  colorClass: string;
};

function StatCard({ title, value, previousValue, percentChange, chartData, colorClass }: StatCardProps) {
  const isPositive = percentChange >= 0;
  
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-400">{title}</h4>
        <span className={`${isPositive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'} text-xs px-2 py-0.5 rounded-full flex items-center`}>
          <i className={`${isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
          {Math.abs(percentChange).toFixed(1)}%
        </span>
      </div>
      <div className="flex items-end">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-xs text-gray-400 ml-2 mb-1">vs {previousValue} last period</span>
      </div>
      <div className="h-10 mt-2">
        <div className="h-full w-full bg-muted rounded-md overflow-hidden">
          <div className="flex h-full items-end">
            {chartData.map((height, i) => (
              <div
                key={i}
                style={{ height: `${height}%` }}
                className={`w-1/12 ${colorClass}${(i / chartData.length) * 100}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExecutiveOverview() {
  const { toast } = useToast();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    onError: () => {
      toast({
        title: "Error loading dashboard stats",
        description: "Could not load dashboard statistics. Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  const generateMockChartData = () => {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 60) + 40);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-medium">Channel Overview</h3>
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-3">Last 30 days</span>
          <div className="relative">
            <Button variant="outline" size="sm" className="text-sm bg-muted">
              <span>Filter</span>
              <i className="ri-arrow-down-s-line ml-1"></i>
            </Button>
          </div>
        </div>
      </div>
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {isLoading ? (
          <>
            <Card className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-10 w-full" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-10 w-full" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-10 w-full" />
            </Card>
            <Card className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-10 w-full" />
            </Card>
          </>
        ) : (
          <>
            <StatCard
              title="Total Views"
              value={stats?.totalViews?.toLocaleString() || "486.2K"}
              previousValue="431.5K"
              percentChange={12.8}
              chartData={generateMockChartData()}
              colorClass="bg-primary-500/"
            />
            
            <StatCard
              title="Watch Time (hrs)"
              value={stats?.totalWatchTimeHours?.toLocaleString() || "12,842"}
              previousValue="11,856"
              percentChange={8.3}
              chartData={generateMockChartData()}
              colorClass="bg-secondary-500/"
            />
            
            <StatCard
              title="New Subscribers"
              value={stats?.totalSubscribers?.toLocaleString() || "3,721"}
              previousValue="3,230"
              percentChange={15.2}
              chartData={generateMockChartData()}
              colorClass="bg-blue-500/"
            />
            
            <StatCard
              title="Avg. CTR"
              value={stats?.averageCTR || "4.8%"}
              previousValue="4.9%"
              percentChange={-2.1}
              chartData={generateMockChartData()}
              colorClass="bg-yellow-500/"
            />
          </>
        )}
      </div>
      
      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-card to-muted rounded-xl p-5 border border-border shadow-card relative overflow-hidden mb-8">
        <div className="flex items-start">
          <div className="p-3 bg-primary/20 rounded-lg mr-4">
            <i className="ri-ai-generate text-2xl text-primary-400"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1 flex items-center">
              <span>AI Insight</span>
              <span className="ml-2 text-xs bg-primary/20 text-primary-400 px-2 py-0.5 rounded-full">New</span>
            </h4>
            <p className="text-gray-300 mb-3">
              Your videos with detailed tutorials are outperforming your short-form content by 43%. Consider creating more in-depth guides on trending topics like "API integration" and "AI optimization".
            </p>
            <div className="flex">
              <Button 
                variant="default" 
                size="sm" 
                className="mr-3 bg-primary-700 hover:bg-primary-600"
                onClick={() => window.location.href = '/ai-assistant?task=topic-ideas'}
              >
                <i className="ri-magic-line mr-1"></i> Generate Topic Ideas
              </Button>
              <Button variant="outline" size="sm" className="bg-dark-600 hover:bg-dark-500 text-gray-300">
                <i className="ri-close-line mr-1"></i> Dismiss
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 w-40 h-40 bg-primary/5 rounded-full -mr-16 -mb-16 blur-xl"></div>
      </div>
    </section>
  );
}
