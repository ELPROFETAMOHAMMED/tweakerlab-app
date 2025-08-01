import DashboardHeader from "@/components/dashboard/sections/header";
import { GameConfigsSection } from "@/components/dashboard/game-configs-section";
import { GameConfigsLoading } from "@/components/ui/loading-states";
import { createClient } from "@/lib/supabase/server";
import { User } from "@/types/auth";
import { PCInfo } from "@/types/pc-info";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user profile and PC scan status
  const { data: profile, error } = await supabase
    .from("profile")
    .select(
      "id, full_name, has_scanned_pc, email, avatar_url, role, created_at, updated_at"
    )
    .eq("id", user.id)
    .single();

  const { data: parsedAt } = await supabase
    .from("pc_info")
    .select("parsed_at")
    .eq("user_id", user.id)
    .single();

  // Get PC info for the information dialog
  const { data: pcInfo } = await supabase
    .from("pc_info")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="container py-10 space-y-10">
      <DashboardHeader
        profile={profile as User}
        lastScanPc={parsedAt?.parsed_at ?? null}
        pcInfo={pcInfo as PCInfo}
      />

      {/* Game Configurations Section - Server-side rendered */}
      <div className="w-full">
        <Suspense fallback={<GameConfigsLoading />}>
          <GameConfigsSection />
        </Suspense>
      </div>
    </div>
  );
}
