"use client"

import { useEffect, useState } from "react";
import CardDashboardInfo from "./card-dashboard-info";
import ContentCarousel, { ContentItem } from "./categories-carrousel";
import { GameConfig } from "@/types/game-config";

export default function DashboardContent() {
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
      const transformedData: ContentItem[] = data.map((config: GameConfig) => ({
        id: config.id,
        title: config.title,
        description: config.description,
        image: config.image_url,
        badge: config.badge,
        metadata: {
          settingsFile: config.settings_file_name,
          downloads: formatDownloads(config.downloads_count),
          rating: config.rating,
          category: config.category,
          fileSize: config.file_size,
          gameConfigId: config.id // Add the ID for download functionality
        }
      }));

      setGameConfigs(transformedData);
    } catch (err) {
      console.error('Error fetching game configs:', err);
      setError('Failed to load game configurations');

      // Fallback to empty array on error
      setGameConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDownloads = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
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
  )
}
