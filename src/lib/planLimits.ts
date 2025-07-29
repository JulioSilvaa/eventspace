export interface PlanLimits {
  maxImages: number
  maxAds: number
  allowsFeatured: boolean
  hasPriority: boolean
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxImages: 0, // Conta gratuita não pode criar anúncios
    maxAds: 0,
    allowsFeatured: false,
    hasPriority: false
  },
  basic: {
    maxImages: 10, // Até 10 imagens por anúncio
    maxAds: 1,
    allowsFeatured: false,
    hasPriority: false
  },
  premium: {
    maxImages: 20, // Até 20 imagens por anúncio
    maxAds: 1,
    allowsFeatured: true,
    hasPriority: true
  }
}

export function getPlanLimits(planType: string = 'free'): PlanLimits {
  return PLAN_LIMITS[planType] || PLAN_LIMITS.free
}

export function canUploadImages(planType: string = 'free'): boolean {
  const limits = getPlanLimits(planType)
  return limits.maxImages > 0
}

export function getMaxImagesForPlan(planType: string = 'free'): number {
  const limits = getPlanLimits(planType)
  return limits.maxImages
}

export function canCreateAds(planType: string = 'free'): boolean {
  const limits = getPlanLimits(planType)
  return limits.maxAds > 0
}