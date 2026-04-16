"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Key, Mail, Globe, Database, Shield, Bell, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { saveOrgSettings, saveNotificationSettings } from "@/app/actions/settings";

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveFeedback({ state, error }: { state: SaveState; error?: string }) {
  if (state === "saving") return <span className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Saving…</span>;
  if (state === "saved") return <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Saved</span>;
  if (state === "error") return <span className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error ?? "Save failed"}</span>;
  return null;
}

export default function SettingsPage() {
  // Org settings state
  const [orgName, setOrgName] = useState("Sacred Gatherings");
  const [contactEmail, setContactEmail] = useState("info@sacredgatherings.com");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [orgSaveState, setOrgSaveState] = useState<SaveState>("idle");
  const [orgSaveError, setOrgSaveError] = useState<string>();

  // Notification settings state
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [overdueTaskAlerts, setOverdueTaskAlerts] = useState(true);
  const [missingWaiverAlerts, setMissingWaiverAlerts] = useState(true);
  const [providerConflict, setProviderConflict] = useState(true);
  const [notifSaveState, setNotifSaveState] = useState<SaveState>("idle");
  const [notifSaveError, setNotifSaveError] = useState<string>();

  const [isPending, startTransition] = useTransition();

  const handleSaveOrg = () => {
    setOrgSaveState("saving");
    setOrgSaveError(undefined);
    startTransition(async () => {
      const result = await saveOrgSettings({ org_name: orgName, contact_email: contactEmail, timezone });
      if (result.error) {
        setOrgSaveState("error");
        setOrgSaveError(result.error);
      } else {
        setOrgSaveState("saved");
        setTimeout(() => setOrgSaveState("idle"), 3000);
      }
    });
  };

  const handleSaveNotifications = () => {
    setNotifSaveState("saving");
    setNotifSaveError(undefined);
    startTransition(async () => {
      const result = await saveNotificationSettings({
        low_stock_alerts: lowStockAlerts,
        overdue_task_alerts: overdueTaskAlerts,
        missing_waiver_alerts: missingWaiverAlerts,
        provider_conflict_detection: providerConflict,
      });
      if (result.error) {
        setNotifSaveState("error");
        setNotifSaveError(result.error);
      } else {
        setNotifSaveState("saved");
        setTimeout(() => setNotifSaveState("idle"), 3000);
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Organization settings and defaults</p>
      </div>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-4 w-4 text-sage" />Organization</CardTitle>
          <CardDescription>Basic organization information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org_name">Organization Name</Label>
            <Input id="org_name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">Primary Contact Email</Label>
            <Input id="contact_email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Default Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern</SelectItem>
                <SelectItem value="America/Chicago">Central</SelectItem>
                <SelectItem value="America/Denver">Mountain</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleSaveOrg} disabled={isPending}>
              {orgSaveState === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <SaveFeedback state={orgSaveState} error={orgSaveError} />
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-4 w-4 text-sage" />Email (Resend)</CardTitle>
          <CardDescription>Configure email sending via Resend API. These values are set in your <code className="text-xs bg-muted px-1 rounded">.env.local</code> file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            Email credentials are managed via environment variables for security. Update <code className="text-xs bg-amber-100 px-1 rounded">.env.local</code> to change these values.
          </div>
          <div className="space-y-2">
            <Label>RESEND_API_KEY</Label>
            <Input type="password" value="••••••••••••••••" readOnly className="opacity-60 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label>EMAIL_FROM_ADDRESS</Label>
            <Input value={process.env.EMAIL_FROM_ADDRESS ?? "noreply@sacredgatherings.com"} readOnly className="opacity-60 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label>EMAIL_FROM_NAME</Label>
            <Input value={process.env.EMAIL_FROM_NAME ?? "Sacred Gatherings"} readOnly className="opacity-60 cursor-not-allowed" />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Key className="h-4 w-4 text-sage" />API Keys</CardTitle>
          <CardDescription>External service integrations — managed via environment variables.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            API keys are managed via environment variables. Update <code className="text-xs bg-amber-100 px-1 rounded">.env.local</code> to change these values.
          </div>
          <div className="space-y-2">
            <Label>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</Label>
            <Input type="password" value="••••••••••••••••" readOnly className="opacity-60 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Used for geocoding and directions links</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-4 w-4 text-sage" />Notifications</CardTitle>
          <CardDescription>Default notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Low Stock Alerts</Label>
              <p className="text-xs text-muted-foreground">Notify when materials fall below threshold</p>
            </div>
            <Switch checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Overdue Task Alerts</Label>
              <p className="text-xs text-muted-foreground">Daily digest of overdue tasks</p>
            </div>
            <Switch checked={overdueTaskAlerts} onCheckedChange={setOverdueTaskAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Missing Waiver Alerts</Label>
              <p className="text-xs text-muted-foreground">Flag unsigned waivers 7 days before event</p>
            </div>
            <Switch checked={missingWaiverAlerts} onCheckedChange={setMissingWaiverAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Provider Conflict Detection</Label>
              <p className="text-xs text-muted-foreground">Alert on double-booked providers</p>
            </div>
            <Switch checked={providerConflict} onCheckedChange={setProviderConflict} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleSaveNotifications} disabled={isPending}>
              {notifSaveState === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <SaveFeedback state={notifSaveState} error={notifSaveError} />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-4 w-4 text-sage" />Security & Access</CardTitle>
          <CardDescription>Role-based access control settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { role: "Super Admin", desc: "Full system access, user management, audit logs", count: 1 },
            { role: "Admin / Coordinator", desc: "Event management, participant management, reporting", count: 2 },
            { role: "Provider", desc: "View assigned events, own schedule, limited materials", count: 7 },
            { role: "Participant", desc: "View own profile, event details, prep instructions", count: 18 },
          ].map((r) => (
            <div key={r.role} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">{r.role}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <Badge variant="secondary">{r.count} users</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Database */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Database className="h-4 w-4 text-sage" />Database</CardTitle>
          <CardDescription>Supabase connection — managed via environment variables.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            Database credentials are managed via environment variables. Update <code className="text-xs bg-amber-100 px-1 rounded">.env.local</code> to change these values.
          </div>
          <div className="space-y-2">
            <Label>NEXT_PUBLIC_SUPABASE_URL</Label>
            <Input type="password" value="••••••••••••••••" readOnly className="opacity-60 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label>NEXT_PUBLIC_SUPABASE_ANON_KEY</Label>
            <Input type="password" value="••••••••••••••••" readOnly className="opacity-60 cursor-not-allowed" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
