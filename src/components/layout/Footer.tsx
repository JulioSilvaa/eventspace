import { Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-2">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <span className="text-2xl font-bold text-primary-400">
                EventSpace
              </span>
              <span className="text-xs bg-success-600 text-white px-2 py-1 rounded-full">
                0% Comissão
              </span>
            </div>
            <p className="text-gray-300 mb-4 text-center md:text-left max-w-md mx-auto md:mx-0">
              Conectamos você diretamente com fornecedores de espaços
              para eventos. Sem taxas extras, sem intermediação.
            </p>
          </div>

          {/* Links - Plataforma */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4 text-white">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/espacos" className="text-gray-300 hover:text-white transition-colors">
                  Espaços
                </Link>
              </li>
              <li>
                <Link to="/planos" className="text-gray-300 hover:text-white transition-colors">
                  Planos
                </Link>
              </li>
              <li>
                <Link to="/como-funciona" className="text-gray-300 hover:text-white transition-colors">
                  Como Funciona
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Suporte */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold mb-4 text-white">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/termos" className="text-gray-300 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-gray-300 hover:text-white transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <a href="mailto:eventspace.suporte@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400 mb-2">
                EventSpace é uma plataforma de conexão. Não intermediamos pagamentos ou garantimos transações.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 EventSpace. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <span className="text-sm text-gray-400 font-medium whitespace-nowrap flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Pagamento 100% Seguro
              </span>
              <span className="text-sm text-success-400 font-medium whitespace-nowrap">
                ✓ 100% do valor fica com você
              </span>
              <span className="text-sm text-primary-400 font-medium whitespace-nowrap">
                ✓ Negociação direta
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}