"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface MaterialRecord {
  id: string;
  name: string;
  category: string;
  unit_of_measure: string;
  in_house_qty: number;
  reorder_threshold: number;
  vendor?: string | null;
  is_active: boolean;
}

export async function getMaterials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials_catalog")
    .select("id, name, category, unit_of_measure, in_house_qty, reorder_threshold, vendor, is_active")
    .eq("is_active", true)
    .order("name");
  if (error) return { error: error.message, materials: [] as MaterialRecord[] };
  return { materials: (data ?? []) as MaterialRecord[] };
}

export async function createMaterial(input: {
  name: string;
  category: string;
  unit_of_measure: string;
  in_house_qty: number;
  reorder_threshold: number;
  vendor?: string;
}) {
  if (!input.name.trim()) return { error: "Name is required" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials_catalog")
    .insert({ ...input, is_active: true })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/materials");
  return { data };
}

export async function updateMaterial(
  id: string,
  updates: {
    name?: string;
    category?: string;
    unit_of_measure?: string;
    reorder_threshold?: number;
    vendor?: string;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("materials_catalog")
    .update(updates)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/materials");
  return { success: true };
}

export async function restockMaterial(id: string, addQty: number) {
  if (addQty <= 0) return { error: "Quantity must be greater than 0" };
  const supabase = await createClient();

  // Fetch current qty first
  const { data: current, error: fetchErr } = await supabase
    .from("materials_catalog")
    .select("in_house_qty")
    .eq("id", id)
    .single();

  if (fetchErr || !current) return { error: "Material not found" };

  const { error } = await supabase
    .from("materials_catalog")
    .update({ in_house_qty: current.in_house_qty + addQty })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/materials");
  return { success: true };
}

export async function deleteMaterial(id: string) {
  const supabase = await createClient();
  // Soft-delete by deactivating
  const { error } = await supabase
    .from("materials_catalog")
    .update({ is_active: false })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/materials");
  return { success: true };
}
