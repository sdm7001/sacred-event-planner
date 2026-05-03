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

// Demo data for dashboard
const upcomingEvents = [
  {
    id: "1",
    title: "Spring Equinox Retreat",
    date: "Mar 20-22, 2026",
    status: "confirmed",
    participants: 18,
    capacity: 20,
    readiness: 82,
  },
  {
    id: "2",
    title: "New Moon Ceremony",
    date: "Mar 29, 2026",
    status: "scheduled",
    participants: 12,
    capacity: 15,
    readiness: 65,
  },
  {
    id: "3",
    title: "Summer Solstice Gathering",
    date: "Jun 20-21, 2026",
    status: "draft",
    participants: 0,
    capacity: 30,
    readiness: 15,
  },
];

const overdueTasks = [
  { id: "1", title: "Confirm venue access for Spring Retreat", event: "Spring Equinox Retreat", dueDate: "Mar 10", priority: "high" },
  { id: "2", title: "Send prep instructions to new participants", event: "Spring Equinox Retreat", dueDate: "Mar 12", priority: "urgent" },
  { id: "3", title: "Order additional sage bundles", event: "New Moon Ceremony", dueDate: "Mar 15", priority: "medium" },
];

const lowStockItems = [
  { name: "White Sage Bundle", current: 3, threshold: 10, unit: "bundles" },
  { name: "Ceremonial Candles", current: 8, threshold: 20, unit: "units" },
  { name: "Purified Water", current: 5, threshold: 15, unit: "gallons" },
];

const todayReminders = [
  { title: "Dietary restriction confirmation due", event: "Spring Equinox Retreat", time: "9:00 AM" },
  { title: "Provider arrival confirmation", event: "Spring Equinox Retreat", time: "2:00 PM" },
];

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

export default function DashboardPage() {
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

      {/* Stats row - all clickable */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/events?status=scheduled">
          <Card className="hover:ring-2 hover:ring-sage/40 cursor-pointer transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Next 30 days</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/participants">
          <Card className="hover:ring-2 hover:ring-sage/40 cursor-pointer transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">30</div>
              <p className="text-xs text-muted-foreground">Across active events</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/tasks?status=pending">
          <Card className="hover:ring-2 hover:ring-sage/40 cursor-pointer transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">3</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/events">
          <Card className="hover:ring-2 hover:ring-sage/40 cursor-pointer transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Readiness</CardTitle>
              <TrendingUp className="h-4 w-4 text-sage" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sage">54%</div>
              <p className="text-xs text-muted-foreground">Across confirmed events</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Readiness */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Readiness</CardTitle>
                <CardDescription>Preparation status for upcoming events</CardDescription>
              </div>
              <Link href="/events">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
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
                        {event.participants}/{event.capacity}
                      </span>
                      <span>{event.date}</span>
                      <span className="font-semibold text-foreground">{event.readiness}%</span>
                    </div>
                  </div>
                  <Progress value={event.readiness} className="h-2" />
                </div>
              ))}
            </div>
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
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <Link key={task.id} href={`/tasks?status=pending`}>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:ring-2 hover:ring-sage/40 cursor-pointer transition-all">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.event}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Due {task.dueDate}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <Link key={item.name} href="/materials">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:ring-2 hover:ring-sage/40 cursor-pointer transition-all">
                    <Package className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.current} / {item.threshold} {item.unit}
                      </p>
                    </div>
                    <Progress
                      value={(item.current / item.threshold) * 100}
                      className="w-24 h-2"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Reminders</CardTitle>
            <CardDescription>Scheduled communications for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todayReminders.length > 0 ? (
              <div className="space-y-3">
                {todayReminders.map((reminder, i) => (
                  <Link key={i} href="/reminders">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:ring-2 hover:ring-sage/40 cursor-pointer transition-all">
                      <Clock className="h-4 w-4 text-sage mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{reminder.event}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{reminder.time}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-sage mb-2" />
                <p className="text-sm text-muted-foreground">No reminders for today</p>
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
