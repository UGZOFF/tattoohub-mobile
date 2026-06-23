import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  toasts: Toast[]
  showToast: (message: string, type?: Toast['type']) => void
  hideToast: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],

  showToast: (message, type = 'info') => {
    const id = Date.now().toString()
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, 3500)
  },

  hideToast: (id) => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },
}))
