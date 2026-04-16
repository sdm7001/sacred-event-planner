"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Package, AlertTriangle, MoreHorizontal, Edit, Loader2, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getMaterials, createMaterial, updateMaterial, restockMaterial, type MaterialRecord } from "@/app/actions/materials-catalog";

const CATEGORIES = ["Ceremonial", "Consumable", "Equipment", "Safety", "Medicine", "Other"];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  // Add material dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", category: "Ceremonial", unit_of_measure: "", in_house_qty: "0", reorder_threshold: "10", vendor: "" });

  // Edit dialog
  const [editTarget, setEditTarget] = useState<MaterialRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", unit_of_measure: "", reorder_threshold: "0", vendor: "" });

  // Restock dialog
  const [restockTarget, setRestockTarget] = useState<MaterialRecord | null>(null);
  const [restockQty, setRestockQty] = useState("0");

  useEffect(() => {
    startTransition(async () => {
      const result = await getMaterials();
      if (!result.error) setMaterials(result.materials);
    });
  }, []);

  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || m.category === category;
    return matchSearch && matchCategory;
  });

  const lowStock = materials.filter((m) => m.in_house_qty < m.reorder_threshold);

  const openEdit = (m: MaterialRecord) => {
    setEditTarget(m);
    setEditForm({ name: m.name, category: m.category, unit_of_measure: m.unit_of_measure, reorder_threshold: String(m.reorder_threshold), vendor: m.vendor ?? "" });
  };

  const handleAdd = () => {
    if (!addForm.name.trim()) { setActionError("Name is required"); return; }
    setActionError(null);
    startTransition(async () => {
      const result = await createMaterial({
        name: addForm.name.trim(),
        category: addForm.category,
        unit_of_measure: addForm.unit_of_measure,
        in_house_qty: Number(addForm.in_house_qty),
        reorder_threshold: Number(addForm.reorder_threshold),
        vendor: addForm.vendor || undefined,
      });
      if (result.error) { setActionError(result.error); return; }
      setMaterials((prev) => [...prev, result.data as MaterialRecord]);
      setIsAddOpen(false);
      setAddForm({ name: "", category: "Ceremonial", unit_of_measure: "", in_house_qty: "0", reorder_threshold: "10", vendor: "" });
    });
  };

  const handleEdit = () => {
    if (!editTarget) return;
    setActionError(null);
    startTransition(async () => {
      const result = await updateMaterial(editTarget.id, {
        name: editForm.name.trim(),
        category: editForm.category,
        unit_of_measure: editForm.unit_of_measure,
        reorder_threshold: Number(editForm.reorder_threshold),
        vendor: editForm.vendor || undefined,
      });
      if (result.error) { setActionError(result.error); return; }
      setMaterials((prev) => prev.map((m) => m.id === editTarget.id ? { ...m, ...editForm, reorder_threshold: Number(editForm.reorder_threshold) } : m));
      setEditTarget(null);
    });
  };

  const handleRestock = () => {
    if (!restockTarget) return;
    const qty = Number(restockQty);
    if (!qty || qty <= 0) { setActionError("Enter a valid quantity"); return; }
    setActionError(null);
    startTransition(async () => {
      const result = await restockMaterial(restockTarget.id, qty);
      if (result.error) { setActionError(result.error); return; }
      setMaterials((prev) => prev.map((m) => m.id === restockTarget.id ? { ...m, in_house_qty: m.in_house_qty + qty } : m));
      setRestockTarget(null);
      setRestockQty("0");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Materials Catalog</h1>
          <p className="text-muted-foreground mt-1">{materials.length} materials — {lowStock.length} below threshold</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => { setIsAddOpen(true); setActionError(null); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}

      {lowStock.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="font-medium text-amber-800 dark:text-amber-200">Low Stock Alerts ({lowStock.length})</p>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {lowStock.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded bg-background border">
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.in_house_qty}/{m.reorder_threshold} {m.unit_of_measure}</p>
                  </div>
                  <Progress value={(m.in_house_qty / m.reorder_threshold) * 100} className="w-16 h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search materials..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">In Stock</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No materials found
                  </TableCell>
                </TableRow>
              ) : filtered.map((m) => {
                const pct = m.reorder_threshold > 0 ? (m.in_house_qty / m.reorder_threshold) * 100 : 100;
                const isLow = m.in_house_qty < m.reorder_threshold;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                    <TableCell className="text-sm">{m.unit_of_measure}</TableCell>
                    <TableCell className="text-right font-medium">{m.in_house_qty}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{m.reorder_threshold}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(pct, 100)} className="w-20 h-2" />
                        {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.vendor ?? "—"}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(m)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setRestockTarget(m); setRestockQty("0"); setActionError(null); }}>
                            <Package className="mr-2 h-4 w-4" /> Restock
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Material Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(o) => { if (!isPending) setIsAddOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Material</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name *</Label>
              <Input value={addForm.name} onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., White Sage Bundle" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Category</Label>
                <Select value={addForm.category} onValueChange={(v) => setAddForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Unit</Label>
                <Input value={addForm.unit_of_measure} onChange={(e) => setAddForm((p) => ({ ...p, unit_of_measure: e.target.value }))} placeholder="bundles, ml, units…" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>In Stock</Label>
                <Input type="number" min={0} value={addForm.in_house_qty} onChange={(e) => setAddForm((p) => ({ ...p, in_house_qty: e.target.value }))} />
              </div>
              <div className="space-y-1.5"><Label>Reorder Threshold</Label>
                <Input type="number" min={0} value={addForm.reorder_threshold} onChange={(e) => setAddForm((p) => ({ ...p, reorder_threshold: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5"><Label>Vendor</Label>
              <Input value={addForm.vendor} onChange={(e) => setAddForm((p) => ({ ...p, vendor: e.target.value }))} placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleAdd} disabled={isPending || !addForm.name.trim()}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o && !isPending) setEditTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Material</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Category</Label>
                <Select value={editForm.category} onValueChange={(v) => setEditForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Unit</Label>
                <Input value={editForm.unit_of_measure} onChange={(e) => setEditForm((p) => ({ ...p, unit_of_measure: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Reorder Threshold</Label>
                <Input type="number" min={0} value={editForm.reorder_threshold} onChange={(e) => setEditForm((p) => ({ ...p, reorder_threshold: e.target.value }))} />
              </div>
              <div className="space-y-1.5"><Label>Vendor</Label>
                <Input value={editForm.vendor} onChange={(e) => setEditForm((p) => ({ ...p, vendor: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleEdit} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={!!restockTarget} onOpenChange={(o) => { if (!o && !isPending) setRestockTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Restock: {restockTarget?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Current stock: <strong>{restockTarget?.in_house_qty} {restockTarget?.unit_of_measure}</strong>
            </p>
            <div className="space-y-1.5">
              <Label>Quantity to Add</Label>
              <Input type="number" min={1} value={restockQty} onChange={(e) => setRestockQty(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRestock()} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockTarget(null)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleRestock} disabled={isPending || Number(restockQty) <= 0}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />} Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
