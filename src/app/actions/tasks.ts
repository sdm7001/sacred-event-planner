"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function listTasks(eventId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select("id, title, priority, status, due_date, assigned_to, event_id, description")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query;
  if (error) return { error: error.message, tasks: [] };
  return { tasks: data ?? [], error: null };
}

export async function createTask(input: {
  title: string;
  event_id?: string;
  priority?: string;
  status?: string;
  due_date?: string;
  assigned_to?: string;
  description?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...input,
      status: input.status ?? "pending",
      priority: input.priority ?? "medium",
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/tasks");
  if (input.event_id) revalidatePath(`/events/${input.event_id}`);
  return { data };
}

export async function updateTask(
  id: string,
  input: Partial<{
    title: string;
    priority: string;
    status: string;
    due_date: string;
    assigned_to: string;
    description: string;
  }>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/tasks");
  return { data };
}

export async function deleteTask(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/tasks");
  return { success: true };
}
