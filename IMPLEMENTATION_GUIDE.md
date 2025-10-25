# Implementation Guide: Relational Schema Migration

## Quick Start (5 Steps)

### Step 1: Create Tables in Supabase ✅

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select project: `ohkqlzhubipgpoxaniqt`
3. Go to **SQL Editor** → Click "New Query"
4. Copy & paste file: `supabase/migrations/001_create_relational_schema.sql`
5. Click **Run** (Cmd+Enter)
6. Verify in **Table Editor**: You should see these tables:
   - ✅ users
   - ✅ organizers
   - ✅ events
   - ✅ tickets
   - ✅ audit_log

---

### Step 2: Replace Edge Function Files ✅

1. **Delete** old files (optional, for cleanup):
   - `supabase/functions/make-server-f69ab98e/index.tsx` 
   - `supabase/functions/make-server-f69ab98e/kv_store.tsx`

2. **Keep** the new files:
   - `supabase/functions/make-server-f69ab98e/index-relational.ts` (NEW - relational version)
   - `supabase/functions/make-server-f69ab98e/db.ts` (NEW - database helpers)

3. **Rename** for deployment:
   ```bash
   cd d:\Tickora\supabase\functions\make-server-f69ab98e
   # Rename index-relational.ts to index.ts
   ren index-relational.ts index.ts
   ```

---

### Step 3: Deploy Updated Functions

```bash
cd d:\Tickora
npx supabase functions deploy make-server-f69ab98e
```

**Expected output:**
```
Uploading asset (make-server-f69ab98e): supabase/functions/make-server-f69ab98e/index.ts
Uploading asset (make-server-f69ab98e): supabase/functions/make-server-f69ab98e/db.ts
Deployed Functions on project ohkqlzhubipgpoxaniqt: make-server-f69ab98e
```

---

### Step 4: Set SERVICE_ROLE_KEY (if not already done)

**In Supabase Dashboard:**
1. Go to: **Settings → API**
2. Copy "Service role" key (it's a long JWT token)
3. Go to: **Functions → make-server-f69ab98e → Settings**
4. Add environment variable:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** `<paste your key>`
   - Click **Save**

---

### Step 5: Test with Your App

```bash
npm run dev
```

**Test Sign Up:**
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in:
   ```
   Email: john@example.com
   Password: Test123!
   Name: John Smith
   Type: I want to attend events
   ```
4. Click Sign Up

**Verify in Supabase:**
1. Go to Supabase Dashboard → **Table Editor**
2. Open **users** table
3. You should see your new entry with:
   - ✅ name: "John Smith"
   - ✅ email: "john@example.com"
   - ✅ user_type: "user"
   - ✅ auth_id: (UUID)
   - ✅ member_since: (current date)

---

## 🎯 What Changed

### Old Approach (kv_store):
```
All data stored as JSON in a single kv_store table:
  key: "user:abc123"
  value: { id, name, email, ... }  ← JSON object
```

### New Approach (Relational):
```
Data organized in proper relational tables:
  users table: name, email, phone, location, ...
  organizers table: organization_name, website, ...
  events table: title, date, price, capacity, ...
  tickets table: user_id, event_id, quantity, ...
```

**Benefits:**
- ✅ Type-safe queries
- ✅ Better performance with indexes
- ✅ Foreign key relationships
- ✅ Easy reporting (sums, counts, aggregations)
- ✅ Row-level security built in
- ✅ Easier to maintain

---

## 📊 Database Schema

### users
```sql
- id (UUID, PK)
- auth_id (UUID, FK to auth.users) ← Links to Supabase Auth
- name (TEXT)
- email (TEXT, UNIQUE)
- user_type (VARCHAR: 'user' or 'organizer')
- phone, location, bio (TEXT)
- preferences (JSONB)
- member_since, created_at, updated_at (TIMESTAMP)
```

### organizers
```sql
- id (UUID, PK)
- user_id (UUID, FK to users)
- organization_name (TEXT)
- organization_logo_url (TEXT)
- website (TEXT)
- social_links (JSONB: twitter, facebook, instagram, linkedin)
- total_events_created (INT)
- total_attendees (INT)
- total_revenue (DECIMAL)
- rating (DECIMAL 0-5)
- created_at, updated_at (TIMESTAMP)
```

### events
```sql
- id (UUID, PK)
- organizer_id (UUID, FK to organizers)
- title, description (TEXT)
- date (DATE), time (TIME)
- location (TEXT)
- price (DECIMAL)
- capacity (INT)
- attendees (INT)
- category (VARCHAR)
- image_url (TEXT)
- status (VARCHAR: 'active', 'cancelled', 'completed')
- created_at, updated_at (TIMESTAMP)
```

### tickets
```sql
- id (UUID, PK)
- event_id (UUID, FK to events)
- user_id (UUID, FK to users)
- quantity (INT)
- total_price (DECIMAL)
- status (VARCHAR: 'confirmed', 'cancelled', 'refunded')
- buyer_info (JSONB)
- qr_code (TEXT)
- purchase_date (TIMESTAMP)
```

---

## 🔑 Key Features

### 1. **Automatic Organizer Profile Creation**
When a user signs up as organizer, automatically creates:
```json
{
  "organization_name": "John's Events",
  "social_links": { "twitter": null, "facebook": null, ... }
}
```

### 2. **Atomic Event Attendance Updates**
When ticket purchased:
```
1. Create ticket record
2. Update event.attendees count
3. All or nothing (transaction)
```

### 3. **Dashboard Stats with Aggregation**
Organizer can get:
```json
{
  "totalEvents": 5,
  "totalAttendees": 342,
  "totalRevenue": 34200.00
}
```

User can get:
```json
{
  "totalTickets": 8,
  "totalSpent": 1250.00,
  "upcomingEvents": 3
}
```

### 4. **Search with Full-Text Search**
```sql
WHERE title ILIKE '%keyword%' 
   OR description ILIKE '%keyword%'
   OR location ILIKE '%keyword%'
```

### 5. **Row-Level Security (RLS)**
- Users see only their own data
- Organizers manage their own events
- Public profiles visible to all
- Automatic auth.uid() filtering

---

## 🚀 API Endpoints (Updated)

### Authentication
```
POST /signup          - Create user + organizer profile (if organizer)
POST /signin          - Login, returns user profile
GET  /profile         - Get authenticated user's profile
```

### Events
```
GET    /events                  - List all active events
GET    /events/:id              - Get single event details
GET    /events/search?q=&cat=   - Search events
POST   /events                  - Create event (organizers only)
PUT    /events/:id              - Update event (organizer only)
GET    /organizer/events        - Get organizer's events
```

### Tickets
```
POST   /tickets/purchase        - Buy tickets
GET    /tickets                 - Get user's tickets
GET    /events/:id/tickets      - Get event attendees (organizer only)
```

### Dashboard
```
GET    /dashboard/stats         - Get user or organizer stats
```

### Utility
```
GET    /health                  - Health check
POST   /init-sample-data        - Initialize sample events
```

---

## ✅ Checklist

- [ ] **Step 1**: Run SQL migration in Supabase SQL Editor
- [ ] **Step 2**: Copy new db.ts file to functions directory
- [ ] **Step 3**: Rename index-relational.ts to index.ts
- [ ] **Step 4**: Deploy functions: `npx supabase functions deploy`
- [ ] **Step 5**: Set SUPABASE_SERVICE_ROLE_KEY in function settings
- [ ] **Step 6**: Test sign-up and verify data in users table
- [ ] **Step 7**: Test sign-up as organizer and verify organizers table
- [ ] **Step 8**: Call `/init-sample-data` to populate events
- [ ] **Step 9**: Test event browsing and ticket purchasing
- [ ] **Step 10**: Check dashboard stats endpoint

---

## 🐛 Troubleshooting

### Issue: "relation 'users' does not exist"
**Solution:** SQL migration failed. Check for errors in SQL editor.
- [ ] Run migration again
- [ ] Check each CREATE TABLE statement executed successfully

### Issue: "auth_id does not match auth.users.id"
**Solution:** Supabase Auth user not found when creating database user.
- [ ] Check SUPABASE_SERVICE_ROLE_KEY is correct
- [ ] Ensure auth.users entry exists first

### Issue: "user_type must be 'user' or 'organizer'"
**Solution:** Invalid user_type sent to signup.
- [ ] Frontend must send exactly: `"user"` or `"organizer"`
- [ ] Not: `"User"`, `"Organizer"`, `"attendee"`, etc.

### Issue: "Organizers can read own data" policy error
**Solution:** RLS policy may be too strict. Test with anon key vs service key.
- [ ] Use service key for testing (has full access)
- [ ] Use anon key from frontend (respects RLS)

---

## 🔄 Migration Path

If you have existing kv_store data and want to migrate:

```sql
-- Export old users from kv_store
SELECT value 
FROM kv_store_f69ab98e 
WHERE key LIKE 'user:%'

-- Then use this data to insert into new users table
INSERT INTO users (name, email, user_type, phone, location, bio)
SELECT 
  (value->>'name'),
  (value->>'email'),
  (value->>'userType'),
  (value->>'phone'),
  (value->>'location'),
  (value->>'bio')
FROM kv_store_f69ab98e
WHERE key LIKE 'user:%'
```

The old `kv_store_f69ab98e` table is kept for reference/rollback.

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Row-Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Database Functions**: https://supabase.com/docs/guides/database/functions

---

**Last Updated:** October 25, 2025

**Status:** Ready to implement
