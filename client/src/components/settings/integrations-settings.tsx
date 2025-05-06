import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSettings } from "@/hooks/use-settings";
import { SiYoutube, SiGoogle, SiOpenai } from "react-icons/si";
import { AlertCircle, Check, ExternalLink, Link, Info, Eye, EyeOff } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type IntegrationsSettingsProps = {
  settings: UserSettings;
  updateSetting: (key: string, value: string) => Promise<void>;
};

export function IntegrationsSettings({ settings, updateSetting }: IntegrationsSettingsProps) {
  // State for integration status
  const [youtubeConnected, setYoutubeConnected] = useState(
    settings?.youtube_integration === 'true' || true
  );
  const [googleAnalyticsConnected, setGoogleAnalyticsConnected] = useState(
    settings?.google_analytics_integration === 'true' || false
  );
  const [openaiConnected, setOpenaiConnected] = useState(
    settings?.openai_integration === 'true' || true
  );
  
  // State for Google OAuth credentials
  const [googleClientId, setGoogleClientId] = useState(settings?.google_client_id || '');
  const [googleClientSecret, setGoogleClientSecret] = useState(settings?.google_client_secret || '');
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleYoutubeToggle = async (checked: boolean) => {
    setYoutubeConnected(checked);
    await updateSetting('youtube_integration', checked.toString());
  };
  
  const handleGoogleAnalyticsToggle = async (checked: boolean) => {
    setGoogleAnalyticsConnected(checked);
    await updateSetting('google_analytics_integration', checked.toString());
  };
  
  const handleOpenAIToggle = async (checked: boolean) => {
    setOpenaiConnected(checked);
    await updateSetting('openai_integration', checked.toString());
  };
  
  const saveGoogleCredentials = async () => {
    setIsSaving(true);
    try {
      // Update client ID
      await updateSetting('google_client_id', googleClientId);
      // Update client secret
      await updateSetting('google_client_secret', googleClientSecret);
      
      // Make an API call to update environment variables
      await apiRequest({
        url: '/api/settings/update-google-credentials',
        method: 'POST',
        data: {
          clientId: googleClientId,
          clientSecret: googleClientSecret
        }
      });
      
      toast({
        title: "Google credentials updated",
        description: "Your Google OAuth credentials have been saved successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to save credentials",
        description: "There was an error saving your Google OAuth credentials.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-[#151827] border-[#1e2231] text-white">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link className="h-5 w-5 text-indigo-400" />
          <CardTitle>Integrations</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Connect with external services and platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Google OAuth configuration section */}
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] p-4 mb-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="google-oauth" className="border-b-0">
              <AccordionTrigger className="py-2 text-base font-medium hover:no-underline">
                <div className="flex items-center gap-2">
                  <SiGoogle className="h-5 w-5 text-blue-400" />
                  <span>Google OAuth Configuration</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-[#252a3a] p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Info className="h-4 w-4 text-blue-400 mr-2" />
                      <p className="text-sm text-gray-300">Configure your Google OAuth credentials to enable YouTube integration</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      To obtain credentials, visit the{" "}
                      <a 
                        href="https://console.cloud.google.com/apis/credentials" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Google Cloud Console
                      </a>
                      {" "}and create OAuth client credentials with these redirect URIs:
                    </p>
                    <div className="bg-[#1e2231] p-2 rounded text-xs mb-3 font-mono">
                      {window.location.origin}/api/auth/google/callback
                    </div>
                    <p className="text-xs text-gray-400">Required scopes: <span className="font-mono">email profile https://www.googleapis.com/auth/youtube</span></p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Google Client ID</label>
                      <div className="flex space-x-2">
                        <Input
                          className="bg-[#1e2231] border-[#2a3146] text-white flex-1"
                          placeholder="Enter Google Client ID"
                          value={googleClientId}
                          onChange={(e) => setGoogleClientId(e.target.value)}
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" className="border-[#2a3146]">
                                <Info className="h-4 w-4 text-gray-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1a1f2e] border-[#2a3146] text-white">
                              <p className="text-sm">Client ID from Google Cloud Console</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Google Client Secret</label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Input
                            className="bg-[#1e2231] border-[#2a3146] text-white pr-10 w-full"
                            type={showClientSecret ? "text" : "password"}
                            placeholder="Enter Google Client Secret"
                            value={googleClientSecret}
                            onChange={(e) => setGoogleClientSecret(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowClientSecret(!showClientSecret)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showClientSecret ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" className="border-[#2a3146]">
                                <Info className="h-4 w-4 text-gray-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1a1f2e] border-[#2a3146] text-white">
                              <p className="text-sm">Client Secret from Google Cloud Console</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        onClick={saveGoogleCredentials} 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          <>Save Google Credentials</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <div className="bg-[#1a1f2e] rounded-lg border border-[#2a3146] divide-y divide-[#2a3146]">
          {/* YouTube Integration */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-red-500/10 flex items-center justify-center">
                  <SiYoutube className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-medium">YouTube</h3>
                  <p className="text-sm text-gray-400">Connect with YouTube API for channel and video data</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {youtubeConnected && (
                  <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Connected
                  </div>
                )}
                <Switch 
                  checked={youtubeConnected} 
                  onCheckedChange={handleYoutubeToggle}
                />
              </div>
            </div>
            {youtubeConnected && (
              <div className="bg-[#252a3a] p-3 rounded-lg mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Hamna Tec Channel</p>
                  <p className="text-xs text-gray-400">Last synced: 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm" className="border-[#2a3146] text-gray-300">
                  Refresh
                </Button>
              </div>
            )}
          </div>
          
          {/* Google Analytics Integration */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-blue-500/10 flex items-center justify-center">
                  <SiGoogle className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium">Google Analytics</h3>
                  <p className="text-sm text-gray-400">Import Google Analytics data for comprehensive tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {googleAnalyticsConnected && (
                  <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Connected
                  </div>
                )}
                <Switch 
                  checked={googleAnalyticsConnected} 
                  onCheckedChange={handleGoogleAnalyticsToggle}
                />
              </div>
            </div>
            {!googleAnalyticsConnected && (
              <div className="bg-[#252a3a] p-3 rounded-lg mt-3 flex items-center">
                <AlertCircle className="h-4 w-4 text-orange-400 mr-2" />
                <p className="text-xs text-gray-300">Connect to Google Analytics to import traffic and conversion data</p>
              </div>
            )}
          </div>
          
          {/* OpenAI Integration */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-green-500/10 flex items-center justify-center">
                  <SiOpenai className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium">OpenAI</h3>
                  <p className="text-sm text-gray-400">Enable AI-powered recommendations and content generation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openaiConnected && (
                  <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Connected
                  </div>
                )}
                <Switch 
                  checked={openaiConnected} 
                  onCheckedChange={handleOpenAIToggle}
                />
              </div>
            </div>
            {openaiConnected && (
              <div className="bg-[#252a3a] p-3 rounded-lg mt-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">Current Model</p>
                  <p className="text-sm">gpt-4o</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">API Status</p>
                  <div className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full text-xs flex items-center">
                    <Check className="h-3 w-3 mr-1" /> Operational
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-[#1e2231] pt-4 flex justify-between">
        <p className="text-sm text-gray-400">Need help with integrations?</p>
        <Button variant="outline" className="border-[#2a3146] text-gray-300">
          <ExternalLink className="h-4 w-4 mr-2" /> Documentation
        </Button>
      </CardFooter>
    </Card>
  );
}