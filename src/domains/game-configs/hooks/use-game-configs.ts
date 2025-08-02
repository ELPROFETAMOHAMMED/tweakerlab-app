import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GameConfigsClientService } from '../services/game-configs-client-service'

export const gameConfigsKeys = {
  all: ['game-configs'] as const,
  list: () => ['game-configs', 'list'] as const,
  byCategory: (category: string) => ['game-configs', 'category', category] as const,
  search: (term: string) => ['game-configs', 'search', term] as const,
  count: () => ['game-configs', 'count'] as const,
}

export function useGameConfigs() {
  return useQuery({
    queryKey: gameConfigsKeys.list(),
    queryFn: () => GameConfigsClientService.getAllGameConfigs(),
    staleTime: 8 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

export function useGameConfigsByCategory(category: string) {
  return useQuery({
    queryKey: gameConfigsKeys.byCategory(category),
    queryFn: () => GameConfigsClientService.getGameConfigsByCategory(category),
    staleTime: 6 * 60 * 1000,
    gcTime: 12 * 60 * 1000,
    enabled: !!category && category !== 'all',
  })
}

export function useSearchGameConfigs(searchTerm: string) {
  return useQuery({
    queryKey: gameConfigsKeys.search(searchTerm),
    queryFn: () => GameConfigsClientService.searchGameConfigs(searchTerm),
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
    enabled: !!searchTerm && searchTerm.length > 2,
  })
}

export function useGameConfigsCount() {
  return useQuery({
    queryKey: gameConfigsKeys.count(),
    queryFn: () => GameConfigsClientService.getGameConfigsCount(),
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  })
}

export function useDownloadGameConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameConfigId: number) => GameConfigsClientService.downloadGameConfig(gameConfigId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameConfigsKeys.all })
    },
  })
}

export function useGameConfigsCacheUtils() {
  const queryClient = useQueryClient()

  return {
    clearCache: () => queryClient.removeQueries({ queryKey: gameConfigsKeys.all }),
    prefetchGameConfigs: () =>
      queryClient.prefetchQuery({
        queryKey: gameConfigsKeys.list(),
        queryFn: () => GameConfigsClientService.getAllGameConfigs(),
        staleTime: 8 * 60 * 1000,
      }),
    prefetchCategory: (category: string) =>
      queryClient.prefetchQuery({
        queryKey: gameConfigsKeys.byCategory(category),
        queryFn: () => GameConfigsClientService.getGameConfigsByCategory(category),
        staleTime: 6 * 60 * 1000,
      }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: gameConfigsKeys.all }),
  }
}
