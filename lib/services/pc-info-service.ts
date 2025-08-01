import { SupabaseClient } from "@supabase/supabase-js";
import type { PCInfo, CompletePCInfo, ParsedPCInfo } from "@/types/pc-info";

export class PCInfoService {
  constructor(private supabase: SupabaseClient<any>) {}

  /**
   * Obtiene la información básica de PC del usuario
   */
  async getUserPCInfo(userId: string): Promise<{ data: PCInfo | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from("pc_info")
        .select("*")
        .eq("user_id", userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Obtiene la información completa de PC con todos los datos relacionados
   */
  async getCompletePCInfo(userId: string): Promise<{ data: CompletePCInfo | null; error: any }> {
    try {
      const { data: pcInfo, error: pcError } = await this.supabase
        .from("pc_info")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (pcError || !pcInfo) {
        return { data: null, error: pcError };
      }

      // Obtener todos los datos relacionados en paralelo
      const [
        dmaResult,
        irqResult,
        displayResult,
        networkResult,
        disksResult,
        problemsResult,
        startupResult,
        errorResult,
      ] = await Promise.all([
        this.supabase.from("pc_dma_entries").select("*").eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_irq_entries").select("*").eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_display_info").select("*").eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_network_adapters").select("*").eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_disks").select("*").eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_problem_devices").select("*").eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_startup_programs").select("*").eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_error_reports").select("*").eq("pc_info_id", pcInfo.id),
      ]);

      const completePCInfo: CompletePCInfo = {
        ...pcInfo,
        dma_entries: dmaResult.data || [],
        irq_entries: irqResult.data || [],
        display_info: displayResult.data || [],
        network_adapters: networkResult.data || [],
        disks: disksResult.data || [],
        problem_devices: problemsResult.data || [],
        startup_programs: startupResult.data || [],
        error_reports: errorResult.data || [],
      };

      return { data: completePCInfo, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Verifica si el usuario tiene información de PC guardada
   */
  async hasUserScannedPC(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("pc_info")
        .select("id")
        .eq("user_id", userId)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * Elimina toda la información de PC del usuario
   */
  async deletePCInfo(userId: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await this.supabase
        .from("pc_info")
        .delete()
        .eq("user_id", userId);

      if (error) {
        return { success: false, error };
      }

      // Actualizar perfil del usuario
      await this.supabase
        .from("profile")
        .update({ has_scanned_pc: false })
        .eq("id", userId);

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Obtiene estadísticas rápidas del PC
   */
  async getPCStats(userId: string): Promise<{
    data: {
      deviceType: string;
      totalRAM: string;
      processor: string;
      networkAdapters: number;
      disks: number;
      problemDevices: number;
    } | null;
    error: any;
  }> {
    try {
      const { data: pcInfo, error } = await this.getUserPCInfo(userId);

      if (error || !pcInfo) {
        return { data: null, error };
      }

      // Contar elementos relacionados
      const [networkCount, disksCount, problemsCount] = await Promise.all([
        this.supabase.from("pc_network_adapters").select("id", { count: "exact" }).eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_disks").select("id", { count: "exact" }).eq("pc_info_id", pcInfo.id),
        this.supabase.from("pc_problem_devices").select("id", { count: "exact" }).eq("pc_info_id", pcInfo.id),
      ]);

      const stats = {
        deviceType: pcInfo.device_type,
        totalRAM: pcInfo.total_ram || "Unknown",
        processor: pcInfo.processor || "Unknown",
        networkAdapters: networkCount.count || 0,
        disks: disksCount.count || 0,
        problemDevices: problemsCount.count || 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Factory function para crear instancias del servicio
export function createPCInfoService(supabase: SupabaseClient<any>): PCInfoService {
  return new PCInfoService(supabase);
}
