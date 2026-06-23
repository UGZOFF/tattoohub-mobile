import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xwcyfhnggnqgzipmluen.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y3lmaG5nZ25xZ3ppcG1sdWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODI2MTksImV4cCI6MjA1ODY1ODYxOX0.VoMliBBFDKDzTRAptzpMOHbJ_k55REfBpCBzKNj0yqE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'client' | 'artist' | 'admin'
  bio: string | null
  location: string | null
  preferred_styles: string[]
  push_token: string | null
  stripe_customer_id: string | null
  onboarding_complete: boolean
  referral_code: string | null
  credit_balance: number
  created_at: string
}

export type Artist = {
  id: string
  user_id: string
  stage_name: string
  bio: string | null
  avatar_url: string | null
  portfolio_urls: string[]
  styles: string[]
  location: string | null
  city: string
  hourly_rate: number | null
  min_booking_duration: number
  instagram_handle: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  is_verified: boolean
  is_active: boolean
  rating: number
  review_count: number
  total_bookings: number
  early_adopter: boolean
  commission_rate: number
  created_at: string
}

export type Booking = {
  id: string
  client_id: string
  artist_id: string
  date: string
  time_slot: string
  duration_minutes: number
  style: string | null
  body_zone: string | null
  description: string | null
  reference_images: string[]
  status: 'pending' | 'confirmed' | 'deposit_paid' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  total_amount: number
  deposit_amount: number
  deposit_paid: boolean
  stripe_payment_intent_id: string | null
  notes: string | null
  created_at: string
}

export type FlashEvent = {
  id: string
  artist_id: string
  title: string
  description: string | null
  image_url: string
  style: string
  size: 'XS' | 'S' | 'M' | 'L' | 'XL'
  price: number
  available_slots: number
  booked_slots: number
  available_date: string
  available_times: string[]
  body_zones: string[]
  is_active: boolean
  expires_at: string | null
  created_at: string
}

export type Message = {
  id: string
  booking_id: string
  sender_id: string
  content: string | null
  image_url: string | null
  message_type: 'text' | 'image' | 'system'
  read_at: string | null
  created_at: string
}

export type Review = {
  id: string
  booking_id: string
  client_id: string
  artist_id: string
  rating: number
  comment: string | null
  photos: string[]
  created_at: string
}
