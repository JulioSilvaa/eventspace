import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types/onboarding'

interface OnboardingStore {
  // State
  hasVisited: boolean
  userRole: UserRole
  tooltipsSeen: string[]
  tourCompleted: boolean
  welcomeModalDismissed: boolean

  // Actions
  markAsVisited: () => void
  setUserRole: (role: UserRole) => void
  markTooltipSeen: (id: string) => void
  hasSeenTooltip: (id: string) => boolean
  dismissWelcomeModal: () => void
  markTourCompleted: () => void
  reset: () => void
}

const initialState = {
  hasVisited: false,
  userRole: null as UserRole,
  tooltipsSeen: [],
  tourCompleted: false,
  welcomeModalDismissed: false,
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      markAsVisited: () => set({ hasVisited: true }),

      setUserRole: (role) => set({ userRole: role, hasVisited: true }),

      markTooltipSeen: (id) =>
        set((state) => ({
          tooltipsSeen: [...new Set([...state.tooltipsSeen, id])],
        })),

      hasSeenTooltip: (id) => get().tooltipsSeen.includes(id),

      dismissWelcomeModal: () => set({ welcomeModalDismissed: true }),

      markTourCompleted: () => set({ tourCompleted: true }),

      reset: () => set(initialState),
    }),
    {
      name: 'eventspace-onboarding',
    }
  )
)
