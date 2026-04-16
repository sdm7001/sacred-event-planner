"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const providers = [
  { id: "pr1", full_name: "River Stone", role_type: "Lead Facilitator", email: "river@example.com", phone: "(512) 555-0201", city: "Dripping Springs", state: "TX", contract: "active", events: 8, rate: "$2,500/event" },
  { id: "pr2", full_name: "Luna Martinez", role_type: "Sound Healer", email: "luna@example.com", phone: "(512) 555-0202", city: "Austin", state: "TX", contract: "active", events: 5, rate: "$150/hr" },
  { id: "pr3", full_name: "Oak Williams", role_type: "Cook", email: "oak@example.com", phone: "(512) 555-0203", city: "Bastrop", state: "TX", contract: "active", events: 6, rate: "$800/event" },
  { id: "pr4", full_name: "Willow Adams", role_type: "Yoga Instructor", email: "willow@example.com", phone: "(512) 555-0204", city: "Austin", state: "TX", contract: "pending", events: 2, rate: "$100/hr" },
  { id: "pr5", full_name: "Cedar Brooks", role_type: "Driver", email: "cedar@example.com", phone: "(512) 555-0205", city: "San Marcos", state: "TX", contract: "none", events: 3, rate: "$50/hr" },
  { id: "pr6", full_name: "Sage Thompson", role_type: "Musician", email: "sage@example.com", phone: "(512) 555-0206", city: "Wimberley", state: "TX", contract: "expired", events: 4, rate: "$500/event" },
  { id: "pr7", full_name: "Dawn Walker", role_type: "Healer", email: "dawn@example.com", phone: "(512) 555-0207", city: "Fredericksburg", state: "TX", contract: "active", events: 7, rate: "$200/hr" },
];

function contractColor(status: string) {
  switch (status) {
    case "active": return "sage" as const;
    case "pending": return "warm" as const;
    case "expired": return "destructive" as const;
    default: return "secondary" as const;
  }
}

export default function ProvidersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = providers.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.role_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Providers</h1>
          <p className="text-muted-foreground mt-1">Facilitators, healers, and support staff</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark">
          <Plus className="mr-2 h-4 w-4" /> Add Provider
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-center">Events</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/providers/${p.id}`} className="font-medium hover:text-sage transition-colors">
                      {p.full_name}
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.role_type}</Badge></TableCell>
                  <TableCell>
                    <p className="text-sm">{p.email}</p>
                    <p className="text-xs text-muted-foreground">{p.phone}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {p.city}, {p.state}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{p.rate}</TableCell>
                  <TableCell className="text-center"><Badge variant="secondary">{p.events}</Badge></TableCell>
                  <TableCell><Badge variant={contractColor(p.contract)}>{p.contract}</Badge></TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/providers/${p.id}/edit`)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { window.location.href = `mailto:${p.email}`; }}><Mail className="mr-2 h-4 w-4" /> Contact</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
