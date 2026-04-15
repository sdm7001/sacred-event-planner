"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Bell, Clock, Users, Mail, Copy, Trash2, CalendarDays } from "lucide-react";

const workflows = [
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Reminder Workflows</h1>
          <p className="text-muted-foreground mt-1">Automated email reminders tied to event schedules</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark">
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
                <Button variant="outline" size="sm"><Copy className="mr-2 h-4 w-4" /> Clone</Button>
                <Button size="sm" className="bg-sage hover:bg-sage-dark"><Plus className="mr-2 h-4 w-4" /> Add Rule</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wf.rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <Switch checked={rule.active} />
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
