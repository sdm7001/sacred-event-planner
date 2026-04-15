# Gather - Sacred Event Planner

A production-ready event operations platform for managing shamanic retreats, ceremonies, and gatherings. Built with Next.js 15, Supabase, and Tailwind CSS.

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components (Radix primitives)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with RLS
- **Email**: Resend API
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack Table
- **Maps**: Google Maps API (Haversine distance calculation)

## Getting Started

### 1. Clone and install

```bash
cd sacred-event-planner
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
# Fill in your Supabase and Resend credentials
```

### 3. Set up database

Run the schema SQL in your Supabase SQL editor:

```bash
# Copy contents of supabase/schema.sql into Supabase SQL Editor and execute
```

### 4. Seed data (optional)

```bash
SUPABASE_SERVICE_KEY=your-service-key npx tsx scripts/seed.ts
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (dashboard)/          # Authenticated dashboard routes
      page.tsx            # Dashboard with readiness scores
      events/             # Event CRUD + command center
      participants/       # Participant management
      providers/          # Provider management
      calendar/           # Calendar view
      materials/          # Global materials catalog
      tasks/              # Task board (kanban + list)
      reminders/          # Reminder workflow builder
      email-templates/    # Email template manager
      communications/     # Communication log
      reports/            # Analytics and exports
      documents/          # Document management
      settings/           # Organization settings
    login/                # Auth page
    auth/callback/        # OAuth callback
    api/cron/reminders/   # Reminder engine endpoint
    actions/              # Server actions (events, materials, email)
  components/
    ui/                   # shadcn/ui primitives
    layout/               # Sidebar, header
  lib/
    supabase/             # Client, server, middleware
    utils.ts              # Haversine, readiness score, token replacement
  types/
    database.ts           # TypeScript types matching schema
  hooks/
    use-theme.ts          # Light/dark mode
supabase/
  schema.sql              # Complete database schema with RLS
scripts/
  seed.ts                 # Seed data script
```

## Key Features

- **Event Command Center**: Tabbed view with Overview, Participants, Providers, Materials, Tasks, Schedule, Reminders, Communications, Documents, Notes
- **Materials Dosing Calculator**: Auto-calculate requirements based on headcount with per-participant overrides
- **Reminder Engine**: Cron-based system for automated email reminders relative to event dates
- **Email Templates**: Token-based templates with preview and clone support
- **Event Readiness Score**: Composite score from waivers, RSVPs, materials, tasks, reminders
- **Distance Calculation**: Haversine formula for participant-to-venue distances
- **Role-Based Security**: Supabase RLS with Super Admin, Admin, Coordinator, Provider, Participant roles
- **Audit Logging**: All sensitive changes tracked with before/after data

## Color Palette

- Warm Stone: `#f5f0e8`
- Deep Charcoal: `#2c2c2c`
- Muted Sage: `#7a8c6e`
- Warm Cream: `#faf6f0`

## Security

- Row-Level Security (RLS) on all tables
- Admin-only dosing controls with confirmation prompts
- Private notes never exposed to participants
- Audit trails for sensitive operations
