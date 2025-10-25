# Quick Reference: Relational Schema Files

## 📁 New Files Created Today

### Essential Files (Required for Migration)

```
supabase/
├── migrations/
│   └── 001_create_relational_schema.sql
│       └─ SQL script to create all tables
│       └─ Run in: Supabase SQL Editor
│       └─ Action: Copy & Paste & Run
│
└── functions/make-server-f69ab98e/
    ├── db.ts (NEW ✅)
    │   └─ Database helper functions
    │   └─ 30+ functions for all DB operations
    │   └─ Status: Ready to deploy
    │
    ├── index-relational.ts (NEW ✅)
    │   └─ Edge Function server (relational version)
    │   └─ 15+ API endpoints
    │   └─ Action: Rename to index.ts
    │   └─ Status: Ready to deploy
    │
    └── [OLD FILES - Keep for reference]
        ├── index.tsx (OLD kv_store version)
        └── kv_store.tsx (OLD helpers)
```

### Documentation Files

```
RELATIONAL_MIGRATION_SUMMARY.md
├─ Complete overview of changes
├─ Schema diagrams and relationships
├─ Comparison: old vs new
└─ Feature highlights

IMPLEMENTATION_GUIDE.md
├─ 5-step quick start (20 min)
├─ Schema reference
├─ API endpoints
└─ Troubleshooting guide

MIGRATION_CHECKLIST.md
├─ Step-by-step action items
├─ Phase 1-10 breakdown
├─ Success criteria
└─ Verification steps

RELATIONAL_SCHEMA_SETUP.md
├─ Detailed setup guide
├─ Table structure explanation
├─ Advanced topics
└─ Migration path for old data

PROFILE_TEST_GUIDE.md
├─ Sample profile data reference
├─ Testing scenarios
└─ Debug tips
```

---

## 🎯 Quick Start (Copy-Paste Guide)

### 1️⃣ Get Supabase Open
```
https://supabase.com/dashboard
Select: ohkqlzhubipgpoxaniqt
```

### 2️⃣ Create Tables
```
Supabase → SQL Editor → New Query
Copy from: supabase/migrations/001_create_relational_schema.sql
Paste → Run
Expected: "Executed successfully"
```

### 3️⃣ Prepare Functions
```
Command line:
cd d:\Tickora\supabase\functions\make-server-f69ab98e
ren index-relational.ts index.ts
```

### 4️⃣ Deploy Functions
```
Command:
npx supabase functions deploy make-server-f69ab98e
Expected: "Deployed Functions on project..."
```

### 5️⃣ Set Service Key
```
Supabase Dashboard:
Settings → API → Copy Service Role Key
Functions → make-server-f69ab98e → Settings
Add: SUPABASE_SERVICE_ROLE_KEY = <your-key>
```

### 6️⃣ Test App
```
npm run dev
Sign up → Check users table
Sign up as organizer → Check organizers table
✅ Done!
```

---

## 📊 Database Tables

```sql
users
├─ id (UUID, PK)
├─ auth_id (UUID, FK)
├─ name, email
├─ user_type ('user' or 'organizer')
├─ phone, location, bio
├─ preferences (JSONB)
└─ timestamps

organizers
├─ id (UUID, PK)
├─ user_id (UUID, FK)
├─ organization_name
├─ organization_logo_url
├─ website
├─ social_links (JSONB)
├─ stats (events, attendees, revenue, rating)
└─ timestamps

events
├─ id (UUID, PK)
├─ organizer_id (UUID, FK)
├─ title, description
├─ date, time
├─ location
├─ price, capacity, attendees
├─ category, image_url
├─ status ('active', 'cancelled', 'completed')
└─ timestamps

tickets
├─ id (UUID, PK)
├─ event_id (UUID, FK)
├─ user_id (UUID, FK)
├─ quantity, total_price
├─ status ('confirmed', 'cancelled', 'refunded')
├─ buyer_info (JSONB)
├─ qr_code
└─ timestamps

audit_log (optional)
├─ id (UUID, PK)
├─ table_name, operation
├─ old_data, new_data (JSONB)
└─ created_at
```

---

## 🔄 API Endpoints

```
Authentication
  POST   /signup
  POST   /signin
  GET    /profile

Events
  GET    /events
  GET    /events/:id
  GET    /events/search?q=&category=
  POST   /events
  PUT    /events/:id
  GET    /organizer/events

Tickets
  POST   /tickets/purchase
  GET    /tickets
  GET    /events/:id/tickets

Dashboard
  GET    /dashboard/stats

Utility
  GET    /health
  POST   /init-sample-data
```

---

## ✅ Verification Steps

After each phase:

**Phase 1 (Tables):**
- [ ] 5 tables appear in Table Editor
- [ ] All indexes created
- [ ] No SQL errors

**Phase 2 (Deploy):**
- [ ] Functions deploy without errors
- [ ] Function status shows "Deployed"
- [ ] Logs are accessible

**Phase 3 (Test):**
- [ ] User sign-up works
- [ ] User appears in `users` table
- [ ] Organizer sign-up works
- [ ] Organizer appears in `users` + `organizers` tables

**Phase 4 (Full Flow):**
- [ ] Events browse without login
- [ ] User purchases tickets
- [ ] Ticket appears in `tickets` table
- [ ] Event attendees count increases
- [ ] Dashboard stats update

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "relation 'users' does not exist" | Run SQL migration again, check for errors |
| Functions return 500 errors | Verify SERVICE_ROLE_KEY is set |
| User sign-up fails | Check auth user creation, review function logs |
| No data in tables | Check app console for errors (F12) |
| "Only organizers can create events" | Verify user_type is exactly 'organizer' (case-sensitive) |
| RLS blocking requests | Use service key for testing, verify auth.uid() |
| Tables appear but are empty | Check sample data initialization `/init-sample-data` |

---

## 📈 Old vs New Comparison

| Aspect | kv_store (OLD) | Relational (NEW) |
|--------|---|---|
| Users | JSON strings in JSONB | Proper users table |
| Organizers | JSON in kv_store | Proper organizers table |
| Events | JSON in kv_store | Proper events table |
| Tickets | JSON in kv_store | Proper tickets table |
| Query Speed | Slow (JSONB filtering) | Fast (indexes) |
| Relationships | Manual in code | Enforced by DB |
| Data Integrity | App-level | Database-level |
| RLS | Not available | Full support |
| Scalability | Limited | Production-ready |

---

## 🚀 What's Different in Your App

### For Users
```
Before: Sign up → falls back to sample data if no backend
After:  Sign up → real data stored in database
Result: Your profile persists across sessions ✅
```

### For Organizers
```
Before: Events stored as JSON, difficult to query
After:  Events in proper table with indexes
Result: Fast event search and filtering ✅
```

### For Attendees
```
Before: Tickets not properly tracked
After:  Tickets stored with full event details
Result: Can view all bookings with event info ✅
```

### For Admin/Stats
```
Before: Manual JSON parsing to calculate stats
After:  SQL aggregation queries
Result: Instant dashboard statistics ✅
```

---

## 📞 Support Resources

### Files to Read (In Order)
1. **RELATIONAL_MIGRATION_SUMMARY.md** (5 min read)
2. **IMPLEMENTATION_GUIDE.md** (10 min guide)
3. **MIGRATION_CHECKLIST.md** (follow step-by-step)

### External Resources
- Supabase Docs: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Row-Level Security: https://supabase.com/docs/guides/auth/row-level-security

### Debugging
- Supabase Dashboard → Functions → Logs (see errors)
- Browser Console (F12) → Check app logs
- VS Code Terminal → Watch for deploy messages

---

## 🎓 Learning Outcomes

After completing this migration, you'll understand:

✅ **Relational Database Design**
- Tables and relationships
- Foreign keys and referential integrity
- Indexes and performance optimization

✅ **Row-Level Security (RLS)**
- How to control data access at database level
- Authentication integration with Supabase Auth

✅ **SQL Operations**
- CRUD operations (Create, Read, Update, Delete)
- JOINs for related data
- Aggregation functions (SUM, COUNT, etc.)

✅ **Backend Architecture**
- How Edge Functions interact with database
- Transaction handling
- Error handling and validation

✅ **Full Stack Development**
- Frontend → Backend → Database flow
- Data persistence and retrieval
- Real-time data management

---

## 📋 Files Checklist

After migration, you should have:

```
✅ supabase/
   ✅ migrations/001_create_relational_schema.sql
   ✅ functions/make-server-f69ab98e/
      ✅ db.ts (NEW)
      ✅ index.ts (renamed from index-relational.ts)
      ✅ kv_store.ts (OLD - can delete)
      ✅ index.tsx (OLD - can delete)

✅ Documentation/
   ✅ RELATIONAL_MIGRATION_SUMMARY.md
   ✅ IMPLEMENTATION_GUIDE.md
   ✅ MIGRATION_CHECKLIST.md
   ✅ RELATIONAL_SCHEMA_SETUP.md
   ✅ PROFILE_TEST_GUIDE.md

✅ Database/
   ✅ users table
   ✅ organizers table
   ✅ events table
   ✅ tickets table
   ✅ audit_log table
   ✅ All indexes
   ✅ RLS policies
```

---

## 🎯 Success Metrics

Your migration is complete when:

| Metric | Target | Status |
|--------|--------|--------|
| Tables created | 5 | ✅ |
| Indexes created | 8+ | ✅ |
| RLS policies | 6+ | ✅ |
| Functions deployed | 1 | ✅ |
| Sample data | 3 events | ✅ |
| Test users | 2+ | ✅ |
| API endpoints | 15+ | ✅ |
| Documentation | 5 files | ✅ |

---

**Ready to Start? Begin with Step 1 in MIGRATION_CHECKLIST.md** 🚀

**Estimated Time:** 20-30 minutes
**Difficulty:** Intermediate
**Support:** 5 comprehensive guides provided
