import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { XCircle, RefreshCw, ArrowLeft, CreditCard, HelpCircle, MessageCircle } from 'lucide-react'

export default function CheckoutError() {
  const [searchParams] = useSearchParams()
  
  // Get error details from URL
  const errorType = searchParams.get('error') || 'payment_failed'
  const errorMessage = searchParams.get('message')
  const plan = searchParams.get('plan') || 'basic'

  // Log error for analytics
  useEffect(() => {
    console.error('Checkout Error:', { errorType, errorMessage, plan })
    // Here you could send to analytics service
  }, [errorType, errorMessage, plan])

  const errorDetails = {
    payment_failed: {
      title: 'Pagamento Não Autorizado',
      description: 'Seu cartão foi recusado ou houve um problema no processamento.',
      icon: XCircle,
      color: 'red',
      causes: [
        'Cartão sem limite disponível',
        'Dados do cartão incorretos',
        'Problema temporário com a operadora',
        'Cartão bloqueado ou vencido'
      ],
      solutions: [
        'Verifique os dados do cartão',
        'Tente com outro cartão',
        'Entre em contato com seu banco',
        'Aguarde alguns minutos e tente novamente'
      ]
    },
    stripe_error: {
      title: 'Erro no Processamento do Pagamento',
      description: 'Houve um problema técnico durante o processamento.',
      icon: CreditCard,
      color: 'orange',
      causes: [
        'Problema na comunicação com o processador',
        'Configuração incorreta do sistema',
        'Erro temporário nos servidores'
      ],
      solutions: [
        'Tente novamente em alguns minutos',
        'Use um método de pagamento diferente',
        'Entre em contato com o suporte'
      ]
    },
    session_expired: {
      title: 'Sessão Expirada',
      description: 'Sua sessão de pagamento expirou por inatividade.',
      icon: RefreshCw,
      color: 'amber',
      causes: [
        'Tempo limite da sessão atingido',
        'Inatividade prolongada',
        'Problema de conexão'
      ],
      solutions: [
        'Inicie o processo novamente',
        'Certifique-se de ter boa conexão',
        'Complete o pagamento mais rapidamente'
      ]
    },
    cancelled: {
      title: 'Pagamento Cancelado',
      description: 'Você cancelou o processo de pagamento.',
      icon: XCircle,
      color: 'gray',
      causes: [
        'Pagamento cancelado pelo usuário',
        'Fechou a janela durante o processo'
      ],
      solutions: [
        'Tente novamente quando estiver pronto',
        'Escolha um método de pagamento diferente'
      ]
    },
    network_error: {
      title: 'Erro de Conexão',
      description: 'Houve um problema de conexão durante o pagamento.',
      icon: RefreshCw,
      color: 'orange',
      causes: [
        'Conexão com internet instável',
        'Problema temporário nos servidores',
        'Timeout da requisição'
      ],
      solutions: [
        'Verifique sua conexão com internet',
        'Tente novamente em alguns minutos',
        'Use uma conexão mais estável'
      ]
    }
  }

  const currentError = errorDetails[errorType as keyof typeof errorDetails] || errorDetails.payment_failed
  const IconComponent = currentError.icon

  const planNames = {
    basic: 'Básico (R$ 49,90/mês)',
    premium: 'Premium (R$ 79,90/mês)'
  }

  const retryUrl = `/pricing?plan=${plan}&retry=true`

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 bg-${currentError.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className={`w-10 h-10 text-${currentError.color}-600`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentError.title}
          </h1>
          <p className="text-xl text-gray-600">
            {currentError.description}
          </p>
          {errorMessage && (
            <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Plan Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Plano Selecionado</h3>
          <p className="text-gray-600">
            {planNames[plan as keyof typeof planNames] || planNames.basic}
          </p>
        </div>

        {/* Error Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Possible Causes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              Possíveis Causas
            </h3>
            <ul className="space-y-2">
              {currentError.causes.map((cause, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                  {cause}
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Como Resolver
            </h3>
            <ul className="space-y-2">
              {currentError.solutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Method Available */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">💳 Método de Pagamento Disponível</h3>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg max-w-sm">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Cartão de Crédito</p>
              <p className="text-sm text-gray-600">Visa, Mastercard, Elo</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to={retryUrl}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </Link>
          
          <Link
            to="/pricing"
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar aos Planos
          </Link>
        </div>

        {/* Support Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Precisa de Ajuda?
          </h3>
          <p className="text-gray-600 mb-4">
            Se o problema persistir, nossa equipe está pronta para ajudar você a ativar seu plano.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="https://wa.me/5511999999999?text=Olá,%20tive%20problema%20no%20checkout%20do%20EventSpace"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-600">(11) 99999-9999</p>
              </div>
            </a>
            
            <a
              href="mailto:suporte@eventspace.com.br?subject=Problema no Checkout&body=Olá, tive um problema no pagamento do plano EventSpace."
              className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-sm">
                @
              </div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">suporte@eventspace.com.br</p>
              </div>
            </a>
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Dúvidas frequentes sobre pagamentos:
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/faq#pagamentos" className="text-blue-600 hover:text-blue-700">
              Como funciona o pagamento?
            </Link>
            <Link to="/faq#seguranca" className="text-blue-600 hover:text-blue-700">
              Dados seguros?
            </Link>
            <Link to="/faq#cancelamento" className="text-blue-600 hover:text-blue-700">
              Posso cancelar?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}