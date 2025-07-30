import { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { Toast as ToastType } from '@/contexts/ToastContext'

interface ToastProps {
  toast: ToastType
  onRemove: (id: string) => void
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <Info className="w-5 h-5 text-gray-600" />
    }
  }

  const getStyles = () => {
    const baseStyles = "border-l-4"
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50`
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50`
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50`
      case 'info':
        return `${baseStyles} border-blue-500 bg-blue-50`
      case 'loading':
        return `${baseStyles} border-blue-500 bg-blue-50`
      default:
        return `${baseStyles} border-gray-500 bg-gray-50`
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'scale-95' : 'scale-100'}
        w-full bg-white shadow-lg rounded-lg pointer-events-auto overflow-hidden
        ${getStyles()}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {toast.title}
            </p>
            
            {toast.message && (
              <p className="mt-1 text-xs text-gray-500">
                {toast.message}
              </p>
            )}
            
            {toast.action && (
              <div className="mt-2">
                <button
                  onClick={toast.action.onClick}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          
          {toast.type !== 'loading' && (
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleRemove}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}