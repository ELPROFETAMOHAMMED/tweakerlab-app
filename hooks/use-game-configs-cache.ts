import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameConfigsClientService } from '@/lib/services/client/game-configs-client-service';
import type { GameConfig } from '@/types/game-config';

// Query Keys - centralized for consistency
export const gameConfigsKeys = {
  all: ['game-configs'] as const,
  list: () => ['game-configs', 'list'] as const,
  byCategory: (category: string) => ['game-configs', 'category', category] as const,
  search: (term: string) => ['game-configs', 'search', term] as const,
  count: () => ['game-configs', 'count'] as const,
};

// Get All Game Configs Hook
export function useGameConfigs() {
  return useQuery({
    queryKey: gameConfigsKeys.list(),
    queryFn: () => GameConfigsClientService.getAllGameConfigs(),
    staleTime: 8 * 60 * 1000, // 8 minutes - game configs don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Game Configs by Category Hook
export function useGameConfigsByCategory(category: string) {
  return useQuery({
    queryKey: gameConfigsKeys.byCategory(category),
    queryFn: () => GameConfigsClientService.getGameConfigsByCategory(category),
    staleTime: 6 * 60 * 1000, // 6 minutes
    gcTime: 12 * 60 * 1000, // 12 minutes
    enabled: !!category && category !== 'all',
  });
}

// Search Game Configs Hook
export function useSearchGameConfigs(searchTerm: string) {
  return useQuery({
    queryKey: gameConfigsKeys.search(searchTerm),
    queryFn: () => GameConfigsClientService.searchGameConfigs(searchTerm),
    staleTime: 3 * 60 * 1000, // 3 minutes - search results can change
    gcTime: 8 * 60 * 1000, // 8 minutes
    enabled: !!searchTerm && searchTerm.length > 2, // Only search if term is > 2 chars
  });
}

// Game Configs Count Hook
export function useGameConfigsCount() {
  return useQuery({
    queryKey: gameConfigsKeys.count(),
    queryFn: () => GameConfigsClientService.getGameConfigsCount(),
    staleTime: 15 * 60 * 1000, // 15 minutes - count doesn't change often
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Download Game Config Mutation
export function useDownloadGameConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameConfigId: number) => GameConfigsClientService.downloadGameConfig(gameConfigId),
    onSuccess: () => {
      // Invalidate and refetch game configs to update download counts
      queryClient.invalidateQueries({ queryKey: gameConfigsKeys.all });
    },
  });
}

// Cache Utilities
export function useGameConfigsCacheUtils() {
  const queryClient = useQueryClient();

  return {
    // Clear all game configs cache
    clearCache: () => {
      queryClient.removeQueries({ queryKey: gameConfigsKeys.all });
    },

    // Prefetch all game configs
    prefetchGameConfigs: () => {
      return queryClient.prefetchQuery({
        queryKey: gameConfigsKeys.list(),
        queryFn: () => GameConfigsClientService.getAllGameConfigs(),
        staleTime: 8 * 60 * 1000,
      });
    },

    // Prefetch category
    prefetchCategory: (category: string) => {
      return queryClient.prefetchQuery({
        queryKey: gameConfigsKeys.byCategory(category),
        queryFn: () => GameConfigsClientService.getGameConfigsByCategory(category),
        staleTime: 6 * 60 * 1000,
      });
    },

    // Invalidate all game configs data
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: gameConfigsKeys.all });
    },
  };
}
