import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Mail, MapPin, Phone, Calendar } from "lucide-react";

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: participant, error } = await supabase
    .from("participants")
    .select("id, full_name, preferred_name, email, phone, dob, emergency_contact_name, emergency_contact_phone, address_line1, city, state, postal_code, notes")
    .eq("id", id)
    .single();

  if (error || !participant) notFound();

  const { data: eventParticipants } = await supabase
    .from("event_participants")
    .select("rsvp_status, waiver_status, created_at, events(id, title, start_datetime)")
    .eq("participant_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: emailJobs } = await supabase
    .from("email_jobs")
    .select("id, scheduled_for, status, email_templates(subject)")
    .eq("recipient_id", id)
    .eq("recipient_type", "participant")
    .order("scheduled_for", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/participants">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-semibold tracking-tight">{participant.full_name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{participant.email}</span>
              {participant.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{participant.phone}</span>}
              {participant.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />{participant.city}{participant.state ? `, ${participant.state}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        <Link href={`/participants/${id}/edit`}>
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {participant.preferred_name && (
              <div>
                <p className="text-xs text-muted-foreground">Preferred Name</p>
                <p className="text-sm font-medium">{participant.preferred_name}</p>
              </div>
            )}
            {participant.dob && (
              <div>
                <p className="text-xs text-muted-foreground">Date of Birth</p>
                <p className="text-sm">{new Date(participant.dob).toLocaleDateString()}</p>
              </div>
            )}
            {(participant.address_line1 || participant.city) && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  {participant.address_line1 && <p className="text-sm">{participant.address_line1}</p>}
                  <p className="text-sm">
                    {participant.city}{participant.state ? `, ${participant.state}` : ""} {participant.postal_code}
                  </p>
                </div>
              </>
            )}
            {participant.emergency_contact_name && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Emergency Contact</p>
                  <p className="text-sm font-medium">{participant.emergency_contact_name}</p>
                  {participant.emergency_contact_phone && (
                    <p className="text-sm">{participant.emergency_contact_phone}</p>
                  )}
                </div>
              </>
            )}
            {participant.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{participant.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="events">
            <TabsList>
              <TabsTrigger value="events"><Calendar className="mr-1.5 h-3.5 w-3.5" />Event History</TabsTrigger>
              <TabsTrigger value="comms"><Mail className="mr-1.5 h-3.5 w-3.5" />Communications</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event History ({(eventParticipants ?? []).length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {(eventParticipants ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground p-6 text-center">No event history yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>RSVP</TableHead>
                          <TableHead>Waiver</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(eventParticipants ?? []).map((ep, i) => {
                          const ev = ep.events as { id?: string; title?: string; start_datetime?: string } | null;
                          return (
                            <TableRow key={i}>
                              <TableCell className="font-medium">
                                {ev?.id ? (
                                  <Link href={`/events/${ev.id}`} className="hover:text-sage">{ev.title}</Link>
                                ) : (ev?.title ?? "—")}
                              </TableCell>
                              <TableCell className="text-sm">
                                {ev?.start_datetime
                                  ? new Date(ev.start_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs capitalize">{ep.rsvp_status?.replace("_", " ") ?? "—"}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs capitalize">{ep.waiver_status?.replace("_", " ") ?? "—"}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comms">
              <Card>
                <CardHeader><CardTitle className="text-lg">Communication Log</CardTitle></CardHeader>
                <CardContent>
                  {(emailJobs ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No communications sent yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {(emailJobs ?? []).map((job) => {
                        const tpl = job.email_templates as { subject?: string } | null;
                        return (
                          <div key={job.id} className="flex items-center gap-4 p-3 rounded-lg border">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{tpl?.subject ?? "Email"}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(job.scheduled_for).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">{job.status}</Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
