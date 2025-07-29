import { forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import { AlertCircle, ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: Option[]
  error?: FieldError | string
  hint?: string
  required?: boolean
  placeholder?: string
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, hint, required, placeholder, className = '', ...props }, ref) => {
    const errorMessage = typeof error === 'string' ? error : error?.message

    return (
      <div className="space-y-2">
        {/* Label */}
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-3 py-2 border rounded-lg shadow-sm appearance-none
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
              disabled:bg-gray-50 disabled:text-gray-500
              ${errorMessage 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300'
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Chevron Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
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

FormSelect.displayName = 'FormSelect'

export default FormSelect