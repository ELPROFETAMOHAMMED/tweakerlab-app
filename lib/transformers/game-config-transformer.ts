import { GameConfig } from "@/types/game-config";
import { ContentItem } from "@/components/dashboard/categories-carrousel";
import { formatDownloads } from "@/lib/utils/format-helpers";

/**
 * Transform Supabase GameConfig data to ContentItem format for UI components
 */
export function transformGameConfigsToContentItems(configs: GameConfig[]): ContentItem[] {
  return configs.map((config) => ({
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
      gameConfigId: config.id
    }
  }));
}
