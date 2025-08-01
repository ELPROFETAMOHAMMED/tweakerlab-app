import { GameConfig } from "@/types/game-config";

export interface GameConfigsResponse {
  data: GameConfig[];
}

export interface GameConfigsCountResponse {
  count: number;
}

export interface DownloadResponse {
  fileName: string;
  content: string;
  title: string;
}

/**
 * Client-side service for game configurations API calls
 * Separates API logic from components for better maintainability
 */
export class GameConfigsClientService {
  private static readonly BASE_URL = '/api/game-configs';

  /**
   * Fetch all game configurations
   */
  static async getAllGameConfigs(): Promise<GameConfig[]> {
    try {
      const response = await fetch(this.BASE_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch game configurations: ${response.status}`);
      }

      const { data }: GameConfigsResponse = await response.json();
      return data || [];
    } catch (error) {
      console.error('[GAME CONFIGS CLIENT SERVICE] Error fetching game configs:', error);
      throw error;
    }
  }

  /**
   * Get count of active game configurations
   */
  static async getGameConfigsCount(): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/count`);

      if (!response.ok) {
        throw new Error(`Failed to fetch game configs count: ${response.status}`);
      }

      const { count }: GameConfigsCountResponse = await response.json();
      return count || 0;
    } catch (error) {
      console.error('[GAME CONFIGS CLIENT SERVICE] Error fetching count:', error);
      // Return default count on error instead of throwing
      return 8;
    }
  }

  /**
   * Download a game configuration .ini file
   */
  static async downloadGameConfig(gameConfigId: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameConfigId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const { fileName, content, title }: DownloadResponse = await response.json();

      // Ensure file has .ini extension (fix for legacy .settings)
      const cleanFileName = fileName.replace(/\.settings$/, '.ini');

      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = cleanFileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      console.log(`Downloaded: ${fileName} for ${title}`);
    } catch (error) {
      console.error('[GAME CONFIGS CLIENT SERVICE] Download error:', error);
      throw error;
    }
  }

  /**
   * Search game configurations by query
   */
  static async searchGameConfigs(query: string): Promise<GameConfig[]> {
    try {
      const response = await fetch(`${this.BASE_URL}?search=${encodeURIComponent(query)}`);

      if (!response.ok) {
        throw new Error(`Failed to search game configurations: ${response.status}`);
      }

      const { data }: GameConfigsResponse = await response.json();
      return data || [];
    } catch (error) {
      console.error('[GAME CONFIGS CLIENT SERVICE] Error searching game configs:', error);
      throw error;
    }
  }

  /**
   * Get game configurations by category
   */
  static async getGameConfigsByCategory(category: string): Promise<GameConfig[]> {
    try {
      const response = await fetch(`${this.BASE_URL}?category=${encodeURIComponent(category)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch game configurations by category: ${response.status}`);
      }

      const { data }: GameConfigsResponse = await response.json();
      return data || [];
    } catch (error) {
      console.error('[GAME CONFIGS CLIENT SERVICE] Error fetching by category:', error);
      throw error;
    }
  }
}
