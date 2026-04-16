import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { processEmailQueue } from "@/app/actions/email";

/**
 * Reminder Engine - Cron endpoint
 *
 * This should be called every minute via:
 * - Supabase pg_cron
 * - Vercel cron
 * - External cron service
 *
 * Logic:
 * 1. Find active reminder_rules
 * 2. For offset type: check if (event.start_datetime - offset_minutes) <= now
 * 3. For fixed type: check if fixed_datetime <= now
 * 4. Segment audience (all_participants, all_providers, all)
 * 5. Deduplicate: skip if email_job already exists for this rule+recipient
 * 6. Queue email_jobs
 * 7. Mark reminder as processed
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  let queued = 0;

  // Get active reminder rules with event data
  const { data: rules } = await supabase
    .from("reminder_rules")
    .select("*, events(*)")
    .eq("is_active", true);

  if (!rules || rules.length === 0) {
    return NextResponse.json({ queued: 0, message: "No active reminders" });
  }

  const now = new Date();

  for (const rule of rules) {
    let shouldFire = false;

    if (rule.trigger_type === "offset" && rule.offset_minutes && rule.events) {
      const eventStart = new Date(rule.events.start_datetime);
      const fireAt = new Date(eventStart.getTime() - rule.offset_minutes * 60 * 1000);
      shouldFire = fireAt <= now;
    } else if (rule.trigger_type === "fixed" && rule.fixed_datetime) {
      shouldFire = new Date(rule.fixed_datetime) <= now;
    }

    if (!shouldFire) continue;

    // Get audience
    const recipientIds: { id: string; type: string }[] = [];

    if (rule.audience_segment === "all_participants" || rule.audience_segment === "all") {
      const { data: eps } = await supabase
        .from("event_participants")
        .select("participant_id")
        .eq("event_id", rule.event_id);
      if (eps) {
        recipientIds.push(...eps.map((ep: { participant_id: string }) => ({ id: ep.participant_id, type: "participant" })));
      }
    }

    if (rule.audience_segment === "all_providers" || rule.audience_segment === "all") {
      const { data: evp } = await supabase
        .from("event_providers")
        .select("provider_id")
        .eq("event_id", rule.event_id);
      if (evp) {
        recipientIds.push(...evp.map((ep: { provider_id: string }) => ({ id: ep.provider_id, type: "provider" })));
      }
    }

    // Deduplicate: skip if a non-failed job already exists for this rule+recipient
    for (const recipient of recipientIds) {
      const { data: existing } = await supabase
        .from("email_jobs")
        .select("id")
        .eq("event_id", rule.event_id)
        .eq("recipient_id", recipient.id)
        .eq("recipient_type", recipient.type)
        .eq("rule_id", rule.id)
        .neq("status", "failed")
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Queue email job
      await supabase.from("email_jobs").insert({
        event_id: rule.event_id,
        rule_id: rule.id,
        template_id: rule.template_id ?? null,
        recipient_type: recipient.type,
        recipient_id: recipient.id,
        scheduled_for: new Date().toISOString(),
        status: "pending",
      });

      queued++;
    }

    // Deactivate offset-based rules after firing (one-time)
    if (rule.trigger_type === "offset") {
      await supabase
        .from("reminder_rules")
        .update({ is_active: false })
        .eq("id", rule.id);
    }
  }

  // Process any pending email jobs (including ones just queued above)
  const { processed, error: sendError } = await processEmailQueue();

  return NextResponse.json({
    queued,
    processed,
    message: `Queued ${queued} reminder emails, sent ${processed}`,
    ...(sendError ? { sendError } : {}),
  });
}
