import { createClient } from "@/lib/supabase/server";
import { GameConfigsService } from "@/lib/services/game-configs-service";
import { transformGameConfigsToContentItems } from "@/lib/transformers/game-config-transformer";
import ContentCarousel from "./categories-carrousel";
import CardDashboardInfo from "./card-dashboard-info";

/**
 * Server component for rendering game configurations section
 * Fetches data directly from Supabase and renders the carousel
 */
export async function GameConfigsSection() {
  const supabase = await createClient();
  const gameConfigsService = new GameConfigsService(supabase as any);

  try {
    const { data: gameConfigs, error } = await gameConfigsService.getAllGameConfigs();

    if (error) {
      console.error("[DASHBOARD] Error fetching game configs:", error);
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load game configurations</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      );
    }

    if (!gameConfigs || gameConfigs.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground">No game configurations available</p>
          </div>
        </div>
      );
    }

    const contentItems = transformGameConfigsToContentItems(gameConfigs);

    return (
      <ContentCarousel
        items={contentItems}
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
  } catch (error) {
    console.error("[DASHBOARD] Unexpected error fetching game configs:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Something went wrong</p>
          <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }
}
