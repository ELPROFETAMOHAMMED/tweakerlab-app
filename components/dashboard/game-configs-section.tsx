"use client"

import { transformGameConfigsToContentItems } from "@/lib/transformers/game-config-transformer";
import ContentCarousel from "./categories-carrousel";
import CardDashboardInfo from "./card-dashboard-info";
import { GameConfigsSkeletonCarousel } from "./game-configs-skeleton-carousel";
import { useGameConfigs, useGameConfigsCount } from "@/game-configs";

/**
 * Client component for rendering game configurations section
 * Now uses TanStack Query cache for blazing fast performance! 🚀
 */
export function GameConfigsSection() {
  // Use cache hooks - much simpler and faster!
  const { data: gameConfigsData, isLoading: isLoadingConfigs, error: configsError, refetch } = useGameConfigs();
  const { data: cardsCount = 8, isLoading: isLoadingCount } = useGameConfigsCount();

  const isLoading = isLoadingConfigs || isLoadingCount;
  const gameConfigs = gameConfigsData ? transformGameConfigsToContentItems(gameConfigsData) : [];

  // Convert error to string if it exists
  const errorMessage = configsError ?
    (configsError instanceof Error ? configsError.message : 'Failed to load game configurations') : null;

  const handleRetry = () => {
    refetch();
  };

  // Show skeleton while loading
  if (isLoading) {
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

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{errorMessage}</p>
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
