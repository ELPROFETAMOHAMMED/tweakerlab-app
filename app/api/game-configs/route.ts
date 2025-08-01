import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GameConfigsService } from "@/lib/services/game-configs-service";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const gameConfigsService = new GameConfigsService(supabase);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let result;

    if (search) {
      result = await gameConfigsService.searchGameConfigs(search);
    } else if (category) {
      result = await gameConfigsService.getGameConfigsByCategory(category);
    } else {
      result = await gameConfigsService.getAllGameConfigs();
    }

    const { data, error } = result;

    if (error) {
      console.error("[GAME CONFIGS API] Error fetching game configs:", error);
      return NextResponse.json(
        { error: "Failed to fetch game configurations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("[GAME CONFIGS API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
