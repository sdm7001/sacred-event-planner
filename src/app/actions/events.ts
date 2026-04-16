"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateEventInput {
  title: string;
  type?: string;
  description?: string;
  ceremony_notes?: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  capacity?: number | null;
  waitlist_enabled?: boolean;
  public_notes?: string;
  private_notes?: string;
  tags?: string[];
  // Inline venue fields — a new location row will be created automatically
  venue_name?: string;
  venue_address?: string;
  venue_parking_notes?: string;
  venue_entry_instructions?: string;
  venue_arrival_window?: string;
  venue_onsite_contact?: string;
}

export async function createEvent(input: CreateEventInput) {
  const supabase = await createClient();

  let location_id: string | null = null;

  // Create location row if venue details provided
  if (input.venue_name) {
    const { data: loc, error: locErr } = await supabase
      .from("locations")
      .insert({
        name: input.venue_name,
        address: input.venue_address || null,
        parking_notes: input.venue_parking_notes || null,
        entry_instructions: input.venue_entry_instructions || null,
        arrival_window: input.venue_arrival_window || null,
        onsite_contact: input.venue_onsite_contact || null,
      })
      .select("id")
      .single();

    if (locErr) return { error: `Location error: ${locErr.message}` };
    location_id = loc.id;
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      type: input.type || null,
      description: input.description || null,
      ceremony_notes: input.ceremony_notes || null,
      start_datetime: input.start_datetime,
      end_datetime: input.end_datetime,
      timezone: input.timezone,
      capacity: input.capacity ?? null,
      waitlist_enabled: input.waitlist_enabled ?? false,
      public_notes: input.public_notes || null,
      private_notes: input.private_notes || null,
      tags: input.tags ?? [],
      location_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/events");
  return { data };
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  const fields = ["title", "type", "status", "description", "ceremony_notes", "start_datetime", "end_datetime", "timezone", "public_notes", "private_notes"];

  for (const field of fields) {
    const value = formData.get(field);
    if (value !== null) updates[field] = value;
  }

  const capacity = formData.get("capacity");
  if (capacity) updates.capacity = Number(capacity);

  const waitlist = formData.get("waitlist_enabled");
  if (waitlist !== null) updates.waitlist_enabled = waitlist === "true";

  const tags = formData.get("tags") as string;
  if (tags) updates.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);

  const { data, error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/events/${id}`);
  revalidatePath("/events");
  return { data };
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/events");
  return { success: true };
}

export async function duplicateEvent(id: string) {
  const supabase = await createClient();

  const { data: original, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) return { error: "Event not found" };

  const { id: _id, created_at, updated_at, current_participant_count, ...eventData } = original;

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...eventData,
      title: `${eventData.title} (Copy)`,
      status: "draft",
      current_participant_count: 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/events");
  return { data };
}
