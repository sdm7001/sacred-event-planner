import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Mail, Phone, MapPin } from "lucide-react";

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: provider, error } = await supabase
    .from("providers")
    .select("id, full_name, role_type, email, phone, city, state, compensation, contract_status, bio, availability_notes")
    .eq("id", id)
    .single();

  if (error || !provider) notFound();

  const { data: eventProviders } = await supabase
    .from("event_providers")
    .select("role, responsibilities, events(id, title, start_datetime)")
    .eq("provider_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/providers">
            <Button variant="ghost" size="icon" className="mt-1"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-semibold tracking-tight">{provider.full_name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {provider.role_type && <Badge variant="outline">{provider.role_type}</Badge>}
              {provider.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{provider.email}</span>}
              {provider.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{provider.phone}</span>}
            </div>
          </div>
        </div>
        <Link href={`/providers/${id}/edit`}>
          <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {provider.city && (
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {provider.city}{provider.state ? `, ${provider.state}` : ""}
                </p>
              </div>
            )}
            {provider.compensation && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Compensation</p>
                  <p className="text-sm font-medium">{provider.compensation}</p>
                </div>
              </>
            )}
            {provider.contract_status && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Contract Status</p>
                  <Badge
                    variant={provider.contract_status === "active" ? "sage" : "outline"}
                    className="capitalize"
                  >
                    {provider.contract_status}
                  </Badge>
                </div>
              </>
            )}
            {provider.bio && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Bio</p>
                  <p className="text-sm">{provider.bio}</p>
                </div>
              </>
            )}
            {provider.availability_notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Availability</p>
                  <p className="text-sm">{provider.availability_notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Event Assignments ({(eventProviders ?? []).length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {(eventProviders ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center">No event assignments yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Responsibilities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(eventProviders ?? []).map((ep, i) => {
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
                        <TableCell>{ep.role && <Badge variant="secondary">{ep.role}</Badge>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {ep.responsibilities}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
