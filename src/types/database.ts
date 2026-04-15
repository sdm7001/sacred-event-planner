// Core types matching the Supabase schema

export type EventStatus =
  | "draft"
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "canceled";

export type RSVPStatus = "invited" | "confirmed" | "declined" | "tentative" | "waitlisted";
export type AttendanceStatus = "registered" | "present" | "absent" | "partial";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded" | "comped";
export type WaiverStatus = "not_sent" | "sent" | "signed" | "expired";
export type PrepCompliance = "not_started" | "in_progress" | "compliant" | "non_compliant";
export type ProcurementStatus = "not_needed" | "to_order" | "ordered" | "received" | "in_stock";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "canceled";
export type EmailStatus = "pending" | "sent" | "failed" | "delivered";
export type TriggerType = "offset" | "fixed";
export type AudienceType = "all_participants" | "all_providers" | "all" | "custom";
export type ContractStatus = "none" | "pending" | "active" | "expired";
export type RoleType = "super_admin" | "admin" | "coordinator" | "provider" | "participant";

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: RoleType;
}

export interface Event {
  id: string;
  title: string;
  type?: string;
  status: EventStatus;
  description?: string;
  ceremony_notes?: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  capacity?: number;
  current_participant_count: number;
  waitlist_enabled: boolean;
  private_notes?: string;
  public_notes?: string;
  coordinator_id?: string;
  coordinator?: User;
  tags?: string[];
  location_id?: string;
  location?: Location;
  created_at: string;
  updated_at: string;
}

export interface EventSession {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  facilitator_id?: string;
  notes?: string;
  sort_order: number;
}

export interface Participant {
  id: string;
  full_name: string;
  preferred_name?: string;
  email: string;
  phone?: string;
  dob?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  geocoded_lat?: number;
  geocoded_lng?: number;
  notes?: string;
  custom_fields?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Provider {
  id: string;
  full_name: string;
  role_type: string;
  company?: string;
  email: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  geocoded_lat?: number;
  geocoded_lng?: number;
  bio?: string;
  availability?: string;
  hourly_rate?: number;
  flat_rate?: number;
  contract_status: ContractStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  participant_id: string;
  participant?: Participant;
  rsvp_status: RSVPStatus;
  attendance_status: AttendanceStatus;
  payment_status: PaymentStatus;
  waiver_status: WaiverStatus;
  dietary_notes?: string;
  transport_notes?: string;
  prep_compliance: PrepCompliance;
  participant_notes?: string;
}

export interface EventProvider {
  id: string;
  event_id: string;
  provider_id: string;
  provider?: Provider;
  assigned_role: string;
  arrival_time?: string;
  departure_time?: string;
  responsibilities?: string;
  internal_notes?: string;
}

export interface Location {
  id: string;
  venue_name: string;
  address: string;
  gps_lat?: number;
  gps_lng?: number;
  parking_notes?: string;
  entry_instructions?: string;
  arrival_window?: string;
  onsite_contact?: string;
  weather_notes?: string;
  lodging_notes?: string;
}

export interface MaterialsCatalog {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit_of_measure: string;
  default_vendor?: string;
  in_house_qty: number;
  reorder_threshold: number;
  notes?: string;
  is_active: boolean;
}

export interface EventMaterial {
  id: string;
  event_id: string;
  material_id: string;
  material?: MaterialsCatalog;
  required: boolean;
  base_qty: number;
  qty_per_participant: number;
  qty_per_provider: number;
  buffer_amount: number;
  waste_pct: number;
  unit: string;
  dose_per_participant?: number;
  dose_min?: number;
  dose_max?: number;
  dose_notes?: string;
  total_required: number;
  current_stock: number;
  to_purchase: number;
  purchaser_id?: string;
  procurement_status: ProcurementStatus;
}

export interface DosingRule {
  id: string;
  event_material_id: string;
  participant_id: string;
  participant?: Participant;
  custom_dose?: number;
  excluded: boolean;
  notes?: string;
}

export interface SchedulingItem {
  id: string;
  event_id: string;
  type: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  assignee_id?: string;
  linked_entity_type?: string;
  linked_entity_id?: string;
}

export interface PrepPlan {
  id: string;
  event_id: string;
  title: string;
  description?: string;
}

export interface PrepInstruction {
  id: string;
  prep_plan_id: string;
  title: string;
  content: string;
  instruction_type: string;
  audience_type: AudienceType;
  is_required: boolean;
  sort_order: number;
}

export interface ReminderRule {
  id: string;
  event_id: string;
  prep_instruction_id?: string;
  trigger_type: TriggerType;
  offset_minutes?: number;
  fixed_datetime?: string;
  audience_segment: AudienceType;
  is_active: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  tokens_used: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailJob {
  id: string;
  event_id: string;
  template_id?: string;
  recipient_type: string;
  recipient_id: string;
  scheduled_for: string;
  sent_at?: string;
  status: EmailStatus;
  opened_at?: string;
  error_message?: string;
}

export interface CommunicationsLog {
  id: string;
  event_id?: string;
  direction: "inbound" | "outbound";
  recipient_type: string;
  recipient_id: string;
  subject: string;
  body: string;
  sent_at: string;
  channel: string;
  status: string;
}

export interface Task {
  id: string;
  event_id?: string;
  event?: Event;
  title: string;
  description?: string;
  owner_id?: string;
  due_date?: string;
  priority: TaskPriority;
  status: TaskStatus;
  linked_entity_type?: string;
  linked_entity_id?: string;
  created_at: string;
}

export interface Checklist {
  id: string;
  event_id: string;
  title: string;
  template_id?: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  title: string;
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

export interface Document {
  id: string;
  event_id?: string;
  linked_entity_type?: string;
  linked_entity_id?: string;
  filename: string;
  storage_url: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface Note {
  id: string;
  entity_type: string;
  entity_id: string;
  content: string;
  created_by?: string;
  created_at: string;
  is_admin_only: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changed_by?: string;
  changed_at: string;
  before_data?: Record<string, unknown>;
  after_data?: Record<string, unknown>;
}

// Dashboard aggregated types
export interface DashboardMetrics {
  upcomingEvents: Event[];
  overdueTasks: Task[];
  lowStockMaterials: MaterialsCatalog[];
  todayReminders: ReminderRule[];
  eventReadiness: Array<{
    event: Event;
    score: number;
  }>;
}
