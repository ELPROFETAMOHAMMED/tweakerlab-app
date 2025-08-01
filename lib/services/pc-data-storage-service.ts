import { SupabaseClient } from "@supabase/supabase-js";
import type { ParsedPCInfo } from "@/types/pc-info";

export class PCDataStorageService {
  constructor(private supabase: SupabaseClient<any>) { }

  /**
   * Crea un nuevo registro de PC info con todos los datos relacionados
   */
  async createPCInfo(userId: string, parsedInfo: ParsedPCInfo, fileSize: number): Promise<{ data?: any; error?: any }> {
    try {
      // Creating PC info for user

      const summary = parsedInfo.system_summary as any;

      // Crear el registro principal de PC info
      const { data: pcInfo, error: pcInfoError } = await this.supabase
        .from("pc_info")
        .insert({
          user_id: userId,
          os_name: summary.os_name || null,
          os_version: summary.os_version || null,
          system_manufacturer: summary.system_manufacturer || null,
          system_model: summary.system_model || null,
          processor: summary.processor || null,
          total_ram: summary.total_ram || null,
          available_ram: summary.available_ram || null,
          total_virtual: summary.total_virtual || null,
          available_virtual: summary.available_virtual || null,
          bios_version: summary.bios_version || null,
          secure_boot_state: summary.secure_boot_state || null,
          timezone: summary.timezone || null,
          username: summary.username || null,
          system_name: summary.system_name || null,
          device_type: parsedInfo.device_detection?.device_type || "desktop",
          detection_confidence: Math.round((parsedInfo.device_detection?.confidence || 0) * 100),
          detection_reasons: parsedInfo.device_detection?.reasons || [],
          parser_version: parsedInfo.parser_metadata?.version || "5.0",
          file_size_bytes: fileSize,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (pcInfoError) {
        console.error("[PC DATA STORAGE] PC info creation error:", pcInfoError);
        return { error: pcInfoError };
      }

      const pcInfoId = pcInfo.id;

      // Insertar datos relacionados en paralelo
      const insertPromises = [];

      // DMA entries
      if (parsedInfo.dma_entries?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_dma_entries").insert(
            parsedInfo.dma_entries.map((entry: any) => ({
              pc_info_id: pcInfoId,
              channel: entry.channel,
              device_name: entry.device_name,
            }))
          )
        );
      }

      // IRQ entries
      if (parsedInfo.irq_entries?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_irq_entries").insert(
            parsedInfo.irq_entries.map((entry: any) => ({
              pc_info_id: pcInfoId,
              irq_number: entry.irq_number,
              device_name: entry.device_name,
              device_type: entry.device_type || null,
            }))
          )
        );
      }

      // Display info
      if (parsedInfo.display_info?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_display_info").insert(
            parsedInfo.display_info.map((display: any) => ({
              pc_info_id: pcInfoId,
              name: display.name,
              adapter_ram: display.adapter_ram,
              driver_version: display.driver_version,
              adapter_description: display.adapter_description || null,
              resolution: display.resolution || null,
            }))
          )
        );
      }

      // Network adapters
      if (parsedInfo.network_adapters?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_network_adapters").insert(
            parsedInfo.network_adapters.map((adapter: any) => ({
              pc_info_id: pcInfoId,
              name: adapter.name,
              adapter_type: adapter.adapter_type || null,
              dhcp_enabled: adapter.dhcp_enabled || false,
              is_wireless: adapter.is_wireless || false,
            }))
          )
        );
      }

      // Disks
      if (parsedInfo.disks?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_disks").insert(
            parsedInfo.disks.map((disk: any) => ({
              pc_info_id: pcInfoId,
              model: disk.model,
              description: disk.description || null,
              manufacturer: disk.manufacturer || null,
              partitions: disk.partitions || null,
              size_bytes: disk.size_bytes || null,
            }))
          )
        );
      }

      // Problem devices
      if (parsedInfo.problem_devices?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_problem_devices").insert(
            parsedInfo.problem_devices.map((device: any) => ({
              pc_info_id: pcInfoId,
              device_name: device.device_name,
              problem_code: device.problem_code || null,
              description: device.description || null,
            }))
          )
        );
      }

      // Startup programs
      if (parsedInfo.startup_programs?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_startup_programs").insert(
            parsedInfo.startup_programs.map((program: any) => ({
              pc_info_id: pcInfoId,
              name: program.program_name || program.name,
              command: program.command,
              location: program.location,
              user_name: program.user || program.user_name,
              startup_type: program.startup_type,
            }))
          )
        );
      }

      // Error reports
      if (parsedInfo.error_reports?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_error_reports").insert(
            parsedInfo.error_reports.map((report: any) => ({
              pc_info_id: pcInfoId,
              report_id: report.report_id || null,
              description: report.report_description || report.description,
              report_type: report.report_type || "Application Error",
              module_name: report.faulting_module || report.module_name,
              error_code: report.error_code || null,
            }))
          )
        );
      }

      // Execute all insertions in parallel
      const results = await Promise.allSettled(insertPromises);

      // Check if any insertion failed
      const failedInserts = results.filter((result) => result.status === "rejected");
      if (failedInserts.length > 0) {
        console.error("[PC DATA STORAGE] Some related data insertions failed:", failedInserts);
      }

      // PC info created successfully

      return { data: pcInfo };
    } catch (error) {
      console.error("[PC DATA STORAGE] Unexpected error during PC info creation:", error);
      return { error };
    }
  }

  /**
   * Actualiza un registro existente de PC info
   */
  async updatePCInfo(userId: string, parsedInfo: ParsedPCInfo, fileSize: number): Promise<{ data?: any; error?: any }> {
    try {
      // Updating PC info for user

      const summary = parsedInfo.system_summary as any;

      // Actualizar el registro principal de PC info
      const { data: pcInfo, error: pcInfoError } = await this.supabase
        .from("pc_info")
        .update({
          os_name: summary.os_name || null,
          os_version: summary.os_version || null,
          system_manufacturer: summary.system_manufacturer || null,
          system_model: summary.system_model || null,
          processor: summary.processor || null,
          total_ram: summary.total_ram || null,
          available_ram: summary.available_ram || null,
          total_virtual: summary.total_virtual || null,
          available_virtual: summary.available_virtual || null,
          bios_version: summary.bios_version || null,
          secure_boot_state: summary.secure_boot_state || null,
          timezone: summary.timezone || null,
          username: summary.username || null,
          system_name: summary.system_name || null,
          device_type: parsedInfo.device_detection?.device_type || "desktop",
          detection_confidence: Math.round((parsedInfo.device_detection?.confidence || 0) * 100),
          detection_reasons: parsedInfo.device_detection?.reasons || [],
          parser_version: parsedInfo.parser_metadata?.version || "5.0",
          file_size_bytes: fileSize,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (pcInfoError) {
        console.error("[PC DATA STORAGE] PC info update error:", pcInfoError);
        return { error: pcInfoError };
      }

      const pcInfoId = pcInfo.id;

      // Eliminar datos relacionados existentes
      await this.cleanupRelatedData(pcInfoId);

      // Insert new related data (reuse create logic)
      const insertPromises = [];

      // DMA entries
      if (parsedInfo.dma_entries?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_dma_entries").insert(
            parsedInfo.dma_entries.map((entry: any) => ({
              pc_info_id: pcInfoId,
              channel: entry.channel,
              device_name: entry.device_name,
            }))
          )
        );
      }

      // IRQ entries
      if (parsedInfo.irq_entries?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_irq_entries").insert(
            parsedInfo.irq_entries.map((entry: any) => ({
              pc_info_id: pcInfoId,
              irq_number: entry.irq_number,
              device_name: entry.device_name,
              device_type: entry.device_type || null,
            }))
          )
        );
      }

      // Display info
      if (parsedInfo.display_info?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_display_info").insert(
            parsedInfo.display_info.map((display: any) => ({
              pc_info_id: pcInfoId,
              name: display.name,
              adapter_ram: display.adapter_ram,
              driver_version: display.driver_version,
              adapter_description: display.adapter_description || null,
              resolution: display.resolution || null,
            }))
          )
        );
      }

      // Network adapters
      if (parsedInfo.network_adapters?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_network_adapters").insert(
            parsedInfo.network_adapters.map((adapter: any) => ({
              pc_info_id: pcInfoId,
              name: adapter.name,
              adapter_type: adapter.adapter_type || null,
              dhcp_enabled: adapter.dhcp_enabled || false,
              is_wireless: adapter.is_wireless || false,
            }))
          )
        );
      }

      // Disks
      if (parsedInfo.disks?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_disks").insert(
            parsedInfo.disks.map((disk: any) => ({
              pc_info_id: pcInfoId,
              model: disk.model,
              description: disk.description || null,
              manufacturer: disk.manufacturer || null,
              partitions: disk.partitions || null,
              size_bytes: disk.size_bytes || null,
            }))
          )
        );
      }

      // Problem devices
      if (parsedInfo.problem_devices?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_problem_devices").insert(
            parsedInfo.problem_devices.map((device: any) => ({
              pc_info_id: pcInfoId,
              device_name: device.device_name,
              problem_code: device.problem_code || null,
              description: device.description || null,
            }))
          )
        );
      }

      // Startup programs
      if (parsedInfo.startup_programs?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_startup_programs").insert(
            parsedInfo.startup_programs.map((program: any) => ({
              pc_info_id: pcInfoId,
              name: program.program_name || program.name,
              command: program.command,
              location: program.location,
              user_name: program.user || program.user_name,
              startup_type: program.startup_type,
            }))
          )
        );
      }

      // Error reports
      if (parsedInfo.error_reports?.length > 0) {
        insertPromises.push(
          this.supabase.from("pc_error_reports").insert(
            parsedInfo.error_reports.map((report: any) => ({
              pc_info_id: pcInfoId,
              report_id: report.report_id || null,
              description: report.report_description || report.description,
              report_type: report.report_type || "Application Error",
              module_name: report.faulting_module || report.module_name,
              error_code: report.error_code || null,
            }))
          )
        );
      }

      // Execute all insertions in parallel
      const results = await Promise.allSettled(insertPromises);

      // Check if any insertion failed
      const failedInserts = results.filter((result) => result.status === "rejected");
      if (failedInserts.length > 0) {
        console.error("[PC DATA STORAGE] Some related data insertions failed:", failedInserts);
      }

      // PC info updated successfully

      return { data: pcInfo };
    } catch (error) {
      console.error("[PC DATA STORAGE] Unexpected error during PC info update:", error);
      return { error };
    }
  }

  /**
   * Limpia todos los datos relacionados de un PC info
   */
  private async cleanupRelatedData(pcInfoId: string): Promise<void> {
    const deletePromises = [
      this.supabase.from("pc_dma_entries").delete().eq("pc_info_id", pcInfoId),
      this.supabase.from("pc_irq_entries").delete().eq("pc_info_id", pcInfoId),
      this.supabase.from("pc_display_info").delete().eq("pc_info_id", pcInfoId),
      this.supabase.from("pc_network_adapters").delete().eq("pc_info_id", pcInfoId),
      this.supabase.from("pc_disks").delete().eq("pc_info_id", pcInfoId),
      this.supabase.from("pc_problem_devices").delete().eq("pc_info_id", pcInfoId),
      this.supabase.from("pc_startup_programs").delete().eq("pc_info_id", pcInfoId),
      this.supabase.from("pc_error_reports").delete().eq("pc_info_id", pcInfoId),
    ];

    const results = await Promise.allSettled(deletePromises);
    const failedDeletes = results.filter((result) => result.status === "rejected");

    if (failedDeletes.length > 0) {
      console.error("[PC DATA STORAGE] Some data cleanup operations failed:", failedDeletes);
    }
  }
}

// Factory function para crear instancias del servicio
export function createPCDataStorageService(supabase: SupabaseClient<any>): PCDataStorageService {
  return new PCDataStorageService(supabase);
}
