import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: FieldError | string
  hint?: string
  required?: boolean
  showCharCount?: boolean
  maxLength?: number
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ 
    label, 
    error, 
    hint, 
    required, 
    showCharCount, 
    maxLength, 
    className = '', 
    value = '',
    ...props 
  }, ref) => {
    const errorMessage = typeof error === 'string' ? error : error?.message
    const charCount = String(value).length
    const isNearLimit = maxLength && charCount > maxLength * 0.9

    return (
      <div className="space-y-2">
        {/* Label */}
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Textarea */}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={`
            w-full px-3 py-2 border rounded-lg shadow-sm resize-vertical
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            ${errorMessage 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
            }
            ${className}
          `}
          {...props}
        />

        {/* Character Count */}
        {showCharCount && maxLength && (
          <div className="flex justify-end">
            <span className={`text-xs ${isNearLimit ? 'text-orange-600' : 'text-gray-500'}`}>
              {charCount}/{maxLength}
            </span>
          </div>
        )}

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

FormTextarea.displayName = 'FormTextarea'

export default FormTextarea