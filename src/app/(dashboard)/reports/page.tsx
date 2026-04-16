"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Download, Users, CheckSquare, Shield, Loader2 } from "lucide-react";
import { listEventsForReports, getEventReport, type EventReport } from "@/app/actions/reports";

function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [report, setReport] = useState<EventReport | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await listEventsForReports();
      if (!result.error && result.events.length > 0) {
        setEvents(result.events);
        setSelectedEventId(result.events[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;
    startTransition(async () => {
      const result = await getEventReport(selectedEventId);
      if (!result.error) setReport(result.report);
    });
  }, [selectedEventId]);

  const rsvpPct = report && report.total_participants > 0
    ? Math.round((report.confirmed / report.total_participants) * 100)
    : 0;
  const waiverPct = report && report.total_participants > 0
    ? Math.round((report.waivers_signed / report.total_participants) * 100)
    : 0;
  const taskPct = report && report.total_tasks > 0
    ? Math.round((report.completed_tasks / report.total_tasks) * 100)
    : 0;
  const materialPct = report && report.total_materials > 0
    ? Math.round((report.in_stock / report.total_materials) * 100)
    : 0;

  const handleExportRoster = () => {
    if (!report) return;
    downloadCSV(
      ["Metric", "Value"],
      [
        ["Total Participants", report.total_participants],
        ["Confirmed RSVP", report.confirmed],
        ["Tentative", report.tentative],
        ["Declined", report.declined],
        ["Waivers Signed", `${report.waivers_signed}/${report.total_participants} (${waiverPct}%)`],
      ],
      `roster-${report.event_title.replace(/\s+/g, "-")}.csv`
    );
  };

  const handleExportTasks = () => {
    if (!report) return;
    downloadCSV(
      ["Metric", "Value"],
      [
        ["Total Tasks", report.total_tasks],
        ["Completed", report.completed_tasks],
        ["Overdue", report.overdue_tasks],
        ["Completion %", `${taskPct}%`],
      ],
      `tasks-${report.event_title.replace(/\s+/g, "-")}.csv`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Event analytics and exportable reports</p>
        </div>
        <Select value={selectedEventId} onValueChange={setSelectedEventId} disabled={isPending}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select an event..." />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : !report ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {events.length === 0 ? "No events found." : "Select an event to view its report."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Roster Report */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 text-sage" />Roster
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportRoster}>
                    <Download className="mr-2 h-4 w-4" />Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Total Registered</span><span className="font-bold">{report.total_participants}</span></div>
                  <div className="flex justify-between text-sm"><span>Confirmed RSVP</span><span className="font-bold text-green-600">{report.confirmed}</span></div>
                  <div className="flex justify-between text-sm"><span>Tentative</span><span className="font-bold text-amber-600">{report.tentative}</span></div>
                  <div className="flex justify-between text-sm"><span>Declined</span><span className="font-bold text-red-600">{report.declined}</span></div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Waivers Signed</span>
                    <span className="font-bold">{report.waivers_signed}/{report.total_participants} ({waiverPct}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>RSVP Rate</span>
                    <span className="font-bold">{rsvpPct}%</span>
                  </div>
                  <Progress value={rsvpPct} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Tasks Report */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-sage" />Tasks
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExportTasks}>
                    <Download className="mr-2 h-4 w-4" />Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Total Tasks</span><span className="font-bold">{report.total_tasks}</span></div>
                  <div className="flex justify-between text-sm"><span>Completed</span><span className="font-bold text-green-600">{report.completed_tasks}</span></div>
                  <div className="flex justify-between text-sm"><span>Overdue</span><span className="font-bold text-red-600">{report.overdue_tasks}</span></div>
                  <div className="flex justify-between text-sm"><span>Remaining</span><span className="font-bold">{report.total_tasks - report.completed_tasks}</span></div>
                  <Separator />
                  <div className="flex justify-between text-sm"><span>Completion</span><span className="font-bold">{taskPct}%</span></div>
                  <Progress value={taskPct} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Waivers Report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sage" />Waivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span>Total Participants</span><span className="font-bold">{report.total_participants}</span></div>
                  <div className="flex justify-between text-sm"><span>Signed</span><span className="font-bold text-green-600">{report.waivers_signed}</span></div>
                  <div className="flex justify-between text-sm"><span>Outstanding</span><span className="font-bold text-amber-600">{report.total_participants - report.waivers_signed}</span></div>
                  <Separator />
                  <div className="flex justify-between text-sm"><span>Signed %</span><span className="font-bold">{waiverPct}%</span></div>
                  <Progress value={waiverPct} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Materials summary */}
          {report.total_materials > 0 && (
            <Card>
              <CardHeader>
                <CardDescription>Materials catalog — {report.total_materials} total items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{report.in_stock}</p>
                    <p className="text-xs text-muted-foreground">Above threshold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{report.to_order}</p>
                    <p className="text-xs text-muted-foreground">Need reorder</p>
                  </div>
                  <div className="flex-1">
                    <Progress value={materialPct} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{materialPct}% adequately stocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
