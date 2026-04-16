"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ReminderRule {
  id: string;
  event_id: string;
  name: string;
  offset_days: number;
  audience_segment: string;
  is_active: boolean;
  template_id?: string | null;
}

export interface ReminderWorkflow {
  event_id: string;
  event_title: string;
  event_date: string;
  rules: ReminderRule[];
}

export async function getReminderWorkflows(): Promise<{ workflows: ReminderWorkflow[]; error?: string }> {
  const supabase = await createClient();

  const { data: rules, error } = await supabase
    .from("reminder_rules")
    .select("id, event_id, name, offset_days, audience_segment, is_active, template_id, events(id, title, start_datetime)")
    .order("offset_days", { ascending: false });

  if (error) return { workflows: [], error: error.message };

  // Group by event
  const map = new Map<string, ReminderWorkflow>();
  for (const rule of rules ?? []) {
    const ev = rule.events as { id?: string; title?: string; start_datetime?: string } | null;
    const eventId = rule.event_id as string;
    if (!map.has(eventId)) {
      map.set(eventId, {
        event_id: eventId,
        event_title: ev?.title ?? "Unknown Event",
        event_date: ev?.start_datetime
          ? new Date(ev.start_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "TBD",
        rules: [],
      });
    }
    map.get(eventId)!.rules.push({
      id: rule.id as string,
      event_id: eventId,
      name: (rule.name as string) ?? `${rule.audience_segment} — ${rule.offset_days}d before`,
      offset_days: (rule.offset_days as number) ?? 0,
      audience_segment: rule.audience_segment as string,
      is_active: rule.is_active as boolean,
      template_id: rule.template_id as string | null,
    });
  }

  return { workflows: Array.from(map.values()) };
}

export async function createReminderWorkflow(eventId: string) {
  // Just validates the event exists; rules are added separately
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, start_datetime")
    .eq("id", eventId)
    .single();
  if (error || !data) return { error: "Event not found" };
  revalidatePath("/reminders");
  return { event: data };
}

export async function createReminderRule(input: {
  event_id: string;
  name: string;
  offset_days: number;
  audience_segment: string;
  template_id?: string | null;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reminder_rules")
    .insert({
      event_id: input.event_id,
      name: input.name,
      offset_days: input.offset_days,
      offset_minutes: input.offset_days * 24 * 60,
      trigger_type: "offset",
      audience_segment: input.audience_segment,
      template_id: input.template_id ?? null,
      is_active: true,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/reminders");
  return { data };
}

export async function toggleReminderRule(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminder_rules")
    .update({ is_active })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reminders");
  return { success: true };
}

export async function deleteReminderRule(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reminder_rules")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reminders");
  return { success: true };
}
