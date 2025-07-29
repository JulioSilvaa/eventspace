import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  loading?: boolean
  children?: ReactNode
}

export default function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-primary-600',
  trend,
  loading = false,
  children
}: DashboardCardProps) {
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          
          {/* Value */}
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            
            {/* Trend */}
            {trend && !isNaN(trend.value) && (
              <span className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${trend.isPositive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              `}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}% {trend.label}
              </span>
            )}
          </div>
          
          {/* Description */}
          {description && (
            <p className="text-sm text-gray-500 mt-2">
              {description}
            </p>
          )}
        </div>
        
        {/* Icon */}
        {Icon && (
          <div className={`p-3 rounded-lg bg-gray-50 ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      
      {/* Custom content */}
      {children && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}