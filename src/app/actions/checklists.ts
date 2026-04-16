"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getChecklists() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checklists")
    .select("id, title, event_id, created_at, events(title)")
    .order("created_at", { ascending: false });
  if (error) return { error: error.message, checklists: [] };
  return { checklists: data ?? [] };
}

export async function createChecklist(title: string, eventId?: string) {
  if (!title.trim()) return { error: "Title is required" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checklists")
    .insert({ title: title.trim(), event_id: eventId || null })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/checklists");
  return { data };
}

export async function deleteChecklist(id: string) {
  const supabase = await createClient();
  // Items cascade delete via FK constraint
  const { error } = await supabase.from("checklists").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/checklists");
  return { success: true };
}

export async function getChecklistItems(checklistId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checklist_items")
    .select("id, title, is_done, sort_order, assigned_to")
    .eq("checklist_id", checklistId)
    .order("sort_order");
  if (error) return { error: error.message, items: [] };
  return { items: data ?? [] };
}

export async function addChecklistItem(checklistId: string, title: string) {
  if (!title.trim()) return { error: "Item title is required" };
  const supabase = await createClient();

  // Get current max sort_order
  const { data: existing } = await supabase
    .from("checklist_items")
    .select("sort_order")
    .eq("checklist_id", checklistId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({ checklist_id: checklistId, title: title.trim(), is_done: false, sort_order: nextOrder })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function toggleChecklistItem(itemId: string, isDone: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update({ is_done: isDone })
    .eq("id", itemId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteChecklistItem(itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  return { success: true };
}
