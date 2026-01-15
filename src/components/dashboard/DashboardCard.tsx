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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5 hover:border-gray-200 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-semibold text-gray-500 line-clamp-1">
          {title}
        </p>

        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconColor.replace('text-', 'bg-').replace('-600', '-50')} ${iconColor} transition-transform group-hover:scale-110`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-3xl md:text-3xl font-black text-gray-900 tracking-tight">
          {value}
        </h3>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* Trend */}
        {trend && !isNaN(trend.value) && (
          <div className="flex items-center gap-2">
            <span className={`
              inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold
              ${trend.value === 0
                ? 'bg-gray-100 text-gray-600'
                : trend.isPositive
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }
            `}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs font-medium text-gray-400">
              {trend.label}
            </span>
          </div>
        )}

        {/* Description */}
        {description && !trend && (
          <p className="text-xs text-gray-400 font-medium">
            {description}
          </p>
        )}

        {/* If we have both trend and description, maybe description is redundant or can be secondary? 
            In the current data, description is "Total de visualizações" which is redundant with title "Visualizações". 
            Let's hide description if trend exists to reduce clutter, or show it very subtly.
            Actually, the user screenshot shows "Total de visualizações" at the bottom.
            Let's keep it but make it very subtle.
        */}
        {description && trend && (
          <p className="text-xs text-gray-400 font-medium line-clamp-1">
            {description}
          </p>
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