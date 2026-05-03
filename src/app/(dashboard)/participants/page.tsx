"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Plus, Search, Mail, MoreHorizontal, Edit, Trash2, MapPin, Phone, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const seedParticipants = [
  { id: "p1", full_name: "Sarah Johnson", preferred_name: "Sarah", email: "sarah@example.com", phone: "(512) 555-0101", city: "Austin", state: "TX", events: 4, lastEvent: "Spring Equinox", waiver: "signed", prep: "compliant" },
  { id: "p2", full_name: "Michael Rivera", preferred_name: "Mike", email: "michael@example.com", phone: "(512) 555-0102", city: "San Antonio", state: "TX", events: 2, lastEvent: "Spring Equinox", waiver: "signed", prep: "in_progress" },
  { id: "p3", full_name: "Emily Chen", preferred_name: "Em", email: "emily@example.com", phone: "(512) 555-0103", city: "Houston", state: "TX", events: 1, lastEvent: "Spring Equinox", waiver: "not_sent", prep: "not_started" },
  { id: "p4", full_name: "David Kim", preferred_name: "David", email: "david@example.com", phone: "(512) 555-0104", city: "Dallas", state: "TX", events: 3, lastEvent: "Spring Equinox", waiver: "sent", prep: "not_started" },
  { id: "p5", full_name: "Jessica Patel", preferred_name: "Jess", email: "jess@example.com", phone: "(512) 555-0105", city: "Austin", state: "TX", events: 5, lastEvent: "Spring Equinox", waiver: "signed", prep: "compliant" },
  { id: "p6", full_name: "Robert Wilson", preferred_name: "Rob", email: "rob@example.com", phone: "(512) 555-0106", city: "Round Rock", state: "TX", events: 1, lastEvent: "Full Moon Fire", waiver: "signed", prep: "compliant" },
  { id: "p7", full_name: "Amanda Torres", preferred_name: "Amanda", email: "amanda@example.com", phone: "(512) 555-0107", city: "Georgetown", state: "TX", events: 2, lastEvent: "New Moon", waiver: "not_sent", prep: "not_started" },
  { id: "p8", full_name: "James Wright", preferred_name: "James", email: "james@example.com", phone: "(512) 555-0108", city: "Pflugerville", state: "TX", events: 6, lastEvent: "Full Moon Fire", waiver: "signed", prep: "compliant" },
];

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    signed: "bg-green-500",
    compliant: "bg-green-500",
    sent: "bg-blue-500",
    in_progress: "bg-amber-500",
    not_sent: "bg-red-500",
    not_started: "bg-gray-400",
  };
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status] || "bg-gray-400"}`} />
  );
}

export default function ParticipantsPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState(seedParticipants);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = participants.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected((prev) => prev.length === filtered.length ? [] : filtered.map((p) => p.id));
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("participants").delete().eq("id", id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("participants").delete().in("id", selected);
      setParticipants((prev) => prev.filter((p) => !selected.includes(p.id)));
      setSelected([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setDeleting(false);
      setBulkDeleteOpen(false);
    }
  };

  const handleBulkEmail = () => {
    const emails = participants
      .filter((p) => selected.includes(p.id))
      .map((p) => p.email)
      .join(",");
    window.open(`mailto:${emails}`, "_blank");
  };

  const handleSingleEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Participants</h1>
          <p className="text-muted-foreground mt-1">{participants.length} total participants</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => router.push("/participants/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Participant
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or city..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {selected.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkEmail}>
                  <Mail className="mr-2 h-4 w-4" /> Email ({selected.length})
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Remove ({selected.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Events</TableHead>
                <TableHead>Waiver</TableHead>
                <TableHead>Prep</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(p.id)}
                      onCheckedChange={() => toggleSelect(p.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/participants/${p.id}`} className="hover:text-sage transition-colors">
                      <p className="font-medium">{p.full_name}</p>
                      {p.preferred_name !== p.full_name.split(" ")[0] && (
                        <p className="text-xs text-muted-foreground">Goes by {p.preferred_name}</p>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{p.email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {p.phone}
                    </p>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.city}, {p.state}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{p.events}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <StatusDot status={p.waiver} />
                      {p.waiver.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm">
                      <StatusDot status={p.prep} />
                      {p.prep.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/participants/${p.id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSingleEmail(p.email)}>
                          <Mail className="mr-2 h-4 w-4" /> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(p.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Single Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Participant</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove &quot;{participants.find((p) => p.id === deleteTarget)?.full_name}&quot;?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)} disabled={deleting}>
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing...</> : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {selected.length} Participants</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove {selected.length} selected participant{selected.length !== 1 ? "s" : ""}?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing...</> : "Remove All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
