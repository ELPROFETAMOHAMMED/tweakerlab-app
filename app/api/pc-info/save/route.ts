import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ParsedPCInfo } from "@/types/pc-info";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { parsedInfo, fileSize } = await request.json();

    if (!parsedInfo || !fileSize) {
      return NextResponse.json(
        { success: false, error: "Missing required data" },
        { status: 400 }
      );
    }

    // For now, use the existing pc-info service
    const { createPCInfo, updatePCInfo, GetPcInfo } = await import("@/services/pc-info");

    // Check if user already has PC info
    const { data: existingInfo } = await GetPcInfo(supabase, user.id);

    let result;
    if (existingInfo) {
      result = await updatePCInfo(user.id, parsedInfo, fileSize, supabase);
    } else {
      result = await createPCInfo(user.id, parsedInfo, fileSize, supabase);
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: "Failed to save data" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });

  } catch (error) {
    console.error("[SAVE API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
