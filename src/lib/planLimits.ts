export interface PlanLimits {
  maxImages: number
  maxAds: number
  allowsFeatured: boolean
  hasPriority: boolean
}

// Em uma plataforma gratuita, todos os usuários têm os mesmos limites
export const PLAN_LIMITS: PlanLimits = {
  maxImages: 15,    // Aumentado para 15 para todos
  maxAds: 50,       // Praticamente ilimitado para uso normal
  allowsFeatured: true, // Todos podem ter destaque
  hasPriority: true
}

export function getPlanLimits(_planType: string = 'free'): PlanLimits {
  return PLAN_LIMITS
}

export function canUploadImages(_planType: string = 'free'): boolean {
  return PLAN_LIMITS.maxImages > 0
}

export function getMaxImagesForPlan(_planType: string = 'free'): number {
  return PLAN_LIMITS.maxImages
}

export function canCreateAds(_planType: string = 'free'): boolean {
  return PLAN_LIMITS.maxAds > 0
}