import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ApiQuota } from "@/hooks/use-api-quota";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Activity, ArrowUpRight } from "lucide-react";

export default function ApiQuotaPage() {
  // Fetch API quota data
  const { data: apiQuotas = [], isLoading } = useQuery<ApiQuota[]>({
    queryKey: ['/api/quota'],
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

  // Check if any API is close to quota limit
  const hasWarning = apiQuotas.some((api: ApiQuota) => {
    const percentUsed = (api.quotaUsed / api.quotaLimit) * 100;
    return percentUsed >= 80;
  });

  return (
    <div className="flex h-screen bg-[#0e1118]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">API Quota Management</h1>
              <p className="text-gray-400">Monitor and manage your API usage</p>
            </div>
            <div className="flex gap-3">
              <Button className="gradient-primary">
                Request Quota Increase
              </Button>
            </div>
          </div>

          {hasWarning && (
            <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900 text-red-300">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning: API Quota Limits</AlertTitle>
              <AlertDescription>
                One or more of your APIs is nearing its quota limit. Consider upgrading or requesting a quota increase.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apiQuotas.map((api: ApiQuota) => {
              const percentUsed = (api.quotaUsed / api.quotaLimit) * 100;
              const isWarning = percentUsed >= 80;
              const isCritical = percentUsed >= 95;
              
              let statusColor = "bg-green-500";
              if (isWarning) statusColor = "bg-yellow-500";
              if (isCritical) statusColor = "bg-red-500";

              return (
                <Card 
                  key={api.id} 
                  className="bg-[#151827] border-[#1e2231] text-white overflow-hidden"
                >
                  <div className={`h-1 w-full ${statusColor}`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {api.name}
                          {api.type === 'youtube' && 
                            <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">YouTube</span>
                          }
                          {api.type === 'openai' && 
                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">OpenAI</span>
                          }
                          {api.type === 'vision' && 
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">Vision</span>
                          }
                        </CardTitle>
                        <CardDescription className="text-gray-400 mt-1">
                          Usage for current billing cycle
                        </CardDescription>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Active</span>
                          <Switch checked={api.isActive} />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <div className="text-sm text-gray-400">
                            {api.quotaUsed.toLocaleString()} / {api.quotaLimit.toLocaleString()} units
                          </div>
                          <div className="text-sm font-medium">
                            {percentUsed.toFixed(1)}%
                          </div>
                        </div>
                        <Progress 
                          value={percentUsed} 
                          className="h-2 bg-[#252a3a]"
                          indicatorClassName={
                            isCritical ? "bg-red-500" : 
                            isWarning ? "bg-yellow-500" : 
                            "bg-green-500"
                          }
                        />
                      </div>

                      <div className="bg-[#1a1f2e] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="h-4 w-4 text-indigo-400" />
                          <h4 className="text-sm font-medium text-white">Usage Stats</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-gray-400">Remaining</div>
                            <div className="text-lg font-semibold text-white">
                              {(api.quotaLimit - api.quotaUsed).toLocaleString()} units
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Resets</div>
                            <div className="text-lg font-semibold text-white">
                              {/* In a real app, this would come from the API */}
                              In 15 days
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Daily Average</div>
                            <div className="text-lg font-semibold text-white">
                              {/* This is a placeholder calculation */}
                              {Math.round(api.quotaUsed / 15).toLocaleString()} units
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400">Status</div>
                            <div className="flex items-center gap-1 mt-1">
                              {isCritical ? (
                                <span className="text-sm text-red-400 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Critical
                                </span>
                              ) : isWarning ? (
                                <span className="text-sm text-yellow-400 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Warning
                                </span>
                              ) : (
                                <span className="text-sm text-green-400 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" /> Healthy
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="link" 
                      className="text-indigo-400 p-0 h-auto flex items-center gap-1 hover:text-indigo-300"
                    >
                      View usage details <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <Card className="mt-6 bg-[#151827] border-[#1e2231] text-white">
            <CardHeader>
              <CardTitle>API Quota Management Tips</CardTitle>
              <CardDescription className="text-gray-400">
                Best practices to optimize your API usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#1a1f2e] p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Batch API Requests</h3>
                  <p className="text-gray-400 text-sm">
                    When fetching multiple videos, use the <code className="bg-[#252a3a] px-1 py-0.5 rounded text-indigo-300">videos.list</code> endpoint 
                    with multiple IDs in a single request instead of making separate requests for each video.
                  </p>
                </div>
                <div className="bg-[#1a1f2e] p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Implement Caching</h3>
                  <p className="text-gray-400 text-sm">
                    Cache API responses that don't change frequently to reduce the number of API calls. 
                    For example, video metadata rarely changes and can be cached for 24 hours.
                  </p>
                </div>
                <div className="bg-[#1a1f2e] p-4 rounded-lg">
                  <h3 className="font-medium text-white mb-2">Request Only Needed Fields</h3>
                  <p className="text-gray-400 text-sm">
                    Use the <code className="bg-[#252a3a] px-1 py-0.5 rounded text-indigo-300">part</code> parameter 
                    to specify only the fields you need, reducing quota costs per request.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}