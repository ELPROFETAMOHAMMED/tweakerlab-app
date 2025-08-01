"use client"

import { useEffect, useState } from "react";
import { transformGameConfigsToContentItems } from "@/lib/transformers/game-config-transformer";
import { ContentItem } from "./categories-carrousel";
import ContentCarousel from "./categories-carrousel";
import CardDashboardInfo from "./card-dashboard-info";
import { GameConfigsSkeletonCarousel } from "./game-configs-skeleton-carousel";
import { GameConfigsClientService } from "@/lib/services/client/game-configs-client-service";

/**
 * Client component for rendering game configurations section
 * Uses client service for all API calls - clean separation of concerns
 */
export function GameConfigsSection() {
  const [gameConfigs, setGameConfigs] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardsCount, setCardsCount] = useState<number>(8); // Default fallback

  useEffect(() => {
    // Fetch count and data in parallel for better performance
    Promise.all([
      fetchCardsCount(),
      fetchGameConfigs()
    ]);
  }, []);

  const fetchCardsCount = async () => {
    try {
      const count = await GameConfigsClientService.getGameConfigsCount();
      setCardsCount(count);
    } catch (err) {
      console.error('Error fetching cards count:', err);
      // Keep default count of 8 on error
    }
  };

  const fetchGameConfigs = async () => {
    try {
      const data = await GameConfigsClientService.getAllGameConfigs();

      // Transform Supabase data to ContentItem format
      const transformedData = transformGameConfigsToContentItems(data);
      setGameConfigs(transformedData);
    } catch (err) {
      console.error('Error fetching game configs:', err);
      setError('Failed to load game configurations');
      setGameConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    await fetchGameConfigs();
  };

  // Show skeleton while loading
  if (loading) {
    return (
      <GameConfigsSkeletonCarousel
        count={cardsCount}
        title="🎮 Game Configurations"
        showIcon={false}
        showImage={true}
        showBadge={true}
        itemsPerView="1/4"
        renderCustomContent={true}
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameConfigs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No game configurations available</p>
        </div>
      </div>
    );
  }

  // Show real carousel with data
  return (
    <ContentCarousel
      items={gameConfigs}
      title="🎮 Game Configurations"
      showIcon={false}
      showImage={true}
      showBadge={true}
      itemsPerView="1/4"
      renderCustomContent={(item) => (
        <CardDashboardInfo
          description={item.description}
          settingsFile={item.metadata?.settingsFile}
          fileSize={item.metadata?.fileSize}
          downloads={item.metadata?.downloads}
          rating={item.metadata?.rating}
          category={item.metadata?.category}
          gameConfigId={item.metadata?.gameConfigId}
        />
      )}
    />
  );
}
