import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating?: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export default function StarRating({ 
  rating = 0, 
  onRatingChange, 
  readonly = false,
  size = 'md',
  showValue = false
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const handleClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating)
    }
  }
  
  const handleMouseEnter = (starRating: number) => {
    if (!readonly) {
      setHover(starRating)
    }
  }
  
  const handleMouseLeave = () => {
    if (!readonly) {
      setHover(0)
    }
  }
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating)
        
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-all duration-150
              ${!readonly && 'hover:brightness-110'}
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                transition-colors duration-150
                ${filled 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-200'
                }
              `}
            />
          </button>
        )
      })}
      
      {showValue && rating > 0 && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}