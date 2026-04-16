"use server";

import { createClient } from "@/lib/supabase/server";

export interface EmailJobRow {
  id: string;
  event_id: string | null;
  recipient_type: string;
  recipient_id: string;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  error_message: string | null;
  event_title: string | null;
  template_subject: string | null;
}

export async function listEmailJobs(limit = 100): Promise<{ jobs: EmailJobRow[]; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_jobs")
    .select("id, event_id, recipient_type, recipient_id, status, scheduled_for, sent_at, error_message, events(title), email_templates(subject)")
    .order("scheduled_for", { ascending: false })
    .limit(limit);

  if (error) return { jobs: [], error: error.message };

  const jobs = (data ?? []).map((row) => ({
    id: row.id as string,
    event_id: row.event_id as string | null,
    recipient_type: row.recipient_type as string,
    recipient_id: row.recipient_id as string,
    status: row.status as string,
    scheduled_for: row.scheduled_for as string,
    sent_at: row.sent_at as string | null,
    error_message: row.error_message as string | null,
    event_title: (row.events as { title?: string } | null)?.title ?? null,
    template_subject: (row.email_templates as { subject?: string } | null)?.subject ?? null,
  }));

  return { jobs };
}

export async function createBroadcastJobs(input: {
  audience: "all_participants" | "all_providers" | "everyone";
  subject: string;
  body: string;
}): Promise<{ queued: number; error?: string }> {
  const supabase = await createClient();

  // Get recipient IDs based on audience
  const recipientIds: { id: string; type: string }[] = [];

  if (input.audience === "all_participants" || input.audience === "everyone") {
    const { data } = await supabase.from("participants").select("id");
    (data ?? []).forEach((p: { id: string }) => recipientIds.push({ id: p.id, type: "participant" }));
  }
  if (input.audience === "all_providers" || input.audience === "everyone") {
    const { data } = await supabase.from("providers").select("id");
    (data ?? []).forEach((p: { id: string }) => recipientIds.push({ id: p.id, type: "provider" }));
  }

  if (recipientIds.length === 0) return { queued: 0, error: "No recipients found" };

  // Create a one-off email template for this broadcast
  const { data: tmpl, error: tmplErr } = await supabase
    .from("email_templates")
    .insert({ name: `Broadcast: ${input.subject}`, subject: input.subject, body_html: `<p>${input.body}</p>`, is_active: false })
    .select("id")
    .single();

  if (tmplErr || !tmpl) return { queued: 0, error: tmplErr?.message ?? "Failed to create template" };

  const jobs = recipientIds.map((r) => ({
    template_id: tmpl.id,
    recipient_type: r.type,
    recipient_id: r.id,
    scheduled_for: new Date().toISOString(),
    status: "pending",
  }));

  const { error: jobErr } = await supabase.from("email_jobs").insert(jobs);
  if (jobErr) return { queued: 0, error: jobErr.message };

  return { queued: jobs.length };
}
