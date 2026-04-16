"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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

type LocationData = {
  venue_name: string;
  address: string;
  gps_lat: number | null;
  gps_lng: number | null;
  parking_notes: string | null;
  entry_instructions: string | null;
  arrival_window: string | null;
  onsite_contact: string | null;
};

type EventData = {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string | null;
  ceremony_notes: string | null;
  start_datetime: string;
  end_datetime: string;
  timezone: string | null;
  capacity: number;
  current_participant_count: number;
  locations: LocationData | null;
};

type ParticipantRow = {
  id: string;
  name: string;
  email: string;
  rsvp: RSVPStatus;
  waiver: WaiverStatus;
  payment: string;
  prep: string;
  dietary: string;
};

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
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [localParticipants, setLocalParticipants] = useState<ParticipantRow[]>([]);
  const [rsvpPending, startRsvpTransition] = useTransition();
  const [waiverPending, startWaiverTransition] = useTransition();

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteAdminOnly, setNoteAdminOnly] = useState(false);
  const [notesPending, startNotesTransition] = useTransition();
  const notesLoadedRef = useRef(false);

  useEffect(() => {
    if (!eventId) return;
    const supabase = createClient();

    // Fetch event details
    supabase
      .from("events")
      .select("id, title, type, status, description, ceremony_notes, start_datetime, end_datetime, timezone, capacity, current_participant_count, locations(venue_name, address, gps_lat, gps_lng, parking_notes, entry_instructions, arrival_window, onsite_contact)")
      .eq("id", eventId)
      .single()
      .then(({ data }) => {
        setEventData(data as unknown as EventData);
        setLoadingEvent(false);
      });

    // Fetch participants for this event
    supabase
      .from("event_participants")
      .select("participant_id, rsvp_status, waiver_status, payment_status, prep_status, participants(full_name, email, dietary_restrictions)")
      .eq("event_id", eventId)
      .then(({ data }) => {
        const rows = (data ?? []).map((ep) => {
          const p = ep.participants as { full_name?: string; email?: string; dietary_restrictions?: string } | null;
          return {
            id: ep.participant_id as string,
            name: p?.full_name ?? "—",
            email: p?.email ?? "",
            rsvp: (ep.rsvp_status ?? "invited") as RSVPStatus,
            waiver: (ep.waiver_status ?? "not_sent") as WaiverStatus,
            payment: (ep.payment_status as string) ?? "unpaid",
            prep: (ep.prep_status as string) ?? "not_started",
            dietary: p?.dietary_restrictions ?? "",
          };
        });
        setLocalParticipants(rows);
      });
  }, [eventId]);

  const loadNotes = () => {
    if (notesLoadedRef.current) return;
    notesLoadedRef.current = true;
    startNotesTransition(async () => {
      const result = await getEventNotes(eventId);
      if (!result.error) setNotes(result.notes);
    });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    startNotesTransition(async () => {
      const result = await addEventNote(eventId, noteText.trim(), noteAdminOnly);
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
      await deleteEventNote(eventId, noteId);
    });
  };

  const handleRsvpChange = (participantId: string, rsvp_status: RSVPStatus) => {
    setLocalParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, rsvp: rsvp_status } : p))
    );
    startRsvpTransition(async () => {
      await updateRSVP(eventId, participantId, rsvp_status);
    });
  };

  const handleWaiverChange = (participantId: string, waiver_status: WaiverStatus) => {
    setLocalParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, waiver: waiver_status } : p))
    );
    startWaiverTransition(async () => {
      await updateWaiverStatus(eventId, participantId, waiver_status);
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
      await sendWaiver(eventId, notSent);
    });
  };

  // Computed readiness from real participant data
  const totalP = localParticipants.length;
  const waiverPct = totalP > 0 ? Math.round((localParticipants.filter((p) => p.waiver === "signed").length / totalP) * 100) : 0;
  const rsvpPct = totalP > 0 ? Math.round((localParticipants.filter((p) => p.rsvp === "confirmed").length / totalP) * 100) : 0;
  const overallPct = totalP > 0 ? Math.round((waiverPct + rsvpPct) / 2) : 0;

  if (loadingEvent) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        <p>Event not found.</p>
        <Link href="/events" className="text-sage hover:underline mt-2 inline-block">Back to Events</Link>
      </div>
    );
  }

  const location = eventData.locations;

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
              <h1 className="text-3xl font-heading font-semibold tracking-tight">{eventData.title}</h1>
              <Badge variant="sage">{eventData.status}</Badge>
              <Badge variant="secondary">{eventData.type}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDateTime(eventData.start_datetime)} - {formatDateTime(eventData.end_datetime)}
              </span>
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {location.venue_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {eventData.current_participant_count}/{eventData.capacity}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${eventData.id}/edit`}>
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
              <p className="text-sm text-muted-foreground">Based on RSVP and waiver completion</p>
            </div>
            <span className="text-3xl font-bold text-sage">{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-3 mb-4" />
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              { label: "Waivers Signed", value: waiverPct, icon: Shield },
              { label: "RSVPs Confirmed", value: rsvpPct, icon: Users },
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
            {eventData.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{eventData.description}</p>
                </CardContent>
              </Card>
            )}
            {location && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Venue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{location.venue_name}</p>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    {location.parking_notes && <p><span className="font-medium">Parking:</span> {location.parking_notes}</p>}
                    {location.entry_instructions && <p><span className="font-medium">Entry:</span> {location.entry_instructions}</p>}
                    {location.arrival_window && <p><span className="font-medium">Arrival:</span> {location.arrival_window}</p>}
                    {location.onsite_contact && <p><span className="font-medium">Contact:</span> {location.onsite_contact}</p>}
                  </div>
                  {location.address && (
                    <a
                      href={getDirectionsLink("", location.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-sage hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Get Directions
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
            {eventData.ceremony_notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ceremony Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{eventData.ceremony_notes}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Admin only
                  </p>
                </CardContent>
              </Card>
            )}
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
                  <Button size="sm" className="bg-sage hover:bg-sage-dark" asChild>
                    <Link href="/participants"><Plus className="mr-2 h-4 w-4" /> Add Participant</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {localParticipants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No participants yet.</p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Providers</CardTitle>
                  <CardDescription>Facilitators, healers, and support staff</CardDescription>
                </div>
                <Button size="sm" className="bg-sage hover:bg-sage-dark" asChild>
                  <Link href="/providers"><Plus className="mr-2 h-4 w-4" /> Manage Providers</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Manage providers from the <Link href="/providers" className="text-sage hover:underline">Providers</Link> section.
              </p>
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
                    {eventData.current_participant_count} participants registered
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={`/events/${eventData.id}/materials`}>
                    <Button variant="outline" size="sm">
                      <Pill className="mr-2 h-4 w-4" /> Dosing Calculator
                    </Button>
                  </Link>
                  <Button size="sm" className="bg-sage hover:bg-sage-dark" asChild>
                    <Link href="/materials"><Plus className="mr-2 h-4 w-4" /> Manage Materials</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Manage materials from the <Link href="/materials" className="text-sage hover:underline">Materials Catalog</Link>.
              </p>
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
                <Button size="sm" className="bg-sage hover:bg-sage-dark" asChild>
                  <Link href="/tasks"><Plus className="mr-2 h-4 w-4" /> Manage Tasks</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Manage tasks from the <Link href="/tasks" className="text-sage hover:underline">Tasks</Link> section.
              </p>
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
              <p className="text-sm text-muted-foreground text-center py-4">
                Schedule management coming soon.
              </p>
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
                <Button size="sm" className="bg-sage hover:bg-sage-dark" asChild>
                  <Link href="/reminders"><Bell className="mr-2 h-4 w-4" /> Manage Reminders</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Manage reminder workflows from the <Link href="/reminders" className="text-sage hover:underline">Reminders</Link> section.
              </p>
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
                <Button size="sm" className="bg-sage hover:bg-sage-dark" asChild>
                  <Link href="/communications"><Mail className="mr-2 h-4 w-4" /> Send Email</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                View the full log in <Link href="/communications" className="text-sage hover:underline">Communications</Link>.
              </p>
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
                <Button size="sm" className="bg-sage hover:bg-sage-dark" asChild>
                  <Link href="/documents"><Plus className="mr-2 h-4 w-4" /> Upload</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-4">
                Manage documents from the <Link href="/documents" className="text-sage hover:underline">Documents</Link> section.
              </p>
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
