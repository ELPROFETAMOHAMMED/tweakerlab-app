import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types/auth";

export async function getSession() {
  const supabase = await createClient();

  try {
    // Obtener el usuario autenticado
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !authUser) {
      console.error("User authentication error:", userError);
      return { user: null, access_token: null };
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return { user: null, access_token: null };
    }

    // Get session for access_token
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session fetch error:", sessionError);
      return { user: null, access_token: null };
    }

    const user: User = {
      id: profile.id,
      email: authUser.email!,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: profile.role,
      has_scanned_pc: profile.has_scanned_pc,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return {
      user,
      access_token: session?.access_token || null,
    };
  } catch (error) {
    console.error("Session error:", error);
    return { user: null, access_token: null };
  }
}
