import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TweaksClientService } from '@/lib/services/client/tweaks-client-service';
import type { DatabaseTweak } from '@/lib/services/tweaks-service';

// Query Keys - centralized for consistency
export const tweaksKeys = {
  all: ['tweaks'] as const,
  featured: (limit?: number) => ['tweaks', 'featured', limit] as const,
  byCategory: (category: string, limit?: number) => ['tweaks', 'category', category, limit] as const,
  search: (term: string, limit?: number) => ['tweaks', 'search', term, limit] as const,
  count: () => ['tweaks', 'count'] as const,
  filters: (filters: any) => ['tweaks', 'filters', filters] as const,
};

// Featured Tweaks Hook
export function useFeaturedTweaks(limit: number = 10) {
  return useQuery({
    queryKey: tweaksKeys.featured(limit),
    queryFn: () => TweaksClientService.getFeaturedTweaks(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// All Tweaks Hook with Filters
export function useTweaks(filters?: {
  category?: string;
  search?: string;
  status?: string;
  riskLevel?: string;
  deviceType?: string;
  windowsVersion?: string;
  requiresAdmin?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: tweaksKeys.filters(filters),
    queryFn: () => TweaksClientService.getAllTweaks(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes (less than featured since this can change more)
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: true, // Always fetch unless disabled
  });
}

// Tweaks by Category Hook
export function useTweaksByCategory(category: string, limit: number = 20) {
  return useQuery({
    queryKey: tweaksKeys.byCategory(category, limit),
    queryFn: () => TweaksClientService.getTweaksByCategory(category, limit),
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 9 * 60 * 1000, // 9 minutes
    enabled: !!category && category !== 'all',
  });
}

// Search Tweaks Hook
export function useSearchTweaks(searchTerm: string, limit: number = 50) {
  return useQuery({
    queryKey: tweaksKeys.search(searchTerm, limit),
    queryFn: () => TweaksClientService.searchTweaks(searchTerm, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes (search results can change)
    gcTime: 6 * 60 * 1000, // 6 minutes
    enabled: !!searchTerm && searchTerm.length > 2, // Only search if term is > 2 chars
  });
}

// Tweaks Count Hook
export function useTweaksCount() {
  return useQuery({
    queryKey: tweaksKeys.count(),
    queryFn: () => TweaksClientService.getTweaksCount(),
    staleTime: 10 * 60 * 1000, // 10 minutes (count doesn't change often)
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Download Tweak Mutation
export function useDownloadTweak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tweakId: string) => TweaksClientService.downloadTweak(tweakId),
    onSuccess: () => {
      // Invalidate and refetch featured tweaks to update download counts
      queryClient.invalidateQueries({ queryKey: tweaksKeys.featured() });
      queryClient.invalidateQueries({ queryKey: tweaksKeys.all });
    },
  });
}

// Like/Unlike Tweak Mutation
export function useLikeTweak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tweakId, action }: { tweakId: string; action: 'like' | 'unlike' }) =>
      TweaksClientService.toggleLike(tweakId, action),
    onMutate: async ({ tweakId, action }) => {
      // Optimistic update - immediately update the UI
      await queryClient.cancelQueries({ queryKey: tweaksKeys.all });

      // Get current data
      const previousData = queryClient.getQueriesData({ queryKey: tweaksKeys.all });

      // Update all relevant queries optimistically
      queryClient.setQueriesData({ queryKey: tweaksKeys.all }, (old: any) => {
        if (!old?.tweaks) return old;

        return {
          ...old,
          tweaks: old.tweaks.map((tweak: DatabaseTweak) =>
            tweak.id === tweakId
              ? {
                ...tweak,
                likes_count: action === 'like'
                  ? tweak.likes_count + 1
                  : Math.max(tweak.likes_count - 1, 0)
              }
              : tweak
          ),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: tweaksKeys.all });
    },
  });
}

// Submit Report Mutation
export function useSubmitReport() {
  return useMutation({
    mutationFn: (report: {
      tweakId: string;
      reportType: string;
      title: string;
      description: string;
      userSystemInfo?: any;
    }) => TweaksClientService.submitReport(report),
  });
}

// Cache Utilities
export function useTweaksCacheUtils() {
  const queryClient = useQueryClient();

  return {
    // Clear all tweaks cache
    clearCache: () => {
      queryClient.removeQueries({ queryKey: tweaksKeys.all });
    },

    // Prefetch featured tweaks
    prefetchFeatured: (limit: number = 10) => {
      return queryClient.prefetchQuery({
        queryKey: tweaksKeys.featured(limit),
        queryFn: () => TweaksClientService.getFeaturedTweaks(limit),
        staleTime: 5 * 60 * 1000,
      });
    },

    // Prefetch category
    prefetchCategory: (category: string, limit: number = 20) => {
      return queryClient.prefetchQuery({
        queryKey: tweaksKeys.byCategory(category, limit),
        queryFn: () => TweaksClientService.getTweaksByCategory(category, limit),
        staleTime: 4 * 60 * 1000,
      });
    },

    // Invalidate all tweaks data
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: tweaksKeys.all });
    },
  };
}
