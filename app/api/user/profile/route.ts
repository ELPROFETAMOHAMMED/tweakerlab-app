import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    const { data: pcInfo, error: pcError } = await supabase
      .from("pc_info")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (pcError && pcError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to check PC scan status" },
        { status: 500 }
      );
    }

    const hasScanPC = pcInfo && pcInfo.length > 0;

    return NextResponse.json({
      success: true,
      profile: {
        ...profile,
        hasScanPC,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
