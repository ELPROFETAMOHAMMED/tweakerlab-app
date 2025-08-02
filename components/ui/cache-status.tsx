'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { tweaksKeys } from '@/hooks/use-tweaks-cache';
import { gameConfigsKeys } from '@/hooks/use-game-configs-cache';
import { useEffect, useState } from 'react';

export function CacheStatus() {
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  // Only render after hydration to avoid SSR mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only show in development and after hydration
  if (process.env.NODE_ENV !== 'development' || !isClient) {
    return null;
  }

  const getCacheStats = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();

    const tweakQueries = queries.filter(query =>
      query.queryKey[0] === 'tweaks'
    );
    const gameConfigQueries = queries.filter(query =>
      query.queryKey[0] === 'game-configs'
    );

    const tweaksStats = {
      total: tweakQueries.length,
      cached: tweakQueries.filter(q => q.state.status === 'success').length,
      loading: tweakQueries.filter(q => q.state.status === 'pending').length,
      errors: tweakQueries.filter(q => q.state.status === 'error').length,
    };

    const gameConfigsStats = {
      total: gameConfigQueries.length,
      cached: gameConfigQueries.filter(q => q.state.status === 'success').length,
      loading: gameConfigQueries.filter(q => q.state.status === 'pending').length,
      errors: gameConfigQueries.filter(q => q.state.status === 'error').length,
    };

    return { tweaks: tweaksStats, gameConfigs: gameConfigsStats };
  };

  const stats = getCacheStats();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur border rounded-lg p-3 shadow-lg">
      <div className="text-xs font-mono space-y-2">
        <div className="font-medium text-muted-foreground">Cache Status</div>

        {/* Tweaks Stats */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">⚙️ Tweaks:</div>
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {stats.tweaks.total}
            </Badge>
            <Badge variant="default" className="text-xs bg-green-500">
              {stats.tweaks.cached}
            </Badge>
            {stats.tweaks.loading > 0 && (
              <Badge variant="default" className="text-xs bg-blue-500">
                {stats.tweaks.loading}
              </Badge>
            )}
            {stats.tweaks.errors > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.tweaks.errors}
              </Badge>
            )}
          </div>
        </div>

        {/* Game Configs Stats */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">🎮 Games:</div>
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {stats.gameConfigs.total}
            </Badge>
            <Badge variant="default" className="text-xs bg-green-500">
              {stats.gameConfigs.cached}
            </Badge>
            {stats.gameConfigs.loading > 0 && (
              <Badge variant="default" className="text-xs bg-blue-500">
                {stats.gameConfigs.loading}
              </Badge>
            )}
            {stats.gameConfigs.errors > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.gameConfigs.errors}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
