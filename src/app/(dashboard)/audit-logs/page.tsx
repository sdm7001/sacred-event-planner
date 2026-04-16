"use client";

import { useState, useTransition, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  changed_by: string;
  changed_at: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
}

const ACTION_COLOR: Record<string, string> = {
  INSERT: "bg-green-100 text-green-800 border-green-200",
  UPDATE: "bg-blue-100 text-blue-800 border-blue-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [tableFilter, setTableFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [tables, setTables] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();
      const role = (roleData as { role?: string } | null)?.role ?? "";
      if (role !== "super_admin" && role !== "admin") {
        router.replace("/");
        return;
      }
      setAuthorized(true);
    });
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    startTransition(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("audit_logs")
        .select("id, action, table_name, record_id, changed_by, changed_at, old_values, new_values")
        .order("changed_at", { ascending: false })
        .limit(500);

      const rows = (data ?? []) as AuditLog[];
      setLogs(rows);
      setTables([...new Set(rows.map((r) => r.table_name))].sort());
    });
  }, [authorized]);

  const filtered = logs.filter((log) => {
    if (tableFilter !== "all" && log.table_name !== tableFilter) return false;
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.table_name?.toLowerCase().includes(q) ||
        log.record_id?.toLowerCase().includes(q) ||
        log.changed_by?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!authorized) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">System activity and data change history</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by table, record ID, user..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All tables" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tables</SelectItem>
                {tables.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="INSERT">INSERT</SelectItem>
                <SelectItem value="UPDATE">UPDATE</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No audit logs found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Changed By</TableHead>
                  <TableHead className="w-20">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log) => (
                  <Fragment key={log.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    >
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(log.changed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono ${ACTION_COLOR[log.action] ?? "bg-muted text-muted-foreground"}`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{log.table_name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                        {log.record_id}
                      </TableCell>
                      <TableCell className="text-sm">{log.changed_by || "system"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {(log.old_values || log.new_values) ? (
                          <span className="text-sage hover:underline">
                            {expanded === log.id ? "hide" : "show"}
                          </span>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                    {expanded === log.id && (log.old_values || log.new_values) && (
                      <TableRow key={`${log.id}-detail`}>
                        <TableCell colSpan={6} className="bg-muted/30 p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {log.old_values && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Before</p>
                                <pre className="text-xs bg-background rounded p-2 border overflow-auto max-h-40">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">After</p>
                                <pre className="text-xs bg-background rounded p-2 border overflow-auto max-h-40">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!isPending && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filtered.length} of {logs.length} entries (max 500)
        </p>
      )}
    </div>
  );
}
