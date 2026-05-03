"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recalculateEventMaterials(eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("recalculate_event_materials", {
    p_event_id: eventId,
  });

  if (error) return { error: error.message };

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/materials`);
  return { success: true };
}

export async function addEventMaterial(eventId: string, formData: FormData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_materials")
    .insert({
      event_id: eventId,
      material_id: formData.get("material_id") as string,
      required: formData.get("required") === "true",
      base_qty: Number(formData.get("base_qty") || 0),
      qty_per_participant: Number(formData.get("qty_per_participant") || 0),
      qty_per_provider: Number(formData.get("qty_per_provider") || 0),
      buffer_amount: Number(formData.get("buffer_amount") || 0),
      waste_pct: Number(formData.get("waste_pct") || 0),
      unit: formData.get("unit") as string,
      dose_per_participant: formData.get("dose_per_participant") ? Number(formData.get("dose_per_participant")) : null,
      dose_min: formData.get("dose_min") ? Number(formData.get("dose_min")) : null,
      dose_max: formData.get("dose_max") ? Number(formData.get("dose_max")) : null,
      dose_notes: formData.get("dose_notes") as string,
      current_stock: Number(formData.get("current_stock") || 0),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Recalculate totals
  await recalculateEventMaterials(eventId);

  return { data };
}

export async function updateDosingRule(
  eventMaterialId: string,
  participantId: string,
  customDose: number | null,
  excluded: boolean,
  notes: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dosing_rules")
    .upsert(
      {
        event_material_id: eventMaterialId,
        participant_id: participantId,
        custom_dose: customDose,
        excluded,
        notes,
      },
      { onConflict: "event_material_id,participant_id" }
    );

  if (error) return { error: error.message };

  return { success: true };
}
