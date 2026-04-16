"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateProvider } from "@/app/actions/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

const ROLE_TYPES = ["Lead Facilitator", "Sound Healer", "Cook", "Yoga Instructor", "Driver", "Musician", "Healer", "Assistant", "Other"];
const CONTRACT_STATUSES = ["active", "pending", "expired", "none"];

export default function EditProviderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    role_type: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    rate: "",
    contract_status: "none",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("providers")
      .select("full_name, role_type, email, phone, city, state, rate, contract_status")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name ?? "",
            role_type: data.role_type ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            city: data.city ?? "",
            state: data.state ?? "",
            rate: data.rate ?? "",
            contract_status: data.contract_status ?? "none",
          });
        }
        setLoading(false);
      });
  }, [id]);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.full_name.trim()) { setSubmitError("Name is required."); return; }
    setSubmitError(null);
    startTransition(async () => {
      const result = await updateProvider(id, {
        full_name: form.full_name.trim(),
        role_type: form.role_type || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        rate: form.rate || undefined,
        contract_status: form.contract_status || undefined,
      });
      if (result.error) {
        setSubmitError(result.error);
      } else {
        router.push(`/providers/${id}`);
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
        <Link href={`/providers/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Edit Provider</h1>
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
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="River Stone" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role / Specialty</Label>
              <Select value={form.role_type} onValueChange={(v) => set("role_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {ROLE_TYPES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contract Status</Label>
              <Select value={form.contract_status} onValueChange={(v) => set("contract_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTRACT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Rate</Label>
            <Input value={form.rate} onChange={(e) => set("rate", e.target.value)} placeholder="$150/hr or $2,500/event" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="provider@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(512) 555-0100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Austin" />
            </div>
            <div className="space-y-1.5">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="TX" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-3 pb-6">
        <Link href={`/providers/${id}`}>
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
