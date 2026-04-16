"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type RSVPStatus = "invited" | "confirmed" | "declined" | "tentative" | "waitlisted";
export type WaiverStatus = "not_sent" | "sent" | "signed" | "expired";

export async function updateRSVP(eventId: string, participantId: string, rsvp_status: RSVPStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("event_participants")
    .update({ rsvp_status })
    .eq("event_id", eventId)
    .eq("participant_id", participantId);

  if (error) return { error: error.message };

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function updateWaiverStatus(eventId: string, participantId: string, waiver_status: WaiverStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("event_participants")
    .update({ waiver_status })
    .eq("event_id", eventId)
    .eq("participant_id", participantId);

  if (error) return { error: error.message };

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function sendWaiver(eventId: string, participantIds: string[]) {
  const supabase = await createClient();

  // Mark waiver as "sent" for each participant
  const { error } = await supabase
    .from("event_participants")
    .update({ waiver_status: "sent" })
    .eq("event_id", eventId)
    .in("participant_id", participantIds)
    .eq("waiver_status", "not_sent"); // only update those not yet sent

  if (error) return { error: error.message };

  revalidatePath(`/events/${eventId}`);
  return { success: true, count: participantIds.length };
}
