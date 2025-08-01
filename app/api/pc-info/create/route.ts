import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient(cookies());
    const { userId, parsedInfo, fileSize } = await request.json();

    // Ensure we have safe defaults for device detection
    const deviceType = parsedInfo.device_detection?.device_type || "desktop";
    const detectionConfidence = Math.round(
      (parsedInfo.device_detection?.confidence || 0) * 100
    );
    const detectionReasons = parsedInfo.device_detection?.reasons || [];

    // Insert main PC info record
    const { data: pcInfo, error: pcInfoError } = await supabase
      .from("pc_info")
      .insert({
        user_id: userId,
        // System information
        os_name: parsedInfo.system_summary?.os_name,
        os_version: parsedInfo.system_summary?.os_version,
        os_manufacturer: parsedInfo.system_summary?.os_manufacturer,
        system_name: parsedInfo.system_summary?.system_name,
        system_manufacturer: parsedInfo.system_summary?.system_manufacturer,
        system_model: parsedInfo.system_summary?.system_model,
        system_type: parsedInfo.system_summary?.system_type,
        processor: parsedInfo.system_summary?.processor,
        bios_version: parsedInfo.system_summary?.bios_version,
        bios_mode: parsedInfo.system_summary?.bios_mode,
        baseboard_manufacturer:
          parsedInfo.system_summary?.baseboard_manufacturer,
        baseboard_product: parsedInfo.system_summary?.baseboard_product,
        platform_role: parsedInfo.system_summary?.platform_role,
        secure_boot_state: parsedInfo.system_summary?.secure_boot_state,
        boot_device: parsedInfo.system_summary?.boot_device,
        username: parsedInfo.system_summary?.username,
        timezone: parsedInfo.system_summary?.timezone,
        installed_ram: parsedInfo.system_summary?.installed_ram,
        total_ram: parsedInfo.system_summary?.total_ram,
        available_ram: parsedInfo.system_summary?.available_ram,
        total_virtual: parsedInfo.system_summary?.total_virtual,
        available_virtual: parsedInfo.system_summary?.available_virtual,
        kernel_dma_protection: parsedInfo.system_summary?.kernel_dma_protection,
        virtualization_security:
          parsedInfo.system_summary?.virtualization_security,
        hyperv_vm_mode: parsedInfo.system_summary?.hyperv_vm_mode,
        hyperv_slats: parsedInfo.system_summary?.hyperv_slats,
        hyperv_enabled: parsedInfo.system_summary?.hyperv_enabled,
        hyperv_dep: parsedInfo.system_summary?.hyperv_dep,
        // Device detection - stored directly in pc_info table
        device_type: deviceType,
        detection_confidence: detectionConfidence,
        detection_reasons: detectionReasons,
        // Parser metadata
        parser_version: parsedInfo.parser_metadata?.version || "4.0",
        file_size_bytes: fileSize,
      })
      .select()
      .single();

    if (pcInfoError) {
      console.error("[DB] PC info creation error:", pcInfoError);
      return NextResponse.json(
        { error: "Failed to create PC info" },
        { status: 500 }
      );
    }

    // Insert related data
    const pcInfoId = pcInfo.id;

    // Insert DMA entries
    if (parsedInfo.dma_entries?.length > 0) {
      const { error: dmaError } = await supabase.from("pc_dma_entries").insert(
        parsedInfo.dma_entries.map((entry: any) => ({
          pc_info_id: pcInfoId,
          channel: entry.channel,
          device_name: entry.device_name,
        }))
      );
    }

    // Insert IRQ entries
    if (parsedInfo.irq_entries?.length > 0) {
      const { error: irqError } = await supabase.from("pc_irq_entries").insert(
        parsedInfo.irq_entries.map((entry: any) => ({
          pc_info_id: pcInfoId,
          irq_number: entry.irq_number,
          device_name: entry.device_name,
          device_type: entry.device_type,
        }))
      );
    }

    // Insert display info
    if (parsedInfo.display_info?.length > 0) {
      const { error: displayError } = await supabase
        .from("pc_display_info")
        .insert(
          parsedInfo.display_info.map((display: any) => ({
            pc_info_id: pcInfoId,
            name: display.name,
            pnp_device_id: display.pnp_device_id,
            adapter_type: display.adapter_type,
            adapter_description: display.adapter_description,
            adapter_ram: display.adapter_ram,
            driver_version: display.driver_version,
            color_table_entries: display.color_table_entries,
            resolution: display.resolution,
            bits_per_pixel: display.bits_per_pixel,
            irq_channel: display.irq_channel,
          }))
        );
    }

    // Insert network adapters
    if (parsedInfo.network_adapters?.length > 0) {
      const { error: networkError } = await supabase
        .from("pc_network_adapters")
        .insert(
          parsedInfo.network_adapters.map((adapter: any) => ({
            pc_info_id: pcInfoId,
            name: adapter.name,
            adapter_type: adapter.adapter_type,
            product_type: adapter.product_type,
            last_reset: adapter.last_reset,
            default_ip_gateway: adapter.default_ip_gateway,
            dhcp_enabled: adapter.dhcp_enabled,
            irq_channel: adapter.irq_channel,
            is_wireless: adapter.is_wireless,
          }))
        );
    }

    // Insert disks
    if (parsedInfo.disks?.length > 0) {
      const { error: disksError } = await supabase.from("pc_disks").insert(
        parsedInfo.disks.map((disk: any) => ({
          pc_info_id: pcInfoId,
          description: disk.description,
          manufacturer: disk.manufacturer,
          model: disk.model,
          bytes_per_sector: disk.bytes_per_sector,
          media_type: disk.media_type,
          partitions: disk.partitions,
          sectors_per_track: disk.sectors_per_track,
          size_bytes: disk.size_bytes,
          total_cylinders: disk.total_cylinders,
          total_sectors: disk.total_sectors,
          total_tracks: disk.total_tracks,
          tracks_per_cylinder: disk.tracks_per_cylinder,
        }))
      );
    }

    // Insert problem devices
    if (parsedInfo.problem_devices?.length > 0) {
      const { error: problemError } = await supabase
        .from("pc_problem_devices")
        .insert(
          parsedInfo.problem_devices.map((device: any) => ({
            pc_info_id: pcInfoId,
            device_name: device.device_name,
            problem_code: device.problem_code,
            description: device.description,
          }))
        );
    }

    // Insert startup programs
    if (parsedInfo.startup_programs?.length > 0) {
      const { error: startupError } = await supabase
        .from("pc_startup_programs")
        .insert(
          parsedInfo.startup_programs.map((program: any) => ({
            pc_info_id: pcInfoId,
            name: program.name,
            location: program.location,
            command: program.command,
            user_name: program.user_name,
            startup_type: program.startup_type,
          }))
        );
    }

    // Insert error reports
    if (parsedInfo.error_reports?.length > 0) {
      const { error: errorReportsError } = await supabase
        .from("pc_error_reports")
        .insert(
          parsedInfo.error_reports.map((report: any) => ({
            pc_info_id: pcInfoId,
            report_id: report.report_id,
            description: report.description,
            report_type: report.report_type,
            timestamp_reported: report.timestamp_reported,
            module_name: report.module_name,
            error_code: report.error_code,
          }))
        );
    }

    return NextResponse.json({ data: pcInfo }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
