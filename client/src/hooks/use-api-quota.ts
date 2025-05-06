import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type ApiQuota = {
  id: number;
  type: string;
  name: string;
  quotaLimit: number;
  quotaUsed: number;
  isActive: boolean;
};

export function useApiQuota() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch API quota data
  const {
    data: apiQuotas,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<ApiQuota[]>({
    queryKey: ['/api/quota'],
    onError: (err) => {
      toast({
        title: "Error loading API quota",
        description: `Could not load API quota data: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Add new API key
  const addApiKey = useMutation({
    mutationFn: async (apiKey: Omit<ApiQuota, 'id'>) => {
      const res = await apiRequest('POST', '/api/api-keys', apiKey);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quota'] });
      toast({
        title: "API key added",
        description: "Your API key has been added successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error adding API key",
        description: `Failed to add API key: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Update API key
  const updateApiKey = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ApiQuota> & { id: number }) => {
      const res = await apiRequest('PUT', `/api/api-keys/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quota'] });
      toast({
        title: "API key updated",
        description: "Your API key has been updated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error updating API key",
        description: `Failed to update API key: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete API key
  const deleteApiKey = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/api-keys/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quota'] });
      toast({
        title: "API key deleted",
        description: "Your API key has been deleted successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error deleting API key",
        description: `Failed to delete API key: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Rotate API key
  const rotateApiKey = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/api-keys/${id}/rotate`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quota'] });
      toast({
        title: "API key rotated",
        description: "Your API key has been rotated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error rotating API key",
        description: `Failed to rotate API key: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Helper functions
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

  return {
    apiQuotas,
    isLoading,
    isError,
    error,
    refetch,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    rotateApiKey,
    getQuotaPercentage,
    getProgressColor,
    formatQuotaDisplay
  };
}
