import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://xwcyfhnggnqgzipmluen.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y3lmaG5nZ25xZ3ppcG1sdWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwODI2MTksImV4cCI6MjA1ODY1ODYxOX0.VoMliBBFDKDzTRAptzpMOHbJ_k55REfBpCBzKNj0yqE"

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

export type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "artist" | "admin"
  bio: string | null
  location: string | null
  preferred_styles: string[]
  push_token: string | null
  onboarding_complete: boolean
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
  city: string
  hourly_rate: number | null
  rating: number
  review_count: number
  is_verified: boolean
  early_adopter: boolean
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
  status: "pending" | "confirmed" | "deposit_paid" | "in_progress" | "completed" | "cancelled"
  total_amount: number
  deposit_amount: number
  deposit_paid: boolean
  created_at: string
}

export type FlashEvent = {
  id: string
  artist_id: string
  title: string
  description: string | null
  image_url: string
  style: string
  size: "XS" | "S" | "M" | "L" | "XL"
  price: number
  available_slots: number
  booked_slots: number
  available_date: string
  is_active: boolean
  created_at: string
}

export type Message = {
  id: string
  booking_id: string
  sender_id: string
  content: string | null
  image_url: string | null
  message_type: "text" | "image" | "system"
  read_at: string | null
  created_at: string
}