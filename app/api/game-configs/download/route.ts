import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GameConfigsService } from "@/lib/services/game-configs-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const gameConfigsService = new GameConfigsService(supabase);

    const { gameConfigId } = await request.json();

    if (!gameConfigId) {
      return NextResponse.json(
        { error: "Game configuration ID is required" },
        { status: 400 }
      );
    }

    // Get the game configuration
    const { data: gameConfig, error: fetchError } = await gameConfigsService.getGameConfigById(gameConfigId);

    if (fetchError || !gameConfig) {
      console.error("[DOWNLOAD API] Error fetching game config:", fetchError);
      return NextResponse.json(
        { error: "Game configuration not found" },
        { status: 404 }
      );
    }

    // Increment download count
    const { error: incrementError } = await gameConfigsService.incrementDownloadCount(gameConfigId);

    if (incrementError) {
      console.error("[DOWNLOAD API] Error incrementing download count:", incrementError);
      // Continue with download even if count increment fails
    }

    // Return the file content and metadata
    return NextResponse.json({
      fileName: gameConfig.settings_file_name,
      content: gameConfig.ini_content,
      mimeType: "text/plain",
      title: gameConfig.title
    }, { status: 200 });

  } catch (error) {
    console.error("[DOWNLOAD API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const gameConfigsService = new GameConfigsService(supabase);

    const { searchParams } = new URL(request.url);
    const gameConfigId = searchParams.get("id");

    if (!gameConfigId) {
      return NextResponse.json(
        { error: "Game configuration ID is required" },
        { status: 400 }
      );
    }

    // Get the game configuration
    const { data: gameConfig, error: fetchError } = await gameConfigsService.getGameConfigById(parseInt(gameConfigId));

    if (fetchError || !gameConfig) {
      console.error("[DOWNLOAD API] Error fetching game config:", fetchError);
      return NextResponse.json(
        { error: "Game configuration not found" },
        { status: 404 }
      );
    }

    // Increment download count
    await gameConfigsService.incrementDownloadCount(parseInt(gameConfigId));

    // Create file download response
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    headers.set('Content-Disposition', `attachment; filename="${gameConfig.settings_file_name}"`);
    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(gameConfig.ini_content, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("[DOWNLOAD API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
