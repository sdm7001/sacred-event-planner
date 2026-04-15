"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, FileText } from "lucide-react";

export default function ProviderDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/providers"><Button variant="ghost" size="icon" className="mt-1"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div>
            <h1 className="text-3xl font-heading font-semibold tracking-tight">River Stone</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <Badge variant="outline">Lead Facilitator</Badge>
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" />river@example.com</span>
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" />(512) 555-0201</span>
            </div>
          </div>
        </div>
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Dripping Springs, TX</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Compensation</p>
              <p className="text-sm font-medium">$2,500/event (flat rate)</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Contract Status</p>
              <Badge variant="sage">Active</Badge>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Bio</p>
              <p className="text-sm">20+ years facilitating ceremonial work. Trained in indigenous traditions. Specializes in rites of passage, sweat lodge, and fire ceremonies.</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Availability</p>
              <p className="text-sm">Weekends preferred. Available for multi-day retreats with 2 weeks notice.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-lg">Event Assignments (8)</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Responsibilities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { title: "Spring Equinox Retreat", date: "Mar 20-22, 2026", role: "Lead Facilitator", resp: "Opening/closing circles, sunrise ceremony" },
                  { title: "Full Moon Fire Circle", date: "Feb 12, 2026", role: "Lead Facilitator", resp: "Fire circle, evening ceremony" },
                  { title: "Winter Solstice Ceremony", date: "Dec 21, 2025", role: "Lead Facilitator", resp: "Solstice ceremony, blessing" },
                ].map((e, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{e.title}</TableCell>
                    <TableCell className="text-sm">{e.date}</TableCell>
                    <TableCell><Badge variant="secondary">{e.role}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{e.resp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
