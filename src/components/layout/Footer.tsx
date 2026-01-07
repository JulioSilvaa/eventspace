import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-bold text-primary-400">
                EventSpace
              </span>
              <span className="text-xs bg-success-600 text-white px-2 py-1 rounded-full">
                0% Comissão
              </span>
            </div>
            <p className="text-gray-300 mb-4">
              Conectamos você diretamente com fornecedores de espaços e equipamentos
              para eventos. Sem taxas extras, sem intermediação.
            </p>
            <p className="text-sm text-gray-400">
              © 2024 EventSpace. Todos os direitos reservados.
            </p>
          </div>

          {/* Links - Plataforma */}
          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/equipamentos" className="text-gray-300 hover:text-white transition-colors">
                  Equipamentos
                </Link>
              </li>
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
          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
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
                <a href="mailto:contato@eventspace.com.br" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              EventSpace é uma plataforma de conexão. Não intermediamos pagamentos ou garantimos transações.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-sm text-success-400 font-medium">
                ✓ 100% do valor fica com você
              </span>
              <span className="text-sm text-primary-400 font-medium">
                ✓ Negociação direta
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}