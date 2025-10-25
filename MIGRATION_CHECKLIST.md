# Tickora Relational Schema - Action Checklist

## 🎯 Complete Migration Checklist (20-30 minutes)

### ✅ Phase 1: Setup (Preparation)

- [ ] **Review the schema diagram**
  - File: `RELATIONAL_MIGRATION_SUMMARY.md`
  - Time: 2 min
  - Understand: users → organizers → events → tickets

- [ ] **Gather requirements**
  - Supabase project ID: `ohkqlzhubipgpoxaniqt` ✅ (you have this)
  - Service Role Key: From Supabase Settings → API
  - Time: 1 min

---

### ✅ Phase 2: Create Tables in Supabase (5 min)

- [ ] **Open Supabase Dashboard**
  - URL: https://supabase.com/dashboard
  - Select project: `ohkqlzhubipgpoxaniqt`

- [ ] **Open SQL Editor**
  - Click: "SQL Editor" in left sidebar
  - Click: "New Query" button

- [ ] **Copy SQL Migration**
  - Open: `supabase/migrations/001_create_relational_schema.sql`
  - Select all (Ctrl+A)
  - Copy (Ctrl+C)

- [ ] **Paste & Execute**
  - Paste into SQL Editor (Ctrl+V)
  - Click: "Run" or press Cmd+Enter
  - Wait for: "Executed successfully"

- [ ] **Verify Tables Created**
  - Click: "Table Editor" in left sidebar
  - Confirm you see:
    - ✅ users
    - ✅ organizers
    - ✅ events
    - ✅ tickets
    - ✅ audit_log
    - ✅ kv_store_f69ab98e (backup)

---

### ✅ Phase 3: Prepare Edge Function Files (2 min)

- [ ] **Check function directory**
  - Path: `supabase/functions/make-server-f69ab98e/`
  - Files should contain:
    - `index.ts` or `index.tsx` (OLD kv_store version)
    - `db.ts` (NEW relational helpers)
    - `index-relational.ts` (NEW server with relational code)

- [ ] **Rename index-relational to index**
  - **Option A: Using File Explorer**
    - Right-click: `index-relational.ts`
    - Select: "Rename"
    - Change to: `index.ts`
  
  - **Option B: Using Terminal**
    ```bash
    cd d:\Tickora\supabase\functions\make-server-f69ab98e
    ren index-relational.ts index.ts
    ```

- [ ] **Verify file rename**
  - You should now have:
    - ✅ `index.ts` (NEW relational version)
    - ✅ `db.ts` (NEW database helpers)
    - (OLD `index.tsx` and `kv_store.tsx` can be kept for reference)

---

### ✅ Phase 4: Deploy Updated Functions (3 min)

- [ ] **Open terminal**
  - Location: VS Code or Command Prompt
  - Navigate to: `d:\Tickora`

- [ ] **Run deploy command**
  ```bash
  cd d:\Tickora
  npx supabase functions deploy make-server-f69ab98e
  ```

- [ ] **Wait for success**
  - Expected output:
    ```
    Uploading asset (make-server-f69ab98e): supabase/.../index.ts
    Uploading asset (make-server-f69ab98e): supabase/.../db.ts
    Deployed Functions on project ohkqlzhubipgpoxaniqt: make-server-f69ab98e
    ```

- [ ] **Check deployment link**
  - Click link in output: `https://supabase.com/dashboard/project/.../functions`
  - Verify function shows as "Deployed"

---

### ✅ Phase 5: Set Environment Variables (2 min)

- [ ] **Get Service Role Key**
  - In Supabase Dashboard
  - Go to: Settings → API
  - Find: "Service role" (NOT "Anon key")
  - Copy: The long JWT token (starts with `eyJ...`)

- [ ] **Set in function environment**
  - In Supabase Dashboard
  - Go to: Functions → make-server-f69ab98e
  - Click: Settings (gear icon)
  - Click: "Add environment variable"
  - Name: `SUPABASE_SERVICE_ROLE_KEY`
  - Value: `<paste your service role key>`
  - Click: Save

- [ ] **Verify it's set**
  - Refresh page
  - Confirm `SUPABASE_SERVICE_ROLE_KEY` appears in environment variables list

---

### ✅ Phase 6: Test Your App (10 min)

- [ ] **Start development server**
  ```bash
  npm run dev
  ```
  - Opens: http://localhost:3000

- [ ] **Test Sign Up (Attendee)**
  - Click: "Sign Up" button
  - Fill in:
    - Email: `john@test.com`
    - Password: `Test123!`
    - Name: `John Test`
    - Type: **"I want to attend events"** ← Select this
  - Click: Sign Up
  - Check: Console for success/error logs (F12 → Console)

- [ ] **Verify in Supabase (users table)**
  - In Supabase Dashboard
  - Go to: Table Editor → users
  - Look for new row with:
    - ✅ name: "John Test"
    - ✅ email: "john@test.com"
    - ✅ user_type: "user"
    - ✅ auth_id: (should be a UUID)
    - ✅ member_since: (today's date)

- [ ] **Test Sign Up (Organizer)**
  - Sign out if needed
  - Click: "Sign Up" again
  - Fill in:
    - Email: `sarah@test.com`
    - Password: `Test123!`
    - Name: `Sarah Test`
    - Type: **"I'm an event organizer"** ← Select this
  - Click: Sign Up

- [ ] **Verify in Supabase (organizers table)**
  - In Supabase Dashboard
  - Go to: Table Editor → organizers
  - Look for new row with:
    - ✅ user_id: (should match Sarah's user.id from users table)
    - ✅ organization_name: "Sarah Test's Events"
    - ✅ website: null
    - ✅ created_at: (today's date)

- [ ] **View profile**
  - After signing in
  - Check that profile page shows your entered data
  - Verify: Name and email match what you entered (not sample data)

---

### ✅ Phase 7: Initialize Sample Events (5 min)

- [ ] **Call init-sample-data endpoint**
  - **Option A: From app**
    - Look for "Initialize Sample Data" button (if available)
    - Or check browser console: `fetch('/api/init-sample-data', {method: 'POST'})`
  
  - **Option B: Using curl**
    ```bash
    curl -X POST https://<your-project>.supabase.co/functions/v1/make-server-f69ab98e/init-sample-data
    ```
  
  - **Option C: Manually populate events**
    - Wait, that's what init does!

- [ ] **Verify events created**
  - In Supabase Dashboard
  - Go to: Table Editor → events
  - You should see 3 sample events:
    - ✅ "Tech Innovation Conference 2025"
    - ✅ "Summer Music Festival"
    - ✅ "Digital Marketing Workshop"

- [ ] **Check event details**
  - Click on any event row
  - Verify:
    - ✅ title, description filled
    - ✅ date, time populated
    - ✅ price, capacity set
    - ✅ organizer_id linked to Sarah's organizer profile
    - ✅ attendees: 0

---

### ✅ Phase 8: Test Complete Flow (5 min)

- [ ] **Browse events in app**
  - Go to: http://localhost:3000
  - Sign in as attendee (john@test.com / Test123!)
  - Dashboard or Events page should show:
    - ✅ Tech Innovation Conference 2025 ($299)
    - ✅ Summer Music Festival ($150)
    - ✅ Digital Marketing Workshop ($89)

- [ ] **Purchase tickets**
  - Click on an event
  - Click: "Buy Tickets" or similar
  - Enter quantity: 2
  - Click: Purchase
  - Check: Success message
  - Check: Tickets page shows your purchase

- [ ] **Verify ticket in database**
  - In Supabase Dashboard
  - Go to: Table Editor → tickets
  - Look for new row:
    - ✅ event_id: (matches the event you booked)
    - ✅ user_id: (matches your user.id)
    - ✅ quantity: 2
    - ✅ total_price: 598.00 (if $299 event × 2)
    - ✅ status: "confirmed"

- [ ] **Check event attendees updated**
  - In Supabase Dashboard
  - Go to: Table Editor → events
  - Find the event you purchased
  - Check: attendees count increased by 2

- [ ] **View organizer dashboard**
  - Sign in as: sarah@test.com
  - Go to: Dashboard or Organizer Events
  - Should show:
    - ✅ Total Events: 3
    - ✅ Total Attendees: 2 (from your purchase)
    - ✅ Total Revenue: $598.00

---

### ✅ Phase 9: Verify RLS Security (2 min)

- [ ] **Test user can only see own data**
  - Sign in as: john@test.com
  - Go to: Profile page
  - Should see: John Test's profile (not Sarah's)

- [ ] **Test organizer can only edit own events**
  - Sign in as: sarah@test.com
  - Try to edit someone else's event
  - Should get: "Unauthorized" error (good!)

- [ ] **Test public can view events**
  - Don't sign in (sign out)
  - Try to browse events
  - Should see: All active events
  - Should NOT see: User profiles or private data

---

### ✅ Phase 10: Final Verification (2 min)

- [ ] **Check all tables are populated**
  
  | Table | Count | Status |
  |-------|-------|--------|
  | users | 2+ | ✅ |
  | organizers | 1+ | ✅ |
  | events | 3+ | ✅ |
  | tickets | 1+ | ✅ |
  | audit_log | ? | ✅ |

- [ ] **Run API health check**
  - Browser: `http://localhost:3000/api/health` (or similar)
  - Should return: `{"status": "healthy", ...}`

- [ ] **Check browser console**
  - F12 → Console
  - Should show: No errors (warnings OK)
  - Check for: Successful API calls

- [ ] **Verify logs**
  - Supabase Dashboard → Functions → Logs
  - Should show: Successful requests
  - Look for: No 500 errors

---

## 🎉 Success Criteria

You'll know everything works when:

✅ **Database**
- [ ] 5 tables created in Supabase
- [ ] All indexes created successfully
- [ ] RLS policies enabled

✅ **Edge Functions**
- [ ] Functions deployed successfully
- [ ] SERVICE_ROLE_KEY set in environment
- [ ] No deployment errors

✅ **Data Flow**
- [ ] User can sign up → appears in users table
- [ ] Organizer can sign up → appears in users + organizers tables
- [ ] Sample events appear in events table
- [ ] User can purchase tickets → appears in tickets table
- [ ] Event attendees count increases

✅ **Security**
- [ ] Users see only their own data
- [ ] Organizers can only edit their own events
- [ ] RLS policies enforced at database level

✅ **Performance**
- [ ] All queries complete in <100ms
- [ ] No N+1 query problems
- [ ] Indexes being used

---

## 📊 What's Next?

After completing this checklist:

1. **Production Deployment**
   - Deploy to production environment
   - Set up SSL/TLS
   - Configure backups

2. **Additional Features**
   - Implement reviews & ratings
   - Add wishlists
   - Payment processing
   - Email confirmations

3. **Monitoring**
   - Set up analytics
   - Monitor query performance
   - Track user behavior

4. **Optimization**
   - Add caching
   - Optimize database queries
   - Load testing

---

## 🆘 Troubleshooting

### Table doesn't appear after SQL run
- ✅ Check for SQL errors in output
- ✅ Try running migration again
- ✅ Check table name is correct

### Functions deploy but return 500 errors
- ✅ Check SERVICE_ROLE_KEY is set
- ✅ Check function logs in Supabase Dashboard
- ✅ Verify database tables exist

### Sign up succeeds but no user appears in table
- ✅ Check auth user was created (Settings → Auth)
- ✅ Check database user record creation query
- ✅ Check function logs for errors

### "Only organizers can create events" error when creating event
- ✅ Verify you're signed in as organizer
- ✅ Check organizers table has entry for your user
- ✅ Check user_type is 'organizer' not 'Organizer'

### RLS is blocking all requests
- ✅ Verify auth.uid() is being passed correctly
- ✅ Check RLS policies are correctly written
- ✅ Use service key (not anon key) for debugging

---

## 📞 Need Help?

Check these files in order:
1. **RELATIONAL_MIGRATION_SUMMARY.md** - Overview
2. **IMPLEMENTATION_GUIDE.md** - Detailed steps
3. **RELATIONAL_SCHEMA_SETUP.md** - Database schema reference
4. **Supabase Docs** - https://supabase.com/docs

---

## ✅ Sign-Off Checklist

When complete, mark these as done:

- [ ] All tables created in Supabase ✅
- [ ] Edge Functions deployed ✅
- [ ] SERVICE_ROLE_KEY set ✅
- [ ] Sample users exist in database ✅
- [ ] Sample organizer exists in database ✅
- [ ] Sample events exist in database ✅
- [ ] User can purchase tickets ✅
- [ ] Tickets appear in database ✅
- [ ] Dashboard stats work ✅
- [ ] No errors in console ✅

**🎉 YOU'RE DONE! Tickora now has a production-ready relational database!**

---

**Created:** October 25, 2025
**Status:** Ready for implementation
**Estimated Time:** 20-30 minutes
**Difficulty:** Intermediate
