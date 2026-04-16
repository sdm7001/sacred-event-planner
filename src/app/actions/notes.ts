"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addEventNote(eventId: string, body: string, isAdminOnly: boolean) {
  if (!body.trim()) return { error: "Note cannot be empty" };

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .insert({
      linked_entity_type: "event",
      linked_entity_id: eventId,
      title: null,
      body: body.trim(),
      is_admin_only: isAdminOnly,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/events/${eventId}`);
  return { data };
}

export async function getEventNotes(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notes")
    .select("id, body, is_admin_only, created_at")
    .eq("linked_entity_type", "event")
    .eq("linked_entity_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, notes: [] as Note[] };
  return { notes: (data ?? []) as Note[] };
}

export async function deleteEventNote(eventId: string, noteId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) return { error: error.message };

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export interface Note {
  id: string;
  body: string;
  is_admin_only: boolean;
  created_at: string;
}
