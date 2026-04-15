import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Haversine distance calculation between two GPS coordinates
 * Returns distance in miles
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Generate Google Maps directions link
 */
export function getDirectionsLink(
  originAddress: string,
  destinationAddress: string
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    originAddress
  )}&destination=${encodeURIComponent(destinationAddress)}`;
}

/**
 * Calculate event readiness score (0-100)
 */
export function calculateReadinessScore(metrics: {
  waiverPct: number;
  rsvpPct: number;
  materialsPct: number;
  tasksPct: number;
  remindersConfigured: boolean;
}): number {
  const weights = {
    waivers: 25,
    rsvp: 25,
    materials: 25,
    tasks: 15,
    reminders: 10,
  };
  return Math.round(
    metrics.waiverPct * (weights.waivers / 100) +
      metrics.rsvpPct * (weights.rsvp / 100) +
      metrics.materialsPct * (weights.materials / 100) +
      metrics.tasksPct * (weights.tasks / 100) +
      (metrics.remindersConfigured ? weights.reminders : 0)
  );
}

/**
 * Calculate total materials required
 */
export function calculateMaterialsTotal(params: {
  baseQty: number;
  participantCount: number;
  qtyPerParticipant: number;
  providerCount: number;
  qtyPerProvider: number;
  bufferAmount: number;
  wastePct: number;
}): number {
  const subtotal =
    params.baseQty +
    params.participantCount * params.qtyPerParticipant +
    params.providerCount * params.qtyPerProvider +
    params.bufferAmount;
  return Math.ceil(subtotal * (1 + params.wastePct / 100));
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Replace email template tokens
 */
export function replaceEmailTokens(
  template: string,
  tokens: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

/**
 * Status color mapping
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-earth-200 text-earth-800",
    scheduled: "bg-blue-100 text-blue-800",
    confirmed: "bg-sage-100 text-sage-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    canceled: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    delivered: "bg-emerald-100 text-emerald-800",
    signed: "bg-green-100 text-green-800",
    not_signed: "bg-red-100 text-red-800",
    confirmed_rsvp: "bg-sage-100 text-sage-800",
    declined: "bg-red-100 text-red-800",
    tentative: "bg-amber-100 text-amber-800",
    paid: "bg-green-100 text-green-800",
    unpaid: "bg-red-100 text-red-800",
    partial: "bg-amber-100 text-amber-800",
    present: "bg-green-100 text-green-800",
    absent: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}
