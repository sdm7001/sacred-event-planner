"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteProvider, createProvider } from "@/app/actions/providers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Mail, MapPin, Loader2, AlertCircle } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Provider {
  id: string;
  full_name: string;
  role_type?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  contract_status?: string;
  rate?: string;
}

const EMPTY_FORM = { full_name: "", role_type: "", email: "", phone: "", city: "", state: "", rate: "" };

function contractColor(status: string) {
  switch (status) {
    case "active": return "sage" as const;
    case "pending": return "warm" as const;
    case "expired": return "destructive" as const;
    default: return "secondary" as const;
  }
}

export default function ProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("providers")
      .select("id, full_name, role_type, email, phone, city, state, contract_status, rate")
      .order("full_name")
      .then(({ data }) => {
        setProviders((data ?? []) as Provider[]);
        setLoading(false);
      });
  }, []);

  const filtered = providers.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.role_type ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.full_name.trim()) { setActionError("Name is required."); return; }
    setActionError(null);
    startTransition(async () => {
      const result = await createProvider({
        full_name: form.full_name.trim(),
        role_type: form.role_type || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        rate: form.rate || undefined,
      });
      if (result.error) { setActionError(result.error); return; }
      if (result.data) setProviders((prev) => [...prev, result.data as Provider]);
      setAddOpen(false);
      setForm(EMPTY_FORM);
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setActionError(null);
    startTransition(async () => {
      const result = await deleteProvider(deleteTarget.id);
      if (result.error) { setActionError(result.error); return; }
      setProviders((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Providers</h1>
          <p className="text-muted-foreground mt-1">Facilitators, healers, and support staff</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => { setForm(EMPTY_FORM); setActionError(null); setAddOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Provider
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/providers/${p.id}`} className="font-medium hover:text-sage transition-colors">
                      {p.full_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {p.role_type && <Badge variant="outline">{p.role_type}</Badge>}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{p.email ?? "—"}</p>
                    {p.phone && <p className="text-xs text-muted-foreground">{p.phone}</p>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {(p.city || p.state) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {[p.city, p.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{p.rate ?? "—"}</TableCell>
                  <TableCell>
                    {p.contract_status && (
                      <Badge variant={contractColor(p.contract_status)}>{p.contract_status}</Badge>
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
                        <DropdownMenuItem onClick={() => router.push(`/providers/${p.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {p.email && (
                          <DropdownMenuItem onClick={() => { window.location.href = `mailto:${p.email}`; }}>
                            <Mail className="mr-2 h-4 w-4" /> Contact
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(p)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    No providers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Provider Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!isPending) { setAddOpen(open); setActionError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {actionError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="River Stone" />
              </div>
              <div className="space-y-1.5">
                <Label>Role / Specialty</Label>
                <Input value={form.role_type} onChange={(e) => setForm((f) => ({ ...f, role_type: e.target.value }))} placeholder="Lead Facilitator" />
              </div>
              <div className="space-y-1.5">
                <Label>Rate</Label>
                <Input value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} placeholder="$150/hr" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="provider@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(512) 555-0100" />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Austin" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleAdd} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove &ldquo;{deleteTarget?.full_name}&rdquo;?</DialogTitle>
            <DialogDescription>
              This will permanently remove this provider from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isPending}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
