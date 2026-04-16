"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateParticipant } from "@/app/actions/participants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

export default function EditParticipantPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    preferred_name: "",
    email: "",
    phone: "",
    dob: "",
    address_line1: "",
    city: "",
    state: "",
    postal_code: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("participants")
      .select("full_name, preferred_name, email, phone, dob, address_line1, city, state, postal_code, emergency_contact_name, emergency_contact_phone, notes")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name ?? "",
            preferred_name: data.preferred_name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            dob: data.dob ?? "",
            address_line1: data.address_line1 ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            postal_code: data.postal_code ?? "",
            emergency_contact_name: data.emergency_contact_name ?? "",
            emergency_contact_phone: data.emergency_contact_phone ?? "",
            notes: data.notes ?? "",
          });
        }
        setLoading(false);
      });
  }, [id]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.full_name.trim()) { setSubmitError("Full name is required."); return; }
    if (!form.email.trim()) { setSubmitError("Email is required."); return; }
    setSubmitError(null);
    startTransition(async () => {
      const result = await updateParticipant(id, {
        full_name: form.full_name.trim(),
        preferred_name: form.preferred_name.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        dob: form.dob || null,
        address_line1: form.address_line1.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim() || null,
        emergency_contact_name: form.emergency_contact_name.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone.trim() || null,
        notes: form.notes.trim() || null,
      });
      if (result.error) {
        setSubmitError(result.error);
      } else {
        router.push(`/participants/${id}`);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href={`/participants/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Edit Participant</h1>
          <p className="text-muted-foreground mt-1">{form.full_name || "Loading…"}</p>
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {submitError}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Preferred Name</Label>
              <Input value={form.preferred_name} onChange={(e) => set("preferred_name", e.target.value)} placeholder="Jane" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(512) 555-0100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Date of Birth</Label>
            <Input type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Street Address</Label>
            <Input value={form.address_line1} onChange={(e) => set("address_line1", e.target.value)} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Austin" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="TX" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Postal Code</Label>
            <Input value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} placeholder="78701" className="max-w-[160px]" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Contact Name</Label>
              <Input value={form.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} placeholder="John Smith" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Phone</Label>
              <Input value={form.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} placeholder="(512) 555-0101" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            rows={4}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Dietary restrictions, medical notes, preferences…"
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-3 pb-6">
        <Link href={`/participants/${id}`}>
          <Button variant="outline" disabled={isPending}>Cancel</Button>
        </Link>
        <Button className="bg-sage hover:bg-sage-dark" onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
