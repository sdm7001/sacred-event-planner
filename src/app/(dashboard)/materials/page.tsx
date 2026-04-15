"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Package, AlertTriangle, MoreHorizontal, Edit } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const materials = [
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = materials.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || m.category === category;
    return matchSearch && matchCategory;
  });

  const lowStock = materials.filter((m) => m.inHouse < m.threshold);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Materials Catalog</h1>
          <p className="text-muted-foreground mt-1">{materials.length} materials -- {lowStock.length} below threshold</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark"><Plus className="mr-2 h-4 w-4" /> Add Material</Button>
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
                <div key={m.id} className="flex items-center justify-between p-2 rounded bg-background border">
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
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem><Package className="mr-2 h-4 w-4" /> Restock</DropdownMenuItem>
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
    </div>
  );
}
