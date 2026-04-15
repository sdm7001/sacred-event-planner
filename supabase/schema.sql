-- Sacred Event Planner - Complete Database Schema
-- Supabase PostgreSQL

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE event_status AS ENUM ('draft', 'scheduled', 'confirmed', 'in_progress', 'completed', 'canceled');
CREATE TYPE rsvp_status AS ENUM ('invited', 'confirmed', 'declined', 'tentative', 'waitlisted');
CREATE TYPE attendance_status AS ENUM ('registered', 'present', 'absent', 'partial');
CREATE TYPE payment_status AS ENUM ('unpaid', 'partial', 'paid', 'refunded', 'comped');
CREATE TYPE waiver_status AS ENUM ('not_sent', 'sent', 'signed', 'expired');
CREATE TYPE prep_compliance AS ENUM ('not_started', 'in_progress', 'compliant', 'non_compliant');
CREATE TYPE procurement_status AS ENUM ('not_needed', 'to_order', 'ordered', 'received', 'in_stock');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'canceled');
CREATE TYPE email_job_status AS ENUM ('pending', 'sent', 'failed', 'delivered');
CREATE TYPE trigger_type AS ENUM ('offset', 'fixed');
CREATE TYPE audience_type AS ENUM ('all_participants', 'all_providers', 'all', 'custom');
CREATE TYPE contract_status AS ENUM ('none', 'pending', 'active', 'expired');
CREATE TYPE user_role_type AS ENUM ('super_admin', 'admin', 'coordinator', 'provider', 'participant');

-- ============================================================
-- CORE: Users & Roles
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name user_role_type UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- ============================================================
-- LOCATIONS
-- ============================================================

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_name TEXT NOT NULL,
  address TEXT NOT NULL,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  parking_notes TEXT,
  entry_instructions TEXT,
  arrival_window TEXT,
  onsite_contact TEXT,
  weather_notes TEXT,
  lodging_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT,
  status event_status DEFAULT 'draft',
  description TEXT,
  ceremony_notes TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'America/Chicago',
  capacity INT,
  current_participant_count INT DEFAULT 0,
  waitlist_enabled BOOLEAN DEFAULT false,
  private_notes TEXT,
  public_notes TEXT,
  coordinator_id UUID REFERENCES users(id),
  tags TEXT[] DEFAULT '{}',
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  facilitator_id UUID REFERENCES users(id),
  notes TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PEOPLE
-- ============================================================

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  dob DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  geocoded_lat DOUBLE PRECISION,
  geocoded_lng DOUBLE PRECISION,
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  role_type TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  geocoded_lat DOUBLE PRECISION,
  geocoded_lng DOUBLE PRECISION,
  bio TEXT,
  availability TEXT,
  hourly_rate DECIMAL(10,2),
  flat_rate DECIMAL(10,2),
  contract_status contract_status DEFAULT 'none',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENT RELATIONSHIPS
-- ============================================================

CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  rsvp_status rsvp_status DEFAULT 'invited',
  attendance_status attendance_status DEFAULT 'registered',
  payment_status payment_status DEFAULT 'unpaid',
  waiver_status waiver_status DEFAULT 'not_sent',
  dietary_notes TEXT,
  transport_notes TEXT,
  prep_compliance prep_compliance DEFAULT 'not_started',
  participant_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, participant_id)
);

CREATE TABLE event_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  assigned_role TEXT NOT NULL,
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  responsibilities TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, provider_id)
);

-- ============================================================
-- MATERIALS
-- ============================================================

CREATE TABLE materials_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit_of_measure TEXT NOT NULL,
  default_vendor TEXT,
  in_house_qty DECIMAL(10,2) DEFAULT 0,
  reorder_threshold DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials_catalog(id),
  required BOOLEAN DEFAULT true,
  base_qty DECIMAL(10,2) DEFAULT 0,
  qty_per_participant DECIMAL(10,4) DEFAULT 0,
  qty_per_provider DECIMAL(10,4) DEFAULT 0,
  buffer_amount DECIMAL(10,2) DEFAULT 0,
  waste_pct DECIMAL(5,2) DEFAULT 0,
  unit TEXT NOT NULL,
  dose_per_participant DECIMAL(10,4),
  dose_min DECIMAL(10,4),
  dose_max DECIMAL(10,4),
  dose_notes TEXT,
  total_required DECIMAL(10,2) DEFAULT 0,
  current_stock DECIMAL(10,2) DEFAULT 0,
  to_purchase DECIMAL(10,2) DEFAULT 0,
  purchaser_id UUID REFERENCES users(id),
  procurement_status procurement_status DEFAULT 'not_needed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dosing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_material_id UUID REFERENCES event_materials(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  custom_dose DECIMAL(10,4),
  excluded BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_material_id, participant_id)
);

-- ============================================================
-- SCHEDULING & REMINDERS
-- ============================================================

CREATE TABLE scheduling_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  assignee_id UUID REFERENCES users(id),
  linked_entity_type TEXT,
  linked_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prep_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prep_instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prep_plan_id UUID REFERENCES prep_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  instruction_type TEXT DEFAULT 'general',
  audience_type audience_type DEFAULT 'all_participants',
  is_required BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reminder_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  prep_instruction_id UUID REFERENCES prep_instructions(id),
  trigger_type trigger_type DEFAULT 'offset',
  offset_minutes INT,
  fixed_datetime TIMESTAMPTZ,
  audience_segment audience_type DEFAULT 'all_participants',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMUNICATIONS
-- ============================================================

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  tokens_used TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  recipient_type TEXT NOT NULL,
  recipient_id UUID NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status email_job_status DEFAULT 'pending',
  opened_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE communications_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  recipient_type TEXT NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  channel TEXT DEFAULT 'email',
  status TEXT DEFAULT 'sent'
);

-- ============================================================
-- OPERATIONS
-- ============================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'pending',
  linked_entity_type TEXT,
  linked_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  linked_entity_type TEXT,
  linked_entity_id UUID,
  filename TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_admin_only BOOLEAN DEFAULT false
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#7a8c6e'
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  before_data JSONB,
  after_data JSONB
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start ON events(start_datetime);
CREATE INDEX idx_events_coordinator ON events(coordinator_id);
CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_participant ON event_participants(participant_id);
CREATE INDEX idx_event_providers_event ON event_providers(event_id);
CREATE INDEX idx_event_materials_event ON event_materials(event_id);
CREATE INDEX idx_tasks_event ON tasks(event_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_email_jobs_status ON email_jobs(status);
CREATE INDEX idx_email_jobs_scheduled ON email_jobs(scheduled_for);
CREATE INDEX idx_reminder_rules_event ON reminder_rules(event_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_providers_email ON providers(email);
CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Admin policies: full access for super_admin and admin roles
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid()
    AND ur.role IN ('super_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_coordinator_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN users u ON u.id = ur.user_id
    WHERE u.auth_id = auth.uid()
    AND ur.role IN ('super_admin', 'admin', 'coordinator')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Users: read own, admin reads all
CREATE POLICY users_select ON users FOR SELECT USING (
  auth_id = auth.uid() OR is_admin()
);
CREATE POLICY users_update ON users FOR UPDATE USING (
  auth_id = auth.uid() OR is_admin()
);

-- Events: coordinators+ can CRUD
CREATE POLICY events_select ON events FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY events_insert ON events FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY events_update ON events FOR UPDATE USING (is_coordinator_or_admin());
CREATE POLICY events_delete ON events FOR DELETE USING (is_admin());

-- Participants: coordinators+ read all
CREATE POLICY participants_select ON participants FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY participants_insert ON participants FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY participants_update ON participants FOR UPDATE USING (is_coordinator_or_admin());
CREATE POLICY participants_delete ON participants FOR DELETE USING (is_admin());

-- Providers: coordinators+ read all
CREATE POLICY providers_select ON providers FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY providers_insert ON providers FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY providers_update ON providers FOR UPDATE USING (is_coordinator_or_admin());
CREATE POLICY providers_delete ON providers FOR DELETE USING (is_admin());

-- Event relationships: coordinators+ manage
CREATE POLICY ep_select ON event_participants FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY ep_insert ON event_participants FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY ep_update ON event_participants FOR UPDATE USING (is_coordinator_or_admin());
CREATE POLICY ep_delete ON event_participants FOR DELETE USING (is_coordinator_or_admin());

CREATE POLICY eprov_select ON event_providers FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY eprov_insert ON event_providers FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY eprov_update ON event_providers FOR UPDATE USING (is_coordinator_or_admin());
CREATE POLICY eprov_delete ON event_providers FOR DELETE USING (is_coordinator_or_admin());

-- Locations: coordinators+ manage
CREATE POLICY locations_select ON locations FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY locations_insert ON locations FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY locations_update ON locations FOR UPDATE USING (is_coordinator_or_admin());

-- Materials: coordinators+ manage
CREATE POLICY materials_select ON materials_catalog FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY materials_insert ON materials_catalog FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY materials_update ON materials_catalog FOR UPDATE USING (is_coordinator_or_admin());

CREATE POLICY em_select ON event_materials FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY em_insert ON event_materials FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY em_update ON event_materials FOR UPDATE USING (is_coordinator_or_admin());
CREATE POLICY em_delete ON event_materials FOR DELETE USING (is_coordinator_or_admin());

-- Dosing: admin only
CREATE POLICY dosing_select ON dosing_rules FOR SELECT USING (is_admin());
CREATE POLICY dosing_insert ON dosing_rules FOR INSERT WITH CHECK (is_admin());
CREATE POLICY dosing_update ON dosing_rules FOR UPDATE USING (is_admin());
CREATE POLICY dosing_delete ON dosing_rules FOR DELETE USING (is_admin());

-- Tasks: coordinators+ manage
CREATE POLICY tasks_select ON tasks FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY tasks_update ON tasks FOR UPDATE USING (is_coordinator_or_admin());
CREATE POLICY tasks_delete ON tasks FOR DELETE USING (is_coordinator_or_admin());

-- Email: coordinators+ manage
CREATE POLICY et_select ON email_templates FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY et_insert ON email_templates FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY et_update ON email_templates FOR UPDATE USING (is_coordinator_or_admin());

CREATE POLICY ej_select ON email_jobs FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY ej_insert ON email_jobs FOR INSERT WITH CHECK (is_coordinator_or_admin());

-- Audit: admin only
CREATE POLICY audit_select ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY audit_insert ON audit_logs FOR INSERT WITH CHECK (is_coordinator_or_admin());

-- Notes: admin-only notes restricted
CREATE POLICY notes_select ON notes FOR SELECT USING (
  is_admin() OR (is_coordinator_or_admin() AND NOT is_admin_only)
);
CREATE POLICY notes_insert ON notes FOR INSERT WITH CHECK (is_coordinator_or_admin());
CREATE POLICY notes_update ON notes FOR UPDATE USING (is_coordinator_or_admin());

-- Documents: coordinators+ manage
CREATE POLICY docs_select ON documents FOR SELECT USING (is_coordinator_or_admin());
CREATE POLICY docs_insert ON documents FOR INSERT WITH CHECK (is_coordinator_or_admin());

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER participants_updated BEFORE UPDATE ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER providers_updated BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER locations_updated BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER materials_updated BEFORE UPDATE ON materials_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER event_materials_updated BEFORE UPDATE ON event_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER email_templates_updated BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: Recalculate material totals
-- ============================================================

CREATE OR REPLACE FUNCTION recalculate_event_materials(p_event_id UUID)
RETURNS VOID AS $$
DECLARE
  v_participant_count INT;
  v_provider_count INT;
BEGIN
  SELECT current_participant_count INTO v_participant_count
  FROM events WHERE id = p_event_id;

  SELECT COUNT(*) INTO v_provider_count
  FROM event_providers WHERE event_id = p_event_id;

  UPDATE event_materials
  SET
    total_required = CEIL(
      (base_qty + (v_participant_count * qty_per_participant) +
       (v_provider_count * qty_per_provider) + buffer_amount)
      * (1 + waste_pct / 100)
    ),
    to_purchase = GREATEST(0,
      CEIL(
        (base_qty + (v_participant_count * qty_per_participant) +
         (v_provider_count * qty_per_provider) + buffer_amount)
        * (1 + waste_pct / 100)
      ) - current_stock
    ),
    updated_at = NOW()
  WHERE event_id = p_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGER: Auto-recalculate materials on participant count change
-- ============================================================

CREATE OR REPLACE FUNCTION on_participant_count_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_participant_count != OLD.current_participant_count THEN
    PERFORM recalculate_event_materials(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_participant_count_changed
  AFTER UPDATE OF current_participant_count ON events
  FOR EACH ROW EXECUTE FUNCTION on_participant_count_change();

-- Auto-update participant count when event_participants changes
CREATE OR REPLACE FUNCTION update_participant_count()
RETURNS TRIGGER AS $$
DECLARE
  v_event_id UUID;
BEGIN
  v_event_id := COALESCE(NEW.event_id, OLD.event_id);
  UPDATE events
  SET current_participant_count = (
    SELECT COUNT(*) FROM event_participants
    WHERE event_id = v_event_id AND rsvp_status NOT IN ('declined')
  )
  WHERE id = v_event_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ep_count_insert AFTER INSERT ON event_participants FOR EACH ROW EXECUTE FUNCTION update_participant_count();
CREATE TRIGGER ep_count_update AFTER UPDATE ON event_participants FOR EACH ROW EXECUTE FUNCTION update_participant_count();
CREATE TRIGGER ep_count_delete AFTER DELETE ON event_participants FOR EACH ROW EXECUTE FUNCTION update_participant_count();
