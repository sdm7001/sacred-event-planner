"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Bell, Clock, Users, Mail, Copy, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Rule = {
  id: string;
  title: string;
  offsetDays: number;
  audience: string;
  active: boolean;
};

type Workflow = {
  id: string;
  event: string;
  eventDate: string;
  rules: Rule[];
};

const seedWorkflows: Workflow[] = [
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

export default function RemindersPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(seedWorkflows);

  // Add rule dialog
  const [addRuleWf, setAddRuleWf] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({ title: "", offsetDays: 1, audience: "All participants" });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteRule, setDeleteRule] = useState<{ wfId: string; ruleId: string } | null>(null);

  const toggleRuleActive = (wfId: string, ruleId: string) => {
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === wfId
          ? { ...wf, rules: wf.rules.map((r) => r.id === ruleId ? { ...r, active: !r.active } : r) }
          : wf
      )
    );
    // Persist toggle
    const supabase = createClient();
    const wf = workflows.find((w) => w.id === wfId);
    const rule = wf?.rules.find((r) => r.id === ruleId);
    if (rule) {
      void supabase.from("reminder_rules").update({ active: !rule.active }).eq("id", ruleId);
    }
  };

  const handleClone = (wfId: string) => {
    const source = workflows.find((wf) => wf.id === wfId);
    if (!source) return;
    const cloned: Workflow = {
      ...source,
      id: `clone-${Date.now()}`,
      event: `${source.event} (Copy)`,
      rules: source.rules.map((r) => ({ ...r, id: `clone-r-${Date.now()}-${Math.random().toString(36).slice(2)}` })),
    };
    setWorkflows((prev) => [...prev, cloned]);
  };

  const handleAddRule = () => {
    if (!addRuleWf || !newRule.title) return;
    setSaving(true);
    const rule: Rule = {
      id: `new-r-${Date.now()}`,
      title: newRule.title,
      offsetDays: newRule.offsetDays,
      audience: newRule.audience,
      active: true,
    };
    setWorkflows((prev) =>
      prev.map((wf) => wf.id === addRuleWf ? { ...wf, rules: [...wf.rules, rule] } : wf)
    );
    setSaving(false);
    setAddRuleWf(null);
    setNewRule({ title: "", offsetDays: 1, audience: "All participants" });
  };

  const handleDeleteRule = () => {
    if (!deleteRule) return;
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === deleteRule.wfId
          ? { ...wf, rules: wf.rules.filter((r) => r.id !== deleteRule.ruleId) }
          : wf
      )
    );
    // Persist
    const supabase = createClient();
    void supabase.from("reminder_rules").delete().eq("id", deleteRule.ruleId);
    setDeleteRule(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Reminder Workflows</h1>
          <p className="text-muted-foreground mt-1">Automated email reminders tied to event schedules</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => {
          const newWf: Workflow = {
            id: `new-wf-${Date.now()}`,
            event: "New Workflow",
            eventDate: "TBD",
            rules: [],
          };
          setWorkflows((prev) => [...prev, newWf]);
        }}>
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>

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
                <Button variant="outline" size="sm" onClick={() => handleClone(wf.id)}>
                  <Copy className="mr-2 h-4 w-4" /> Clone
                </Button>
                <Button size="sm" className="bg-sage hover:bg-sage-dark" onClick={() => setAddRuleWf(wf.id)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Rule
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wf.rules.length === 0 && (
                <div className="flex items-center justify-center h-16 rounded-lg border border-dashed text-sm text-muted-foreground">
                  No rules yet. Click &quot;Add Rule&quot; to create one.
                </div>
              )}
              {wf.rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <Switch checked={rule.active} onCheckedChange={() => toggleRuleActive(wf.id, rule.id)} />
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteRule({ wfId: wf.id, ruleId: rule.id })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Rule Dialog */}
      <Dialog open={!!addRuleWf} onOpenChange={(open) => { if (!open) setAddRuleWf(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Reminder Rule</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reminder Title</Label>
              <Input placeholder="e.g. Final reminder with directions" value={newRule.title}
                onChange={(e) => setNewRule({ ...newRule, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Days Before Event</Label>
                <Input type="number" min="0" value={newRule.offsetDays}
                  onChange={(e) => setNewRule({ ...newRule, offsetDays: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select value={newRule.audience} onValueChange={(v) => setNewRule({ ...newRule, audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All participants">All participants</SelectItem>
                    <SelectItem value="All providers">All providers</SelectItem>
                    <SelectItem value="All">All (participants + providers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddRuleWf(null)}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleAddRule} disabled={saving || !newRule.title}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Rule Confirmation */}
      <Dialog open={!!deleteRule} onOpenChange={(open) => { if (!open) setDeleteRule(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Rule</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this reminder rule? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRule(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteRule}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
