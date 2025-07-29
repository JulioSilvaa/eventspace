import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { ChevronRight, Home } from 'lucide-react'

interface LegalLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export default function LegalLayout({ 
  children, 
  title, 
  subtitle,
  breadcrumbs = [] 
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="flex items-center hover:text-blue-600 transition-colors">
            <Home className="w-4 h-4 mr-1" />
            Início
          </Link>
          
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-blue-600 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="prose prose-lg max-w-none p-8 sm:p-12">
            {children}
          </div>
        </div>

        {/* Legal Pages Navigation */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Outras Informações Legais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/como-funciona" 
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <h4 className="font-medium text-gray-900 mb-2">Como Funciona</h4>
              <p className="text-sm text-gray-600">
                Entenda como nossa plataforma conecta fornecedores e clientes
              </p>
            </Link>
            
            <Link 
              to="/termos" 
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <h4 className="font-medium text-gray-900 mb-2">Termos de Uso</h4>
              <p className="text-sm text-gray-600">
                Regras e condições para uso da plataforma
              </p>
            </Link>
            
            <Link 
              to="/privacidade" 
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <h4 className="font-medium text-gray-900 mb-2">Política de Privacidade</h4>
              <p className="text-sm text-gray-600">
                Como tratamos e protegemos seus dados pessoais
              </p>
            </Link>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Tem dúvidas sobre algum termo ou política?
          </p>
          <a 
            href="mailto:contato@eventspace.com.br"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Entre em Contato
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}