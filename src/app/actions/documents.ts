"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "documents";

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };

  const eventId = (formData.get("event_id") as string) || null;
  const docType = (formData.get("doc_type") as string) || "other";

  // Sanitize filename and build storage path
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${eventId ?? "general"}/${Date.now()}_${safeName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  // Insert metadata into documents table
  const { data, error: dbError } = await supabase
    .from("documents")
    .insert({
      event_id: eventId,
      linked_entity_type: docType,
      filename: file.name,
      storage_url: urlData.publicUrl,
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };

  revalidatePath("/documents");
  return { data };
}

export async function listDocuments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("id, filename, storage_url, linked_entity_type, event_id, uploaded_at, events(title)")
    .order("uploaded_at", { ascending: false });
  if (error) return { error: error.message, documents: [] };
  return { documents: data ?? [] };
}

export async function deleteDocument(id: string, storagePath: string) {
  const supabase = await createClient();

  // Remove from storage if path provided
  if (storagePath) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
  }

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/documents");
  return { success: true };
}
