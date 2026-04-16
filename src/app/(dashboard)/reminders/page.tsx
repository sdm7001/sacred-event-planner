"use client";

import { useState, useTransition, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Bell, Clock, Users, Mail, Trash2, CalendarDays, Loader2, AlertCircle } from "lucide-react";
import {
  getReminderWorkflows,
  createReminderRule,
  toggleReminderRule,
  deleteReminderRule,
  type ReminderWorkflow,
} from "@/app/actions/reminders";

const EMPTY_RULE_FORM = { title: "", offsetDays: "3", audience: "All participants" };

export default function RemindersPage() {
  const [workflows, setWorkflows] = useState<ReminderWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // New Workflow dialog
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  // Add Rule dialog
  const [addRuleTarget, setAddRuleTarget] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE_FORM);

  const loadWorkflows = () => {
    startTransition(async () => {
      const result = await getReminderWorkflows();
      if (!result.error) setWorkflows(result.workflows);
      else setActionError(result.error);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadWorkflows();
    // Load events for the "New Workflow" dropdown
    const supabase = createClient();
    supabase
      .from("events")
      .select("id, title")
      .order("start_datetime", { ascending: false })
      .then(({ data }) => setEvents(data ?? []));
  }, []);

  const handleCreateWorkflow = () => {
    if (!selectedEventId) return;
    // Check if a workflow for this event already exists
    const exists = workflows.some((w) => w.event_id === selectedEventId);
    if (exists) {
      setActionError("A workflow for this event already exists.");
      return;
    }
    // Find the event details from local list
    const ev = events.find((e) => e.id === selectedEventId);
    if (!ev) return;
    setWorkflows((prev) => [
      ...prev,
      { event_id: selectedEventId, event_title: ev.title, event_date: "", rules: [] },
    ]);
    setNewWorkflowOpen(false);
    setSelectedEventId("");
    setActionError(null);
  };

  const handleAddRule = () => {
    if (!ruleForm.title.trim() || !addRuleTarget) return;
    setActionError(null);
    startTransition(async () => {
      const result = await createReminderRule({
        event_id: addRuleTarget,
        name: ruleForm.title.trim(),
        offset_days: Number(ruleForm.offsetDays) || 0,
        audience_segment: ruleForm.audience,
      });
      if (result.error) {
        setActionError(result.error);
        return;
      }
      setAddRuleTarget(null);
      setRuleForm(EMPTY_RULE_FORM);
      loadWorkflows();
    });
  };

  const handleToggleRule = (ruleId: string, current: boolean) => {
    // Optimistic update
    setWorkflows((prev) =>
      prev.map((wf) => ({
        ...wf,
        rules: wf.rules.map((r) => (r.id === ruleId ? { ...r, is_active: !current } : r)),
      }))
    );
    startTransition(async () => {
      const result = await toggleReminderRule(ruleId, !current);
      if (result.error) {
        // Revert
        setWorkflows((prev) =>
          prev.map((wf) => ({
            ...wf,
            rules: wf.rules.map((r) => (r.id === ruleId ? { ...r, is_active: current } : r)),
          }))
        );
        setActionError(result.error);
      }
    });
  };

  const handleDeleteRule = (wfEventId: string, ruleId: string) => {
    // Optimistic update
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.event_id === wfEventId
          ? { ...wf, rules: wf.rules.filter((r) => r.id !== ruleId) }
          : wf
      )
    );
    startTransition(async () => {
      const result = await deleteReminderRule(ruleId);
      if (result.error) {
        setActionError(result.error);
        loadWorkflows(); // reload to restore
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Reminder Workflows</h1>
          <p className="text-muted-foreground mt-1">Automated email reminders tied to event schedules</p>
        </div>
        <Button
          className="bg-sage hover:bg-sage-dark"
          onClick={() => { setSelectedEventId(""); setActionError(null); setNewWorkflowOpen(true); }}
          disabled={isPending}
        >
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}

      <Card className="bg-sage-50/50 dark:bg-sage-900/10 border-sage-200 dark:border-sage-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-sage mt-0.5" />
            <div>
              <p className="font-medium">How Reminders Work</p>
              <p className="text-sm text-muted-foreground mt-1">
                Reminders are calculated relative to each event&apos;s start date. Set an offset in days before the event,
                choose the audience segment, and the system queues emails automatically via the cron job.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No reminder workflows yet.</p>
          <button onClick={() => setNewWorkflowOpen(true)} className="text-sage hover:underline mt-1">
            Create your first workflow
          </button>
        </div>
      ) : workflows.map((wf) => (
        <Card key={wf.event_id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sage" />
                  {wf.event_title}
                </CardTitle>
                {wf.event_date && <CardDescription>Event date: {wf.event_date}</CardDescription>}
              </div>
              <Button
                size="sm"
                className="bg-sage hover:bg-sage-dark"
                onClick={() => { setRuleForm(EMPTY_RULE_FORM); setActionError(null); setAddRuleTarget(wf.event_id); }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wf.rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={() => handleToggleRule(rule.id, rule.is_active)}
                    disabled={isPending}
                  />
                  <Bell className="h-4 w-4 text-sage shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rule.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rule.offset_days} day{rule.offset_days !== 1 ? "s" : ""} before
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{rule.audience_segment}
                      </span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />Email</span>
                    </div>
                  </div>
                  <Badge variant={rule.is_active ? "sage" : "secondary"}>
                    {rule.is_active ? "Active" : "Paused"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteRule(wf.event_id, rule.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {wf.rules.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No rules yet. Add a rule to get started.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* New Workflow Dialog */}
      <Dialog open={newWorkflowOpen} onOpenChange={(open) => { if (!isPending) setNewWorkflowOpen(open); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Event *</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger><SelectValue placeholder="Select an event" /></SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewWorkflowOpen(false)}>Cancel</Button>
            <Button
              className="bg-sage hover:bg-sage-dark"
              onClick={handleCreateWorkflow}
              disabled={!selectedEventId}
            >
              <Plus className="mr-2 h-4 w-4" /> Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rule Dialog */}
      <Dialog open={!!addRuleTarget} onOpenChange={(open) => { if (!open) setAddRuleTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Reminder Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Rule Title *</Label>
              <Input
                value={ruleForm.title}
                onChange={(e) => setRuleForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Prep instructions reminder"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Days Before Event</Label>
                <Input
                  type="number"
                  min={0}
                  value={ruleForm.offsetDays}
                  onChange={(e) => setRuleForm((f) => ({ ...f, offsetDays: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={ruleForm.audience} onValueChange={(v) => setRuleForm((f) => ({ ...f, audience: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All participants">All participants</SelectItem>
                    <SelectItem value="All providers">All providers</SelectItem>
                    <SelectItem value="All">Everyone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRuleTarget(null)}>Cancel</Button>
            <Button
              className="bg-sage hover:bg-sage-dark"
              onClick={handleAddRule}
              disabled={isPending || !ruleForm.title.trim()}
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
