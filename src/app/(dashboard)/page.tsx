import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function getStatusVariant(status: string) {
  switch (status) {
    case "confirmed": return "sage" as const;
    case "scheduled": return "default" as const;
    case "draft": return "secondary" as const;
    default: return "outline" as const;
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent": return "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";
    case "high": return "text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400";
    case "medium": return "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400";
    default: return "text-muted-foreground bg-muted";
  }
}

function formatEventDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  }
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Upcoming events (next 90 days, not completed/canceled)
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, status, start_datetime, end_datetime, capacity, current_participant_count")
    .gte("start_datetime", now)
    .not("status", "in", '("completed","canceled")')
    .order("start_datetime", { ascending: true })
    .limit(5);

  // Overdue tasks
  const { data: overdueTasks } = await supabase
    .from("tasks")
    .select("id, title, priority, due_date, event_id, events(title)")
    .lt("due_date", new Date().toISOString().split("T")[0])
    .not("status", "in", '("completed","canceled")')
    .order("due_date", { ascending: true })
    .limit(5);

  // Low stock materials
  const { data: lowStockItems } = await supabase
    .from("materials_catalog")
    .select("id, name, in_house_qty, reorder_threshold, unit_of_measure")
    .eq("is_active", true)
    .filter("in_house_qty", "lt", "reorder_threshold")
    .order("in_house_qty", { ascending: true })
    .limit(5);

  // Today's scheduled email jobs
  const { data: todayReminders } = await supabase
    .from("email_jobs")
    .select("id, scheduled_for, email_templates(name, subject), events(title)")
    .eq("status", "pending")
    .gte("scheduled_for", todayStart.toISOString())
    .lte("scheduled_for", todayEnd.toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(5);

  // Stats
  type UpcomingEvent = NonNullable<typeof upcomingEvents>[number];

  const totalParticipants = (upcomingEvents ?? []).reduce(
    (sum: number, e: UpcomingEvent) => sum + (e.current_participant_count ?? 0),
    0
  );
  const avgReadiness =
    (upcomingEvents ?? []).length > 0
      ? Math.round(
          (upcomingEvents ?? []).reduce((sum: number, e: UpcomingEvent) => {
            const pct = e.capacity ? (e.current_participant_count / e.capacity) * 100 : 0;
            return sum + pct;
          }, 0) / (upcomingEvents ?? []).length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your events, tasks, and operations
          </p>
        </div>
        <Link href="/events/new">
          <Button className="bg-sage hover:bg-sage-dark">
            <CalendarDays className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(upcomingEvents ?? []).length}</div>
            <p className="text-xs text-muted-foreground">Next 90 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Across active events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {(overdueTasks ?? []).length}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fill Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-sage" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sage">{avgReadiness}%</div>
            <p className="text-xs text-muted-foreground">Participants / capacity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Readiness */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Participant fill rate for upcoming events</CardDescription>
              </div>
              <Link href="/events">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(upcomingEvents ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
                <Link href="/events/new" className="mt-2">
                  <Button size="sm" variant="outline">Create your first event</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {(upcomingEvents ?? []).map((event) => {
                  const fillPct = event.capacity
                    ? Math.round((event.current_participant_count / event.capacity) * 100)
                    : 0;
                  return (
                    <div key={event.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link href={`/events/${event.id}`} className="font-medium hover:text-sage transition-colors">
                            {event.title}
                          </Link>
                          <Badge variant={getStatusVariant(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {event.current_participant_count}/{event.capacity ?? "∞"}
                          </span>
                          <span>{formatEventDateRange(event.start_datetime, event.end_datetime)}</span>
                          {event.capacity && (
                            <span className="font-semibold text-foreground">{fillPct}%</span>
                          )}
                        </div>
                      </div>
                      {event.capacity && <Progress value={fillPct} className="h-2" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overdue Tasks</CardTitle>
                <CardDescription>Items needing immediate attention</CardDescription>
              </div>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(overdueTasks ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-sage mb-2" />
                <p className="text-sm text-muted-foreground">No overdue tasks</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(overdueTasks ?? []).map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(task.events as { title?: string } | null)?.title ?? "No event"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Due {new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Materials below reorder threshold</CardDescription>
              </div>
              <Link href="/materials">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(lowStockItems ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-8 w-8 text-sage mb-2" />
                <p className="text-sm text-muted-foreground">All materials well stocked</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(lowStockItems ?? []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Package className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.in_house_qty} / {item.reorder_threshold} {item.unit_of_measure}
                      </p>
                    </div>
                    <Progress
                      value={item.reorder_threshold > 0
                        ? (item.in_house_qty / item.reorder_threshold) * 100
                        : 0}
                      className="w-24 h-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Reminders</CardTitle>
            <CardDescription>Scheduled communications for today</CardDescription>
          </CardHeader>
          <CardContent>
            {(todayReminders ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-sage mb-2" />
                <p className="text-sm text-muted-foreground">No reminders scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(todayReminders ?? []).map((reminder) => (
                  <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="h-4 w-4 text-sage mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {(reminder.email_templates as { subject?: string } | null)?.subject ?? "Email reminder"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {(reminder.events as { title?: string } | null)?.title ?? ""}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(reminder.scheduled_for).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/events/new">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" /> New Event
                </Button>
              </Link>
              <Link href="/participants">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" /> Add Participant
                </Button>
              </Link>
              <Link href="/tasks">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle2 className="mr-2 h-4 w-4" /> New Task
                </Button>
              </Link>
              <Link href="/communications">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarDays className="mr-2 h-4 w-4" /> Send Email
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
