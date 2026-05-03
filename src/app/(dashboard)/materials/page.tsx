"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, Package, AlertTriangle, MoreHorizontal, Edit, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

type Material = {
  id: string;
  name: string;
  category: string;
  unit: string;
  inHouse: number;
  threshold: number;
  vendor: string;
  active: boolean;
};

const seedMaterials: Material[] = [
  { id: "1", name: "White Sage Bundle", category: "Ceremonial", unit: "bundles", inHouse: 15, threshold: 20, vendor: "Sacred Herb Co.", active: true },
  { id: "2", name: "Palo Santo Sticks", category: "Ceremonial", unit: "sticks", inHouse: 45, threshold: 30, vendor: "Sacred Herb Co.", active: true },
  { id: "3", name: "Ceremonial Candles", category: "Ceremonial", unit: "units", inHouse: 8, threshold: 20, vendor: "Beeswax Naturals", active: true },
  { id: "4", name: "Purified Water", category: "Consumable", unit: "gallons", inHouse: 5, threshold: 15, vendor: "Spring Valley", active: true },
  { id: "5", name: "Meditation Cushions", category: "Equipment", unit: "units", inHouse: 22, threshold: 20, vendor: "Zen Supplies", active: true },
  { id: "6", name: "Blankets (Wool)", category: "Equipment", unit: "units", inHouse: 30, threshold: 25, vendor: "Pendleton", active: true },
  { id: "7", name: "First Aid Kit", category: "Safety", unit: "kits", inHouse: 3, threshold: 2, vendor: "MedSupply", active: true },
  { id: "8", name: "Fire Pit Wood (cord)", category: "Consumable", unit: "cords", inHouse: 2, threshold: 3, vendor: "Local Ranch", active: true },
  { id: "9", name: "Ceremonial Tea", category: "Medicine", unit: "ml", inHouse: 200, threshold: 100, vendor: "---", active: true },
  { id: "10", name: "Rapeh", category: "Medicine", unit: "grams", inHouse: 50, threshold: 30, vendor: "---", active: true },
];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(seedMaterials);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // Edit dialog state
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Restock dialog state
  const [restockMaterial, setRestockMaterial] = useState<Material | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  // Add dialog state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState<Omit<Material, "id" | "active">>({
    name: "", category: "Ceremonial", unit: "", inHouse: 0, threshold: 0, vendor: "",
  });

  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || m.category === category;
    return matchSearch && matchCategory;
  });

  const lowStock = materials.filter((m) => m.inHouse < m.threshold);

  const handleSaveEdit = async () => {
    if (!editMaterial) return;
    setSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("materials").update({
        name: editMaterial.name,
        category: editMaterial.category,
        unit: editMaterial.unit,
        in_house_qty: editMaterial.inHouse,
        reorder_threshold: editMaterial.threshold,
        vendor: editMaterial.vendor,
      }).eq("id", editMaterial.id);
      setMaterials((prev) => prev.map((m) => m.id === editMaterial.id ? editMaterial : m));
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
      setIsEditOpen(false);
    }
  };

  const handleRestock = async () => {
    if (!restockMaterial || !restockQty) return;
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) return;
    setSaving(true);
    try {
      const newQty = restockMaterial.inHouse + qty;
      const supabase = createClient();
      await supabase.from("materials").update({ in_house_qty: newQty }).eq("id", restockMaterial.id);
      setMaterials((prev) =>
        prev.map((m) => m.id === restockMaterial.id ? { ...m, inHouse: newQty } : m)
      );
    } catch (err) {
      console.error("Restock failed:", err);
    } finally {
      setSaving(false);
      setIsRestockOpen(false);
      setRestockQty("");
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.from("materials").insert({
        name: newMaterial.name,
        category: newMaterial.category,
        unit: newMaterial.unit,
        in_house_qty: newMaterial.inHouse,
        reorder_threshold: newMaterial.threshold,
        vendor: newMaterial.vendor,
      }).select().single();

      const added: Material = {
        id: data?.id || `new-${Date.now()}`,
        ...newMaterial,
        active: true,
      };
      setMaterials((prev) => [...prev, added]);
    } catch (err) {
      console.error("Add failed:", err);
      // Still add locally for demo
      setMaterials((prev) => [...prev, { id: `new-${Date.now()}`, ...newMaterial, active: true }]);
    } finally {
      setSaving(false);
      setIsAddOpen(false);
      setNewMaterial({ name: "", category: "Ceremonial", unit: "", inHouse: 0, threshold: 0, vendor: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Materials Catalog</h1>
          <p className="text-muted-foreground mt-1">{materials.length} materials -- {lowStock.length} below threshold</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="font-medium text-amber-800 dark:text-amber-200">Low Stock Alerts ({lowStock.length})</p>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {lowStock.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2 rounded bg-background border cursor-pointer hover:ring-2 hover:ring-sage/40 transition-all"
                  onClick={() => { setRestockMaterial(m); setIsRestockOpen(true); }}>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.inHouse}/{m.threshold} {m.unit}</p>
                  </div>
                  <Progress value={(m.inHouse / m.threshold) * 100} className="w-16 h-2" />
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
                <SelectItem value="Ceremonial">Ceremonial</SelectItem>
                <SelectItem value="Consumable">Consumable</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Medicine">Medicine</SelectItem>
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
              {filtered.map((m) => {
                const pct = (m.inHouse / m.threshold) * 100;
                const isLow = pct < 100;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                    <TableCell className="text-sm">{m.unit}</TableCell>
                    <TableCell className="text-right font-medium">{m.inHouse}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{m.threshold}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={Math.min(pct, 100)} className="w-20 h-2" />
                        {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.vendor}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditMaterial({ ...m }); setIsEditOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setRestockMaterial(m); setIsRestockOpen(true); }}>
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

      {/* Edit Material Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Material</DialogTitle></DialogHeader>
          {editMaterial && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editMaterial.name} onChange={(e) => setEditMaterial({ ...editMaterial, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editMaterial.category} onValueChange={(v) => setEditMaterial({ ...editMaterial, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ceremonial">Ceremonial</SelectItem>
                      <SelectItem value="Consumable">Consumable</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Medicine">Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={editMaterial.unit} onChange={(e) => setEditMaterial({ ...editMaterial, unit: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>In Stock</Label>
                  <Input type="number" value={editMaterial.inHouse} onChange={(e) => setEditMaterial({ ...editMaterial, inHouse: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Threshold</Label>
                  <Input type="number" value={editMaterial.threshold} onChange={(e) => setEditMaterial({ ...editMaterial, threshold: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Input value={editMaterial.vendor} onChange={(e) => setEditMaterial({ ...editMaterial, vendor: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleSaveEdit} disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockOpen} onOpenChange={setIsRestockOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Restock {restockMaterial?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Current stock: <span className="font-medium text-foreground">{restockMaterial?.inHouse}</span> {restockMaterial?.unit}
              {" "}(threshold: {restockMaterial?.threshold})
            </p>
            <div className="space-y-2">
              <Label>Quantity to Add</Label>
              <Input type="number" min="1" placeholder="Enter quantity..." value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsRestockOpen(false); setRestockQty(""); }}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleRestock} disabled={saving || !restockQty}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</> : "Add Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Material Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add New Material</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Material name" value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newMaterial.category} onValueChange={(v) => setNewMaterial({ ...newMaterial, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ceremonial">Ceremonial</SelectItem>
                    <SelectItem value="Consumable">Consumable</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Medicine">Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input placeholder="e.g. bundles" value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial Stock</Label>
                <Input type="number" value={newMaterial.inHouse}
                  onChange={(e) => setNewMaterial({ ...newMaterial, inHouse: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Reorder Threshold</Label>
                <Input type="number" value={newMaterial.threshold}
                  onChange={(e) => setNewMaterial({ ...newMaterial, threshold: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input placeholder="Vendor name" value={newMaterial.vendor}
                onChange={(e) => setNewMaterial({ ...newMaterial, vendor: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleAdd} disabled={saving || !newMaterial.name}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Material"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
