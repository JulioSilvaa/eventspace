import { Star } from 'lucide-react'

interface FeaturedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function FeaturedBadge({ size = 'md', className = '' }: FeaturedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`
      inline-flex items-center gap-1 
      bg-gradient-to-r from-yellow-400 to-orange-400 
      text-white font-medium rounded-full
      ${sizeClasses[size]} ${className}
    `}>
      <Star className={`${iconSizes[size]} fill-current`} />
      Destaque
    </div>
  )
}