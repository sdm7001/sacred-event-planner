"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface CalEvent {
  id: string;
  title: string;
  status: string;
  start_datetime: string;
  end_datetime: string;
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: "bg-sage/20 text-sage-800 border-sage/40",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  draft: "bg-stone-100 text-stone-700 border-stone-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
  canceled: "bg-red-50 text-red-600 border-red-100",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const supabase = createClient();
      const start = new Date(currentYear, currentMonth, 1).toISOString();
      const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

      const { data } = await supabase
        .from("events")
        .select("id, title, status, start_datetime, end_datetime")
        .gte("start_datetime", start)
        .lte("start_datetime", end)
        .not("status", "eq", "canceled")
        .order("start_datetime");

      setEvents(data ?? []);
    });
  }, [currentMonth, currentYear]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const start = new Date(e.start_datetime);
      const end = new Date(e.end_datetime);
      const dayDate = new Date(currentYear, currentMonth, day);
      return dayDate >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
             dayDate <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
    });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const goToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">View all events and sessions</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>Today</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth} disabled={isPending}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <CardTitle>{MONTHS[currentMonth]} {currentYear}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isPending}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();
              return (
                <div
                  key={i}
                  className={cn("bg-background min-h-[100px] p-2", !day && "bg-muted/30")}
                >
                  {day && (
                    <>
                      <span className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                        isToday && "bg-sage text-white font-bold"
                      )}>
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.map((e) => (
                          <Link key={e.id} href={`/events/${e.id}`}>
                            <div className={cn(
                              "rounded px-1.5 py-0.5 text-xs border truncate",
                              STATUS_COLOR[e.status] ?? "bg-muted text-muted-foreground border-border"
                            )}>
                              {e.title}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            {Object.entries(STATUS_COLOR).map(([status, cls]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn("h-3 w-3 rounded border", cls)} />
                <span className="text-xs text-muted-foreground capitalize">{status.replace("_", " ")}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Month event list */}
      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{MONTHS[currentMonth]} Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.map((e) => (
                <Link key={e.id} href={`/events/${e.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                  <div>
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.start_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      {" – "}
                      {new Date(e.end_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <Badge className={cn("text-xs capitalize", STATUS_COLOR[e.status])}>{e.status}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isPending && events.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No events in {MONTHS[currentMonth]} {currentYear}.{" "}
          <Link href="/events/new" className="text-sage hover:underline">Create one?</Link>
        </div>
      )}
    </div>
  );
}
