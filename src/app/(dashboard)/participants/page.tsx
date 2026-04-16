"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Users, Plus, Search, Mail, MoreHorizontal, Edit, Trash2, MapPin, Phone, Loader2, AlertCircle } from "lucide-react";
import { removeParticipants, createParticipant } from "@/app/actions/participants";
import { useRouter } from "next/navigation";

interface Participant {
  id: string;
  full_name: string;
  preferred_name?: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
}


const EMPTY_FORM = { full_name: "", preferred_name: "", email: "", phone: "", city: "", state: "" };

export default function ParticipantsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("participants")
      .select("id, full_name, preferred_name, email, phone, city, state")
      .order("full_name")
      .then(({ data }) => {
        setParticipants(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = participants.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected((prev) => prev.length === filtered.length ? [] : filtered.map((p) => p.id));
  };

  const handleBulkRemove = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await removeParticipants(selected);
      if (result.error) {
        setActionError(result.error);
      } else {
        setParticipants((prev) => prev.filter((p) => !selected.includes(p.id)));
        setSelected([]);
        setConfirmRemoveOpen(false);
      }
    });
  };

  const handleAddParticipant = () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      setActionError("Name and email are required.");
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.set(k, v); });
      const result = await createParticipant(fd);
      if (result.error) {
        setActionError(result.error);
      } else {
        setParticipants((prev) => [...prev, result.data as Participant]);
        setAddOpen(false);
        setForm(EMPTY_FORM);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Participants</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading…" : `${participants.length} total participants`}
          </p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => { setForm(EMPTY_FORM); setActionError(null); setAddOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Participant
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
        </div>
      )}

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
                <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)} disabled={isPending}>
                  <Mail className="mr-2 h-4 w-4" />Email ({selected.length})
                </Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmRemoveOpen(true)} disabled={isPending}>
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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
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
                        {p.preferred_name && p.preferred_name !== p.full_name.split(" ")[0] && (
                          <p className="text-xs text-muted-foreground">Goes by {p.preferred_name}</p>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{p.email}</p>
                      {p.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.city && (
                        <span className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {p.city}{p.state ? `, ${p.state}` : ""}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/participants/${p.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelected([p.id]); setEmailDialogOpen(true); }}>
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => { setSelected([p.id]); setConfirmRemoveOpen(true); }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No participants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Participant Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!isPending) { setAddOpen(open); setActionError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {actionError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Preferred Name</Label>
                <Input value={form.preferred_name} onChange={(e) => setForm((f) => ({ ...f, preferred_name: e.target.value }))} placeholder="Jane" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(512) 555-0100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Austin" />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="TX" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleAddParticipant} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Participant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <Dialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {selected.length} participant{selected.length !== 1 ? "s" : ""}?</DialogTitle>
            <DialogDescription>
              This will permanently delete the selected participant{selected.length !== 1 ? "s" : ""} and all associated records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemoveOpen(false)} disabled={isPending}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkRemove} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {selected.length} participant{selected.length !== 1 ? "s" : ""}</DialogTitle>
            <DialogDescription>
              Navigate to an event&apos;s Communications tab to select a template and send targeted emails.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Close</Button>
            <Link href="/communications">
              <Button className="bg-sage hover:bg-sage-dark"><Mail className="mr-2 h-4 w-4" /> Go to Communications</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
