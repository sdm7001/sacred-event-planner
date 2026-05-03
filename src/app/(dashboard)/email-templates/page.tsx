"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Copy, Mail, Eye, Code } from "lucide-react";

const templates = [
  {
    id: "t1",
    name: "Event Invitation",
    subject: "You're Invited: {{event_name}}",
    body: `<h2>Dear {{first_name}},</h2>
<p>You are warmly invited to <strong>{{event_name}}</strong>.</p>
<p><strong>Date:</strong> {{event_date}} at {{event_time}}<br/>
<strong>Location:</strong> {{venue_name}}</p>
<p>{{prep_instructions}}</p>
<p>Please confirm your attendance at your earliest convenience.</p>
<p>With warmth,<br/>The Team</p>`,
    tokens: ["first_name", "event_name", "event_date", "event_time", "venue_name", "prep_instructions"],
    active: true,
  },
  {
    id: "t2",
    name: "Prep Instructions",
    subject: "Preparation Guide for {{event_name}}",
    body: `<h2>Hello {{first_name}},</h2>
<p>Your upcoming event <strong>{{event_name}}</strong> is approaching. Here is your preparation guide:</p>
<p>{{prep_instructions}}</p>
<h3>What to Bring</h3>
<p>{{materials_to_bring}}</p>
<h3>Directions</h3>
<p><a href="{{directions_link}}">Click here for directions to {{venue_name}}</a></p>
<p>Please reach out if you have any questions.</p>`,
    tokens: ["first_name", "event_name", "prep_instructions", "materials_to_bring", "directions_link", "venue_name"],
    active: true,
  },
  {
    id: "t3",
    name: "Day-Of Reminder",
    subject: "Today's the Day: {{event_name}}",
    body: `<h2>Good morning {{first_name}},</h2>
<p><strong>{{event_name}}</strong> is today!</p>
<p><strong>Time:</strong> {{event_time}}<br/>
<strong>Location:</strong> {{venue_name}}</p>
<p><a href="{{directions_link}}">Get Directions</a></p>
<p>We look forward to seeing you.</p>`,
    tokens: ["first_name", "event_name", "event_time", "venue_name", "directions_link"],
    active: true,
  },
  {
    id: "t4",
    name: "Provider Assignment",
    subject: "Your Role at {{event_name}}",
    body: `<h2>Hello {{provider_name}},</h2>
<p>Thank you for joining us at <strong>{{event_name}}</strong>.</p>
<p><strong>Your Role:</strong> {{assigned_role}}<br/>
<strong>Date:</strong> {{event_date}}<br/>
<strong>Location:</strong> {{venue_name}}</p>
<p>Please review your assignment details and confirm your availability.</p>`,
    tokens: ["provider_name", "event_name", "assigned_role", "event_date", "venue_name"],
    active: true,
  },
];

const availableTokens = [
  { token: "first_name", desc: "Participant or provider first name" },
  { token: "event_name", desc: "Event title" },
  { token: "event_date", desc: "Event start date" },
  { token: "event_time", desc: "Event start time" },
  { token: "venue_name", desc: "Venue name" },
  { token: "directions_link", desc: "Google Maps link" },
  { token: "prep_instructions", desc: "Prep plan content" },
  { token: "materials_to_bring", desc: "List of materials" },
  { token: "provider_name", desc: "Provider full name" },
  { token: "assigned_role", desc: "Provider's role" },
];

export default function EmailTemplatesPage() {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">Reusable templates with dynamic token replacement</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark"><Plus className="mr-2 h-4 w-4" /> New Template</Button>
      </div>

      {/* Available Tokens Reference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-sage" />
            <CardTitle className="text-lg">Available Tokens</CardTitle>
          </div>
          <CardDescription>Use double curly braces in templates. Tokens are replaced at send time.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableTokens.map((t) => (
              <Badge key={t.token} variant="outline" className="font-mono text-xs cursor-help" title={t.desc}>
                {"{{"}
                {t.token}
                {"}}"}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tmpl) => (
          <Card key={tmpl.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tmpl.name}</CardTitle>
                <Badge variant={tmpl.active ? "sage" : "secondary"}>{tmpl.active ? "Active" : "Inactive"}</Badge>
              </div>
              <CardDescription className="font-mono text-xs">{tmpl.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {tmpl.tokens.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs font-mono">{t}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreview(tmpl.id === preview ? null : tmpl.id)}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                  <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                  <Button variant="outline" size="sm"><Copy className="mr-2 h-4 w-4" /> Clone</Button>
                </div>
                {preview === tmpl.id && (
                  <div className="mt-3 p-4 rounded-lg border bg-background">
                    <p className="text-xs text-muted-foreground mb-2">Preview (tokens shown as-is):</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: tmpl.body }} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
