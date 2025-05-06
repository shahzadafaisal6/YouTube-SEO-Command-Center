import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Protected route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isLoading, isError } = useQuery({ 
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && isError) {
      setLocation('/login');
    }
  }, [isLoading, isError, setLocation]);
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-[#0e1118]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }
  
  if (isError) {
    return null; // Will redirect via useEffect
  }
  
  return <Component />;
}

// Import all pages
import VideosPage from "@/pages/videos";
import KeywordResearch from "@/pages/keyword-research";
import ApiQuotaPage from "@/pages/api-quota";
import AIAssistant from "@/pages/ai-assistant";
import CompetitorAnalysis from "@/pages/competitor-analysis";
import Analytics from "@/pages/analytics";
import SettingsPage from "@/pages/settings";

// Import tool pages
import TitleGenerator from "@/pages/tools/title-generator";
import DescriptionWriter from "@/pages/tools/description-writer";
import TagOptimizer from "@/pages/tools/tag-optimizer";
import ThumbnailAnalyzer from "@/pages/tools/thumbnail-analyzer";

function Router() {
  const [location] = useLocation();
  
  // Authenticated state check
  const { data: user, isLoading } = useQuery({ 
    queryKey: ['/api/auth/user'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: location !== '/login',
  });
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/videos" component={() => <ProtectedRoute component={VideosPage} />} />
      <Route path="/keyword-research" component={() => <ProtectedRoute component={KeywordResearch} />} />
      <Route path="/analytics" component={() => <ProtectedRoute component={Analytics} />} />
      <Route path="/api-quota" component={() => <ProtectedRoute component={ApiQuotaPage} />} />
      <Route path="/ai-assistant" component={() => <ProtectedRoute component={AIAssistant} />} />
      <Route path="/competitor-analysis" component={() => <ProtectedRoute component={CompetitorAnalysis} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      
      {/* Tool routes */}
      <Route path="/tools/title-generator" component={() => <ProtectedRoute component={TitleGenerator} />} />
      <Route path="/tools/description-writer" component={() => <ProtectedRoute component={DescriptionWriter} />} />
      <Route path="/tools/tag-optimizer" component={() => <ProtectedRoute component={TagOptimizer} />} />
      <Route path="/tools/thumbnail-analyzer" component={() => <ProtectedRoute component={ThumbnailAnalyzer} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

// Auth provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    // Check authentication status on load
    const checkAuth = async () => {
      try {
        await apiRequest({
          url: '/api/auth/user', 
          method: 'GET'
        });
        setIsLoaded(true);
      } catch (error) {
        if (window.location.pathname !== '/login') {
          setLocation('/login');
        }
        setIsLoaded(true);
      }
    };
    
    checkAuth();
  }, [setLocation]);
  
  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center bg-[#0e1118]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="hamna-tec-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
