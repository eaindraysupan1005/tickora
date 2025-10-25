-- Tickora Database Schema
-- Created: October 25, 2025
-- Migrates from kv_store pattern to relational tables

-- ============================================
-- 1. USERS TABLE (for attendees)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (user_type IN ('user', 'organizer')),
  phone TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{
    "emailNotifications": true,
    "smsNotifications": false,
    "marketingEmails": true,
    "eventReminders": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);

-- ============================================
-- 2. ORGANIZERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_logo_url TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{
    "twitter": null,
    "facebook": null,
    "instagram": null,
    "linkedin": null
  }'::jsonb,
  total_events_created INT DEFAULT 0,
  total_attendees INT DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0.00,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_organizers_user_id ON organizers(user_id);

-- ============================================
-- 3. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL,
  attendees INT DEFAULT 0,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_status ON events(status);

-- ============================================
-- 4. TICKETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  buyer_info JSONB,
  qr_code TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- ============================================
-- 5. BACKUP: OLD KV_STORE TABLE (for data migration if needed)
-- ============================================
CREATE TABLE IF NOT EXISTS kv_store_f69ab98e (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Users can read public profiles
CREATE POLICY "Users can read public profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id);

-- RLS Policies for organizers table
-- Organizers can read own data
CREATE POLICY "Organizers can read own data"
  ON organizers FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Everyone can read organizer profiles
CREATE POLICY "Organizers profile is public"
  ON organizers FOR SELECT
  USING (true);

-- Organizers can update own data
CREATE POLICY "Organizers can update own data"
  ON organizers FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- RLS Policies for events table
-- Everyone can read active events
CREATE POLICY "Everyone can read active events"
  ON events FOR SELECT
  USING (status = 'active');

-- Organizers can read their own events
CREATE POLICY "Organizers can read own events"
  ON events FOR SELECT
  USING (organizer_id IN (SELECT id FROM organizers WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- Organizers can create events
CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  WITH CHECK (organizer_id IN (SELECT id FROM organizers WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  USING (organizer_id IN (SELECT id FROM organizers WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- RLS Policies for tickets table
-- Users can read their own tickets
CREATE POLICY "Users can read own tickets"
  ON tickets FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Organizers can read tickets for their events
CREATE POLICY "Organizers can read event tickets"
  ON tickets FOR SELECT
  USING (event_id IN (SELECT id FROM events WHERE organizer_id IN (SELECT id FROM organizers WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))));

-- Users can create tickets (purchase)
CREATE POLICY "Users can create tickets"
  ON tickets FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ============================================
-- 7. AUDIT TRAIL (optional)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(255) NOT NULL,
  operation VARCHAR(50) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id UUID REFERENCES users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- 8. SAMPLE DATA (for testing)
-- ============================================
-- Note: In production, use proper data migration scripts
-- This is just for demonstration

-- Insert sample organizer user (requires a valid auth.users entry)
-- Uncomment and modify with real auth.users IDs when testing:
/*
INSERT INTO users (auth_id, name, email, user_type, phone, location, bio, member_since)
VALUES (
  'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  -- Replace with real auth.users.id
  'Sarah Johnson',
  'sarah@techevents.co',
  'organizer',
  '+1 (555) 123-4567',
  'San Francisco, CA',
  'Experienced event organizer passionate about creating memorable tech conferences.',
  NOW()
);

-- Create organizer profile
INSERT INTO organizers (user_id, organization_name, organization_logo_url, website)
SELECT id, 'TechEvents Co.', NULL, 'https://techevents.co'
FROM users WHERE email = 'sarah@techevents.co';

-- Create sample event
INSERT INTO events (
  organizer_id, title, description, date, time, location, price, capacity, category, image_url
)
SELECT 
  o.id,
  'Tech Summit 2025: AI & Innovation',
  'Join industry leaders for an inspiring conference exploring the latest in AI and technology.',
  '2025-10-15'::date,
  '09:00'::time,
  'San Francisco Convention Center',
  299.00,
  500,
  'Conference',
  'https://images.unsplash.com/photo-1600320261634-78edd477fa1e...'
FROM organizers o
WHERE o.organization_name = 'TechEvents Co.';
*/

-- ============================================
-- END OF MIGRATION SCRIPT
-- ============================================
