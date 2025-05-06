import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import { ApiKeySettings } from "@/components/settings/api-key-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { IntegrationsSettings } from "@/components/settings/integrations-settings";
import { User, Key, Shield, Palette, Link as LinkIcon, Bell, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function SettingsPage() {
  const {
    profile,
    settings,
    isLoading: settingsLoading,
    updateProfile,
    updateSetting
  } = useSettings();
  
  // Fetch API keys
  const { data: apiKeys = [], isLoading: apiKeysLoading, refetch: refetchApiKeys } = useQuery({
    queryKey: ['/api/api-keys'],
    queryFn: async () => {
      try {
        const response = await apiRequest({ url: '/api/api-keys', method: 'GET' });
        return response || [];
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
        return [];
      }
    }
  });
  
  // Handle URL tab parameter if redirected from another page
  const [activeTab, setActiveTab] = React.useState('account');
  
  React.useEffect(() => {
    // Get tab from URL if it exists (e.g., /settings?tab=api-keys)
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['account', 'api-keys', 'security', 'appearance', 'integrations', 'notifications', 'advanced'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  // Show loading state while fetching settings or API keys
  const isLoading = settingsLoading || (activeTab === 'api-keys' && apiKeysLoading);
  
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 p-6 h-screen">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-6 h-full">
      <div className="container mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </header>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8 border-b border-[#1e2231]">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="account" 
                className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white text-gray-400 hover:text-white"
              >
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="api-keys" 
                className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white text-gray-400 hover:text-white"
              >
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white text-gray-400 hover:text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white text-gray-400 hover:text-white"
              >
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              <TabsTrigger 
                value="integrations" 
                className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white text-gray-400 hover:text-white"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white text-gray-400 hover:text-white"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className="data-[state=active]:bg-[#252a3a] data-[state=active]:text-white text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="account" className="mt-0">
            <AccountSettings profile={profile} updateProfile={updateProfile} />
          </TabsContent>
          
          <TabsContent value="api-keys" className="mt-0">
            <ApiKeySettings apiKeys={apiKeys} refetch={refetchApiKeys} />
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <SecuritySettings profile={profile} updateProfile={updateProfile} />
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings settings={settings || {}} updateSetting={updateSetting} />
          </TabsContent>
          
          <TabsContent value="integrations" className="mt-0">
            <IntegrationsSettings settings={settings || {}} updateSetting={updateSetting} />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0">
            <div className="bg-[#151827] border-[#1e2231] text-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-2">Notifications Settings</h2>
              <p className="text-gray-400">Configure your notification preferences</p>
              <div className="mt-4 p-4 bg-[#1a1f2e] rounded-lg">
                <p>Feature coming soon...</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-0">
            <div className="bg-[#151827] border-[#1e2231] text-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-2">Advanced Settings</h2>
              <p className="text-gray-400">Configure advanced options and preferences</p>
              <div className="mt-4 p-4 bg-[#1a1f2e] rounded-lg">
                <p>Feature coming soon...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}