import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, error: "userId and newPassword are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Use the Supabase admin client to update user password
    // Since this app uses Supabase Auth, we update via the auth admin API
    const supabase = await createClient();

    // For Supabase Auth-based password reset, we need the service_role key.
    // If we only have the anon key, we store the password hash in the users table
    // as a fallback for custom auth flows.

    // Attempt 1: Try Supabase Auth admin update (requires service_role)
    // This will only work if SUPABASE_SERVICE_ROLE_KEY is configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceRoleKey}`,
          "apikey": serviceRoleKey,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (res.ok) {
        return NextResponse.json({ success: true, method: "supabase_auth" });
      }

      // If admin API fails, fall through to hash storage
      console.warn("Supabase Auth admin update failed, falling back to hash storage");
    }

    // Attempt 2: Store password hash in users table (custom auth fallback)
    const crypto = await import("node:crypto");
    const salt = process.env.AUTH_SALT || "gather-sacred-events";
    const hash = crypto.createHash("sha256").update(newPassword + salt).digest("hex");

    const { error } = await supabase
      .from("users")
      .update({ password_hash: hash })
      .eq("id", userId);

    if (error) {
      console.error("Password hash update failed:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update password. The users table may not have a password_hash column." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, method: "hash_storage" });
  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
