import { Crown } from 'lucide-react'

interface PremiumBadgeProps {
  userPlanType?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function PremiumBadge({ 
  userPlanType, 
  size = 'md',
  className = '' 
}: PremiumBadgeProps) {
  // Só mostra badge se o usuário for premium
  if (userPlanType !== 'premium') {
    return null
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-xs px-2.5 py-1.5', 
    lg: 'text-sm px-3 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <span 
      className={`
        inline-flex items-center gap-1 
        ${sizeClasses[size]}
        bg-gradient-to-r from-amber-500 to-yellow-500 
        text-white font-semibold rounded-full 
        shadow-sm
        ${className}
      `}
      title="Conta Premium"
    >
      <Crown className={`${iconSizes[size]} fill-current`} />
      PREMIUM
    </span>
  )
}