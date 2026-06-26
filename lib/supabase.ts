import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://xwcyfhnggnqgzipmluen.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3Y3lmaG5nZ25xZ3ppcG1sdWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjE5NDYsImV4cCI6MjA5MTYzNzk0Nn0.MhDhTpDS0iICG_ojtmcWccxycuVmp7ehTxj2tvjDJ-s"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})