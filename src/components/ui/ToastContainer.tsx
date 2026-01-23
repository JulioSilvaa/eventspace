import { useEffect, useState } from 'react'
import { useToast, Toast } from '@/contexts/ToastContext'
import { X, CheckCircle, AlertCircle, Info, Loader2, AlertTriangle } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  // Guard against hydration/mounting issues
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none p-4 sm:p-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 300) // Wait for animation
  }

  // Icons based on type
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    loading: <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
  }

  // Styles based on type
  const styles = {
    success: 'bg-white border-l-4 border-l-green-500',
    error: 'bg-white border-l-4 border-l-red-500',
    warning: 'bg-white border-l-4 border-l-yellow-500',
    info: 'bg-white border-l-4 border-l-blue-500',
    loading: 'bg-white border-l-4 border-l-primary-500'
  }

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 p-4 rounded-lg shadow-lg border border-gray-100
        transition-all duration-300 transform
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        ${styles[toast.type]}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type]}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm text-gray-600 mt-1 leading-relaxed break-words">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-full hover:bg-gray-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}