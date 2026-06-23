-- ============================================
-- TATTOOHUB — SCHÉMA COMPLET v2
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'artist', 'admin')),
  bio TEXT,
  location TEXT,
  preferred_styles TEXT[],
  push_token TEXT,
  stripe_customer_id TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  credit_balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stage_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  portfolio_urls TEXT[],
  styles TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  city TEXT DEFAULT 'Paris',
  hourly_rate INTEGER,
  min_booking_duration INTEGER DEFAULT 60,
  instagram_handle TEXT,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  early_adopter BOOLEAN DEFAULT false,
  commission_rate NUMERIC(4,2) DEFAULT 15.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX artists_styles_gin ON artists USING GIN (styles);
CREATE INDEX artists_name_trgm ON artists USING GIN (stage_name gin_trgm_ops);

CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id),
  artist_id UUID REFERENCES public.artists(id),
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  style TEXT,
  body_zone TEXT,
  description TEXT,
  reference_images TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','deposit_paid','in_progress','completed','cancelled','disputed')),
  total_amount INTEGER NOT NULL,
  deposit_amount INTEGER NOT NULL,
  deposit_paid BOOLEAN DEFAULT false,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  artist_payout_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.flash_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  size TEXT CHECK (size IN ('XS','S','M','L','XL')),
  price INTEGER NOT NULL,
  available_slots INTEGER DEFAULT 1,
  booked_slots INTEGER DEFAULT 0,
  available_date DATE NOT NULL,
  available_times TEXT[],
  body_zones TEXT[],
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT,
  image_url TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','system')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX messages_booking_created ON messages(booking_id, created_at DESC);

CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) UNIQUE,
  client_id UUID REFERENCES auth.users(id),
  artist_id UUID REFERENCES public.artists(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, artist_id)
);

CREATE TABLE public.blocked_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.artist_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stage_name TEXT,
  portfolio_urls TEXT[],
  styles TEXT[],
  experience_years INTEGER,
  instagram_handle TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_note TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flash_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "artists_select_public" ON artists FOR SELECT USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "artists_insert_own" ON artists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "artists_update_own" ON artists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "bookings_client" ON bookings FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "bookings_artist" ON bookings FOR SELECT USING (auth.uid() = (SELECT user_id FROM artists WHERE id = artist_id));
CREATE POLICY "bookings_artist_update" ON bookings FOR UPDATE USING (auth.uid() = (SELECT user_id FROM artists WHERE id = artist_id));

CREATE POLICY "flash_public" ON flash_events FOR SELECT USING (is_active = true);
CREATE POLICY "flash_artist_manage" ON flash_events FOR ALL USING (auth.uid() = (SELECT user_id FROM artists WHERE id = artist_id));

CREATE POLICY "messages_booking_parties" ON messages FOR ALL USING (
  auth.uid() = sender_id OR
  auth.uid() = (SELECT client_id FROM bookings WHERE id = booking_id) OR
  auth.uid() = (SELECT user_id FROM artists WHERE id = (SELECT artist_id FROM bookings WHERE id = booking_id))
);

CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_client" ON reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "favorites_own" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER artists_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_artist_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE artists SET
    rating = (SELECT AVG(rating)::NUMERIC(3,2) FROM reviews WHERE artist_id = NEW.artist_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE artist_id = NEW.artist_id)
  WHERE id = NEW.artist_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_artist_rating();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
