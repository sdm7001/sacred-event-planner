"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Shield, Plus, Pencil, Key, Mail, Loader2, AlertCircle } from "lucide-react";
import { inviteUser, updateUser, resetUserPassword } from "@/app/actions/users";

type UserRole = "super_admin" | "admin" | "coordinator" | "provider" | "participant";

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  last_sign_in?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  coordinator: "Coordinator",
  provider: "Provider",
  participant: "Participant",
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: "bg-red-100 text-red-800",
  admin: "bg-sage/20 text-sage-dark",
  coordinator: "bg-blue-100 text-blue-800",
  provider: "bg-amber-100 text-amber-800",
  participant: "bg-stone-100 text-stone-700",
};

// Seed display data — replace with real Supabase query in production
const MOCK_USERS: UserRecord[] = [
  { id: "1", email: "smcauley@texmg.com", full_name: "Scott McAuley", role: "super_admin", is_active: true, last_sign_in: "2026-04-15" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("coordinator");
  const [inviteName, setInviteName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const flashSuccess = (msg: string) => {
    setActionSuccess(msg);
    setActionError(null);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const openEdit = (user: UserRecord) => {
    setEditUser({ ...user });
    setIsEditOpen(true);
  };

  const saveEdit = () => {
    if (!editUser) return;
    setActionError(null);
    startTransition(async () => {
      const result = await updateUser(editUser.id, {
        full_name: editUser.full_name,
        role: editUser.role,
        is_active: editUser.is_active,
      });
      if (result.error) {
        setActionError(result.error);
      } else {
        setUsers((prev) => prev.map((u) => (u.id === editUser.id ? editUser : u)));
        setIsEditOpen(false);
        flashSuccess("User updated successfully.");
      }
    });
  };

  const toggleActive = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user || user.role === "super_admin") return;
    const newActive = !user.is_active;
    setActionError(null);
    startTransition(async () => {
      const result = await updateUser(userId, { is_active: newActive });
      if (result.error) {
        setActionError(result.error);
      } else {
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: newActive } : u));
      }
    });
  };

  const sendInvite = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await inviteUser(inviteEmail, inviteName, inviteRole);
      if (result.error) {
        setActionError(result.error);
      } else {
        setIsInviteOpen(false);
        setInviteEmail("");
        setInviteName("");
        flashSuccess(`Invite sent to ${inviteEmail}.`);
      }
    });
  };

  const handleResetPassword = (email: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await resetUserPassword(email);
      if (result.error) {
        setActionError(result.error);
      } else {
        flashSuccess(`Password reset email sent to ${email}.`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage access, roles, and invitations</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => setIsInviteOpen(true)} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />Invite User
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <Loader2 className="h-4 w-4 shrink-0 hidden" />{actionSuccess}
        </div>
      )}

      {/* Role info */}
      <Card className="border-sage/30 bg-sage/5">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
              <div key={role} className="flex flex-col gap-1">
                <Badge className={ROLE_COLORS[role]}>{label}</Badge>
                <span className="text-xs text-muted-foreground">
                  {role === "super_admin" && "Full access, manage users"}
                  {role === "admin" && "Manage events & people"}
                  {role === "coordinator" && "Operational access"}
                  {role === "provider" && "Own events only"}
                  {role === "participant" && "Own info only"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-4 w-4 text-sage" />System Users
          </CardTitle>
          <CardDescription>{users.length} user{users.length !== 1 ? "s" : ""} with system access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Name / Email</th>
                  <th className="text-left py-3 pr-4">Role</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Last Login</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-earth/5 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={ROLE_COLORS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => toggleActive(user.id)}
                          disabled={user.role === "super_admin"}
                        />
                        <span className={user.is_active ? "text-green-700" : "text-red-600"}>
                          {user.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {user.last_sign_in || "—"}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                          <Pencil className="h-3 w-3 mr-1" />Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-muted-foreground"
                          onClick={() => handleResetPassword(user.email)}
                          disabled={isPending}>
                          {isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Key className="h-3 w-3 mr-1" />}Reset PW
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editUser.email} disabled className="opacity-60 cursor-not-allowed"
                  title="Email changes must be done through Supabase Auth" />
                <p className="text-xs text-muted-foreground">Email is managed via Supabase Auth</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editUser.role}
                  onValueChange={(v) => setEditUser({ ...editUser, role: v as UserRole })}
                  disabled={editUser.role === "super_admin"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="participant">Participant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editUser.is_active}
                  onCheckedChange={(v) => setEditUser({ ...editUser, is_active: v })}
                  disabled={editUser.role === "super_admin"} />
                <Label>Account active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={saveEdit} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="Jane Smith" value={inviteName}
                onChange={(e) => setInviteName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input placeholder="user@example.com" type="email" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
              <Mail className="inline h-4 w-4 mr-1" />
              An invite email will be sent with a secure link to set their password.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={sendInvite}
              disabled={!inviteEmail || !inviteName || isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
