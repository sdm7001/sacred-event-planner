"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Send, Search, Clock, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const logs = [
  { id: "1", date: "Mar 10, 2026 9:15 AM", event: "Spring Equinox", subject: "Welcome & What to Expect", recipient: "18 participants", channel: "email", status: "delivered", direction: "outbound" },
  { id: "2", date: "Mar 8, 2026 2:00 PM", event: "Spring Equinox", subject: "Registration Confirmation", recipient: "Sarah Johnson", channel: "email", status: "delivered", direction: "outbound" },
  { id: "3", date: "Mar 8, 2026 1:45 PM", event: "Spring Equinox", subject: "Registration Confirmation", recipient: "Michael Rivera", channel: "email", status: "delivered", direction: "outbound" },
  { id: "4", date: "Mar 7, 2026 10:00 AM", event: "Spring Equinox", subject: "Provider Schedule", recipient: "River Stone", channel: "email", status: "delivered", direction: "outbound" },
  { id: "5", date: "Mar 5, 2026 3:00 PM", event: "Spring Equinox", subject: "Invitation to Spring Equinox", recipient: "25 contacts", channel: "email", status: "delivered", direction: "outbound" },
  { id: "6", date: "Mar 12, 2026 8:00 AM", event: "Spring Equinox", subject: "Prep Instructions Reminder", recipient: "18 participants", channel: "email", status: "pending", direction: "outbound" },
  { id: "7", date: "Mar 3, 2026 11:30 AM", event: "New Moon", subject: "Save the Date", recipient: "12 participants", channel: "email", status: "failed", direction: "outbound" },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "delivered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "sent": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    case "pending": return <Clock className="h-4 w-4 text-amber-500" />;
    case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
    default: return null;
  }
}

export default function CommunicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = logs.filter((l) => {
    const matchSearch = l.subject.toLowerCase().includes(search.toLowerCase()) || l.recipient.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Communications</h1>
          <p className="text-muted-foreground mt-1">Email log and broadcast center</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark"><Send className="mr-2 h-4 w-4" /> New Broadcast</Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{logs.filter((l) => l.status === "delivered").length}</div>
            <p className="text-sm text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600">{logs.filter((l) => l.status === "pending").length}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{logs.filter((l) => l.status === "failed").length}</div>
            <p className="text-sm text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-sm text-muted-foreground">Total Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by subject or recipient..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell><StatusIcon status={l.status} /></TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{l.date}</TableCell>
                  <TableCell className="text-sm">{l.event}</TableCell>
                  <TableCell className="font-medium">{l.subject}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{l.recipient}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === "delivered" ? "sage" : l.status === "failed" ? "destructive" : "secondary"}>
                      {l.status}
                    </Badge>
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
