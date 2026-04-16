"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Copy, Eye, Code, Trash2, Loader2, AlertCircle } from "lucide-react";
import {
  createEmailTemplate,
  updateEmailTemplate,
  cloneEmailTemplate,
  deleteEmailTemplate,
} from "@/app/actions/email-templates";

interface Template {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  is_active: boolean;
}

const SEED_TEMPLATES: Template[] = [
  {
    id: "t1",
    name: "Event Invitation",
    subject: "You're Invited: {{event_name}}",
    body_html: `<h2>Dear {{first_name}},</h2><p>You are warmly invited to <strong>{{event_name}}</strong>.</p><p><strong>Date:</strong> {{event_date}}<br/><strong>Location:</strong> {{venue_name}}</p><p>Please confirm your attendance at your earliest convenience.</p><p>With warmth,<br/>The Team</p>`,
    is_active: true,
  },
  {
    id: "t2",
    name: "Prep Instructions",
    subject: "Preparation Guide for {{event_name}}",
    body_html: `<h2>Hello {{first_name}},</h2><p>Your upcoming event <strong>{{event_name}}</strong> is approaching. Here is your preparation guide:</p><p>{{prep_instructions}}</p><h3>Directions</h3><p><a href="{{directions_link}}">Click here for directions to {{venue_name}}</a></p>`,
    is_active: true,
  },
  {
    id: "t3",
    name: "Day-Of Reminder",
    subject: "Today's the Day: {{event_name}}",
    body_html: `<h2>Good morning {{first_name}},</h2><p><strong>{{event_name}}</strong> is today!</p><p><strong>Location:</strong> {{venue_name}}</p><p><a href="{{directions_link}}">Get Directions</a></p>`,
    is_active: true,
  },
  {
    id: "t4",
    name: "Provider Assignment",
    subject: "Your Role at {{event_name}}",
    body_html: `<h2>Hello {{provider_name}},</h2><p>Thank you for joining us at <strong>{{event_name}}</strong>.</p><p><strong>Your Role:</strong> {{assigned_role}}<br/><strong>Date:</strong> {{event_date}}<br/><strong>Location:</strong> {{venue_name}}</p>`,
    is_active: true,
  },
];

const TOKEN_REFERENCE = [
  "first_name", "last_name", "full_name", "email",
  "event_name", "event_date", "venue_name", "venue_address",
  "directions_link", "prep_instructions", "provider_name", "assigned_role",
];

const EMPTY_FORM = { name: "", subject: "", body_html: "", body_text: "", is_active: true };

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(SEED_TEMPLATES);
  const [preview, setPreview] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setIsNewOpen(true);
    setActionError(null);
  };

  const openEdit = (tmpl: Template) => {
    setForm({ name: tmpl.name, subject: tmpl.subject, body_html: tmpl.body_html, body_text: tmpl.body_text ?? "", is_active: tmpl.is_active });
    setEditTarget(tmpl);
    setIsNewOpen(true);
    setActionError(null);
  };

  const handleSave = () => {
    if (!form.name || !form.subject || !form.body_html) {
      setActionError("Name, subject, and body are required.");
      return;
    }
    setActionError(null);
    startTransition(async () => {
      if (editTarget) {
        const result = await updateEmailTemplate(editTarget.id, form);
        if (result.error) { setActionError(result.error); return; }
        setTemplates((prev) => prev.map((t) => t.id === editTarget.id ? { ...t, ...form } : t));
      } else {
        const result = await createEmailTemplate(form);
        if (result.error) { setActionError(result.error); return; }
        if (result.data) setTemplates((prev) => [...prev, result.data as Template]);
      }
      setIsNewOpen(false);
    });
  };

  const handleClone = (tmpl: Template) => {
    startTransition(async () => {
      const result = await cloneEmailTemplate(tmpl.id);
      if (result.error) { setActionError(result.error); return; }
      if (result.data) setTemplates((prev) => [...prev, { ...result.data as Template }]);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteEmailTemplate(id);
      if (result.error) { setActionError(result.error); return; }
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    });
  };

  const handleToggleActive = (tmpl: Template) => {
    startTransition(async () => {
      const result = await updateEmailTemplate(tmpl.id, { is_active: !tmpl.is_active });
      if (result.error) { setActionError(result.error); return; }
      setTemplates((prev) => prev.map((t) => t.id === tmpl.id ? { ...t, is_active: !t.is_active } : t));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-1">Reusable templates with dynamic token replacement</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={openNew} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
        </div>
      )}

      {/* Token Reference */}
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
            {TOKEN_REFERENCE.map((t) => (
              <Badge key={t} variant="outline" className="font-mono text-xs cursor-default">
                {`{{${t}}}`}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((tmpl) => (
          <Card key={tmpl.id} className={tmpl.is_active ? "" : "opacity-60"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tmpl.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={tmpl.is_active}
                    onCheckedChange={() => handleToggleActive(tmpl)}
                    disabled={isPending}
                  />
                  <Badge variant={tmpl.is_active ? "sage" : "secondary"}>
                    {tmpl.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <CardDescription className="font-mono text-xs">{tmpl.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => setPreview(tmpl.id === preview ? null : tmpl.id)}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(tmpl)} disabled={isPending}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleClone(tmpl)} disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                    Clone
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(tmpl.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {preview === tmpl.id && (
                  <div className="mt-3 p-4 rounded-lg border bg-background">
                    <p className="text-xs text-muted-foreground mb-2">Preview (tokens shown as-is):</p>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: tmpl.body_html }} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isNewOpen} onOpenChange={(open) => { if (!isPending) { setIsNewOpen(open); setActionError(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? `Edit: ${editTarget.name}` : "New Email Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {actionError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tmpl-name">Template Name *</Label>
                <Input id="tmpl-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., Welcome Email" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                <Label>Active</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tmpl-subject">Subject Line *</Label>
              <Input id="tmpl-subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="e.g., You're invited to {{event_name}}" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tmpl-body">HTML Body *</Label>
              <Textarea id="tmpl-body" value={form.body_html} onChange={(e) => setForm((f) => ({ ...f, body_html: e.target.value }))} rows={12} className="font-mono text-xs" placeholder="<h2>Hello {{first_name}},</h2><p>...</p>" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tmpl-text">Plain Text Body <span className="text-muted-foreground text-xs">(optional fallback)</span></Label>
              <Textarea id="tmpl-text" value={form.body_text} onChange={(e) => setForm((f) => ({ ...f, body_text: e.target.value }))} rows={4} placeholder="Hello {{first_name}}, ..." />
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium mb-2">Available tokens:</p>
              <div className="flex flex-wrap gap-1">
                {TOKEN_REFERENCE.map((t) => (
                  <Badge key={t} variant="outline" className="font-mono text-xs">{`{{${t}}}`}</Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editTarget ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
