import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import type { ParsedPCInfo } from "@/types/pc-info";

/**
 * POST /api/onboarding/save-pc-scan
 *
 * Accepts either camel- or snake-case keys:
 * {
 *   parsedInfo   | parsed_info    : ParsedPCInfo,
 *   fileSize     | file_size      : number      (bytes)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[SAVE API] Request received");

    // Check authentication
    const supabase = await createServerClient(cookies());
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("[SAVE API] Unauthorized - no user");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[SAVE API] User authenticated:", user.id);

    const body = await request.json();
    console.log("[SAVE API] Request body keys:", Object.keys(body));

    const {
      parsed_info: rawParsedInfo,
      file_size,
      parsedInfo,
      fileSize,
    } = body;

    // Accept both camelCase and snake_case
    const finalParsedInfo = parsedInfo || rawParsedInfo;
    const finalFileSize = fileSize || file_size;

    if (!finalParsedInfo || !finalFileSize) {
      console.log("[SAVE API] Missing required data:", {
        hasParsedInfo: !!finalParsedInfo,
        hasFileSize: !!finalFileSize,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing parsed data or file size",
          debug: {
            hasParsedInfo: !!finalParsedInfo,
            hasFileSize: !!finalFileSize,
          },
        },
        { status: 400 }
      );
    }

    // Transform the data to the expected format
    let parsed_info: ParsedPCInfo;
    try {
      // Check if the data is already in the expected format
      if (finalParsedInfo.device_detection && finalParsedInfo.system_summary) {
        console.log("[SAVE API] Using pre-transformed ParsedPCInfo");
        parsed_info = finalParsedInfo as ParsedPCInfo;
      } else {
        // Data is in the wrong format, reject it
        console.log("[SAVE API] Received data in unexpected format");
        return NextResponse.json(
          {
            success: false,
            error: "Data format is invalid. Please re-upload and parse your file.",
            debug: {
              hasDeviceDetection: !!finalParsedInfo.device_detection,
              hasSystemSummary: !!finalParsedInfo.system_summary,
              receivedKeys: Object.keys(finalParsedInfo),
            },
          },
          { status: 400 }
        );
      }
    } catch (transformError: any) {
      console.error("[SAVE API] Transform error:", transformError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process parsed data",
          debug: {
            errorMessage: transformError.message,
          },
        },
        { status: 400 }
      );
    }

    // Ensure device_detection exists with safe defaults
    if (!parsed_info.device_detection) {
      console.log("[SAVE API] Adding default device detection");
      parsed_info.device_detection = {
        device_type: "desktop",
        confidence: 0,
        reasons: ["Default fallback - no detection performed"],
      };
    }

    // Check if user already has PC info
    const { data: existingInfo, error: existingError } = await supabase
      .from("pc_info")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingError && existingError.code !== "PGRST116") {
      console.log("[SAVE API] Error checking existing info:", existingError);
    }

    console.log("[SAVE API] Existing info:", !!existingInfo);

    let result;
    try {
      if (existingInfo) {
        console.log("[SAVE API] Updating existing PC info");
        result = await updatePCInfo(
          supabase,
          user.id,
          parsed_info,
          finalFileSize
        );
      } else {
        console.log("[SAVE API] Creating new PC info");
        result = await createPCInfo(
          supabase,
          user.id,
          parsed_info,
          finalFileSize
        );
      }

      if (result.error) {
        throw result.error;
      }
    } catch (dbError: any) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to save system information to database. Please try again.",
          debug: {
            errorMessage: dbError.message,
            errorCode: dbError.code,
          },
        },
        { status: 500 }
      );
    }

    // Update user profile to mark PC as scanned
    try {
      const { error: profileError } = await supabase
        .from("profile")
        .update({ has_scanned_pc: true })
        .eq("id", user.id);

      if (profileError) {
        console.error("[SAVE API] Profile update error:", profileError);
        // Don't fail the request for this, just log it
      } else {
        console.log("[SAVE API] Profile updated successfully");
      }
    } catch (profileError) {
      console.error("[SAVE API] Profile update error:", profileError);
      // Continue anyway
    }

    console.log("[SAVE API] PC info saved successfully:", {
      userId: user.id,
      fileSize: finalFileSize,
      isUpdate: !!existingInfo,
      pcInfoId: result.data?.id,
      deviceType: parsed_info.device_detection?.device_type,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "System information saved successfully",
        pc_info_id: result.data?.id,
        device_type: parsed_info.device_detection?.device_type,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while saving. Please try again.",
        debug: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      },
      { status: 500 }
    );
  }
}

// Helper function to create PC info
async function createPCInfo(
  supabase: any,
  userId: string,
  parsedInfo: ParsedPCInfo,
  fileSize: number
) {
  console.log("[DB] Creating PC info for user:", userId);

  try {
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
        // Device detection
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
      return { data: null, error: pcInfoError };
    }

    console.log("[DB] PC info created successfully:", pcInfo.id);
    return { data: pcInfo, error: null };
  } catch (error) {
    console.error("[DB] Unexpected error in createPCInfo:", error);
    return { data: null, error };
  }
}

// Helper function to update PC info
async function updatePCInfo(
  supabase: any,
  userId: string,
  parsedInfo: ParsedPCInfo,
  fileSize: number
) {
  console.log("[DB] Updating PC info for user:", userId);

  try {
    // Ensure we have safe defaults for device detection
    const deviceType = parsedInfo.device_detection?.device_type || "desktop";
    const detectionConfidence = Math.round(
      (parsedInfo.device_detection?.confidence || 0) * 100
    );
    const detectionReasons = parsedInfo.device_detection?.reasons || [];

    // Update main PC info record
    const { data: pcInfo, error: pcInfoError } = await supabase
      .from("pc_info")
      .update({
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
        // Device detection
        device_type: deviceType,
        detection_confidence: detectionConfidence,
        detection_reasons: detectionReasons,
        // Parser metadata
        parser_version: parsedInfo.parser_metadata?.version || "4.0",
        file_size_bytes: fileSize,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (pcInfoError) {
      console.error("[DB] PC info update error:", pcInfoError);
      return { data: null, error: pcInfoError };
    }

    console.log("[DB] PC info updated successfully:", pcInfo.id);
    return { data: pcInfo, error: null };
  } catch (error) {
    console.error("[DB] Unexpected error in updatePCInfo:", error);
    return { data: null, error };
  }
}
