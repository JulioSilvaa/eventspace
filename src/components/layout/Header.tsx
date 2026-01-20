import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { memo, useState } from 'react'

function Header() {
  const { isAuthenticated, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHomePage = location.pathname === '/' || location.pathname === '/home'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-600 mr-2">
                  EventSpace
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Negociação Direta
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                Conectamos, vocês negociam
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Início
            </Link>
            <Link
              to="/anunciantes"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Anúncios
            </Link>
            <Link
              to="/planos"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Planos
            </Link>
            <Link
              to="/anuncie"
              className="text-gray-700 hover:text-primary-600 transition-colors font-semibold"
            >
              Patrocinar
            </Link>
            <Link
              to="/como-funciona"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Como Funciona
            </Link>
          </nav>

          {/* Desktop Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Área do Anunciante
                </Link>
                {!isHomePage && (
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Sair
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Anunciar Agora
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link
                to="/anunciantes"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Anúncios
              </Link>
              <Link
                to="/planos"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Planos
              </Link>
              <Link
                to="/como-funciona"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Como Funciona
              </Link>

              <div className="border-t pt-4 mt-4">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/dashboard"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Área do Anunciante
                    </Link>
                    {!isHomePage && (
                      <button
                        onClick={async () => {
                          await handleSignOut()
                          setIsMenuOpen(false)
                        }}
                        className="text-left text-gray-700 hover:text-primary-600 transition-colors"
                      >
                        Sair
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Área do Assinante
                    </Link>
                    <Link
                      to="/cadastro"
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Anunciar Agora
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default memo(Header)