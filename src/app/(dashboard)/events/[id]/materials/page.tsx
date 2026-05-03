"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calculator, AlertTriangle, Shield, Plus } from "lucide-react";
import { calculateMaterialsTotal } from "@/lib/utils";

interface MaterialConfig {
  id: string;
  name: string;
  category: string;
  baseQty: number;
  qtyPerParticipant: number;
  qtyPerProvider: number;
  bufferAmount: number;
  wastePct: number;
  unit: string;
  dosePerParticipant: number | null;
  doseMin: number | null;
  doseMax: number | null;
  doseNotes: string;
  currentStock: number;
  isDosable: boolean;
}

const initialMaterials: MaterialConfig[] = [
  {
    id: "m1", name: "White Sage Bundle", category: "Ceremonial",
    baseQty: 5, qtyPerParticipant: 1, qtyPerProvider: 0.5, bufferAmount: 3, wastePct: 10,
    unit: "bundles", dosePerParticipant: null, doseMin: null, doseMax: null, doseNotes: "",
    currentStock: 15, isDosable: false,
  },
  {
    id: "m2", name: "Ceremonial Tea", category: "Medicine",
    baseQty: 0, qtyPerParticipant: 0, qtyPerProvider: 0, bufferAmount: 50, wastePct: 5,
    unit: "ml", dosePerParticipant: 30, doseMin: 20, doseMax: 45, doseNotes: "Adjust based on body weight. First-timers start at minimum dose.",
    currentStock: 200, isDosable: true,
  },
  {
    id: "m3", name: "Purified Water", category: "Consumable",
    baseQty: 5, qtyPerParticipant: 1.5, qtyPerProvider: 1, bufferAmount: 5, wastePct: 0,
    unit: "gallons", dosePerParticipant: null, doseMin: null, doseMax: null, doseNotes: "",
    currentStock: 5, isDosable: false,
  },
  {
    id: "m4", name: "Meditation Cushions", category: "Equipment",
    baseQty: 2, qtyPerParticipant: 1, qtyPerProvider: 1, bufferAmount: 2, wastePct: 0,
    unit: "units", dosePerParticipant: null, doseMin: null, doseMax: null, doseNotes: "",
    currentStock: 22, isDosable: false,
  },
];

const participantOverrides = [
  { participantId: "p1", name: "Sarah Johnson", customDose: 25, excluded: false, notes: "Smaller build, start low" },
  { participantId: "p3", name: "Emily Chen", customDose: null, excluded: true, notes: "First time, opted out" },
];

export default function MaterialsDosingPage() {
  const [materials, setMaterials] = useState(initialMaterials);
  const participantCount = 18;
  const providerCount = 3;

  const updateMaterial = (id: string, field: string, value: number | string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const getTotal = (m: MaterialConfig) => {
    if (m.isDosable && m.dosePerParticipant) {
      const doseTotal = participantCount * m.dosePerParticipant;
      return Math.ceil((doseTotal + m.bufferAmount) * (1 + m.wastePct / 100));
    }
    return calculateMaterialsTotal({
      baseQty: m.baseQty,
      participantCount,
      qtyPerParticipant: m.qtyPerParticipant,
      providerCount,
      qtyPerProvider: m.qtyPerProvider,
      bufferAmount: m.bufferAmount,
      wastePct: m.wastePct,
    });
  };

  const getToPurchase = (m: MaterialConfig) => {
    return Math.max(0, getTotal(m) - m.currentStock);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events/1">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Materials Planner</h1>
          <p className="text-muted-foreground mt-1">
            Spring Equinox Retreat -- {participantCount} participants, {providerCount} providers
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-sm text-muted-foreground">Materials tracked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">
              {materials.filter((m) => getToPurchase(m) > 0).length}
            </div>
            <p className="text-sm text-muted-foreground">Items to purchase</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-sage">
              {materials.filter((m) => m.isDosable).length}
            </div>
            <p className="text-sm text-muted-foreground">Dosable materials</p>
          </CardContent>
        </Card>
      </div>

      {/* Materials Calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Materials Calculator
              </CardTitle>
              <CardDescription>
                Auto-calculated totals. Adjust quantities and the totals update in real-time.
              </CardDescription>
            </div>
            <Button size="sm" className="bg-sage hover:bg-sage-dark">
              <Plus className="mr-2 h-4 w-4" /> Add Material
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">/Participant</TableHead>
                <TableHead className="text-right">/Provider</TableHead>
                <TableHead className="text-right">Buffer</TableHead>
                <TableHead className="text-right">Waste%</TableHead>
                <TableHead className="text-right font-semibold">Total Required</TableHead>
                <TableHead className="text-right">In Stock</TableHead>
                <TableHead className="text-right font-semibold">To Purchase</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.filter((m) => !m.isDosable).map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.category} -- {m.unit}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-16 text-right h-8"
                      value={m.baseQty}
                      onChange={(e) => updateMaterial(m.id, "baseQty", Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-16 text-right h-8"
                      value={m.qtyPerParticipant}
                      onChange={(e) => updateMaterial(m.id, "qtyPerParticipant", Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-16 text-right h-8"
                      value={m.qtyPerProvider}
                      onChange={(e) => updateMaterial(m.id, "qtyPerProvider", Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-16 text-right h-8"
                      value={m.bufferAmount}
                      onChange={(e) => updateMaterial(m.id, "bufferAmount", Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-16 text-right h-8"
                      value={m.wastePct}
                      onChange={(e) => updateMaterial(m.id, "wastePct", Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell className="text-right font-semibold">{getTotal(m)} {m.unit}</TableCell>
                  <TableCell className="text-right">{m.currentStock}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {getToPurchase(m) > 0 ? (
                      <span className="text-amber-600">{getToPurchase(m)}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dosing Calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sage" />
            <div>
              <CardTitle>Dosing Calculator</CardTitle>
              <CardDescription>
                Admin-only section. Per-participant dose management with safety controls.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {materials.filter((m) => m.isDosable).map((m) => (
            <div key={m.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{m.name}</h4>
                  <p className="text-sm text-muted-foreground">{m.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{getTotal(m)} {m.unit}</p>
                  <p className="text-xs text-muted-foreground">total required</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Default Dose</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={m.dosePerParticipant || ""}
                    onChange={(e) => updateMaterial(m.id, "dosePerParticipant", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min Dose</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={m.doseMin || ""}
                    onChange={(e) => updateMaterial(m.id, "doseMin", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Dose</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={m.doseMax || ""}
                    onChange={(e) => updateMaterial(m.id, "doseMax", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Buffer ({m.unit})</Label>
                  <Input
                    type="number"
                    className="h-8"
                    value={m.bufferAmount}
                    onChange={(e) => updateMaterial(m.id, "bufferAmount", Number(e.target.value))}
                  />
                </div>
              </div>

              {m.doseNotes && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">{m.doseNotes}</p>
                </div>
              )}

              {/* Participant overrides */}
              <div>
                <h5 className="text-sm font-medium mb-2">Participant Overrides</h5>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead className="text-right">Custom Dose ({m.unit})</TableHead>
                      <TableHead>Excluded</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participantOverrides.map((po) => (
                      <TableRow key={po.participantId}>
                        <TableCell className="font-medium">{po.name}</TableCell>
                        <TableCell className="text-right">
                          {po.excluded ? (
                            <span className="text-muted-foreground">---</span>
                          ) : (
                            <span>{po.customDose || m.dosePerParticipant}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {po.excluded ? (
                            <Badge variant="outline" className="text-red-600">Excluded</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">Included</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{po.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Procurement Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Procurement Summary</CardTitle>
          <CardDescription>Items that need to be purchased</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {materials
              .filter((m) => getToPurchase(m) > 0)
              .map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">{getToPurchase(m)} {m.unit}</p>
                    <p className="text-xs text-muted-foreground">needed</p>
                  </div>
                </div>
              ))}
            {materials.filter((m) => getToPurchase(m) > 0).length === 0 && (
              <p className="text-center text-muted-foreground py-4">All materials are in stock</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
