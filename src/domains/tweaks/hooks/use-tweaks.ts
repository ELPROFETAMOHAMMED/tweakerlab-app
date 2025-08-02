import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TweaksClientService } from '../services/tweaks-client-service'
import type { DatabaseTweak, TweaksFilters, ReportData } from '../types/tweaks'

export const tweaksKeys = {
  all: ['tweaks'] as const,
  featured: (limit?: number) => ['tweaks', 'featured', limit] as const,
  byCategory: (category: string, limit?: number) => ['tweaks', 'category', category, limit] as const,
  search: (term: string, limit?: number) => ['tweaks', 'search', term, limit] as const,
  count: () => ['tweaks', 'count'] as const,
  filters: (filters: TweaksFilters) => ['tweaks', 'filters', filters] as const,
}

export function useFeaturedTweaks(limit = 10) {
  return useQuery({
    queryKey: tweaksKeys.featured(limit),
    queryFn: () => TweaksClientService.getFeaturedTweaks(limit),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useTweaks(filters?: TweaksFilters) {
  return useQuery({
    queryKey: tweaksKeys.filters(filters || {}),
    queryFn: () => TweaksClientService.getAllTweaks(filters),
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
  })
}

export function useTweaksByCategory(category: string, limit = 20) {
  return useQuery({
    queryKey: tweaksKeys.byCategory(category, limit),
    queryFn: () => TweaksClientService.getTweaksByCategory(category, limit),
    staleTime: 4 * 60 * 1000,
    gcTime: 9 * 60 * 1000,
    enabled: !!category && category !== 'all',
  })
}

export function useSearchTweaks(searchTerm: string, limit = 50) {
  return useQuery({
    queryKey: tweaksKeys.search(searchTerm, limit),
    queryFn: () => TweaksClientService.searchTweaks(searchTerm, limit),
    staleTime: 2 * 60 * 1000,
    gcTime: 6 * 60 * 1000,
    enabled: !!searchTerm && searchTerm.length > 2,
  })
}

export function useTweaksCount() {
  return useQuery({
    queryKey: tweaksKeys.count(),
    queryFn: () => TweaksClientService.getTweaksCount(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useDownloadTweak() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tweakId: string) => TweaksClientService.downloadTweak(tweakId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tweaksKeys.featured() })
      queryClient.invalidateQueries({ queryKey: tweaksKeys.all })
    },
  })
}

export function useLikeTweak() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tweakId, action }: { tweakId: string; action: 'like' | 'unlike' }) =>
      TweaksClientService.toggleLike(tweakId, action),
    onMutate: ({ tweakId, action }) => {
      return queryClient
        .cancelQueries({ queryKey: tweaksKeys.all })
        .then(() => {
          const previousData = queryClient.getQueriesData({ queryKey: tweaksKeys.all })

          queryClient.setQueriesData({ queryKey: tweaksKeys.all }, (old: any) => {
            if (!old?.tweaks) return old

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
            }
          })

          return { previousData }
        })
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tweaksKeys.all })
    },
  })
}

export function useSubmitReport() {
  return useMutation({
    mutationFn: (report: ReportData) => TweaksClientService.submitReport(report),
  })
}

export function useTweaksCacheUtils() {
  const queryClient = useQueryClient()

  return {
    clearCache: () => queryClient.removeQueries({ queryKey: tweaksKeys.all }),
    prefetchFeatured: (limit = 10) =>
      queryClient.prefetchQuery({
        queryKey: tweaksKeys.featured(limit),
        queryFn: () => TweaksClientService.getFeaturedTweaks(limit),
        staleTime: 5 * 60 * 1000,
      }),
    prefetchCategory: (category: string, limit = 20) =>
      queryClient.prefetchQuery({
        queryKey: tweaksKeys.byCategory(category, limit),
        queryFn: () => TweaksClientService.getTweaksByCategory(category, limit),
        staleTime: 4 * 60 * 1000,
      }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: tweaksKeys.all }),
  }
}
