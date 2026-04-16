"use server";

import { createClient } from "@/lib/supabase/server";

export interface OrgSettings {
  org_name: string;
  contact_email: string;
  timezone: string;
}

export interface NotificationSettings {
  low_stock_alerts: boolean;
  overdue_task_alerts: boolean;
  missing_waiver_alerts: boolean;
  provider_conflict_detection: boolean;
}

/**
 * Persists settings by upserting a row in the notes table using
 * linked_entity_type='app_settings' as a key-value store.
 * Replace with a dedicated settings table once the schema is migrated.
 */
export async function saveOrgSettings(settings: OrgSettings) {
  const supabase = await createClient();

  const { error } = await supabase.from("notes").upsert(
    {
      linked_entity_type: "app_settings",
      linked_entity_id: "00000000-0000-0000-0000-000000000001",
      title: "org_settings",
      body: JSON.stringify(settings),
      is_admin_only: true,
    },
    { onConflict: "linked_entity_type,linked_entity_id,title" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveNotificationSettings(settings: NotificationSettings) {
  const supabase = await createClient();

  const { error } = await supabase.from("notes").upsert(
    {
      linked_entity_type: "app_settings",
      linked_entity_id: "00000000-0000-0000-0000-000000000002",
      title: "notification_settings",
      body: JSON.stringify(settings),
      is_admin_only: true,
    },
    { onConflict: "linked_entity_type,linked_entity_id,title" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function loadSettings() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("notes")
    .select("title, body")
    .eq("linked_entity_type", "app_settings");

  if (!data) return {};

  const result: Record<string, unknown> = {};
  for (const row of data) {
    try {
      result[row.title] = JSON.parse(row.body);
    } catch {
      // ignore malformed rows
    }
  }
  return result;
}
