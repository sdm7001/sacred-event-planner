/**
 * Seed Data Script for Sacred Event Planner
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY env vars
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  console.log("Seeding Sacred Event Planner database...\n");

  // ===================== LOCATIONS =====================
  console.log("Creating locations...");
  const { data: locations } = await supabase
    .from("locations")
    .insert([
      {
        venue_name: "Sacred Valley Ranch",
        address: "4521 Valley Road, Hill Country, TX 78669",
        gps_lat: 30.3274,
        gps_lng: -98.1247,
        parking_notes: "Gravel lot at main gate. Overflow parking in south meadow.",
        entry_instructions: "Gate code: 4521#. Follow signs to main lodge.",
        arrival_window: "9:00 AM - 10:00 AM",
        onsite_contact: "River Stone (512) 555-0142",
        weather_notes: "Open-air ceremony space. Rain backup in main lodge.",
        lodging_notes: "8 cabins available. Tent camping permitted in designated areas.",
      },
      {
        venue_name: "Riverside Temple",
        address: "789 River Bend Drive, Austin, TX 78746",
        gps_lat: 30.2672,
        gps_lng: -97.7431,
        parking_notes: "Street parking on River Bend. Small lot behind building.",
        entry_instructions: "Enter through garden gate on east side.",
        arrival_window: "30 minutes before start",
        onsite_contact: "Temple Manager (512) 555-0300",
      },
      {
        venue_name: "Hilltop Meadow",
        address: "1200 Summit Trail, Wimberley, TX 78676",
        gps_lat: 29.9975,
        gps_lng: -98.0986,
        parking_notes: "4WD recommended for last mile. Shuttle from base parking.",
        entry_instructions: "Follow trail markers from parking area. 10-minute walk.",
        weather_notes: "Fully outdoor. No shade. Bring sunscreen and water.",
      },
    ])
    .select();

  // ===================== EVENTS =====================
  console.log("Creating events...");
  const { data: events } = await supabase
    .from("events")
    .insert([
      {
        title: "Spring Equinox Retreat",
        type: "retreat",
        status: "confirmed",
        description: "A transformative three-day retreat welcoming the spring season with ceremony, reflection, and community connection.",
        ceremony_notes: "Opening circle with sage cleansing. Sunrise ceremony on Day 2. Closing integration circle on Day 3.",
        start_datetime: "2026-03-20T10:00:00-05:00",
        end_datetime: "2026-03-22T16:00:00-05:00",
        timezone: "America/Chicago",
        capacity: 20,
        current_participant_count: 18,
        waitlist_enabled: true,
        public_notes: "Please arrive between 9-10 AM. Comfortable clothing recommended.",
        private_notes: "Emily Chen may need extra support - first ceremony.",
        tags: ["equinox", "multi-day", "retreat"],
        location_id: locations?.[0]?.id,
      },
      {
        title: "New Moon Ceremony",
        type: "ceremony",
        status: "scheduled",
        description: "An evening ceremony honoring the new moon cycle. Setting intentions and releasing what no longer serves.",
        ceremony_notes: "Cacao ceremony followed by sound healing. Fire circle for intention setting.",
        start_datetime: "2026-03-29T18:00:00-05:00",
        end_datetime: "2026-03-29T23:00:00-05:00",
        timezone: "America/Chicago",
        capacity: 15,
        current_participant_count: 12,
        tags: ["moon", "evening", "ceremony"],
        location_id: locations?.[1]?.id,
      },
      {
        title: "Summer Solstice Gathering",
        type: "festival",
        status: "draft",
        description: "A two-day celebration of the longest day. Music, ceremony, community.",
        start_datetime: "2026-06-20T08:00:00-05:00",
        end_datetime: "2026-06-21T20:00:00-05:00",
        timezone: "America/Chicago",
        capacity: 30,
        current_participant_count: 0,
        tags: ["solstice", "outdoor", "festival"],
        location_id: locations?.[2]?.id,
      },
      {
        title: "Full Moon Fire Circle",
        type: "ceremony",
        status: "completed",
        description: "Monthly full moon ceremony with fire circle and drumming.",
        start_datetime: "2026-02-12T19:00:00-06:00",
        end_datetime: "2026-02-12T23:00:00-06:00",
        timezone: "America/Chicago",
        capacity: 15,
        current_participant_count: 14,
        tags: ["moon", "fire", "monthly"],
        location_id: locations?.[1]?.id,
      },
      {
        title: "Autumn Harvest Celebration",
        type: "festival",
        status: "canceled",
        description: "Seasonal celebration canceled due to venue availability.",
        start_datetime: "2025-09-22T10:00:00-05:00",
        end_datetime: "2025-09-23T18:00:00-05:00",
        timezone: "America/Chicago",
        capacity: 25,
        current_participant_count: 8,
        tags: ["harvest", "outdoor"],
        location_id: locations?.[0]?.id,
      },
    ])
    .select();

  // ===================== PARTICIPANTS =====================
  console.log("Creating participants...");
  const participantNames = [
    { full_name: "Sarah Johnson", preferred_name: "Sarah", email: "sarah@example.com", phone: "(512) 555-0101", city: "Austin", state: "TX", dietary: "Vegetarian" },
    { full_name: "Michael Rivera", preferred_name: "Mike", email: "michael@example.com", phone: "(512) 555-0102", city: "San Antonio", state: "TX" },
    { full_name: "Emily Chen", preferred_name: "Em", email: "emily@example.com", phone: "(512) 555-0103", city: "Houston", state: "TX", dietary: "Vegan" },
    { full_name: "David Kim", preferred_name: "David", email: "david@example.com", phone: "(512) 555-0104", city: "Dallas", state: "TX" },
    { full_name: "Jessica Patel", preferred_name: "Jess", email: "jess@example.com", phone: "(512) 555-0105", city: "Austin", state: "TX", dietary: "Gluten-free" },
    { full_name: "Robert Wilson", preferred_name: "Rob", email: "rob@example.com", phone: "(512) 555-0106", city: "Round Rock", state: "TX" },
    { full_name: "Amanda Torres", preferred_name: "Amanda", email: "amanda@example.com", phone: "(512) 555-0107", city: "Georgetown", state: "TX" },
    { full_name: "James Wright", preferred_name: "James", email: "james@example.com", phone: "(512) 555-0108", city: "Pflugerville", state: "TX" },
    { full_name: "Maria Garcia", preferred_name: "Maria", email: "maria@example.com", phone: "(512) 555-0109", city: "Cedar Park", state: "TX", dietary: "Pescatarian" },
    { full_name: "Thomas Lee", preferred_name: "Tom", email: "tom@example.com", phone: "(512) 555-0110", city: "Dripping Springs", state: "TX" },
    { full_name: "Rachel Green", preferred_name: "Rachel", email: "rachel@example.com", phone: "(512) 555-0111", city: "Buda", state: "TX" },
    { full_name: "Daniel Ortiz", preferred_name: "Dan", email: "dan@example.com", phone: "(512) 555-0112", city: "Kyle", state: "TX" },
    { full_name: "Sophia Nguyen", preferred_name: "Sophie", email: "sophie@example.com", phone: "(512) 555-0113", city: "Lakeway", state: "TX" },
    { full_name: "Christopher Davis", preferred_name: "Chris", email: "chris@example.com", phone: "(512) 555-0114", city: "Bastrop", state: "TX" },
    { full_name: "Olivia Martinez", preferred_name: "Liv", email: "liv@example.com", phone: "(512) 555-0115", city: "New Braunfels", state: "TX" },
    { full_name: "Andrew Baker", preferred_name: "Drew", email: "drew@example.com", phone: "(512) 555-0116", city: "San Marcos", state: "TX" },
    { full_name: "Natalie Young", preferred_name: "Nat", email: "nat@example.com", phone: "(512) 555-0117", city: "Wimberley", state: "TX", dietary: "Vegetarian" },
    { full_name: "Benjamin Hall", preferred_name: "Ben", email: "ben@example.com", phone: "(512) 555-0118", city: "Leander", state: "TX" },
    { full_name: "Emma White", preferred_name: "Emma", email: "emma@example.com", phone: "(512) 555-0119", city: "Hutto", state: "TX" },
    { full_name: "Kevin Campbell", preferred_name: "Kev", email: "kev@example.com", phone: "(512) 555-0120", city: "Manor", state: "TX" },
  ];

  const { data: participants } = await supabase
    .from("participants")
    .insert(
      participantNames.map((p) => ({
        full_name: p.full_name,
        preferred_name: p.preferred_name,
        email: p.email,
        phone: p.phone,
        city: p.city,
        state: p.state,
        country: "US",
        emergency_contact_name: "Emergency Contact",
        emergency_contact_phone: "(512) 555-9999",
      }))
    )
    .select();

  // ===================== PROVIDERS =====================
  console.log("Creating providers...");
  const { data: providers } = await supabase
    .from("providers")
    .insert([
      { full_name: "River Stone", role_type: "Lead Facilitator", email: "river@example.com", phone: "(512) 555-0201", city: "Dripping Springs", state: "TX", bio: "20+ years facilitating ceremonial work.", flat_rate: 2500, contract_status: "active" },
      { full_name: "Luna Martinez", role_type: "Sound Healer", email: "luna@example.com", phone: "(512) 555-0202", city: "Austin", state: "TX", bio: "Crystal bowl and gong practitioner.", hourly_rate: 150, contract_status: "active" },
      { full_name: "Oak Williams", role_type: "Cook", email: "oak@example.com", phone: "(512) 555-0203", city: "Bastrop", state: "TX", bio: "Farm-to-table ceremonial meals.", flat_rate: 800, contract_status: "active" },
      { full_name: "Willow Adams", role_type: "Yoga Instructor", email: "willow@example.com", phone: "(512) 555-0204", city: "Austin", state: "TX", hourly_rate: 100, contract_status: "pending" },
      { full_name: "Cedar Brooks", role_type: "Driver", email: "cedar@example.com", phone: "(512) 555-0205", city: "San Marcos", state: "TX", hourly_rate: 50, contract_status: "none" },
      { full_name: "Sage Thompson", role_type: "Musician", email: "sage@example.com", phone: "(512) 555-0206", city: "Wimberley", state: "TX", flat_rate: 500, contract_status: "expired" },
      { full_name: "Dawn Walker", role_type: "Healer", email: "dawn@example.com", phone: "(512) 555-0207", city: "Fredericksburg", state: "TX", hourly_rate: 200, contract_status: "active" },
      { full_name: "Moss Rivera", role_type: "Facilitator", email: "moss@example.com", phone: "(512) 555-0208", city: "Wimberley", state: "TX", flat_rate: 1500, contract_status: "active" },
      { full_name: "Fern Delgado", role_type: "Cook", email: "fern@example.com", phone: "(512) 555-0209", city: "Austin", state: "TX", flat_rate: 600, contract_status: "active" },
      { full_name: "Ash Petrov", role_type: "Driver", email: "ash@example.com", phone: "(512) 555-0210", city: "Round Rock", state: "TX", hourly_rate: 45, contract_status: "none" },
    ])
    .select();

  // ===================== MATERIALS CATALOG =====================
  console.log("Creating materials catalog...");
  const { data: materialsCatalog } = await supabase
    .from("materials_catalog")
    .insert([
      { name: "White Sage Bundle", category: "Ceremonial", unit_of_measure: "bundles", default_vendor: "Sacred Herb Co.", in_house_qty: 15, reorder_threshold: 20 },
      { name: "Palo Santo Sticks", category: "Ceremonial", unit_of_measure: "sticks", default_vendor: "Sacred Herb Co.", in_house_qty: 45, reorder_threshold: 30 },
      { name: "Ceremonial Candles", category: "Ceremonial", unit_of_measure: "units", default_vendor: "Beeswax Naturals", in_house_qty: 8, reorder_threshold: 20 },
      { name: "Purified Water", category: "Consumable", unit_of_measure: "gallons", default_vendor: "Spring Valley", in_house_qty: 5, reorder_threshold: 15 },
      { name: "Meditation Cushions", category: "Equipment", unit_of_measure: "units", default_vendor: "Zen Supplies", in_house_qty: 22, reorder_threshold: 20 },
      { name: "Blankets (Wool)", category: "Equipment", unit_of_measure: "units", default_vendor: "Pendleton", in_house_qty: 30, reorder_threshold: 25 },
      { name: "First Aid Kit", category: "Safety", unit_of_measure: "kits", default_vendor: "MedSupply", in_house_qty: 3, reorder_threshold: 2 },
      { name: "Fire Pit Wood", category: "Consumable", unit_of_measure: "cords", default_vendor: "Local Ranch", in_house_qty: 2, reorder_threshold: 3 },
      { name: "Ceremonial Tea", category: "Medicine", unit_of_measure: "ml", in_house_qty: 200, reorder_threshold: 100, notes: "Handle with care. Admin access only." },
      { name: "Rapeh", category: "Medicine", unit_of_measure: "grams", in_house_qty: 50, reorder_threshold: 30, notes: "Traditional preparation. Admin only." },
      { name: "Tobacco (Ceremonial)", category: "Medicine", unit_of_measure: "grams", in_house_qty: 100, reorder_threshold: 50 },
      { name: "Copal Incense", category: "Ceremonial", unit_of_measure: "pieces", in_house_qty: 25, reorder_threshold: 15 },
      { name: "Altar Cloth", category: "Ceremonial", unit_of_measure: "units", in_house_qty: 5, reorder_threshold: 3 },
      { name: "Charcoal Discs", category: "Consumable", unit_of_measure: "boxes", in_house_qty: 4, reorder_threshold: 5 },
      { name: "Eye Masks", category: "Equipment", unit_of_measure: "units", in_house_qty: 25, reorder_threshold: 20 },
      { name: "Yoga Mats", category: "Equipment", unit_of_measure: "units", in_house_qty: 15, reorder_threshold: 15 },
      { name: "Sleeping Bags", category: "Equipment", unit_of_measure: "units", in_house_qty: 10, reorder_threshold: 10 },
      { name: "LED Candles", category: "Ceremonial", unit_of_measure: "units", in_house_qty: 30, reorder_threshold: 20 },
      { name: "Herbal Tea Bags", category: "Consumable", unit_of_measure: "boxes", in_house_qty: 8, reorder_threshold: 6 },
      { name: "Paper Cups", category: "Consumable", unit_of_measure: "packs", in_house_qty: 3, reorder_threshold: 4 },
    ])
    .select();

  // ===================== EMAIL TEMPLATES =====================
  console.log("Creating email templates...");
  await supabase.from("email_templates").insert([
    {
      name: "Event Invitation",
      subject: "You're Invited: {{event_name}}",
      html_body: "<h2>Dear {{first_name}},</h2><p>You are warmly invited to <strong>{{event_name}}</strong>.</p><p><strong>Date:</strong> {{event_date}} at {{event_time}}<br/><strong>Location:</strong> {{venue_name}}</p><p>Please confirm your attendance at your earliest convenience.</p>",
      tokens_used: ["first_name", "event_name", "event_date", "event_time", "venue_name"],
    },
    {
      name: "Prep Instructions",
      subject: "Preparation Guide for {{event_name}}",
      html_body: "<h2>Hello {{first_name}},</h2><p>Your upcoming event <strong>{{event_name}}</strong> is approaching.</p><p>{{prep_instructions}}</p><h3>Directions</h3><p><a href='{{directions_link}}'>Click here for directions to {{venue_name}}</a></p>",
      tokens_used: ["first_name", "event_name", "prep_instructions", "directions_link", "venue_name"],
    },
    {
      name: "Day-Of Reminder",
      subject: "Today's the Day: {{event_name}}",
      html_body: "<h2>Good morning {{first_name}},</h2><p><strong>{{event_name}}</strong> is today!</p><p><strong>Time:</strong> {{event_time}}<br/><strong>Location:</strong> {{venue_name}}</p><p><a href='{{directions_link}}'>Get Directions</a></p>",
      tokens_used: ["first_name", "event_name", "event_time", "venue_name", "directions_link"],
    },
    {
      name: "Provider Assignment",
      subject: "Your Role at {{event_name}}",
      html_body: "<h2>Hello {{provider_name}},</h2><p>Thank you for joining us at <strong>{{event_name}}</strong>.</p><p><strong>Your Role:</strong> {{assigned_role}}<br/><strong>Date:</strong> {{event_date}}</p>",
      tokens_used: ["provider_name", "event_name", "assigned_role", "event_date"],
    },
  ]);

  // ===================== TASKS =====================
  console.log("Creating tasks...");
  if (events && events.length > 0) {
    await supabase.from("tasks").insert([
      { event_id: events[0].id, title: "Confirm venue access", priority: "high", status: "pending", due_date: "2026-03-15" },
      { event_id: events[0].id, title: "Send prep instructions to new participants", priority: "urgent", status: "pending", due_date: "2026-03-12" },
      { event_id: events[0].id, title: "Print waiver forms", priority: "medium", status: "completed", due_date: "2026-03-18" },
      { event_id: events[0].id, title: "Arrange transportation for providers", priority: "medium", status: "in_progress", due_date: "2026-03-17" },
      { event_id: events[0].id, title: "Confirm dietary requirements", priority: "high", status: "in_progress", due_date: "2026-03-16" },
      { event_id: events[1].id, title: "Order sage bundles", priority: "high", status: "pending", due_date: "2026-03-20" },
      { event_id: events[1].id, title: "Set up sound equipment", priority: "medium", status: "pending", due_date: "2026-03-28" },
      { event_id: events[2].id, title: "Draft event schedule", priority: "low", status: "pending", due_date: "2026-05-01" },
    ]);
  }

  // ===================== TAGS =====================
  console.log("Creating tags...");
  await supabase.from("tags").insert([
    { name: "equinox", color: "#7a8c6e" },
    { name: "solstice", color: "#c9b89a" },
    { name: "moon", color: "#6b7db3" },
    { name: "multi-day", color: "#b5a07e" },
    { name: "outdoor", color: "#5f6d55" },
    { name: "retreat", color: "#a08966" },
    { name: "ceremony", color: "#867153" },
    { name: "fire", color: "#c4614e" },
    { name: "festival", color: "#94a686" },
    { name: "monthly", color: "#8a9b7d" },
  ]);

  console.log("\nSeed complete!");
  console.log(`- ${locations?.length || 0} locations`);
  console.log(`- ${events?.length || 0} events`);
  console.log(`- ${participants?.length || 0} participants`);
  console.log(`- ${providers?.length || 0} providers`);
  console.log(`- ${materialsCatalog?.length || 0} materials`);
  console.log("- 4 email templates");
  console.log("- 8 tasks");
  console.log("- 10 tags");
}

seed().catch(console.error);
