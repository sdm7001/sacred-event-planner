"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Send, Search, Clock, CheckCircle2, XCircle } from "lucide-react";

const initialLogs = [
  { id: "1", date: "Mar 10, 2026 9:15 AM", event: "Spring Equinox", subject: "Welcome & What to Expect", recipient: "18 participants", status: "delivered" },
  { id: "2", date: "Mar 8, 2026 2:00 PM", event: "Spring Equinox", subject: "Registration Confirmation", recipient: "Sarah Johnson", status: "delivered" },
  { id: "3", date: "Mar 8, 2026 1:45 PM", event: "Spring Equinox", subject: "Registration Confirmation", recipient: "Michael Rivera", status: "delivered" },
  { id: "4", date: "Mar 7, 2026 10:00 AM", event: "Spring Equinox", subject: "Provider Schedule", recipient: "River Stone", status: "delivered" },
  { id: "5", date: "Mar 5, 2026 3:00 PM", event: "Spring Equinox", subject: "Invitation to Spring Equinox", recipient: "25 contacts", status: "delivered" },
  { id: "6", date: "Mar 12, 2026 8:00 AM", event: "Spring Equinox", subject: "Prep Instructions Reminder", recipient: "18 participants", status: "pending" },
  { id: "7", date: "Mar 3, 2026 11:30 AM", event: "New Moon", subject: "Save the Date", recipient: "12 participants", status: "failed" },
];

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "delivered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "sent":      return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    case "pending":   return <Clock className="h-4 w-4 text-amber-500" />;
    case "failed":    return <XCircle className="h-4 w-4 text-red-500" />;
    default:          return null;
  }
}

export default function CommunicationsPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all_participants");

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.subject.toLowerCase().includes(search.toLowerCase()) ||
      l.recipient.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSendBroadcast = () => {
    if (!subject.trim() || !body.trim()) return;
    const audienceLabel =
      audience === "all_participants" ? "All participants" :
      audience === "all_providers" ? "All providers" : "Everyone";
    const newLog = {
      id: String(Date.now()),
      date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      event: "Broadcast",
      subject: subject.trim(),
      recipient: audienceLabel,
      status: "pending",
    };
    setLogs((prev) => [newLog, ...prev]);
    setBroadcastOpen(false);
    setSubject("");
    setBody("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Communications</h1>
          <p className="text-muted-foreground mt-1">Email log and broadcast center</p>
        </div>
        <Button
          className="bg-sage hover:bg-sage-dark"
          onClick={() => { setSubject(""); setBody(""); setBroadcastOpen(true); }}
        >
          <Send className="mr-2 h-4 w-4" /> New Broadcast
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Delivered", count: logs.filter((l) => l.status === "delivered").length, color: "" },
          { label: "Pending", count: logs.filter((l) => l.status === "pending").length, color: "text-amber-600" },
          { label: "Failed", count: logs.filter((l) => l.status === "failed").length, color: "text-red-600" },
          { label: "Total Sent", count: logs.length, color: "" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by subject or recipient..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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

      {/* New Broadcast Dialog */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Broadcast</DialogTitle>
            <DialogDescription>
              Send an email to a group of people. This will be queued and sent via Resend.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_participants">All Participants</SelectItem>
                  <SelectItem value="all_providers">All Providers</SelectItem>
                  <SelectItem value="everyone">Everyone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Important update about your upcoming event"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message here..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
            <Button
              className="bg-sage hover:bg-sage-dark"
              onClick={handleSendBroadcast}
              disabled={!subject.trim() || !body.trim()}
            >
              <Send className="mr-2 h-4 w-4" /> Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
