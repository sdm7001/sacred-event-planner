"use client";

import { useState, useTransition, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updateEventInput } from "@/app/actions/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";

const EVENT_TYPES = ["Retreat", "Ceremony", "Workshop", "Fire Circle", "Day Event", "Other"];
const EVENT_STATUSES = ["draft", "scheduled", "confirmed", "in_progress", "completed", "canceled"];
const TIMEZONES = ["America/Chicago", "America/New_York", "America/Los_Angeles", "America/Denver", "America/Phoenix", "UTC"];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "",
    status: "draft",
    description: "",
    ceremony_notes: "",
    start_date: "",
    start_time: "10:00",
    end_date: "",
    end_time: "16:00",
    timezone: "America/Chicago",
    capacity: "",
    waitlist_enabled: false,
    public_notes: "",
    private_notes: "",
    tags: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          const start = new Date(data.start_datetime);
          const end = new Date(data.end_datetime);
          setForm({
            title: data.title ?? "",
            type: data.type ?? "",
            status: data.status ?? "draft",
            description: data.description ?? "",
            ceremony_notes: data.ceremony_notes ?? "",
            start_date: start.toISOString().split("T")[0],
            start_time: start.toTimeString().slice(0, 5),
            end_date: end.toISOString().split("T")[0],
            end_time: end.toTimeString().slice(0, 5),
            timezone: data.timezone ?? "America/Chicago",
            capacity: data.capacity != null ? String(data.capacity) : "",
            waitlist_enabled: data.waitlist_enabled ?? false,
            public_notes: data.public_notes ?? "",
            private_notes: data.private_notes ?? "",
            tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          });
        }
        setLoading(false);
      });
  }, [id]);

  const set = (field: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!form.title.trim()) { setSubmitError("Title is required"); return; }
    if (!form.start_date || !form.end_date) { setSubmitError("Start and end dates are required"); return; }
    setSubmitError(null);
    startTransition(async () => {
      const result = await updateEventInput(id, {
        title: form.title.trim(),
        type: form.type || undefined,
        status: form.status,
        description: form.description,
        ceremony_notes: form.ceremony_notes,
        start_datetime: `${form.start_date}T${form.start_time}:00`,
        end_datetime: `${form.end_date}T${form.end_time}:00`,
        timezone: form.timezone,
        capacity: form.capacity ? Number(form.capacity) : null,
        waitlist_enabled: form.waitlist_enabled,
        public_notes: form.public_notes,
        private_notes: form.private_notes,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      if (result.error) {
        setSubmitError(result.error);
      } else {
        router.push(`/events/${id}`);
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground mt-1">{form.title || "Loading…"}</p>
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
            <Label>Event Title *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g., Spring Equinox Retreat" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EVENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Event overview..." />
          </div>
          <div className="space-y-1.5">
            <Label>Ceremony Notes <span className="text-xs text-muted-foreground">(admin only)</span></Label>
            <Textarea rows={2} value={form.ceremony_notes} onChange={(e) => set("ceremony_notes", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Date & Time</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End Date *</Label>
              <Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={(e) => set("end_time", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => set("timezone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Capacity & Registration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input type="number" min={1} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="Leave blank for unlimited" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.waitlist_enabled} onCheckedChange={(v) => set("waitlist_enabled", v)} />
            <Label>Enable waitlist when full</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Public Notes</Label>
            <Textarea rows={2} value={form.public_notes} onChange={(e) => set("public_notes", e.target.value)} placeholder="Shown to participants..." />
          </div>
          <div className="space-y-1.5">
            <Label>Private Notes <span className="text-xs text-muted-foreground">(admin only)</span></Label>
            <Textarea rows={2} value={form.private_notes} onChange={(e) => set("private_notes", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="equinox, retreat, multi-day (comma separated)" />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-3 pb-6">
        <Link href={`/events/${id}`}>
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
