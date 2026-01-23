export type UserRole = 'seeker' | 'advertiser' | 'explore' | null

export interface OnboardingState {
  hasVisited: boolean
  userRole: UserRole
  tooltipsSeen: string[]
  tourCompleted: boolean
  welcomeModalDismissed: boolean
}

export interface TooltipConfig {
  id: string
  content: string
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  showOnce?: boolean
}

export interface HowItWorksStep {
  number: number
  title: string
  description: string
  icon: string
}

export interface TrustBadge {
  icon: string
  title: string
  description: string
}
