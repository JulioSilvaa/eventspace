import { useEffect, useState } from 'react'

interface SplashScreenProps {
  onFinish: () => void
  minDuration?: number
}

export default function SplashScreen({ onFinish, minDuration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onFinish, 300) // Wait for fade out animation
    }, minDuration)

    return () => clearTimeout(timer)
  }, [minDuration, onFinish])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
    >
      <div className="text-center">
        {/* Logo Animation */}
        <div className="mb-8 animate-bounce">
          <div className="mx-auto w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
            <svg
              className="w-16 h-16 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
          EventSpace
        </h1>
        <p className="text-primary-100 text-lg">
          Espaços para Eventos
        </p>

        {/* Loading Spinner */}
        <div className="mt-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}
