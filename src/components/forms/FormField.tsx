import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: FieldError | string
  hint?: string
  required?: boolean
  showPasswordToggle?: boolean
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, required, showPasswordToggle, type, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <div className="space-y-2">
        {/* Label */}
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full px-4 py-3 border rounded-xl shadow-sm transition-all 
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500
              ${errorMessage
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300'
              }
              ${showPasswordToggle ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />

          {/* Password Toggle */}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hint */}
        {hint && !errorMessage && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export default FormField