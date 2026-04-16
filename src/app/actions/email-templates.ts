"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface TemplateInput {
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  is_active?: boolean;
}

export async function listEmailTemplates() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("id, name, subject, body_html, body_text, is_active, created_at")
    .order("name");
  if (error) return { error: error.message, templates: [] };
  return { templates: data ?? [] };
}

export async function createEmailTemplate(input: TemplateInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_templates")
    .insert({
      name: input.name,
      subject: input.subject,
      body_html: input.body_html,
      body_text: input.body_text || null,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/email-templates");
  return { data };
}

export async function updateEmailTemplate(id: string, input: Partial<TemplateInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_templates")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/email-templates");
  return { data };
}

export async function cloneEmailTemplate(id: string) {
  const supabase = await createClient();
  const { data: original, error: fetchErr } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchErr || !original) return { error: "Template not found" };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at, updated_at, ...rest } = original;
  const { data, error } = await supabase
    .from("email_templates")
    .insert({ ...rest, name: `${original.name} (Copy)`, is_active: false })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/email-templates");
  return { data };
}

export async function deleteEmailTemplate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("email_templates").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/email-templates");
  return { success: true };
}
