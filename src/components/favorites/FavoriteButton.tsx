import { Heart } from 'lucide-react'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useAuth } from '@/hooks/useAuth'

interface FavoriteButtonProps {
  adId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'icon' | 'button'
  className?: string
}

export default function FavoriteButton({ 
  adId, 
  size = 'md', 
  variant = 'icon',
  className = '' 
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  
  // Don't show favorites for logged in users
  if (user) {
    return null
  }

  const isCurrentlyFavorite = isFavorite(adId)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation if inside a Link
    e.stopPropagation() // Prevent event bubbling
    toggleFavorite(adId)
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`
          ${buttonSizeClasses[size]} 
          rounded-lg transition-all duration-200 
          ${isCurrentlyFavorite 
            ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100' 
            : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
          }
          ${className}
        `}
        title={isCurrentlyFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Heart 
          className={`${sizeClasses[size]} transition-all duration-200 ${
            isCurrentlyFavorite ? 'fill-current' : ''
          }`} 
        />
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center 
        transition-all duration-200 transform hover:scale-110
        ${isCurrentlyFavorite 
          ? 'text-red-600 hover:text-red-700' 
          : 'text-gray-600 hover:text-red-600'
        }
        ${className}
      `}
      title={isCurrentlyFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-all duration-200 ${
          isCurrentlyFavorite ? 'fill-current' : ''
        }`} 
      />
    </button>
  )
}