import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  backTo?: string
  wide?: boolean
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
  backTo = '/',
  wide = false
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back Button */}
      {showBackButton && (
        <div className={`sm:mx-auto sm:w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
          <Link
            to={backTo}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao EventSpace
          </Link>
        </div>
      )}

      {/* Header */}
      <div className={`sm:mx-auto sm:w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600 mr-2">
                EventSpace
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Negociação Direta
              </span>
            </div>
            <span className="block text-sm text-gray-500 mt-1">
              Conectamos, vocês negociam
            </span>
          </Link>
        </div>
        
        <h2 className="mt-8 text-center text-3xl font-bold text-gray-900">
          {title}
        </h2>
        
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content */}
      <div className={`mt-8 sm:mx-auto sm:w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className={`bg-white shadow sm:rounded-lg ${wide ? 'py-8 px-6 sm:px-10' : 'py-8 px-4 sm:px-10'}`}>
          {children}
        </div>
      </div>
    </div>
  )
}