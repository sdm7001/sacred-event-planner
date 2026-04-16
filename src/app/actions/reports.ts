"use server";

import { createClient } from "@/lib/supabase/server";

export interface EventReport {
  event_id: string;
  event_title: string;
  // Roster
  total_participants: number;
  confirmed: number;
  tentative: number;
  declined: number;
  waivers_signed: number;
  // Tasks
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  // Materials
  total_materials: number;
  in_stock: number;
  to_order: number;
}

export async function listEventsForReports() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title")
    .order("start_datetime", { ascending: false });
  if (error) return { events: [], error: error.message };
  return { events: (data ?? []) as { id: string; title: string }[] };
}

export async function getEventReport(eventId: string): Promise<{ report: EventReport | null; error?: string }> {
  const supabase = await createClient();

  // Event basic info
  const { data: event, error: evErr } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .single();
  if (evErr || !event) return { report: null, error: "Event not found" };

  // Participants
  const { data: eps } = await supabase
    .from("event_participants")
    .select("rsvp_status, waiver_status")
    .eq("event_id", eventId);

  const participants = eps ?? [];
  const total_participants = participants.length;
  const confirmed = participants.filter((p) => p.rsvp_status === "confirmed").length;
  const tentative = participants.filter((p) => p.rsvp_status === "tentative").length;
  const declined = participants.filter((p) => p.rsvp_status === "declined").length;
  const waivers_signed = participants.filter((p) => p.waiver_status === "signed").length;

  // Tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("status, due_date")
    .eq("event_id", eventId);

  const allTasks = tasks ?? [];
  const total_tasks = allTasks.length;
  const completed_tasks = allTasks.filter((t) => t.status === "completed").length;
  const now = new Date().toISOString();
  const overdue_tasks = allTasks.filter(
    (t) => t.status !== "completed" && t.due_date && t.due_date < now
  ).length;

  // Materials (global catalog — filter low stock)
  const { data: materials } = await supabase
    .from("materials_catalog")
    .select("in_house_qty, reorder_threshold")
    .eq("is_active", true);

  const allMaterials = materials ?? [];
  const total_materials = allMaterials.length;
  const in_stock = allMaterials.filter((m) => m.in_house_qty >= m.reorder_threshold).length;
  const to_order = allMaterials.filter((m) => m.in_house_qty < m.reorder_threshold).length;

  return {
    report: {
      event_id: event.id,
      event_title: event.title,
      total_participants,
      confirmed,
      tentative,
      declined,
      waivers_signed,
      total_tasks,
      completed_tasks,
      overdue_tasks,
      total_materials,
      in_stock,
      to_order,
    },
  };
}
