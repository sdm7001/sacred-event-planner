"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Bell, Clock, Users, Mail, Copy, Trash2, CalendarDays } from "lucide-react";

interface ReminderRule {
  id: string;
  title: string;
  offsetDays: number;
  audience: string;
  active: boolean;
}

interface Workflow {
  id: string;
  event: string;
  eventDate: string;
  rules: ReminderRule[];
}

const initialWorkflows: Workflow[] = [
  {
    id: "w1",
    event: "Spring Equinox Retreat",
    eventDate: "Mar 20, 2026",
    rules: [
      { id: "r1", title: "Prep instructions reminder", offsetDays: 7, audience: "All participants", active: true },
      { id: "r2", title: "Travel & arrival details", offsetDays: 3, audience: "All participants", active: true },
      { id: "r3", title: "Final reminder with directions", offsetDays: 1, audience: "All participants", active: true },
      { id: "r4", title: "Provider schedule confirmation", offsetDays: 3, audience: "All providers", active: true },
    ],
  },
  {
    id: "w2",
    event: "New Moon Ceremony",
    eventDate: "Mar 29, 2026",
    rules: [
      { id: "r5", title: "Event details and prep guide", offsetDays: 5, audience: "All participants", active: true },
      { id: "r6", title: "Day-of reminder", offsetDays: 0, audience: "All", active: false },
    ],
  },
];

const EMPTY_WORKFLOW_FORM = { event: "", eventDate: "" };
const EMPTY_RULE_FORM = { title: "", offsetDays: "3", audience: "All participants" };

export default function RemindersPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [clonedId, setClonedId] = useState<string | null>(null);

  // New Workflow dialog
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);
  const [workflowForm, setWorkflowForm] = useState(EMPTY_WORKFLOW_FORM);

  // Add Rule dialog
  const [addRuleTarget, setAddRuleTarget] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE_FORM);

  const cloneWorkflow = (wf: Workflow) => {
    const newId = `w${Date.now()}`;
    const cloned: Workflow = {
      ...wf,
      id: newId,
      event: `${wf.event} (Copy)`,
      rules: wf.rules.map((r) => ({ ...r, id: `${r.id}-${newId}` })),
    };
    setWorkflows((prev) => [...prev, cloned]);
    setClonedId(newId);
    setTimeout(() => setClonedId(null), 3000);
  };

  const handleCreateWorkflow = () => {
    if (!workflowForm.event.trim()) return;
    const newWf: Workflow = {
      id: `w${Date.now()}`,
      event: workflowForm.event.trim(),
      eventDate: workflowForm.eventDate || "TBD",
      rules: [],
    };
    setWorkflows((prev) => [...prev, newWf]);
    setNewWorkflowOpen(false);
    setWorkflowForm(EMPTY_WORKFLOW_FORM);
  };

  const handleAddRule = () => {
    if (!ruleForm.title.trim() || !addRuleTarget) return;
    const newRule: ReminderRule = {
      id: `r${Date.now()}`,
      title: ruleForm.title.trim(),
      offsetDays: Number(ruleForm.offsetDays) || 0,
      audience: ruleForm.audience,
      active: true,
    };
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === addRuleTarget ? { ...wf, rules: [...wf.rules, newRule] } : wf
      )
    );
    setAddRuleTarget(null);
    setRuleForm(EMPTY_RULE_FORM);
  };

  const toggleRule = (wfId: string, ruleId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === wfId
          ? { ...wf, rules: wf.rules.map((r) => (r.id === ruleId ? { ...r, active: !r.active } : r)) }
          : wf
      )
    );
  };

  const deleteRule = (wfId: string, ruleId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === wfId ? { ...wf, rules: wf.rules.filter((r) => r.id !== ruleId) } : wf
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Reminder Workflows</h1>
          <p className="text-muted-foreground mt-1">Automated email reminders tied to event schedules</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => { setWorkflowForm(EMPTY_WORKFLOW_FORM); setNewWorkflowOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

      {clonedId && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Workflow cloned successfully.
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
                choose the audience segment, and link to a prep instruction or email template.
                The system checks every minute and sends queued emails automatically via Resend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {workflows.map((wf) => (
        <Card key={wf.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-sage" />
                  {wf.event}
                </CardTitle>
                <CardDescription>Event date: {wf.eventDate}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => cloneWorkflow(wf)}>
                  <Copy className="mr-2 h-4 w-4" /> Clone
                </Button>
                <Button size="sm" className="bg-sage hover:bg-sage-dark" onClick={() => { setRuleForm(EMPTY_RULE_FORM); setAddRuleTarget(wf.id); }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Rule
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wf.rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <Switch checked={rule.active} onCheckedChange={() => toggleRule(wf.id, rule.id)} />
                  <Bell className="h-4 w-4 text-sage" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rule.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rule.offsetDays} day{rule.offsetDays !== 1 ? "s" : ""} before</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{rule.audience}</span>
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />Email</span>
                    </div>
                  </div>
                  <Badge variant={rule.active ? "sage" : "secondary"}>
                    {rule.active ? "Active" : "Paused"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteRule(wf.id, rule.id)}>
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
      <Dialog open={newWorkflowOpen} onOpenChange={setNewWorkflowOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Event Name *</Label>
              <Input
                value={workflowForm.event}
                onChange={(e) => setWorkflowForm((f) => ({ ...f, event: e.target.value }))}
                placeholder="e.g., Summer Solstice Retreat"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Event Date</Label>
              <Input
                type="date"
                value={workflowForm.eventDate}
                onChange={(e) => setWorkflowForm((f) => ({ ...f, eventDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewWorkflowOpen(false)}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleCreateWorkflow} disabled={!workflowForm.event.trim()}>
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
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleAddRule} disabled={!ruleForm.title.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
