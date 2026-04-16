"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/actions/events";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Check, CalendarDays, MapPin, Users, FileText, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const steps = [
  { id: 1, name: "Basics", icon: CalendarDays },
  { id: 2, name: "Location", icon: MapPin },
  { id: 3, name: "Capacity", icon: Users },
  { id: 4, name: "Details", icon: FileText },
];

export default function NewEventPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    ceremony_notes: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    timezone: "America/Chicago",
    venue_name: "",
    address: "",
    parking_notes: "",
    entry_instructions: "",
    arrival_window: "",
    onsite_contact: "",
    capacity: "",
    waitlist_enabled: false,
    public_notes: "",
    private_notes: "",
    tags: "",
  });

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setSubmitError(null);
    startTransition(async () => {
      const result = await createEvent({
        title: form.title,
        type: form.type || undefined,
        description: form.description || undefined,
        ceremony_notes: form.ceremony_notes || undefined,
        start_datetime: form.start_date && form.start_time
          ? `${form.start_date}T${form.start_time}:00`
          : "",
        end_datetime: form.end_date && form.end_time
          ? `${form.end_date}T${form.end_time}:00`
          : "",
        timezone: form.timezone,
        capacity: form.capacity ? Number(form.capacity) : null,
        waitlist_enabled: form.waitlist_enabled,
        public_notes: form.public_notes || undefined,
        private_notes: form.private_notes || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        venue_name: form.venue_name || undefined,
        venue_address: form.address || undefined,
        venue_parking_notes: form.parking_notes || undefined,
        venue_entry_instructions: form.entry_instructions || undefined,
        venue_arrival_window: form.arrival_window || undefined,
        venue_onsite_contact: form.onsite_contact || undefined,
      });

      if (result.error) {
        setSubmitError(result.error);
      } else {
        router.push(`/events/${result.data.id}`);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">New Event</h1>
          <p className="text-muted-foreground mt-1">Create a new ceremony, retreat, or gathering</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                currentStep === step.id
                  ? "bg-sage text-white"
                  : currentStep > step.id
                  ? "bg-sage/10 text-sage"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                currentStep === step.id ? "bg-white/20" :
                currentStep > step.id ? "bg-sage/20" : "bg-muted"
              )}>
                {currentStep > step.id ? <Check className="h-3 w-3" /> : step.id}
              </div>
              <span className="hidden sm:inline">{step.name}</span>
            </button>
            {i < steps.length - 1 && (
              <Separator className="w-8 mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Basics</CardTitle>
            <CardDescription>Set the essential details for your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Spring Equinox Retreat"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Event Type</Label>
              <Select value={form.type} onValueChange={(v) => updateForm("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceremony">Ceremony</SelectItem>
                  <SelectItem value="retreat">Retreat</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => updateForm("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => updateForm("start_time", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => updateForm("end_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => updateForm("end_time", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => updateForm("timezone", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern</SelectItem>
                  <SelectItem value="America/Chicago">Central</SelectItem>
                  <SelectItem value="America/Denver">Mountain</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this event..."
                rows={4}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Location */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>Where will this event take place?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue_name">Venue Name *</Label>
              <Input
                id="venue_name"
                placeholder="e.g., Sacred Valley Ranch"
                value={form.venue_name}
                onChange={(e) => updateForm("venue_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                placeholder="Street address, city, state, ZIP"
                value={form.address}
                onChange={(e) => updateForm("address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parking_notes">Parking Notes</Label>
              <Textarea
                id="parking_notes"
                placeholder="Where to park, how many spots available..."
                value={form.parking_notes}
                onChange={(e) => updateForm("parking_notes", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_instructions">Entry Instructions</Label>
              <Textarea
                id="entry_instructions"
                placeholder="Gate code, check-in process, landmarks..."
                value={form.entry_instructions}
                onChange={(e) => updateForm("entry_instructions", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrival_window">Arrival Window</Label>
                <Input
                  id="arrival_window"
                  placeholder="e.g., 9:00 AM - 10:00 AM"
                  value={form.arrival_window}
                  onChange={(e) => updateForm("arrival_window", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="onsite_contact">On-Site Contact</Label>
                <Input
                  id="onsite_contact"
                  placeholder="Name and phone"
                  value={form.onsite_contact}
                  onChange={(e) => updateForm("onsite_contact", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Capacity */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Capacity & Registration</CardTitle>
            <CardDescription>Set limits and registration preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Maximum Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 20"
                value={form.capacity}
                onChange={(e) => updateForm("capacity", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank for no limit</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Enable Waitlist</Label>
                <p className="text-xs text-muted-foreground">
                  Allow participants to join a waitlist when event is full
                </p>
              </div>
              <Switch
                checked={form.waitlist_enabled}
                onCheckedChange={(v) => updateForm("waitlist_enabled", v)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Details */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Notes, ceremony details, and tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ceremony_notes">Ceremony Notes</Label>
              <Textarea
                id="ceremony_notes"
                placeholder="Specific ceremony details, protocols, sacred elements..."
                rows={4}
                value={form.ceremony_notes}
                onChange={(e) => updateForm("ceremony_notes", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Admin only - not visible to participants</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="public_notes">Public Notes</Label>
              <Textarea
                id="public_notes"
                placeholder="Information visible to participants..."
                rows={3}
                value={form.public_notes}
                onChange={(e) => updateForm("public_notes", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="private_notes">Private Notes</Label>
              <Textarea
                id="private_notes"
                placeholder="Internal notes for coordinators only..."
                rows={3}
                value={form.private_notes}
                onChange={(e) => updateForm("private_notes", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Comma-separated tags, e.g., equinox, multi-day, outdoor"
                value={form.tags}
                onChange={(e) => updateForm("tags", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error banner */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{submitError}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1 || isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        {currentStep < 4 ? (
          <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={isPending}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-sage hover:bg-sage-dark" onClick={handleSubmit} disabled={isPending || !form.title || !form.start_date || !form.end_date}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {isPending ? "Creating…" : "Create Event"}
          </Button>
        )}
      </div>
    </div>
  );
}
