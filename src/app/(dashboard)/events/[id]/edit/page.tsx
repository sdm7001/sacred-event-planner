"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";

export default function EditEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "Spring Equinox Retreat",
    type: "retreat",
    status: "confirmed",
    description: "A transformative three-day retreat welcoming the spring season.",
    ceremony_notes: "Opening circle with sage cleansing. Sunrise ceremony on Day 2.",
    start_date: "2026-03-20",
    start_time: "10:00",
    end_date: "2026-03-22",
    end_time: "16:00",
    timezone: "America/Chicago",
    capacity: "20",
    waitlist_enabled: false,
    public_notes: "",
    private_notes: "",
    tags: "equinox, multi-day, retreat",
  });

  const updateForm = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Edit Event</h1>
          <p className="text-muted-foreground mt-1">{form.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => updateForm("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ceremony">Ceremony</SelectItem>
                  <SelectItem value="retreat">Retreat</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateForm("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => updateForm("start_time", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time} onChange={(e) => updateForm("end_time", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Ceremony Notes (Admin Only)</Label>
            <Textarea value={form.ceremony_notes} onChange={(e) => updateForm("ceremony_notes", e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input type="number" value={form.capacity} onChange={(e) => updateForm("capacity", e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label>Waitlist</Label>
              <Switch checked={form.waitlist_enabled} onCheckedChange={(v) => updateForm("waitlist_enabled", v)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input value={form.tags} onChange={(e) => updateForm("tags", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => router.push("/events/1")}>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
