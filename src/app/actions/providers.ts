"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function listProviders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("providers")
    .select("id, full_name, email, phone, role_type, city, state, contract_status, rate")
    .order("full_name");
  if (error) return { error: error.message, providers: [] };
  return { providers: data ?? [], error: null };
}

export async function createProvider(input: {
  full_name: string;
  email?: string;
  phone?: string;
  role_type?: string;
  city?: string;
  state?: string;
  rate?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("providers")
    .insert(input)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/providers");
  return { data };
}

export async function updateProvider(
  id: string,
  input: Partial<{
    full_name: string;
    email: string;
    phone: string;
    role_type: string;
    city: string;
    state: string;
    rate: string;
    contract_status: string;
  }>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("providers")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/providers");
  revalidatePath(`/providers/${id}`);
  return { data };
}

export async function deleteProvider(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("providers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/providers");
  return { success: true };
}
