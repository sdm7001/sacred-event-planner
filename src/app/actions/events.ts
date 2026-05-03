"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const ceremony_notes = formData.get("ceremony_notes") as string;
  const start_datetime = formData.get("start_datetime") as string;
  const end_datetime = formData.get("end_datetime") as string;
  const timezone = formData.get("timezone") as string;
  const capacity = formData.get("capacity") ? Number(formData.get("capacity")) : null;
  const waitlist_enabled = formData.get("waitlist_enabled") === "true";
  const public_notes = formData.get("public_notes") as string;
  const private_notes = formData.get("private_notes") as string;
  const tags = (formData.get("tags") as string)?.split(",").map((t) => t.trim()).filter(Boolean) || [];
  const location_id = formData.get("location_id") as string;

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      type,
      description,
      ceremony_notes,
      start_datetime,
      end_datetime,
      timezone,
      capacity,
      waitlist_enabled,
      public_notes,
      private_notes,
      tags,
      location_id: location_id || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

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
