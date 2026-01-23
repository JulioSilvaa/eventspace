import { useEffect, useState } from 'react'
import { X, Lightbulb } from 'lucide-react'
import { useOnboardingStore } from '@/stores/onboardingStore'

interface SimpleTooltipProps {
  id: string
  title: string
  message: string
  delay?: number
}

export default function SimpleTooltip({
  id,
  title,
  message,
  delay = 1000,
}: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { hasSeenTooltip, markTooltipSeen } = useOnboardingStore()

  useEffect(() => {
    if (hasSeenTooltip(id)) {
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [id, hasSeenTooltip, delay])

  useEffect(() => {
    if (isVisible) {
      const autoDismissTimer = setTimeout(() => {
        handleDismiss()
      }, 12000)

      return () => clearTimeout(autoDismissTimer)
    }
  }, [isVisible])

  const handleDismiss = () => {
    setIsVisible(false)
    markTooltipSeen(id)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Fechar dica"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 pr-6">
            <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full mt-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Entendi!
        </button>
      </div>
    </div>
  )
}
