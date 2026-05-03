"use client";
export const dynamic = 'force-dynamic';

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Plus,
  Search,
  Users,
  MapPin,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const seedEvents = [
  {
    id: "1",
    title: "Spring Equinox Retreat",
    type: "Retreat",
    status: "confirmed",
    start_datetime: "2026-03-20T10:00:00",
    end_datetime: "2026-03-22T16:00:00",
    location: "Sacred Valley Ranch",
    participants: 18,
    capacity: 20,
    coordinator: "Maya Chen",
    readiness: 82,
    tags: ["equinox", "multi-day"],
  },
  {
    id: "2",
    title: "New Moon Ceremony",
    type: "Ceremony",
    status: "scheduled",
    start_datetime: "2026-03-29T18:00:00",
    end_datetime: "2026-03-29T23:00:00",
    location: "Riverside Temple",
    participants: 12,
    capacity: 15,
    coordinator: "Maya Chen",
    readiness: 65,
    tags: ["moon", "evening"],
  },
  {
    id: "3",
    title: "Summer Solstice Gathering",
    type: "Festival",
    status: "draft",
    start_datetime: "2026-06-20T08:00:00",
    end_datetime: "2026-06-21T20:00:00",
    location: "Hilltop Meadow",
    participants: 0,
    capacity: 30,
    coordinator: "River Stone",
    readiness: 15,
    tags: ["solstice", "outdoor"],
  },
  {
    id: "4",
    title: "Full Moon Fire Circle",
    type: "Ceremony",
    status: "completed",
    start_datetime: "2026-02-12T19:00:00",
    end_datetime: "2026-02-12T23:00:00",
    location: "Riverside Temple",
    participants: 14,
    capacity: 15,
    coordinator: "Maya Chen",
    readiness: 100,
    tags: ["moon", "fire"],
  },
  {
    id: "5",
    title: "Autumn Harvest Celebration",
    type: "Festival",
    status: "canceled",
    start_datetime: "2025-09-22T10:00:00",
    end_datetime: "2025-09-23T18:00:00",
    location: "Sacred Valley Ranch",
    participants: 8,
    capacity: 25,
    coordinator: "River Stone",
    readiness: 45,
    tags: ["harvest", "outdoor"],
  },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "confirmed": return "sage" as const;
    case "scheduled": return "default" as const;
    case "draft": return "secondary" as const;
    case "completed": return "earth" as const;
    case "canceled": return "destructive" as const;
    case "in_progress": return "warm" as const;
    default: return "outline" as const;
  }
}

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [events, setEvents] = useState(seedEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("events").delete().eq("id", deleteTarget);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = (eventId: string) => {
    const source = events.find((e) => e.id === eventId);
    if (!source) return;
    const copy = {
      ...source,
      id: `copy-${Date.now()}`,
      title: `${source.title} (Copy)`,
      status: "draft",
      readiness: 0,
      participants: 0,
    };
    setEvents((prev) => [copy, ...prev]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Events</h1>
          <p className="text-muted-foreground mt-1">Manage your ceremonies, retreats, and gatherings</p>
        </div>
        <Link href="/events/new">
          <Button className="bg-sage hover:bg-sage-dark">
            <Plus className="mr-2 h-4 w-4" /> New Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Readiness</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <CalendarDays className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No events found</p>
                      <Link href="/events/new">
                        <Button variant="outline" size="sm">Create your first event</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((event) => (
                  <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/events/${event.id}`)}>
                    <TableCell>
                      <div>
                        <p className="font-medium hover:text-sage transition-colors">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(event.start_datetime)}</p>
                        <p className="text-xs text-muted-foreground">to {formatDate(event.end_datetime)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {event.participants}/{event.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={event.readiness} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">{event.readiness}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(event.status)}>
                        {event.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.id}/edit`); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(event.id); }}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteTarget(event.id); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &quot;{events.find((e) => e.id === deleteTarget)?.title}&quot;?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading events…</div>}>
      <EventsContent />
    </Suspense>
  );
}
