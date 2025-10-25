# Supabase Relational Schema Migration Guide

## Overview
This guide walks you through migrating Tickora from the kv_store key-value pattern to proper relational tables: **users**, **organizers**, **events**, and **tickets**.

---

## 📋 Tables Overview

### 1. **users** (Attendees & Organizers)
Stores all user accounts (both attendees and organizers)
```
id (UUID)              → Primary key
auth_id (UUID)         → Reference to Supabase Auth user
name (TEXT)            → User's name
email (TEXT)           → User's email (unique)
user_type (VARCHAR)    → 'user' or 'organizer'
phone, location, bio    → Profile info
preferences (JSONB)    → Email/SMS notification preferences
member_since           → Account creation date
```

### 2. **organizers** (Event Organizers)
Extended profile for organizers only
```
id (UUID)                → Primary key
user_id (UUID)           → FK to users table
organization_name        → Organization name
website, social_links    → Contact info
total_events_created     → Count of events
total_attendees          → Total people at all events
total_revenue            → Revenue from all events
rating                   → Organizer rating (0-5)
```

### 3. **events** (Events)
All events created by organizers
```
id (UUID)              → Primary key
organizer_id (UUID)    → FK to organizers
title, description     → Event details
date, time             → When the event happens
location               → Where
price                  → Ticket price
capacity               → Max attendees
attendees              → Current attendee count
category               → Type (Conference, Workshop, etc)
image_url              → Event image
status                 → 'active', 'cancelled', 'completed'
```

### 4. **tickets** (Event Bookings)
Tickets purchased by users
```
id (UUID)              → Primary key
event_id (UUID)        → FK to events
user_id (UUID)         → FK to users
quantity               → Number of tickets
total_price            → Total cost
status                 → 'pending', 'confirmed', 'cancelled', 'refunded'
buyer_info (JSONB)     → Name, email, etc
qr_code                → QR code for entry
purchase_date          → When purchased
```

---

## 🚀 Step-by-Step Setup

### Step 1: Create Tables in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `ohkqlzhubipgpoxaniqt`

2. **Open SQL Editor**
   - Click "SQL Editor" on the left sidebar
   - Click "New Query"

3. **Copy & Paste the Migration SQL**
   - Open file: `supabase/migrations/001_create_relational_schema.sql`
   - Copy ALL the SQL code
   - Paste into the Supabase SQL Editor
   - Click "Run" (or Cmd+Enter)

4. **Verify Tables Created**
   - Go to "Table Editor" on left sidebar
   - You should see these new tables:
     - ✅ users
     - ✅ organizers
     - ✅ events
     - ✅ tickets
     - ✅ audit_log
     - ✅ kv_store_f69ab98e (backup)

**Expected Result:**
```
✓ Executed successfully
Row count: 0
```

---

### Step 2: Update Edge Function Database Helpers

Replace `supabase/functions/make-server-f69ab98e/kv_store.ts` with relational database operations:

**New file: `supabase/functions/make-server-f69ab98e/db.ts`**

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2'

// Helper to create Supabase client
function createDBClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

// ============================================
// USER FUNCTIONS
// ============================================

export async function createUser(authId: string, userData: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        auth_id: authId,
        name: userData.name,
        email: userData.email,
        user_type: userData.userType,
        phone: userData.phone || null,
        location: userData.location || null,
        bio: userData.bio || null,
        preferences: userData.preferences || {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: true,
          eventReminders: true,
        },
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create user: ${error.message}`)
  return data
}

export async function getUserByAuthId(authId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get user: ${error.message}`)
  }
  return data || null
}

export async function getUserById(userId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get user: ${error.message}`)
  }
  return data || null
}

export async function updateUser(userId: string, updates: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update user: ${error.message}`)
  return data
}

// ============================================
// ORGANIZER FUNCTIONS
// ============================================

export async function createOrganizer(userId: string, orgData: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('organizers')
    .insert([
      {
        user_id: userId,
        organization_name: orgData.organizationName,
        organization_logo_url: orgData.logoUrl || null,
        website: orgData.website || null,
        social_links: orgData.socialLinks || {
          twitter: null,
          facebook: null,
          instagram: null,
          linkedin: null,
        },
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create organizer: ${error.message}`)
  return data
}

export async function getOrganizerByUserId(userId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get organizer: ${error.message}`)
  }
  return data || null
}

export async function getOrganizerById(organizerId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('id', organizerId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get organizer: ${error.message}`)
  }
  return data || null
}

// ============================================
// EVENT FUNCTIONS
// ============================================

export async function createEvent(organizerId: string, eventData: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        organizer_id: organizerId,
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        price: eventData.price,
        capacity: eventData.capacity,
        category: eventData.category,
        image_url: eventData.imageUrl || null,
        status: 'active',
      },
    ])
    .select()
    .single()

  if (error) throw new Error(`Failed to create event: ${error.message}`)
  return data
}

export async function getEventById(eventId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, organizers(*)')
    .eq('id', eventId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get event: ${error.message}`)
  }
  return data || null
}

export async function getActiveEvents() {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .select('*, organizers(organization_name, website)')
    .eq('status', 'active')
    .order('date', { ascending: true })

  if (error) throw new Error(`Failed to get events: ${error.message}`)
  return data || []
}

export async function getEventsByOrganizerWithJoin(organizerId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)
    .order('date', { ascending: true })

  if (error) throw new Error(`Failed to get organizer events: ${error.message}`)
  return data || []
}

export async function updateEvent(eventId: string, updates: any) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw new Error(`Failed to update event: ${error.message}`)
  return data
}

export async function searchEvents(query: string, category?: string) {
  const supabase = createDBClient()
  let queryBuilder = supabase
    .from('events')
    .select('*, organizers(organization_name)')
    .eq('status', 'active')

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`
    )
  }

  if (category && category !== 'All') {
    queryBuilder = queryBuilder.eq('category', category)
  }

  const { data, error } = await queryBuilder.order('date', { ascending: true })

  if (error) throw new Error(`Failed to search events: ${error.message}`)
  return data || []
}

// ============================================
// TICKET FUNCTIONS
// ============================================

export async function createTicket(ticketData: any) {
  const supabase = createDBClient()

  // Get current event attendees
  const event = await getEventById(ticketData.eventId)
  if (!event) throw new Error('Event not found')

  const availableTickets = event.capacity - event.attendees
  if (ticketData.quantity > availableTickets) {
    throw new Error('Not enough tickets available')
  }

  // Create ticket record
  const { data: ticketData_result, error: ticketError } = await supabase
    .from('tickets')
    .insert([
      {
        event_id: ticketData.eventId,
        user_id: ticketData.userId,
        quantity: ticketData.quantity,
        total_price: ticketData.totalPrice,
        status: 'confirmed',
        buyer_info: ticketData.buyerInfo || null,
      },
    ])
    .select()
    .single()

  if (ticketError) throw new Error(`Failed to create ticket: ${ticketError.message}`)

  // Update event attendees count
  const newAttendees = event.attendees + ticketData.quantity
  await updateEvent(ticketData.eventId, { attendees: newAttendees })

  return ticketData_result
}

export async function getTicketsByUserId(userId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*, events(*)')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('purchase_date', { ascending: false })

  if (error) throw new Error(`Failed to get user tickets: ${error.message}`)
  return data || []
}

export async function getTicketsByEventId(eventId: string) {
  const supabase = createDBClient()
  const { data, error } = await supabase
    .from('tickets')
    .select('*, users(name, email)')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .order('purchase_date', { ascending: false })

  if (error) throw new Error(`Failed to get event tickets: ${error.message}`)
  return data || []
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getOrganizerStats(organizerId: string) {
  const supabase = createDBClient()

  // Get organizer's events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('organizer_id', organizerId)

  if (eventsError) throw new Error(`Failed to get organizer stats: ${eventsError.message}`)

  const totalEvents = events?.length || 0
  const totalAttendees = events?.reduce((sum: number, e: any) => sum + e.attendees, 0) || 0
  const totalRevenue = events?.reduce((sum: number, e: any) => sum + e.price * e.attendees, 0) || 0

  return { totalEvents, totalAttendees, totalRevenue }
}

export async function getUserStats(userId: string) {
  const supabase = createDBClient()

  // Get user's tickets
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*, events(date)')
    .eq('user_id', userId)
    .eq('status', 'confirmed')

  if (ticketsError) throw new Error(`Failed to get user stats: ${ticketsError.message}`)

  const totalTickets = tickets?.reduce((sum: number, t: any) => sum + t.quantity, 0) || 0
  const totalSpent = tickets?.reduce((sum: number, t: any) => sum + t.total_price, 0) || 0
  const upcomingEvents =
    tickets?.filter((t: any) => new Date(t.events.date) > new Date()).length || 0

  return { totalTickets, totalSpent, upcomingEvents }
}
```

---

### Step 3: Deploy Updated Functions

```bash
cd d:\Tickora
npx supabase functions deploy make-server-f69ab98e
```

---

### Step 4: Set SERVICE_ROLE_KEY

**In Supabase Dashboard:**
1. Go to: Settings → API
2. Copy "Service role" key (long JWT token)
3. Go to: Functions → make-server-f69ab98e → Settings
4. Add environment variable:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `<paste the key>`
   - Click "Save"

---

### Step 5: Test the New Schema

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Sign up as attendee:**
   - Email: `attendee@test.com`
   - Password: `Test123!`
   - Name: `John Attendee`
   - Type: "I want to attend events"

3. **Verify in Supabase Dashboard:**
   - Go to: Table Editor → users
   - You should see your new user entry
   - Check `auth_id`, `name`, `email`, `user_type`

4. **Sign up as organizer:**
   - Email: `organizer@test.com`
   - Password: `Test123!`
   - Name: `Sarah Organizer`
   - Type: "I'm an event organizer"

5. **Verify organizer entry:**
   - Table Editor → organizers
   - Should have entry linked to Sarah Organizer's user

---

## ✅ What You Get

After completing this migration:

- ✅ Real user accounts stored in `users` table
- ✅ Organizer profiles in `organizers` table
- ✅ Events created by organizers in `events` table
- ✅ Ticket bookings in `tickets` table
- ✅ Relationships properly maintained via foreign keys
- ✅ Row-level security for data isolation
- ✅ Audit trail for all operations
- ✅ Better performance with proper indexing

---

## 🚨 Important Notes

### Before Migrating:

1. **Backup kv_store data** if you have existing data:
   ```sql
   -- Export kv_store to JSON
   SELECT jsonb_agg(jsonb_build_object('key', key, 'value', value))
   FROM kv_store_f69ab98e;
   ```

2. **The old kv_store table is kept** in the schema for reference/rollback

3. **RLS is enabled** - this provides security but requires proper auth headers

### Next Steps:

1. [ ] Run the SQL migration (Step 1)
2. [ ] Update Edge Functions with db.ts (Step 2)
3. [ ] Deploy updated functions (Step 3)
4. [ ] Set SERVICE_ROLE_KEY (Step 4)
5. [ ] Test with new schema (Step 5)

---

**Questions?** Check the Supabase docs: https://supabase.com/docs
