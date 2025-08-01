import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("game_configs")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) {
      console.error("[GAME CONFIGS COUNT API] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 }, { status: 200 });
  } catch (error) {
    console.error("[GAME CONFIGS COUNT API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
