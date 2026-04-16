"use client";

import { useState, useTransition, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createTask, updateTask, deleteTask } from "@/app/actions/tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, CalendarDays, AlertTriangle, CheckCircle2, Clock, User, Loader2, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskItem = {
  id: string;
  title: string;
  description?: string;
  event_id?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed";
  due_date?: string;
  assigned_to?: string;
};

const priorityColors = {
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const statusColumns = [
  { key: "pending", label: "To Do", icon: Clock },
  { key: "in_progress", label: "In Progress", icon: AlertTriangle },
  { key: "completed", label: "Done", icon: CheckCircle2 },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  due_date: "",
  assigned_to: "",
};

export default function TasksPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<TaskItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tasks")
      .select("id, title, description, event_id, priority, status, due_date, assigned_to")
      .order("due_date", { ascending: true, nullsFirst: false })
      .then(({ data }) => {
        setTasks((data ?? []) as TaskItem[]);
        setLoading(false);
      });
  }, []);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.assigned_to ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (t: TaskItem) =>
    !!t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed";

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setActionError(null);
    setIsDialogOpen(true);
  };

  const openEdit = (task: TaskItem) => {
    setForm({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ?? "",
      assigned_to: task.assigned_to ?? "",
    });
    setEditTarget(task);
    setActionError(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { setActionError("Title is required."); return; }
    setActionError(null);
    startTransition(async () => {
      if (editTarget) {
        const result = await updateTask(editTarget.id, {
          title: form.title.trim(),
          description: form.description || undefined,
          priority: form.priority,
          status: form.status,
          due_date: form.due_date || undefined,
          assigned_to: form.assigned_to || undefined,
        });
        if (result.error) { setActionError(result.error); return; }
        setTasks((prev) => prev.map((t) => t.id === editTarget.id ? { ...t, ...form, title: form.title.trim() } as TaskItem : t));
      } else {
        const result = await createTask({
          title: form.title.trim(),
          description: form.description || undefined,
          priority: form.priority,
          status: form.status,
          due_date: form.due_date || undefined,
          assigned_to: form.assigned_to || undefined,
        });
        if (result.error) { setActionError(result.error); return; }
        if (result.data) setTasks((prev) => [...prev, result.data as TaskItem]);
      }
      setIsDialogOpen(false);
    });
  };

  const handleDelete = (taskId: string) => {
    startTransition(async () => {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setIsDialogOpen(false);
    });
  };

  const handleToggleComplete = (task: TaskItem) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: newStatus } : t));
    startTransition(async () => {
      const result = await updateTask(task.id, { status: newStatus });
      if (result.error) {
        setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status: task.status } : t));
        setActionError(result.error);
      }
    });
  };

  const overdueCount = tasks.filter(isOverdue).length;
  const openCount = tasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading…" : `${overdueCount} overdue — ${openCount} open`}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border">
            <Button variant={view === "board" ? "secondary" : "ghost"} size="sm" onClick={() => setView("board")}>Board</Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}>List</Button>
          </div>
          <Button className="bg-sage hover:bg-sage-dark" onClick={openNew} disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tasks..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Board View */}
      {!loading && view === "board" && (
        <div className="grid gap-4 md:grid-cols-3">
          {statusColumns.map((col) => {
            const colTasks = filtered.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center gap-2 px-2">
                  <col.icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">{col.label}</h3>
                  <Badge variant="secondary" className="text-xs">{colTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={cn("cursor-pointer hover:shadow-md transition-shadow", isOverdue(task) && "border-red-200 dark:border-red-800")}
                      onClick={() => openEdit(task)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium">{task.title}</p>
                          {isOverdue(task) && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            <span className={cn(isOverdue(task) && "text-red-500 font-medium")}>
                              Due {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        )}
                        {task.assigned_to && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />{task.assigned_to}
                          </div>
                        )}
                        <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="flex items-center justify-center h-24 rounded-lg border border-dashed text-sm text-muted-foreground">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && view === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((task) => (
                <div key={task.id} className={cn("flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30", isOverdue(task) && "bg-red-50/50 dark:bg-red-950/10")} onClick={() => openEdit(task)}>
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={() => handleToggleComplete(task)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", task.status === "completed" && "line-through text-muted-foreground")}>{task.title}</p>
                    {task.assigned_to && (
                      <p className="text-xs text-muted-foreground mt-0.5">{task.assigned_to}</p>
                    )}
                  </div>
                  <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                  {task.due_date && (
                    <span className={cn("text-xs", isOverdue(task) ? "text-red-500 font-medium" : "text-muted-foreground")}>
                      Due {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">No tasks found</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!isPending) { setIsDialogOpen(open); setActionError(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {actionError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g., Confirm venue access" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional details..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["urgent", "high", "medium", "low"].map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Assigned To</Label>
                <Input value={form.assigned_to} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))} placeholder="Name or email" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between">
            <div>
              {editTarget && (
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(editTarget.id)} disabled={isPending}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>Cancel</Button>
              <Button className="bg-sage hover:bg-sage-dark" onClick={handleSave} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editTarget ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
