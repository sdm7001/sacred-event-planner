"use server";

import { createClient } from "@/lib/supabase/server";
import { replaceEmailTokens } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

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

  revalidatePath("/communications");
  return { success: true, count: recipientIds.length };
}

export async function processEmailQueue() {
  const supabase = await createClient();

  // Get pending jobs that are due
  const { data: pendingJobs } = await supabase
    .from("email_jobs")
    .select("*, email_templates(*), events(title, start_datetime, locations(name, address))")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(50);

  if (!pendingJobs || pendingJobs.length === 0) {
    return { processed: 0 };
  }

  let resend: Resend | null = null;
  try {
    resend = getResendClient();
  } catch {
    // Resend not configured — mark jobs as failed rather than silently skipping
    await supabase
      .from("email_jobs")
      .update({ status: "failed", error_message: "RESEND_API_KEY not configured" })
      .in("id", pendingJobs.map((j: { id: string }) => j.id));
    return { processed: 0, error: "RESEND_API_KEY not configured" };
  }

  const fromName = process.env.EMAIL_FROM_NAME ?? "Sacred Gatherings";
  const fromEmail = process.env.EMAIL_FROM_ADDRESS ?? "noreply@sacredgatherings.com";
  const from = `${fromName} <${fromEmail}>`;

  let processed = 0;

  for (const job of pendingJobs) {
    try {
      // Get recipient details
      let recipient: Record<string, string> | null = null;
      if (job.recipient_type === "participant") {
        const { data } = await supabase
          .from("participants")
          .select("id, full_name, preferred_name, email")
          .eq("id", job.recipient_id)
          .single();
        recipient = data;
      } else {
        const { data } = await supabase
          .from("providers")
          .select("id, full_name, email")
          .eq("id", job.recipient_id)
          .single();
        recipient = data;
      }

      if (!recipient || !recipient.email) {
        await supabase
          .from("email_jobs")
          .update({ status: "failed", error_message: "Recipient not found or missing email" })
          .eq("id", job.id);
        continue;
      }

      const event = job.events as {
        title?: string;
        start_datetime?: string;
        locations?: { name?: string; address?: string };
      } | null;

      const tokens: Record<string, string> = {
        first_name: recipient.preferred_name ?? (recipient.full_name?.split(" ")[0] ?? ""),
        last_name: recipient.full_name?.split(" ").slice(1).join(" ") ?? "",
        full_name: recipient.full_name ?? "",
        email: recipient.email,
        event_name: event?.title ?? "",
        event_date: event?.start_datetime
          ? new Date(event.start_datetime).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "",
        venue_name: event?.locations?.name ?? "",
        venue_address: event?.locations?.address ?? "",
      };

      const template = job.email_templates as {
        subject?: string;
        body_html?: string;
        body_text?: string;
      } | null;

      if (!template?.subject || !template?.body_html) {
        await supabase
          .from("email_jobs")
          .update({ status: "failed", error_message: "Template missing subject or body" })
          .eq("id", job.id);
        continue;
      }

      const subject = replaceEmailTokens(template.subject, tokens);
      const html = replaceEmailTokens(template.body_html, tokens);
      const text = template.body_text
        ? replaceEmailTokens(template.body_text, tokens)
        : undefined;

      await resend.emails.send({
        from,
        to: recipient.email,
        subject,
        html,
        ...(text ? { text } : {}),
      });

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
        subject,
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
