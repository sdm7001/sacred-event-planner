"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRSVP, updateWaiverStatus, sendWaiver, type RSVPStatus, type WaiverStatus } from "@/app/actions/event-participants";
import { addEventNote, getEventNotes, deleteEventNote, type Note } from "@/app/actions/notes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Edit,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Package,
  Bell,
  Mail,
  CheckSquare,
  FileText,
  StickyNote,
  ExternalLink,
  Plus,
  Shield,
  Pill,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDateTime, getDirectionsLink } from "@/lib/utils";

// Demo data
const event = {
  id: "1",
  title: "Spring Equinox Retreat",
  type: "Retreat",
  status: "confirmed",
  description: "A transformative three-day retreat welcoming the spring season with ceremony, reflection, and community connection.",
  ceremony_notes: "Opening circle with sage cleansing. Sunrise ceremony on Day 2. Closing integration circle on Day 3.",
  start_datetime: "2026-03-20T10:00:00",
  end_datetime: "2026-03-22T16:00:00",
  timezone: "America/Chicago",
  capacity: 20,
  current_participant_count: 18,
  coordinator: "Maya Chen",
  location: {
    venue_name: "Sacred Valley Ranch",
    address: "4521 Valley Road, Hill Country, TX 78669",
    gps_lat: 30.3274,
    gps_lng: -98.1247,
    parking_notes: "Gravel lot at main gate. Overflow parking in south meadow.",
    entry_instructions: "Gate code: 4521#. Follow signs to main lodge.",
    arrival_window: "9:00 AM - 10:00 AM",
    onsite_contact: "River Stone (512) 555-0142",
  },
  readiness: {
    waivers: 78,
    rsvp: 90,
    materials: 70,
    tasks: 65,
    reminders: true,
    overall: 82,
  },
  tags: ["equinox", "multi-day", "retreat"],
};

const participants = [
  { id: "p1", name: "Sarah Johnson", email: "sarah@example.com", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant", dietary: "Vegetarian" },
  { id: "p2", name: "Michael Rivera", email: "michael@example.com", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "in_progress", dietary: "" },
  { id: "p3", name: "Emily Chen", email: "emily@example.com", rsvp: "confirmed", waiver: "not_sent", payment: "unpaid", prep: "not_started", dietary: "Vegan" },
  { id: "p4", name: "David Kim", email: "david@example.com", rsvp: "tentative", waiver: "sent", payment: "partial", prep: "not_started", dietary: "" },
  { id: "p5", name: "Jessica Patel", email: "jess@example.com", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant", dietary: "GF" },
];

const providers = [
  { id: "pr1", name: "River Stone", role: "Lead Facilitator", arrival: "Mar 19, 6 PM", responsibilities: "Opening/closing circles, sunrise ceremony" },
  { id: "pr2", name: "Luna Martinez", role: "Sound Healer", arrival: "Mar 20, 8 AM", responsibilities: "Sound bath sessions, live music" },
  { id: "pr3", name: "Oak Williams", role: "Cook", arrival: "Mar 19, 2 PM", responsibilities: "All meals, dietary accommodations" },
];

const materials = [
  { id: "m1", name: "White Sage Bundle", category: "Ceremonial", required: 25, stock: 15, toPurchase: 10, status: "to_order" },
  { id: "m2", name: "Ceremonial Candles", category: "Ceremonial", required: 40, stock: 8, toPurchase: 32, status: "ordered" },
  { id: "m3", name: "Meditation Cushions", category: "Equipment", required: 22, stock: 22, toPurchase: 0, status: "in_stock" },
  { id: "m4", name: "Purified Water (gal)", category: "Consumable", required: 30, stock: 5, toPurchase: 25, status: "to_order" },
];

const tasks = [
  { id: "t1", title: "Confirm venue access", priority: "high", status: "pending", due: "Mar 15", owner: "Maya Chen" },
  { id: "t2", title: "Send prep instructions", priority: "urgent", status: "pending", due: "Mar 12", owner: "Maya Chen" },
  { id: "t3", title: "Print waiver forms", priority: "medium", status: "completed", due: "Mar 18", owner: "River Stone" },
  { id: "t4", title: "Arrange transportation", priority: "medium", status: "in_progress", due: "Mar 17", owner: "Luna Martinez" },
];

const checklist = [
  { id: "c1", title: "Venue confirmed and deposit paid", done: true },
  { id: "c2", title: "All providers confirmed", done: true },
  { id: "c3", title: "Materials ordered", done: false },
  { id: "c4", title: "Prep instructions sent to all participants", done: false },
  { id: "c5", title: "Emergency contacts collected", done: true },
  { id: "c6", title: "Dietary requirements documented", done: false },
  { id: "c7", title: "Insurance coverage verified", done: true },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    signed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    compliant: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    in_stock: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    tentative: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    partial: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    ordered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    not_started: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    not_sent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    unpaid: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    to_order: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || colors.pending}`}>
      {status.replace("_", " ")}
    </span>
  );
}

type ParticipantRow = typeof participants[number] & { rsvp: RSVPStatus; waiver: WaiverStatus };

export default function EventDetailPage() {
  const [localParticipants, setLocalParticipants] = useState<ParticipantRow[]>(
    participants as ParticipantRow[]
  );
  const [rsvpPending, startRsvpTransition] = useTransition();
  const [waiverPending, startWaiverTransition] = useTransition();

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteAdminOnly, setNoteAdminOnly] = useState(false);
  const [notesPending, startNotesTransition] = useTransition();
  const notesLoadedRef = useRef(false);

  const loadNotes = () => {
    if (notesLoadedRef.current) return;
    notesLoadedRef.current = true;
    startNotesTransition(async () => {
      const result = await getEventNotes(event.id);
      if (!result.error) setNotes(result.notes);
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    startNotesTransition(async () => {
      const result = await addEventNote(event.id, noteText.trim(), noteAdminOnly);
      if (!result.error && result.data) {
        setNotes((prev) => [result.data as Note, ...prev]);
        setNoteText("");
        setNoteAdminOnly(false);
      }
    });
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    startNotesTransition(async () => {
      await deleteEventNote(event.id, noteId);
    });
  };

  const handleRsvpChange = (participantId: string, rsvp_status: RSVPStatus) => {
    setLocalParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, rsvp: rsvp_status } : p))
    );
    startRsvpTransition(async () => {
      await updateRSVP(event.id, participantId, rsvp_status);
    });
  };

  const handleWaiverChange = (participantId: string, waiver_status: WaiverStatus) => {
    setLocalParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, waiver: waiver_status } : p))
    );
    startWaiverTransition(async () => {
      await updateWaiverStatus(event.id, participantId, waiver_status);
    });
  };

  const handleSendAllWaivers = () => {
    const notSent = localParticipants
      .filter((p) => p.waiver === "not_sent")
      .map((p) => p.id);
    if (notSent.length === 0) return;
    setLocalParticipants((prev) =>
      prev.map((p) => (notSent.includes(p.id) ? { ...p, waiver: "sent" as WaiverStatus } : p))
    );
    startWaiverTransition(async () => {
      await sendWaiver(event.id, notSent);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-semibold tracking-tight">{event.title}</h1>
              <Badge variant="sage">{event.status}</Badge>
              <Badge variant="secondary">{event.type}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDateTime(event.start_datetime)} - {formatDateTime(event.end_datetime)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location.venue_name}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.current_participant_count}/{event.capacity}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Readiness Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Event Readiness</h3>
              <p className="text-sm text-muted-foreground">Overall preparation status</p>
            </div>
            <span className="text-3xl font-bold text-sage">{event.readiness.overall}%</span>
          </div>
          <Progress value={event.readiness.overall} className="h-3 mb-4" />
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Waivers", value: event.readiness.waivers, icon: Shield },
              { label: "RSVPs", value: event.readiness.rsvp, icon: Users },
              { label: "Materials", value: event.readiness.materials, icon: Package },
              { label: "Tasks", value: event.readiness.tasks, icon: CheckSquare },
              { label: "Reminders", value: event.readiness.reminders ? 100 : 0, icon: Bell },
            ].map((metric) => (
              <div key={metric.label} className="text-center">
                <metric.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-sm font-semibold">{metric.value}%</p>
                <Progress value={metric.value} className="h-1 mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={(v) => { if (v === "notes") loadNotes(); }}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {[
            { value: "overview", label: "Overview", icon: CalendarDays },
            { value: "participants", label: "Participants", icon: Users },
            { value: "providers", label: "Providers", icon: Users },
            { value: "materials", label: "Materials", icon: Package },
            { value: "tasks", label: "Tasks", icon: CheckSquare },
            { value: "schedule", label: "Schedule", icon: Clock },
            { value: "reminders", label: "Reminders", icon: Bell },
            { value: "comms", label: "Communications", icon: Mail },
            { value: "documents", label: "Documents", icon: FileText },
            { value: "notes", label: "Notes", icon: StickyNote },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-sage/10 data-[state=active]:text-sage-700 dark:data-[state=active]:text-sage-300 rounded-md border"
            >
              <tab.icon className="mr-1.5 h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{event.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Venue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{event.location.venue_name}</p>
                  <p className="text-sm text-muted-foreground">{event.location.address}</p>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Parking:</span> {event.location.parking_notes}</p>
                  <p><span className="font-medium">Entry:</span> {event.location.entry_instructions}</p>
                  <p><span className="font-medium">Arrival:</span> {event.location.arrival_window}</p>
                  <p><span className="font-medium">Contact:</span> {event.location.onsite_contact}</p>
                </div>
                <a
                  href={getDirectionsLink("", event.location.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-sage hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Get Directions
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ceremony Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{event.ceremony_notes}</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Admin only
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pre-Event Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox checked={item.done} />
                      <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Participants ({localParticipants.length})</CardTitle>
                  <CardDescription>Manage attendees for this event</CardDescription>
                </div>
                <div className="flex gap-2">
                  {localParticipants.some((p) => p.waiver === "not_sent") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendAllWaivers}
                      disabled={waiverPending}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Waivers ({localParticipants.filter((p) => p.waiver === "not_sent").length})
                    </Button>
                  )}
                  <Button size="sm" className="bg-sage hover:bg-sage-dark">
                    <Plus className="mr-2 h-4 w-4" /> Add Participant
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>RSVP</TableHead>
                    <TableHead>Waiver</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Prep</TableHead>
                    <TableHead>Dietary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localParticipants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link href={`/participants/${p.id}`} className="hover:text-sage transition-colors">
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.rsvp}
                          onValueChange={(v) => handleRsvpChange(p.id, v as RSVPStatus)}
                          disabled={rsvpPending}
                        >
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["invited","confirmed","tentative","declined","waitlisted"] as RSVPStatus[]).map((s) => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={p.waiver}
                          onValueChange={(v) => handleWaiverChange(p.id, v as WaiverStatus)}
                          disabled={waiverPending}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["not_sent","sent","signed","expired"] as WaiverStatus[]).map((s) => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace("_"," ")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell><StatusBadge status={p.payment} /></TableCell>
                      <TableCell><StatusBadge status={p.prep} /></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.dietary || "---"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Providers ({providers.length})</CardTitle>
                  <CardDescription>Facilitators, healers, and support staff</CardDescription>
                </div>
                <Button size="sm" className="bg-sage hover:bg-sage-dark">
                  <Plus className="mr-2 h-4 w-4" /> Add Provider
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Responsibilities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {providers.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link href={`/providers/${p.id}`} className="hover:text-sage transition-colors">
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{p.role}</Badge></TableCell>
                      <TableCell className="text-sm">{p.arrival}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{p.responsibilities}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Materials & Supplies</CardTitle>
                  <CardDescription>
                    Auto-calculated based on {event.current_participant_count} participants and {providers.length} providers
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={`/events/${event.id}/materials`}>
                    <Button variant="outline" size="sm">
                      <Pill className="mr-2 h-4 w-4" /> Dosing Calculator
                    </Button>
                  </Link>
                  <Button size="sm" className="bg-sage hover:bg-sage-dark">
                    <Plus className="mr-2 h-4 w-4" /> Add Material
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Required</TableHead>
                    <TableHead className="text-right">In Stock</TableHead>
                    <TableHead className="text-right">To Purchase</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                      <TableCell className="text-right">{m.required}</TableCell>
                      <TableCell className="text-right">{m.stock}</TableCell>
                      <TableCell className="text-right font-medium">
                        {m.toPurchase > 0 ? (
                          <span className="text-amber-600">{m.toPurchase}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </TableCell>
                      <TableCell><StatusBadge status={m.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tasks</CardTitle>
                  <CardDescription>Track preparation tasks for this event</CardDescription>
                </div>
                <Button size="sm" className="bg-sage hover:bg-sage-dark">
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Owner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell><StatusBadge status={t.priority} /></TableCell>
                      <TableCell><StatusBadge status={t.status} /></TableCell>
                      <TableCell className="text-sm">{t.due}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Event Schedule</CardTitle>
              <CardDescription>Sessions and activities timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Day 1 - Mar 20", "Day 2 - Mar 21", "Day 3 - Mar 22"].map((day, i) => (
                  <div key={day}>
                    <h4 className="font-semibold text-sm mb-3">{day}</h4>
                    <div className="space-y-2 ml-4 border-l-2 border-sage/20 pl-4">
                      {i === 0 && (
                        <>
                          <ScheduleItem time="9:00-10:00 AM" title="Arrival & Check-in" />
                          <ScheduleItem time="10:30 AM" title="Opening Circle" facilitator="River Stone" />
                          <ScheduleItem time="12:30 PM" title="Communal Lunch" />
                          <ScheduleItem time="3:00 PM" title="Sound Healing Session" facilitator="Luna Martinez" />
                          <ScheduleItem time="6:00 PM" title="Dinner" />
                          <ScheduleItem time="8:00 PM" title="Evening Fire Circle" facilitator="River Stone" />
                        </>
                      )}
                      {i === 1 && (
                        <>
                          <ScheduleItem time="5:30 AM" title="Sunrise Ceremony" facilitator="River Stone" />
                          <ScheduleItem time="8:00 AM" title="Breakfast" />
                          <ScheduleItem time="10:00 AM" title="Workshop: Inner Journey" facilitator="River Stone" />
                          <ScheduleItem time="12:30 PM" title="Lunch" />
                          <ScheduleItem time="2:00 PM" title="Free Time / Nature Walk" />
                          <ScheduleItem time="4:00 PM" title="Sound Bath" facilitator="Luna Martinez" />
                          <ScheduleItem time="6:30 PM" title="Dinner" />
                          <ScheduleItem time="8:30 PM" title="Sharing Circle" />
                        </>
                      )}
                      {i === 2 && (
                        <>
                          <ScheduleItem time="7:00 AM" title="Morning Meditation" />
                          <ScheduleItem time="8:30 AM" title="Breakfast" />
                          <ScheduleItem time="10:00 AM" title="Integration Workshop" facilitator="River Stone" />
                          <ScheduleItem time="12:00 PM" title="Closing Circle" facilitator="River Stone" />
                          <ScheduleItem time="1:00 PM" title="Farewell Lunch" />
                          <ScheduleItem time="3:00-4:00 PM" title="Departure" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reminder Workflows</CardTitle>
                  <CardDescription>Automated communications before the event</CardDescription>
                </div>
                <Button size="sm" className="bg-sage hover:bg-sage-dark">
                  <Plus className="mr-2 h-4 w-4" /> Add Reminder
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { offset: "7 days before", title: "Prep instructions reminder", audience: "All participants", status: "active" },
                  { offset: "3 days before", title: "Travel & arrival details", audience: "All participants", status: "active" },
                  { offset: "1 day before", title: "Final reminder with directions", audience: "All participants", status: "active" },
                  { offset: "3 days before", title: "Provider schedule & responsibilities", audience: "All providers", status: "active" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Bell className="h-4 w-4 text-sage" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">{r.audience} -- {r.offset}</p>
                    </div>
                    <Badge variant="sage">{r.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="comms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Communications Log</CardTitle>
                  <CardDescription>All sent and scheduled communications</CardDescription>
                </div>
                <Button size="sm" className="bg-sage hover:bg-sage-dark">
                  <Mail className="mr-2 h-4 w-4" /> Send Email
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: "Mar 10", subject: "Welcome & What to Expect", recipients: 18, status: "delivered" },
                  { date: "Mar 8", subject: "Registration Confirmation", recipients: 18, status: "delivered" },
                  { date: "Mar 5", subject: "Invitation to Spring Equinox", recipients: 25, status: "delivered" },
                ].map((msg, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground">{msg.recipients} recipients -- {msg.date}</p>
                    </div>
                    <StatusBadge status={msg.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Event files and attachments</CardDescription>
                </div>
                <Button size="sm" className="bg-sage hover:bg-sage-dark">
                  <Plus className="mr-2 h-4 w-4" /> Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Liability Waiver - Spring 2026.pdf", size: "245 KB", date: "Mar 1" },
                  { name: "Venue Contract.pdf", size: "1.2 MB", date: "Feb 15" },
                  { name: "Emergency Protocol.pdf", size: "89 KB", date: "Feb 20" },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.size} -- uploaded {doc.date}</p>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Internal notes and observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note..."
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="admin-only"
                      checked={noteAdminOnly}
                      onCheckedChange={(v) => setNoteAdminOnly(!!v)}
                    />
                    <label htmlFor="admin-only" className="text-sm text-muted-foreground">Admin only</label>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={notesPending || !noteText.trim()}
                    className="bg-sage hover:bg-sage-dark"
                  >
                    {notesPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
                    Add Note
                  </Button>
                </div>
              </div>
              <Separator />
              {notesPending && notes.length === 0 ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg border group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {note.is_admin_only && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="mr-1 h-3 w-3" /> Admin
                            </Badge>
                          )}
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScheduleItem({ time, title, facilitator }: { time: string; title: string; facilitator?: string }) {
  return (
    <div className="flex items-start gap-3 py-1">
      <div className="w-2 h-2 rounded-full bg-sage mt-1.5 shrink-0" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {time}
          {facilitator && <span>-- {facilitator}</span>}
        </div>
      </div>
    </div>
  );
}
