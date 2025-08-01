"use client"

import { useEffect, useState } from "react";
import { transformGameConfigsToContentItems } from "@/lib/transformers/game-config-transformer";
import { ContentItem } from "./categories-carrousel";
import ContentCarousel from "./categories-carrousel";
import CardDashboardInfo from "./card-dashboard-info";
import { GameConfigsSkeletonCarousel } from "./game-configs-skeleton-carousel";

/**
 * Client component for rendering game configurations section
 * Uses separate skeleton component to maintain clean code separation
 */
export function GameConfigsSection() {
  const [gameConfigs, setGameConfigs] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardsCount, setCardsCount] = useState<number>(8); // Default fallback

  useEffect(() => {
    // Fetch count first for accurate skeleton loading
    fetchCardsCount();
    // Then fetch the actual data
    fetchGameConfigs();
  }, []);

  const fetchCardsCount = async () => {
    try {
      const response = await fetch('/api/game-configs/count');

      if (response.ok) {
        const { count } = await response.json();
        setCardsCount(count || 8); // Use fetched count or fallback to 8
      }
    } catch (err) {
      console.error('Error fetching cards count:', err);
      // Keep default count of 8 on error
    }
  };

  const fetchGameConfigs = async () => {
    try {
      const response = await fetch('/api/game-configs');

      if (!response.ok) {
        throw new Error('Failed to fetch game configurations');
      }

      const { data } = await response.json();

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

  // Show skeleton while loading
  if (loading) {
    return (
      <GameConfigsSkeletonCarousel
        count={cardsCount}
        title="🎮 Popular Games - Configuration Files"
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
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchGameConfigs();
            }}
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
      title="🎮 Popular Games - Configuration Files"
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
