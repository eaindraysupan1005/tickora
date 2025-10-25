# Profile Sample Data Testing Guide

## Overview
Your Tickora app comes with built-in sample profile data to help you test the authentication and profile display features without needing real users.

---

## 📋 Available Sample Profiles

### 1. **Attendee Profile** (User Type)
**Location:** `src/components/Profile.tsx` (Lines 99-100)

```
Name:     John Doe
Email:    john.doe@example.com
Phone:    +1 (555) 123-4567
Location: San Francisco, CA
Bio:      Event enthusiast who loves discovering new experiences and connecting with like-minded people.
Member Since: 2023-01-15
```

**Use Case:** Test the attendee/user flow (browsing events, purchasing tickets)

---

### 2. **Organizer Profile** (User Type)
**Location:** `src/components/Profile.tsx` (Lines 99-100, 104-108)

```
Name:              Sarah Johnson
Email:             sarah@techevents.co
Organization:      TechEvents Co.
Website:           https://techevents.co
Phone:             +1 (555) 123-4567
Location:          San Francisco, CA
Bio:               Experienced event organizer passionate about creating memorable tech 
                   conferences and networking experiences. Founded TechEvents Co. in 2020.
Member Since:      2023-01-15

Social Links:
- Twitter:    https://twitter.com/techeventsco
- Facebook:   https://facebook.com/techeventsco
- Instagram:  https://instagram.com/techeventsco
- LinkedIn:   https://linkedin.com/company/techeventsco
```

**Use Case:** Test the organizer flow (creating/managing events)

---

## 🎭 How Sample Profile Data Works

### Current Behavior (Development Fallback):
When you sign up or sign in:

1. **If API succeeds:** Your entered credentials (name, email) are stored and displayed
2. **If API fails:** App falls back to sample profile data based on your selected user type

### Code Reference:
```tsx
// From src/components/Profile.tsx (Lines 99-100)
const defaultName = userProfile?.name || (userType === 'organizer' ? 'Sarah Johnson' : 'John Doe');
const defaultEmail = userProfile?.email || (userType === 'organizer' ? 'sarah@techevents.co' : 'john.doe@example.com');
```

---

## 🧪 Testing Profile Data

### Test Case 1: Development Mode (No Backend)
**Scenario:** API not deployed yet

**Steps:**
1. Open app at `http://localhost:3000`
2. Click "Sign Up"
3. Select user type:
   - Choose **"I want to attend events"** → Will show "John Doe" profile after login
   - Choose **"I'm an event organizer"** → Will show "Sarah Johnson" profile after login
4. Fill in sign-up form with test credentials:
   ```
   Email: test@example.com
   Password: Test123!
   Name: Your Test Name (optional - can be different)
   ```
5. Click Sign Up
6. **Result:** 
   - If backend is working: Your entered name will display
   - If backend fails: Sample profile (John Doe / Sarah Johnson) will display
   - Check browser Console (F12 → Console tab) for debug logs

---

### Test Case 2: With Live Supabase Backend (After Setup)
**Scenario:** Edge Functions deployed, kv_store table created, SERVICE_ROLE_KEY set

**Steps:**
1. Complete Supabase setup:
   - [ ] Create `kv_store_f69ab98e` table
   - [ ] Set `SUPABASE_SERVICE_ROLE_KEY` environment variable
   - [ ] Initialize sample events: `npm run dev` (auto-initializes) or call `/init-sample-data` endpoint

2. Run app: `npm run dev`

3. Try sign-up:
   ```
   Email: testuser@example.com
   Password: Test123!
   Name: Alice Smith
   User Type: I want to attend events
   ```

4. **Expected Result:** 
   - Profile displays: "Alice Smith" (your entered name)
   - Email shows: "testuser@example.com"
   - User data stored in Supabase `kv_store_f69ab98e` table

5. Verify in Supabase Dashboard:
   - Go to: Table Editor → `kv_store_f69ab98e`
   - Search for key: `user:*` (should see entries like `user:abc123`)
   - Click entry to view user object:
     ```json
     {
       "id": "abc123xyz",
       "email": "testuser@example.com",
       "name": "Alice Smith",
       "userType": "user",
       "createdAt": "2025-10-25T..."
     }
     ```

---

## 📊 Sample Profile Data Fields

### Attendee Profile Fields:
```typescript
{
  name: string;           // "John Doe"
  email: string;          // "john.doe@example.com"
  phone: string;          // "+1 (555) 123-4567"
  location: string;       // "San Francisco, CA"
  bio: string;            // Event enthusiast description
  avatar: string;         // URL to profile image (optional)
  memberSince: string;    // "2023-01-15"
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    eventReminders: boolean;
  }
}
```

### Organizer Profile Fields:
```typescript
{
  name: string;                // "Sarah Johnson"
  email: string;               // "sarah@techevents.co"
  organizationName: string;    // "TechEvents Co."
  organizationLogo: string;    // URL (optional)
  website: string;             // "https://techevents.co"
  phone: string;               // "+1 (555) 123-4567"
  location: string;            // "San Francisco, CA"
  bio: string;                 // Organizer description
  avatar: string;              // URL (optional)
  memberSince: string;         // "2023-01-15"
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  }
  preferences: { ... }
}
```

---

## 🔍 Debug Tips

### Check Console Logs:
1. Open Browser DevTools: **F12**
2. Go to **Console** tab
3. Look for messages like:
   ```
   Form submitted...
   Signup API call...
   User profile received: { id, name, email, userType }
   ```

### Test API Endpoint Directly:
```bash
# Test the health check endpoint
curl http://localhost:3000/api/health

# Or test sign-in via backend (when deployed)
curl -X POST https://<your-project>.supabase.co/functions/v1/make-server-f69ab98e/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"test123"}'
```

---

## 🎯 Next Steps

### To Move from Sample Data to Real Data:

1. **Create kv_store table** (if not done):
   ```sql
   CREATE TABLE IF NOT EXISTS kv_store_f69ab98e (
     key TEXT NOT NULL PRIMARY KEY,
     value JSONB NOT NULL
   );
   ```

2. **Deploy Edge Functions**:
   ```bash
   npx supabase functions deploy make-server-f69ab98e
   ```

3. **Set SERVICE_ROLE_KEY**:
   - Get key from Supabase Dashboard → Settings → API
   - In Supabase Dashboard → Functions → make-server-f69ab98e → Settings
   - Add environment variable: `SUPABASE_SERVICE_ROLE_KEY=<your-key>`

4. **Initialize sample events** (optional):
   - Call: `POST /init-sample-data` endpoint
   - Or restart app: `npm run dev`

5. **Test with real data**:
   - Sign up with new email/password
   - Verify profile appears in Supabase Table Editor
   - Purchase tickets to test full flow

---

## 📝 Example Sign-Up Test Scenarios

| Scenario | Email | Password | Name | User Type | Expected Profile |
|----------|-------|----------|------|-----------|------------------|
| Attendee | john@test.com | Test123! | John | Attendee | John's profile + sample data |
| Organizer | sarah@test.co | Test123! | Sarah | Organizer | Sarah's profile + sample data |
| API Down | test@test.com | Test123! | Test User | Attendee | Falls back to "John Doe" sample |
| API Down | test@test.com | Test123! | Test User | Organizer | Falls back to "Sarah Johnson" sample |

---

## 💡 Pro Tips

- **Prefer Real Data:** Once you have a working Supabase backend, use real sign-ups instead of sample data for more realistic testing
- **Multiple Test Users:** Create several test accounts with different user types to test both attendee and organizer flows
- **Check Dates:** Sample events use dates in Oct-Nov 2025, so they should show as upcoming
- **Clear Console:** Regularly clear browser console to see fresh logs: `console.clear()`

---

**Last Updated:** October 25, 2025
