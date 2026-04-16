"use server";

import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Admin client using the service role key — required for user management */
async function createAdminClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // Server Component — can't set cookies
          }
        },
      },
    }
  );
}

export async function inviteUser(email: string, fullName: string, role: string) {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return { error: "SUPABASE_SERVICE_KEY is not configured. Cannot send invites without admin access." };
  }

  const supabase = await createAdminClient();

  // Send Supabase Auth invite email
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });

  if (authError) return { error: authError.message };

  // Insert into our users table and assign role
  const userId = authData.user.id;

  const { error: userError } = await supabase
    .from("users")
    .upsert({ id: userId, email, full_name: fullName }, { onConflict: "id" });

  if (userError) return { error: userError.message };

  const { error: roleError } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role });

  if (roleError) return { error: roleError.message };

  return { success: true };
}

export async function updateUser(userId: string, updates: { full_name?: string; role?: string; is_active?: boolean }) {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return { error: "SUPABASE_SERVICE_KEY is not configured." };
  }

  const supabase = await createAdminClient();

  // Update display name in users table
  if (updates.full_name !== undefined) {
    const { error } = await supabase
      .from("users")
      .update({ full_name: updates.full_name })
      .eq("id", userId);
    if (error) return { error: error.message };
  }

  // Update role in user_roles table
  if (updates.role !== undefined) {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: updates.role }, { onConflict: "user_id" });
    if (error) return { error: error.message };
  }

  // Suspend / reactivate via Supabase Auth
  if (updates.is_active !== undefined) {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: updates.is_active ? "none" : "876600h", // 100 years = effectively suspended
    });
    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function resetUserPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) return { error: error.message };

  return { success: true };
}

export async function listUsers() {
  if (!process.env.SUPABASE_SERVICE_KEY) {
    return { error: "SUPABASE_SERVICE_KEY is not configured.", users: [] };
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, created_at, user_roles(role)")
    .order("full_name");

  if (error) return { error: error.message, users: [] };

  return { users: data ?? [] };
}
