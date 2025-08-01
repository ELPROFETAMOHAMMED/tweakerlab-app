import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MIN_FILE_SIZE = 100; // 100 bytes minimum

export async function POST(request: NextRequest) {
  try {
    console.log("[UPLOAD API] Request received");

    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log("[UPLOAD API] Unauthorized - no user");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[UPLOAD API] User authenticated:", user.id);

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size must be less than 50MB",
        },
        { status: 400 }
      );
    }

    if (file.size < MIN_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File is empty, please upload a valid msinfo32 export",
        },
        { status: 400 }
      );
    }

    // Read file content
    let content: string;
    try {
      content = await readAndSanitizeFile(file);
    } catch (readError) {
      console.error("[UPLOAD API] File read error:", readError);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to read the file content, please try uploading again",
        },
        { status: 400 }
      );
    }

    // Basic validation
    if (!content.includes("System Information") && !content.includes("[System Summary]")) {
      return NextResponse.json(
        {
          success: false,
          error: "File does not appear to be a valid msinfo32.txt export",
        },
        { status: 400 }
      );
    }

    // Parse the file using the new parsing service
    let parseResult;
    try {
      const { parsingService } = await import("@/lib/parsers/services/parsing-service");
      parseResult = await parsingService.parseFile(content, file.name);
    } catch (importError) {
      console.error("[UPLOAD API] Parser import error:", importError);
      return NextResponse.json(
        {
          success: false,
          error: "Parser service unavailable, please try again",
        },
        { status: 500 }
      );
      }

    if (!parseResult.success) {
      console.log("[UPLOAD API] Parsing failed:", parseResult.error);
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error || "Failed to parse file",
        },
        { status: 400 }
      );
    }

    const parsedInfo = parseResult.data!;

    // Initialize services
    let pcInfoService, storageService;
    try {
      const { createPCInfoService } = await import("@/lib/services/pc-info-service");
      const { createPCDataStorageService } = await import("@/lib/services/pc-data-storage-service");
      pcInfoService = createPCInfoService(supabase);
      storageService = createPCDataStorageService(supabase);
    } catch (serviceError) {
      console.error("[UPLOAD API] Service import error:", serviceError);
      return NextResponse.json(
        {
          success: false,
          error: "Database services unavailable, please try again",
        },
        { status: 500 }
      );
    }

    // Check if user already has PC info
    const hasExistingInfo = await pcInfoService.hasUserScannedPC(user.id);

    // Save parsed data to database
    let result;
    try {
      if (hasExistingInfo) {
        console.log("[UPLOAD API] Updating existing PC info");
        result = await storageService.updatePCInfo(user.id, parsedInfo, file.size);
      } else {
        console.log("[UPLOAD API] Creating new PC info");
        result = await storageService.createPCInfo(user.id, parsedInfo, file.size);
      }

      if (result.error) {
        throw new Error(result.error.message || "Database operation failed");
      }
    } catch (dbError) {
      console.error("[UPLOAD API] Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to save system information to database. Please try again.",
        },
        { status: 500 }
      );
    }

    // Update profile to mark as scanned
    try {
      const { error: profileError } = await supabase
        .from("profile")
        .update({ has_scanned_pc: true })
        .eq("id", user.id);

      if (profileError) {
        console.error("[UPLOAD API] Profile update error:", profileError);
        // Don't fail the request for profile update error
      }
    } catch (profileUpdateError) {
      console.error("[UPLOAD API] Profile update error:", profileUpdateError);
    }

    console.log("[UPLOAD API] PC info saved successfully:", {
      userId: user.id,
      fileSize: file.size,
      isUpdate: hasExistingInfo,
      pcInfoId: result.data?.id,
      deviceType: parsedInfo.device_detection?.device_type,
      sectionsFound: parsedInfo.parser_metadata.sections_found.length,
      sectionsParsed: parsedInfo.parser_metadata.sections_parsed.length,
    });

    // Return success response with parsed data
    return NextResponse.json({
      success: true,
      data: {
        // Return the parsed data for UI display
        system_summary: parsedInfo.system_summary,
        display_info: parsedInfo.display_info,
        disks: parsedInfo.disks,
        network_adapters: parsedInfo.network_adapters,
        irq_entries: parsedInfo.irq_entries,
        dma_entries: parsedInfo.dma_entries,
        problem_devices: parsedInfo.problem_devices,
        device_detection: parsedInfo.device_detection,
        parser_metadata: parsedInfo.parser_metadata,
        // Additional response info
        pc_info_id: result.data?.id,
        is_update: hasExistingInfo,
        warnings: parseResult.warnings,
      },
    });

  } catch (error: any) {
    console.error("[UPLOAD API] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your file. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * Read and sanitize file content with proper encoding handling
 */
async function readAndSanitizeFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  let rawContent: string;

  // Handle different encodings
  if (uint8[0] === 0xFF && uint8[1] === 0xFE) {
    // UTF-16LE BOM
    rawContent = new TextDecoder("utf-16le").decode(arrayBuffer);
  } else if (uint8[0] === 0xFE && uint8[1] === 0xFF) {
    // UTF-16BE BOM
    rawContent = new TextDecoder("utf-16be").decode(arrayBuffer);
  } else {
    // Default to UTF-8
    rawContent = new TextDecoder("utf-8").decode(arrayBuffer);
  }

  // Basic sanitization
  return rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}
