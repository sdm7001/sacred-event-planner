"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Send, Search, Clock, CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { listEmailJobs, createBroadcastJobs, type EmailJobRow } from "@/app/actions/communications";

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "sent":
    case "delivered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "pending":   return <Clock className="h-4 w-4 text-amber-500" />;
    case "failed":    return <XCircle className="h-4 w-4 text-red-500" />;
    default:          return null;
  }
}

export default function CommunicationsPage() {
  const [jobs, setJobs] = useState<EmailJobRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all_participants" | "all_providers" | "everyone">("all_participants");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadJobs = () => {
    startTransition(async () => {
      const result = await listEmailJobs(200);
      if (!result.error) setJobs(result.jobs);
    });
  };

  useEffect(() => { loadJobs(); }, []);

  const filtered = jobs.filter((j) => {
    const matchSearch =
      (j.template_subject ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (j.event_title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      j.recipient_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSendBroadcast = () => {
    if (!subject.trim() || !body.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const result = await createBroadcastJobs({ audience, subject: subject.trim(), body: body.trim() });
      if (result.error) {
        setActionError(result.error);
        return;
      }
      setBroadcastOpen(false);
      setSubject("");
      setBody("");
      loadJobs();
    });
  };

  const stats = {
    sent: jobs.filter((j) => j.status === "sent" || j.status === "delivered").length,
    pending: jobs.filter((j) => j.status === "pending").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Communications</h1>
          <p className="text-muted-foreground mt-1">Email log and broadcast center</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadJobs} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
          <Button className="bg-sage hover:bg-sage-dark" onClick={() => { setSubject(""); setBody(""); setActionError(null); setBroadcastOpen(true); }}>
            <Send className="mr-2 h-4 w-4" /> New Broadcast
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Sent", count: stats.sent, color: "" },
          { label: "Pending", count: stats.pending, color: "text-amber-600" },
          { label: "Failed", count: stats.failed, color: "text-red-600" },
          { label: "Total", count: jobs.length, color: "" },
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
                placeholder="Search by subject, event, or recipient type..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
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
          {isPending && jobs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No emails found.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell><StatusIcon status={j.status} /></TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                      {new Date(j.scheduled_for).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-sm">{j.event_title ?? "—"}</TableCell>
                    <TableCell className="font-medium text-sm">{j.template_subject ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{j.recipient_type}</TableCell>
                    <TableCell>
                      <Badge variant={
                        j.status === "sent" || j.status === "delivered" ? "sage" :
                        j.status === "failed" ? "destructive" : "secondary"
                      }>
                        {j.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Broadcast Dialog */}
      <Dialog open={broadcastOpen} onOpenChange={(open) => { if (!isPending) setBroadcastOpen(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Broadcast</DialogTitle>
            <DialogDescription>
              Send an email to a group. Jobs are queued and dispatched via Resend.
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
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
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Important update about your upcoming event" />
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <Textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message here..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleSendBroadcast} disabled={isPending || !subject.trim() || !body.trim()}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
