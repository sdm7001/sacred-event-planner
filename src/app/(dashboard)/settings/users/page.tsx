"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Plus, Pencil, Key, Trash2, Loader2, CheckCircle2, AlertTriangle, RefreshCw, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type UserRole = "super_admin" | "admin" | "coordinator" | "provider" | "participant";

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  role_id?: string; // id in user_roles table
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

const ALL_ROLES: UserRole[] = ["super_admin", "admin", "coordinator", "provider", "participant"];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit dialog
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  // Invite dialog
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("coordinator");
  const [inviteName, setInviteName] = useState("");
  const [inviteSaving, setInviteSaving] = useState(false);

  // Password reset dialog
  const [resetUser, setResetUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSaving, setResetSaving] = useState(false);

  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const showMessage = (type: "success" | "error", text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 5000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Join user_roles → users to get the full picture
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, role, user:user_id(id, email, full_name)");

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: UserRecord[] = (data as any[]).map((row) => ({
          id: row.user?.id || row.id,
          email: row.user?.email || "",
          full_name: row.user?.full_name || "(no name)",
          role: row.role as UserRole,
          role_id: row.id,
        }));
        setUsers(mapped);
      } else {
        // No roles assigned yet — fall back to raw users list
        const { data: rawUsers } = await supabase
          .from("users")
          .select("id, email, full_name");
        setUsers(
          (rawUsers || []).map((u: any) => ({
            id: u.id,
            email: u.email || "",
            full_name: u.full_name || "",
            role: "participant" as UserRole,
          }))
        );
      }
    } catch (err: any) {
      showMessage("error", `Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEdit = (user: UserRecord) => {
    setEditUser({ ...user });
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try {
      const supabase = createClient();

      // Update full_name in users table
      const { error: nameErr } = await supabase
        .from("users")
        .update({ full_name: editUser.full_name })
        .eq("id", editUser.id);
      if (nameErr) throw nameErr;

      // Update role in user_roles table
      if (editUser.role_id) {
        const { error: roleErr } = await supabase
          .from("user_roles")
          .update({ role: editUser.role })
          .eq("id", editUser.role_id);
        if (roleErr) throw roleErr;
      }

      setUsers((prev) => prev.map((u) => (u.id === editUser.id ? editUser : u)));
      showMessage("success", `User "${editUser.full_name}" updated.`);
      setIsEditOpen(false);
    } catch (err: any) {
      showMessage("error", `Update failed: ${err.message}`);
    } finally {
      setEditSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetUser || !newPassword) return;
    setResetSaving(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetUser.id, email: resetUser.email, newPassword }),
      });
      const result = await res.json();
      if (result.success) {
        showMessage("success", `Password updated for ${resetUser.full_name}.`);
        setResetUser(null);
        setNewPassword("");
      } else {
        showMessage("error", result.error || "Password reset failed.");
      }
    } catch {
      showMessage("error", "Password reset request failed.");
    } finally {
      setResetSaving(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail || !inviteName) return;
    setInviteSaving(true);
    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, full_name: inviteName, role: inviteRole }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to create user");

      const newUser: UserRecord = {
        id: result.user?.id || `new-${Date.now()}`,
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole,
      };
      setUsers((prev) => [...prev, newUser]);
      showMessage("success", `User "${inviteName}" created successfully.`);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("coordinator");
    } catch (err: any) {
      showMessage("error", err.message || "Failed to create user");
    } finally {
      setInviteSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleteSaving(true);
    try {
      const supabase = createClient();

      // Delete role first (FK), then user record
      if (deleteUser.role_id) {
        await supabase.from("user_roles").delete().eq("id", deleteUser.role_id);
      }
      const { error } = await supabase.from("users").delete().eq("id", deleteUser.id);
      if (error) throw error;

      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      showMessage("success", `User "${deleteUser.full_name}" deleted.`);
    } catch (err: any) {
      showMessage("error", `Delete failed: ${err.message}`);
    } finally {
      setDeleteSaving(false);
      setDeleteUser(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage access, roles, and accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button className="bg-sage hover:bg-sage-dark" onClick={() => setIsInviteOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />Add User
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          actionMsg.type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {actionMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {actionMsg.text}
        </div>
      )}

      {/* Role legend */}
      <Card className="border-sage/30 bg-sage/5">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            {(Object.entries(ROLE_LABELS) as [UserRole, string][]).map(([role, label]) => (
              <div key={role} className="flex flex-col gap-1">
                <Badge className={ROLE_COLORS[role]}>{label}</Badge>
                <span className="text-xs text-muted-foreground">
                  {role === "super_admin" && "Full access, manage users"}
                  {role === "admin" && "Manage events & people"}
                  {role === "coordinator" && "Run events, update info"}
                  {role === "provider" && "View assigned events"}
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
          <CardDescription>
            {loading ? "Loading..." : `${users.length} user${users.length !== 1 ? "s" : ""} with system access`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="text-left py-3 pr-4">Name / Email</th>
                    <th className="text-left py-3 pr-4">Role</th>
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
                        <Badge className={ROLE_COLORS[user.role] || "bg-stone-100 text-stone-700"}>
                          {ROLE_LABELS[user.role] || user.role}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(user)}>
                            <Pencil className="h-3 w-3 mr-1" />Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-muted-foreground"
                            onClick={() => { setResetUser(user); setNewPassword(""); }}>
                            <Key className="h-3 w-3 mr-1" />Reset PW
                          </Button>
                          {user.role !== "super_admin" && (
                            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteUser(user)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                <Input value={editUser.email} disabled className="opacity-60 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email is read-only</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editUser.role}
                  onValueChange={(v) => setEditUser({ ...editUser, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={saveEdit} disabled={editSaving}>
              {editSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={!!resetUser} onOpenChange={(open) => { if (!open) { setResetUser(null); setNewPassword(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set a new password for <span className="font-medium text-foreground">{resetUser?.full_name}</span>.
            </p>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Min 6 characters" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="rounded-lg bg-amber-50 border-l-4 border-amber-400 p-3 text-sm text-amber-800">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              User must log in with this new password.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetUser(null); setNewPassword(""); }}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleResetPassword}
              disabled={resetSaving || newPassword.length < 6}>
              {resetSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
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
                  {ALL_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
              <Mail className="inline h-4 w-4 mr-1" />
              User record will be created. Provide them with the login URL and set their password via Reset PW.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={sendInvite}
              disabled={inviteSaving || !inviteEmail || !inviteName}>
              {inviteSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : <><Plus className="mr-2 h-4 w-4" />Create User</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-medium text-foreground">{deleteUser?.full_name}</span> ({deleteUser?.email})? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteSaving}>
              {deleteSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
