import { create } from "zustand"
import { supabase, Profile } from "../lib/supabase"
import { Session } from "@supabase/supabase-js"

interface AuthState {
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  sendOtp: (email: string) => Promise<{ error: string | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>
  loadProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,

  sendOtp: async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      return { error: error?.message ?? null }
    } catch (e: any) {
      return { error: e?.message ?? "Erreur réseau" }
    }
  },

  verifyOtp: async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email, token, type: "email",
      })
      if (data?.session) {
        set({ session: data.session })
        await get().loadProfile()
      }
      return { error: error?.message ?? null }
    } catch (e: any) {
      return { error: e?.message ?? "Erreur réseau" }
    }
  },

  loadProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { set({ isLoading: false }); return }
      set({ session })
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
      set({ profile: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
    }
  },

  updateProfile: async (updates) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return { error: "Non connecté" }
      const { error } = await supabase.from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", session.user.id)
      if (!error) set(state => ({ profile: state.profile ? { ...state.profile, ...updates } : null }))
      return { error: error?.message ?? null }
    } catch (e: any) {
      return { error: e?.message ?? "Erreur" }
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },
}))