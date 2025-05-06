import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface UserSettings {
  [key: string]: string;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  company?: string;
  phone?: string;
  timezone?: string;
  emailNotifications: boolean;
  darkMode: boolean;
  twoFactorEnabled: boolean;
};

export function useSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profile
  const {
    data: userProfileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile
  } = useQuery<UserProfile>({
    queryKey: ['/api/auth/user'],
    meta: {
      errorMessage: "Could not load your profile"
    }
  });

  // Extract profile from user data
  const profile = userProfileData;

  // Fetch all settings
  const {
    data: settings,
    isLoading: isSettingsLoading,
    isError: isSettingsError,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery<UserSettings>({
    queryKey: ['/api/settings'],
    meta: {
      errorMessage: "Could not load your settings"
    }
  });

  // For the settings page, combine both loading states
  const isLoading = isProfileLoading || isSettingsLoading;

  // Update a setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest({
        url: `/api/settings/${key}`,
        method: 'PUT',
        data: { value }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Setting updated",
        description: "Your setting has been updated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error updating setting",
        description: `Failed to update setting: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Simplified update setting function for components
  const updateSetting = async (key: string, value: string) => {
    return updateSettingMutation.mutateAsync({ key, value });
  };

  // Update user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      return apiRequest({
        url: '/api/auth/user',
        method: 'PUT',
        data: profileData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error updating profile",
        description: `Failed to update profile: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Simplified update profile function for components
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    return updateProfileMutation.mutateAsync(profileData);
  };

  // Toggle a boolean setting
  const toggleBooleanSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      return apiRequest({
        url: `/api/settings/${key}`,
        method: 'PUT',
        data: { value: value.toString() }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Setting updated",
        description: "Your setting has been updated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error toggling setting",
        description: `Failed to toggle setting: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Helper function to get a specific setting value
  const getSetting = (key: string, defaultValue = '') => {
    if (!settings) return defaultValue;
    return settings[key] || defaultValue;
  };

  // Parse a setting as JSON
  const getJsonSetting = <T>(key: string, defaultValue: T): T => {
    if (!settings || !settings[key]) return defaultValue;
    try {
      return JSON.parse(settings[key]) as T;
    } catch (e) {
      console.error(`Error parsing setting ${key} as JSON:`, e);
      return defaultValue;
    }
  };

  // Helper for dashboard layout preferences
  const getDashboardLayout = () => {
    return getJsonSetting<{widgets: string[]}>('dashboard_layout', { widgets: [] });
  };

  // Helper for API settings
  const getApiSettings = () => {
    return getJsonSetting<{throttling: boolean, caching: boolean, cache_ttl: number}>(
      'api_settings', 
      { throttling: true, caching: true, cache_ttl: 3600 }
    );
  };

  return {
    profile,
    isProfileLoading,
    isProfileError,
    profileError,
    refetchProfile,
    
    settings,
    isSettingsLoading,
    isSettingsError,
    settingsError,
    refetchSettings,
    
    isLoading,
    
    updateSetting,
    updateProfile,
    toggleBooleanSetting,
    getSetting,
    getJsonSetting,
    getDashboardLayout,
    getApiSettings
  };
}
