import { create } from 'zustand'

interface BookingDraft {
  artistId: string | null
  artistName: string | null
  date: string | null
  timeSlot: string | null
  durationMinutes: number
  style: string | null
  bodyZone: string | null
  description: string | null
  referenceImages: string[]
  totalAmount: number
  depositAmount: number
}

interface BookingState {
  draft: BookingDraft
  setDraft: (updates: Partial<BookingDraft>) => void
  resetDraft: () => void
}

const initialDraft: BookingDraft = {
  artistId: null,
  artistName: null,
  date: null,
  timeSlot: null,
  durationMinutes: 60,
  style: null,
  bodyZone: null,
  description: null,
  referenceImages: [],
  totalAmount: 0,
  depositAmount: 0,
}

export const useBookingStore = create<BookingState>((set) => ({
  draft: initialDraft,

  setDraft: (updates) => set(state => ({
    draft: { ...state.draft, ...updates }
  })),

  resetDraft: () => set({ draft: initialDraft }),
}))
