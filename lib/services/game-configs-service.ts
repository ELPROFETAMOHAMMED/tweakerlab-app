import { SupabaseClient } from "@supabase/supabase-js";
import { GameConfig, GameConfigInsert, GameConfigUpdate } from "@/types/game-config";

export class GameConfigsService {
  constructor(private supabase: SupabaseClient) { }

  /**
   * Get all active game configurations, ordered by featured_order
   */
  async getAllGameConfigs(): Promise<{ data: GameConfig[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("game_configs")
        .select("*")
        .eq("is_active", true)
        .order("featured_order", { ascending: true });

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error fetching game configs:", error);
      return { data: null, error };
    }
  }

  /**
   * Get game configuration by ID
   */
  async getGameConfigById(id: number): Promise<{ data: GameConfig | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("game_configs")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error fetching game config by ID:", error);
      return { data: null, error };
    }
  }

  /**
   * Get game configurations by category
   */
  async getGameConfigsByCategory(category: string): Promise<{ data: GameConfig[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("game_configs")
        .select("*")
        .eq("category", category)
        .eq("is_active", true)
        .order("featured_order", { ascending: true });

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error fetching game configs by category:", error);
      return { data: null, error };
    }
  }

  /**
   * Increment download count for a game configuration
   */
  async incrementDownloadCount(id: number): Promise<{ data: GameConfig | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('increment_download_count', { game_config_id: id });

      if (error) {
        // Fallback: manual increment
        const { data: currentData } = await this.supabase
          .from("game_configs")
          .select("downloads_count")
          .eq("id", id)
          .single();

        if (currentData) {
          const { data: updatedData, error: updateError } = await this.supabase
            .from("game_configs")
            .update({ downloads_count: currentData.downloads_count + 1 })
            .eq("id", id)
            .select()
            .single();

          return { data: updatedData, error: updateError };
        }
      }

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error incrementing download count:", error);
      return { data: null, error };
    }
  }

  /**
   * Create a new game configuration (admin only)
   */
  async createGameConfig(gameConfig: GameConfigInsert): Promise<{ data: GameConfig | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("game_configs")
        .insert(gameConfig)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error creating game config:", error);
      return { data: null, error };
    }
  }

  /**
   * Update game configuration (admin only)
   */
  async updateGameConfig(
    id: number,
    updates: GameConfigUpdate
  ): Promise<{ data: GameConfig | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("game_configs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error updating game config:", error);
      return { data: null, error };
    }
  }

  /**
   * Delete game configuration (admin only) - soft delete by setting is_active to false
   */
  async deleteGameConfig(id: number): Promise<{ data: GameConfig | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("game_configs")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error deleting game config:", error);
      return { data: null, error };
    }
  }

  /**
   * Search game configurations by title or description
   */
  async searchGameConfigs(query: string): Promise<{ data: GameConfig[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("game_configs")
        .select("*")
        .eq("is_active", true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order("featured_order", { ascending: true });

      return { data, error };
    } catch (error) {
      console.error("[GAME CONFIGS SERVICE] Error searching game configs:", error);
      return { data: null, error };
    }
  }
}
