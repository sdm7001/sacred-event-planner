"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Upload, Search, Download, Trash2, Eye } from "lucide-react";
import { useState } from "react";

const documents = [
  { id: "1", filename: "Liability Waiver - Spring 2026.pdf", event: "Spring Equinox Retreat", type: "waiver", size: "245 KB", uploaded: "Mar 1, 2026", by: "Maya Chen" },
  { id: "2", filename: "Venue Contract - Sacred Valley.pdf", event: "Spring Equinox Retreat", type: "contract", size: "1.2 MB", uploaded: "Feb 15, 2026", by: "Maya Chen" },
  { id: "3", filename: "Emergency Protocol v3.pdf", event: "General", type: "protocol", size: "89 KB", uploaded: "Feb 20, 2026", by: "River Stone" },
  { id: "4", filename: "Insurance Certificate 2026.pdf", event: "General", type: "insurance", size: "540 KB", uploaded: "Jan 10, 2026", by: "Maya Chen" },
  { id: "5", filename: "Provider Agreement - Luna.pdf", event: "Spring Equinox Retreat", type: "contract", size: "320 KB", uploaded: "Feb 25, 2026", by: "Maya Chen" },
  { id: "6", filename: "Menu Plan - Spring.pdf", event: "Spring Equinox Retreat", type: "other", size: "156 KB", uploaded: "Mar 5, 2026", by: "Oak Williams" },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const filtered = documents.filter((d) => d.filename.toLowerCase().includes(search.toLowerCase()) || d.event.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">{documents.length} files uploaded</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark"><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>By</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{d.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{d.event}</TableCell>
                  <TableCell><Badge variant="outline">{d.type}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.size}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.uploaded}</TableCell>
                  <TableCell className="text-sm">{d.by}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
