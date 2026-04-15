"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, CalendarDays, AlertTriangle, CheckCircle2, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskItem = {
  id: string;
  title: string;
  event: string;
  eventId: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed";
  due: string;
  owner: string;
  overdue: boolean;
};

const allTasks: TaskItem[] = [
  { id: "1", title: "Confirm venue access", event: "Spring Equinox", eventId: "1", priority: "high", status: "pending", due: "Mar 15", owner: "Maya Chen", overdue: true },
  { id: "2", title: "Send prep instructions to new participants", event: "Spring Equinox", eventId: "1", priority: "urgent", status: "pending", due: "Mar 12", owner: "Maya Chen", overdue: true },
  { id: "3", title: "Print waiver forms", event: "Spring Equinox", eventId: "1", priority: "medium", status: "completed", due: "Mar 18", owner: "River Stone", overdue: false },
  { id: "4", title: "Arrange transportation for providers", event: "Spring Equinox", eventId: "1", priority: "medium", status: "in_progress", due: "Mar 17", owner: "Luna Martinez", overdue: false },
  { id: "5", title: "Order sage bundles", event: "New Moon Ceremony", eventId: "2", priority: "high", status: "pending", due: "Mar 20", owner: "Maya Chen", overdue: false },
  { id: "6", title: "Set up sound equipment", event: "New Moon Ceremony", eventId: "2", priority: "medium", status: "pending", due: "Mar 28", owner: "Luna Martinez", overdue: false },
  { id: "7", title: "Confirm dietary requirements", event: "Spring Equinox", eventId: "1", priority: "high", status: "in_progress", due: "Mar 16", owner: "Oak Williams", overdue: false },
  { id: "8", title: "Draft event schedule", event: "Summer Solstice", eventId: "3", priority: "low", status: "pending", due: "May 1", owner: "River Stone", overdue: false },
];

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

export default function TasksPage() {
  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");

  const filtered = allTasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.event.toLowerCase().includes(search.toLowerCase()) ||
    t.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {allTasks.filter((t) => t.overdue).length} overdue -- {allTasks.filter((t) => t.status !== "completed").length} open
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border">
            <Button variant={view === "board" ? "secondary" : "ghost"} size="sm" onClick={() => setView("board")}>Board</Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setView("list")}>List</Button>
          </div>
          <Button className="bg-sage hover:bg-sage-dark"><Plus className="mr-2 h-4 w-4" /> New Task</Button>
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

      {/* Board View */}
      {view === "board" && (
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
                    <Card key={task.id} className={cn("cursor-pointer hover:shadow-md transition-shadow", task.overdue && "border-red-200 dark:border-red-800")}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium">{task.title}</p>
                          {task.overdue && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs"><CalendarDays className="mr-1 h-3 w-3" />{task.event}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.owner}</span>
                          <span className={cn(task.overdue && "text-red-500 font-medium")}>Due {task.due}</span>
                        </div>
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
      {view === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map((task) => (
                <div key={task.id} className={cn("flex items-center gap-4 p-4", task.overdue && "bg-red-50/50 dark:bg-red-950/10")}>
                  <Checkbox checked={task.status === "completed"} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", task.status === "completed" && "line-through text-muted-foreground")}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{task.event}</span>
                      <span>--</span>
                      <span>{task.owner}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                  <span className={cn("text-xs", task.overdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                    Due {task.due}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
