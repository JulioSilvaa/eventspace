import { useEffect, useState, type ReactNode } from 'react'
import { X, Lightbulb } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboardingStore'

interface ContextualTooltipProps {
  id: string
  title?: string
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  showOnce?: boolean
  delay?: number
}

export default function ContextualTooltip({
  id,
  title,
  content,
  children,
  position = 'bottom',
  showOnce = true,
  delay = 500,
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { hasSeenTooltip, markTooltipSeen } = useOnboardingStore()

  useEffect(() => {
    if (showOnce && hasSeenTooltip(id)) {
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [id, showOnce, hasSeenTooltip, delay])

  useEffect(() => {
    if (isVisible) {
      // Auto-dismiss after 10 seconds
      const autoDismissTimer = setTimeout(() => {
        handleDismiss()
      }, 10000)

      return () => clearTimeout(autoDismissTimer)
    }
  }, [isVisible])

  const handleDismiss = () => {
    setIsVisible(false)
    if (showOnce) {
      markTooltipSeen(id)
    }
  }

  if (!isVisible) {
    return <>{children}</>
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white',
  }

  return (
    <div className="relative inline-block">
      {children}

      {/* Tooltip */}
      <div
        className={`absolute z-50 ${positionClasses[position]} animate-in fade-in slide-in-from-bottom-2 duration-300`}
        role="tooltip"
      >
        <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm">
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar dica"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="pr-6">
            {title && (
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <h4 className="font-bold text-gray-900 text-sm">
                  {title}
                </h4>
              </div>
            )}

            <div className="text-sm text-gray-700 leading-relaxed">
              {content}
            </div>

            {/* Action Button */}
            <button
              onClick={handleDismiss}
              className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Entendi
            </button>
          </div>

          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-8 ${arrowClasses[position]}`}
          />
        </div>
      </div>
    </div>
  )
}
