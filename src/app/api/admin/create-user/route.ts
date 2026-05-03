import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdminAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/user_roles?user_id=eq.${user.id}&select=role`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!res.ok) return null;
  const roles = (await res.json()) as Array<{ role: string }>;
  const allowed = ['super_admin', 'admin'];
  return roles.some((r) => allowed.includes(r.role)) ? user : null;
}

export async function POST(req: NextRequest) {
  try {
    const caller = await requireAdminAuth();
    if (!caller) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { email, full_name, role } = await req.json();

    if (!email || !full_name || !role) {
      return NextResponse.json(
        { success: false, error: "email, full_name, and role are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const headers = {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Prefer": "return=representation",
    };

    // Step 1: Insert into users table (only columns that exist)
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, full_name }),
    });

    if (!userRes.ok) {
      const err = await userRes.text();
      if (err.includes("duplicate") || err.includes("unique") || err.includes("23505")) {
        return NextResponse.json(
          { success: false, error: "A user with that email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Failed to create user: ${err.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const userData = await userRes.json();
    const newUser = Array.isArray(userData) ? userData[0] : userData;

    if (!newUser?.id) {
      return NextResponse.json(
        { success: false, error: "User created but no ID returned" },
        { status: 500 }
      );
    }

    // Step 2: Insert role into user_roles table
    const roleRes = await fetch(`${supabaseUrl}/rest/v1/user_roles`, {
      method: "POST",
      headers,
      body: JSON.stringify({ user_id: newUser.id, role }),
    });

    if (!roleRes.ok) {
      const roleErr = await roleRes.text();
      // User was created but role failed — still return partial success
      console.error("Role insert failed:", roleErr);
      return NextResponse.json({
        success: true,
        user: { ...newUser, role },
        warning: "User created but role assignment failed",
      });
    }

    return NextResponse.json({ success: true, user: { ...newUser, role } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
