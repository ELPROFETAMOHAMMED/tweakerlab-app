"use client"

import { useEffect, useState } from "react";
import { transformGameConfigsToContentItems } from "@/lib/transformers/game-config-transformer";
import { GameConfig } from "@/types/game-config";
import { ContentItem } from "./categories-carrousel";
import ContentCarousel from "./categories-carrousel";
import CardDashboardInfo from "./card-dashboard-info";

/**
 * Client component for rendering game configurations section
 * Fetches data from API and renders the carousel with loading states
 */
export function GameConfigsSection() {
  const [gameConfigs, setGameConfigs] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGameConfigs();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading game configurations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={fetchGameConfigs}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
