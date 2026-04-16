"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Download, Users, Package, CheckSquare, Shield, FileText, Printer } from "lucide-react";
import { useState } from "react";

function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const rosterData = [
  ["Metric", "Value"],
  ["Total Registered", 18],
  ["Confirmed RSVP", 15],
  ["Tentative", 2],
  ["Declined", 1],
  ["Waivers Signed", "14/18 (78%)"],
  ["Prep Compliant", "10/18 (56%)"],
  ["Payment Complete", "13/18 (72%)"],
];

const materialsReportData = [
  ["Metric", "Value"],
  ["Total Items", 8],
  ["In Stock", 4],
  ["To Order", 3],
  ["Ordered", 1],
  ["Procurement %", "63%"],
];

const tasksReportData = [
  ["Metric", "Value"],
  ["Total Tasks", 7],
  ["Completed", 2],
  ["In Progress", 2],
  ["Overdue", 2],
  ["Pending", 1],
  ["Completion %", "29%"],
];

const prepComplianceRows = [
  ["Sarah Johnson", "confirmed", "signed", "paid", "compliant", "Vegetarian"],
  ["Michael Rivera", "confirmed", "signed", "paid", "in_progress", ""],
  ["Emily Chen", "confirmed", "not_sent", "unpaid", "not_started", "Vegan"],
  ["David Kim", "tentative", "sent", "partial", "not_started", ""],
  ["Jessica Patel", "confirmed", "signed", "paid", "compliant", "GF"],
];

const procurementData = [
  { name: "White Sage Bundle", category: "Ceremonial", required: 25, stock: 15, purchase: 10, vendor: "Sacred Herb Co.", status: "to_order" },
  { name: "Ceremonial Candles", category: "Ceremonial", required: 40, stock: 8, purchase: 32, vendor: "Beeswax Naturals", status: "ordered" },
  { name: "Purified Water", category: "Consumable", required: 30, stock: 5, purchase: 25, vendor: "Spring Valley", status: "to_order" },
];

function exportCSV(rows: typeof procurementData, filename: string) {
  const headers = ["Name", "Category", "Required", "In Stock", "To Purchase", "Vendor", "Status"];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.name, r.category, r.required, r.stock, r.purchase, r.vendor, r.status].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [selectedEvent, setSelectedEvent] = useState("1");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Event analytics and exportable reports</p>
        </div>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Spring Equinox Retreat</SelectItem>
            <SelectItem value="2">New Moon Ceremony</SelectItem>
            <SelectItem value="3">Summer Solstice Gathering</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Roster Report */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Users className="h-4 w-4 text-sage" />Roster</CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(["Metric", "Value"], rosterData.slice(1) as (string | number)[][], "roster-report.csv")}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span>Total Registered</span><span className="font-bold">18</span></div>
              <div className="flex justify-between text-sm"><span>Confirmed RSVP</span><span className="font-bold text-green-600">15</span></div>
              <div className="flex justify-between text-sm"><span>Tentative</span><span className="font-bold text-amber-600">2</span></div>
              <div className="flex justify-between text-sm"><span>Declined</span><span className="font-bold text-red-600">1</span></div>
              <Separator />
              <div className="flex justify-between text-sm"><span>Waivers Signed</span><span className="font-bold">14/18 (78%)</span></div>
              <div className="flex justify-between text-sm"><span>Prep Compliant</span><span className="font-bold">10/18 (56%)</span></div>
              <div className="flex justify-between text-sm"><span>Payment Complete</span><span className="font-bold">13/18 (72%)</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Package className="h-4 w-4 text-sage" />Materials</CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(["Metric", "Value"], materialsReportData.slice(1) as (string | number)[][], "materials-report.csv")}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span>Total Items</span><span className="font-bold">8</span></div>
              <div className="flex justify-between text-sm"><span>In Stock</span><span className="font-bold text-green-600">4</span></div>
              <div className="flex justify-between text-sm"><span>To Order</span><span className="font-bold text-amber-600">3</span></div>
              <div className="flex justify-between text-sm"><span>Ordered</span><span className="font-bold text-blue-600">1</span></div>
              <Separator />
              <div className="flex justify-between text-sm"><span>Procurement %</span><span className="font-bold">63%</span></div>
              <Progress value={63} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Tasks Report */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><CheckSquare className="h-4 w-4 text-sage" />Tasks</CardTitle>
              <Button variant="outline" size="sm" onClick={() => downloadCSV(["Metric", "Value"], tasksReportData.slice(1) as (string | number)[][], "tasks-report.csv")}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span>Total Tasks</span><span className="font-bold">7</span></div>
              <div className="flex justify-between text-sm"><span>Completed</span><span className="font-bold text-green-600">2</span></div>
              <div className="flex justify-between text-sm"><span>In Progress</span><span className="font-bold text-amber-600">2</span></div>
              <div className="flex justify-between text-sm"><span>Overdue</span><span className="font-bold text-red-600">2</span></div>
              <div className="flex justify-between text-sm"><span>Pending</span><span className="font-bold">1</span></div>
              <Separator />
              <div className="flex justify-between text-sm"><span>Completion %</span><span className="font-bold">29%</span></div>
              <Progress value={29} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Procurement List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-sage" />Procurement List</CardTitle>
              <CardDescription>Items that need to be purchased for this event</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
              <Button variant="outline" size="sm" onClick={() => exportCSV(procurementData, "procurement.csv")}><Download className="mr-2 h-4 w-4" />Export CSV</Button>
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
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {procurementData.map((m) => (
                <TableRow key={m.name}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell><Badge variant="outline">{m.category}</Badge></TableCell>
                  <TableCell className="text-right">{m.required}</TableCell>
                  <TableCell className="text-right">{m.stock}</TableCell>
                  <TableCell className="text-right font-semibold text-amber-600">{m.purchase}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.vendor}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "ordered" ? "default" : "secondary"}>{m.status.replace("_", " ")}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Prep Compliance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-sage" />Prep Compliance</CardTitle>
              <CardDescription>Participant preparation status breakdown</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => downloadCSV(["Name", "RSVP", "Waiver", "Payment", "Prep", "Dietary"], prepComplianceRows, "prep-compliance.csv")}><Download className="mr-2 h-4 w-4" />Export</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>RSVP</TableHead>
                <TableHead>Waiver</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Prep Status</TableHead>
                <TableHead>Dietary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Sarah Johnson", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant", dietary: "Vegetarian" },
                { name: "Michael Rivera", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "in_progress", dietary: "---" },
                { name: "Emily Chen", rsvp: "confirmed", waiver: "not_sent", payment: "unpaid", prep: "not_started", dietary: "Vegan" },
                { name: "David Kim", rsvp: "tentative", waiver: "sent", payment: "partial", prep: "not_started", dietary: "---" },
                { name: "Jessica Patel", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant", dietary: "GF" },
              ].map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant={p.rsvp === "confirmed" ? "sage" : "secondary"} className="text-xs">{p.rsvp}</Badge></TableCell>
                  <TableCell><Badge variant={p.waiver === "signed" ? "sage" : p.waiver === "not_sent" ? "destructive" : "secondary"} className="text-xs">{p.waiver.replace("_", " ")}</Badge></TableCell>
                  <TableCell><Badge variant={p.payment === "paid" ? "sage" : p.payment === "unpaid" ? "destructive" : "secondary"} className="text-xs">{p.payment}</Badge></TableCell>
                  <TableCell><Badge variant={p.prep === "compliant" ? "sage" : p.prep === "not_started" ? "destructive" : "secondary"} className="text-xs">{p.prep.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.dietary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
