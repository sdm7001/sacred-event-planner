"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Mail, MapPin, Phone, Calendar, Shield, Clock, ExternalLink } from "lucide-react";

const participant = {
  id: "p1",
  full_name: "Sarah Johnson",
  preferred_name: "Sarah",
  email: "sarah@example.com",
  phone: "(512) 555-0101",
  dob: "1988-04-15",
  emergency_contact_name: "Tom Johnson",
  emergency_contact_phone: "(512) 555-0199",
  address_line1: "1234 Oak Lane",
  city: "Austin",
  state: "TX",
  postal_code: "78701",
  notes: "Experienced participant. Prefers quiet spaces for integration.",
};

const eventHistory = [
  { id: "e1", title: "Spring Equinox Retreat", date: "Mar 20-22, 2026", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant" },
  { id: "e2", title: "Full Moon Fire Circle", date: "Feb 12, 2026", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant" },
  { id: "e3", title: "Winter Solstice Ceremony", date: "Dec 21, 2025", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant" },
  { id: "e4", title: "New Moon Ceremony", date: "Nov 1, 2025", rsvp: "confirmed", waiver: "signed", payment: "paid", prep: "compliant" },
];

const communications = [
  { date: "Mar 10", subject: "Welcome & What to Expect", channel: "email", status: "delivered" },
  { date: "Mar 8", subject: "Registration Confirmation", channel: "email", status: "delivered" },
  { date: "Feb 15", subject: "Save the Date: Spring Equinox", channel: "email", status: "delivered" },
];

export default function ParticipantDetailPage() {
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
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{participant.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{participant.city}, {participant.state}</span>
            </div>
          </div>
        </div>
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Preferred Name</p>
              <p className="text-sm font-medium">{participant.preferred_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date of Birth</p>
              <p className="text-sm">{new Date(participant.dob).toLocaleDateString()}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm">{participant.address_line1}</p>
              <p className="text-sm">{participant.city}, {participant.state} {participant.postal_code}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Emergency Contact</p>
              <p className="text-sm font-medium">{participant.emergency_contact_name}</p>
              <p className="text-sm">{participant.emergency_contact_phone}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm">{participant.notes}</p>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="events">
            <TabsList>
              <TabsTrigger value="events"><Calendar className="mr-1.5 h-3.5 w-3.5" />Event History</TabsTrigger>
              <TabsTrigger value="comms"><Mail className="mr-1.5 h-3.5 w-3.5" />Communications</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Event History ({eventHistory.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>RSVP</TableHead>
                        <TableHead>Waiver</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Prep</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventHistory.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">
                            <Link href={`/events/${e.id}`} className="hover:text-sage">{e.title}</Link>
                          </TableCell>
                          <TableCell className="text-sm">{e.date}</TableCell>
                          <TableCell><Badge variant="sage" className="text-xs">{e.rsvp}</Badge></TableCell>
                          <TableCell><Badge variant="sage" className="text-xs">{e.waiver}</Badge></TableCell>
                          <TableCell><Badge variant="sage" className="text-xs">{e.payment}</Badge></TableCell>
                          <TableCell><Badge variant="sage" className="text-xs">{e.prep}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comms">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Communication Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {communications.map((c, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{c.subject}</p>
                          <p className="text-xs text-muted-foreground">{c.date} via {c.channel}</p>
                        </div>
                        <Badge variant="outline">{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
