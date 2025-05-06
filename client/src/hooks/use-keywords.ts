import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export type Keyword = {
  id: number;
  keyword: string;
  volume: number;
  trend: string;
};

export function useKeywords() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all keywords
  const {
    data: keywords,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<Keyword[]>({
    queryKey: ['/api/keywords'],
    onError: (err) => {
      toast({
        title: "Error loading keywords",
        description: `Could not load keyword data: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Add a new keyword
  const addKeyword = useMutation({
    mutationFn: async (keyword: Omit<Keyword, 'id'>) => {
      const res = await apiRequest('POST', '/api/keywords', keyword);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      toast({
        title: "Keyword added",
        description: "Your keyword has been added successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error adding keyword",
        description: `Failed to add keyword: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Update a keyword
  const updateKeyword = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Keyword> & { id: number }) => {
      const res = await apiRequest('PUT', `/api/keywords/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      toast({
        title: "Keyword updated",
        description: "Your keyword has been updated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error updating keyword",
        description: `Failed to update keyword: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete a keyword
  const deleteKeyword = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/keywords/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keywords'] });
      toast({
        title: "Keyword deleted",
        description: "Your keyword has been deleted successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error deleting keyword",
        description: `Failed to delete keyword: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Generate keyword suggestions
  const generateKeywordSuggestions = useMutation({
    mutationFn: async (seed: string) => {
      const res = await apiRequest('POST', '/api/keywords/suggest', { seed });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Keyword suggestions generated",
        description: `${data.length} keyword suggestions have been generated.`,
      });
    },
    onError: (err) => {
      toast({
        title: "Error generating suggestions",
        description: `Failed to generate keyword suggestions: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  // Helper functions
  const getTopKeywords = (limit = 5) => {
    if (!keywords) return [];
    return [...keywords]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  };

  const getTrendingKeywords = () => {
    if (!keywords) return [];
    return [...keywords]
      .filter(k => k.trend.startsWith('+'))
      .sort((a, b) => {
        const aTrend = parseFloat(a.trend.replace('+', '').replace('%', ''));
        const bTrend = parseFloat(b.trend.replace('+', '').replace('%', ''));
        return bTrend - aTrend;
      });
  };

  const getDecreasingKeywords = () => {
    if (!keywords) return [];
    return [...keywords]
      .filter(k => k.trend.startsWith('-'))
      .sort((a, b) => {
        const aTrend = parseFloat(a.trend.replace('-', '').replace('%', ''));
        const bTrend = parseFloat(b.trend.replace('-', '').replace('%', ''));
        return bTrend - aTrend;
      });
  };

  return {
    keywords,
    isLoading,
    isError,
    error,
    refetch,
    addKeyword,
    updateKeyword,
    deleteKeyword,
    generateKeywordSuggestions,
    getTopKeywords,
    getTrendingKeywords,
    getDecreasingKeywords
  };
}
