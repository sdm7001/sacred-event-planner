"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function removeParticipants(participantIds: string[]) {
  if (participantIds.length === 0) return { error: "No participants selected" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("participants")
    .delete()
    .in("id", participantIds);

  if (error) return { error: error.message };

  revalidatePath("/participants");
  return { success: true, count: participantIds.length };
}

export async function createParticipant(formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("participants")
    .insert({
      full_name: formData.get("full_name") as string,
      preferred_name: (formData.get("preferred_name") as string) || null,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/participants");
  return { data };
}
