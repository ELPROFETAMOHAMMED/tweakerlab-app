import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const full_name = formData.get("full_name") as string;
    const avatar = formData.get("avatar") as File;

    // Validate required fields
    if (!email || !password || !full_name || !avatar) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields including profile picture are required",
        },
        { status: 400 }
      );
    }

    // Validate form data
    const validation = registerSchema.safeParse({ email, password, full_name });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Validate avatar file
    if (avatar.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(avatar.type)) {
      return NextResponse.json(
        { success: false, error: "File must be a JPEG, PNG, or WebP image" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate secure filename
    const fileExt = avatar.name.split(".").pop()?.toLowerCase();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload avatar to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatar, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload profile picture" },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded avatar
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Create user account
    const { data, error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        data: {
          full_name: validation.data.full_name,
          avatar_url: publicUrl,
        },
      },
    });

    if (error) {
      // Clean up uploaded avatar if user creation fails
      await supabase.storage.from("avatars").remove([filePath]);

      console.error("User registration error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: data.user,
        needsVerification: !data.session,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
