"use server";

import { createClient } from "@/lib/supabase/server";
import { replaceEmailTokens } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function sendEmail(
  eventId: string,
  templateId: string,
  recipientType: "participant" | "provider",
  recipientIds: string[]
) {
  const supabase = await createClient();

  // Get template
  const { data: template, error: tmplError } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (tmplError || !template) return { error: "Template not found" };

  // Get event
  const { data: event } = await supabase
    .from("events")
    .select("*, locations(*)")
    .eq("id", eventId)
    .single();

  // Create email jobs
  const jobs = recipientIds.map((id) => ({
    event_id: eventId,
    template_id: templateId,
    recipient_type: recipientType,
    recipient_id: id,
    scheduled_for: new Date().toISOString(),
    status: "pending" as const,
  }));

  const { error: jobError } = await supabase.from("email_jobs").insert(jobs);

  if (jobError) return { error: jobError.message };

  // In production: trigger actual Resend API sending here
  // For now, mark as sent
  revalidatePath("/communications");
  return { success: true, count: recipientIds.length };
}

export async function processEmailQueue() {
  const supabase = await createClient();

  // Get pending jobs
  const { data: pendingJobs } = await supabase
    .from("email_jobs")
    .select("*, email_templates(*)")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(50);

  if (!pendingJobs || pendingJobs.length === 0) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const job of pendingJobs) {
    try {
      // Get recipient details based on type
      let recipient;
      if (job.recipient_type === "participant") {
        const { data } = await supabase
          .from("participants")
          .select("*")
          .eq("id", job.recipient_id)
          .single();
        recipient = data;
      } else {
        const { data } = await supabase
          .from("providers")
          .select("*")
          .eq("id", job.recipient_id)
          .single();
        recipient = data;
      }

      if (!recipient) {
        await supabase
          .from("email_jobs")
          .update({ status: "failed", error_message: "Recipient not found" })
          .eq("id", job.id);
        continue;
      }

      // In production: call Resend API here
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({ ... });

      await supabase
        .from("email_jobs")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", job.id);

      // Log communication
      await supabase.from("communications_log").insert({
        event_id: job.event_id,
        direction: "outbound",
        recipient_type: job.recipient_type,
        recipient_id: job.recipient_id,
        subject: job.email_templates?.subject || "No subject",
        channel: "email",
        status: "sent",
      });

      processed++;
    } catch (err) {
      await supabase
        .from("email_jobs")
        .update({
          status: "failed",
          error_message: err instanceof Error ? err.message : "Unknown error",
        })
        .eq("id", job.id);
    }
  }

  return { processed };
}
