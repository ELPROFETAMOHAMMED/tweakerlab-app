import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient(cookies());
    const { userId } = await request.json();

    // Get main PC info
    const { data: pcInfo, error: pcInfoError } = await supabase
      .from("pc_info")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (pcInfoError || !pcInfo) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    // Get all related data
    const [
      { data: dmaEntries },
      { data: irqEntries },
      { data: displayInfo },
      { data: networkAdapters },
      { data: disks },
      { data: problemDevices },
      { data: startupPrograms },
      { data: errorReports },
    ] = await Promise.all([
      supabase.from("pc_dma_entries").select("*").eq("pc_info_id", pcInfo.id),
      supabase.from("pc_irq_entries").select("*").eq("pc_info_id", pcInfo.id),
      supabase.from("pc_display_info").select("*").eq("pc_info_id", pcInfo.id),
      supabase
        .from("pc_network_adapters")
        .select("*")
        .eq("pc_info_id", pcInfo.id),
      supabase.from("pc_disks").select("*").eq("pc_info_id", pcInfo.id),
      supabase
        .from("pc_problem_devices")
        .select("*")
        .eq("pc_info_id", pcInfo.id),
      supabase
        .from("pc_startup_programs")
        .select("*")
        .eq("pc_info_id", pcInfo.id),
      supabase.from("pc_error_reports").select("*").eq("pc_info_id", pcInfo.id),
    ]);

    const completePCInfo = {
      ...pcInfo,
      dma_entries: dmaEntries || [],
      irq_entries: irqEntries || [],
      display_info: displayInfo || [],
      network_adapters: networkAdapters || [],
      disks: disks || [],
      problem_devices: problemDevices || [],
      startup_programs: startupPrograms || [],
      error_reports: errorReports || [],
    };

    return NextResponse.json({ data: completePCInfo }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
