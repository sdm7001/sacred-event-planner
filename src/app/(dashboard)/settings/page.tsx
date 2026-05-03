"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Key, Mail, Globe, Database, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
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
            <Label>Organization Name</Label>
            <Input defaultValue="Sacred Gatherings" />
          </div>
          <div className="space-y-2">
            <Label>Primary Contact Email</Label>
            <Input defaultValue="info@sacredgatherings.com" />
          </div>
          <div className="space-y-2">
            <Label>Default Timezone</Label>
            <Select defaultValue="America/Chicago">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern</SelectItem>
                <SelectItem value="America/Chicago">Central</SelectItem>
                <SelectItem value="America/Denver">Mountain</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-sage hover:bg-sage-dark"><Save className="mr-2 h-4 w-4" />Save</Button>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-4 w-4 text-sage" />Email (Resend)</CardTitle>
          <CardDescription>Configure email sending via Resend API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Resend API Key</Label>
            <Input type="password" placeholder="re_..." />
          </div>
          <div className="space-y-2">
            <Label>From Email</Label>
            <Input defaultValue="noreply@sacredgatherings.com" />
          </div>
          <div className="space-y-2">
            <Label>From Name</Label>
            <Input defaultValue="Sacred Gatherings" />
          </div>
          <div className="space-y-2">
            <Label>Reply-To Email</Label>
            <Input defaultValue="info@sacredgatherings.com" />
          </div>
          <Button className="bg-sage hover:bg-sage-dark"><Save className="mr-2 h-4 w-4" />Save</Button>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Key className="h-4 w-4 text-sage" />API Keys</CardTitle>
          <CardDescription>External service integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Google Maps API Key</Label>
            <Input type="password" placeholder="AIza..." />
            <p className="text-xs text-muted-foreground">Used for geocoding and directions links</p>
          </div>
          <Button className="bg-sage hover:bg-sage-dark"><Save className="mr-2 h-4 w-4" />Save</Button>
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
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Overdue Task Alerts</Label>
              <p className="text-xs text-muted-foreground">Daily digest of overdue tasks</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Missing Waiver Alerts</Label>
              <p className="text-xs text-muted-foreground">Flag unsigned waivers 7 days before event</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Provider Conflict Detection</Label>
              <p className="text-xs text-muted-foreground">Alert on double-booked providers</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-4 w-4 text-sage" />Security & Access</CardTitle>
          <CardDescription>Role-based access control settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
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
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Database className="h-4 w-4 text-sage" />Database</CardTitle>
          <CardDescription>Supabase connection settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Supabase URL</Label>
            <Input type="password" placeholder="https://xxxxx.supabase.co" />
          </div>
          <div className="space-y-2">
            <Label>Supabase Anon Key</Label>
            <Input type="password" placeholder="eyJ..." />
          </div>
          <Button className="bg-sage hover:bg-sage-dark"><Save className="mr-2 h-4 w-4" />Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
