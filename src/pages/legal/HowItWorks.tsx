import LegalLayout from '@/components/layout/LegalLayout'
import { Link } from 'react-router-dom'
import { 
  Search, 
  MessageCircle, 
  HandHeart, 
  DollarSign, 
  Shield, 
  Users, 
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function HowItWorks() {
  const breadcrumbs = [
    { label: 'Como Funciona' }
  ]

  return (
    <LegalLayout
      title="Como Funciona o EventSpace"
      subtitle="Uma plataforma que conecta você diretamente com fornecedores de espaços e equipamentos para eventos, sem intermediação e sem taxas extras."
      breadcrumbs={breadcrumbs}
    >
      {/* Hero Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 not-prose">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">0%</div>
          <div className="text-gray-700">Taxa de Comissão</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
          <div className="text-gray-700">Do valor fica com você</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">Direto</div>
          <div className="text-gray-700">Negociação sem intermediários</div>
        </div>
      </div>

      {/* O que é o EventSpace */}
      <section className="mb-12">
        <h2>O que é o EventSpace?</h2>
        <p>
          O EventSpace é uma plataforma inovadora que conecta pessoas que precisam de espaços e 
          equipamentos para eventos com fornecedores especializados. Nossa missão é simples: 
          <strong> facilitar conexões diretas sem cobrar taxas ou comissões</strong>.
        </p>
        <p>
          Diferente de outras plataformas, não intermediamos pagamentos nem cobramos percentuais 
          sobre as transações. Nosso modelo de negócio é baseado em assinaturas mensais acessíveis 
          para fornecedores, garantindo que 100% do valor negociado fique com quem oferece o serviço.
        </p>
      </section>

      {/* Como funciona para clientes */}
      <section className="mb-12">
        <h2>Para quem procura espaços e equipamentos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 not-prose">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Busque</h3>
            <p className="text-gray-600 text-sm">
              Use nossos filtros para encontrar exatamente o que precisa
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Converse</h3>
            <p className="text-gray-600 text-sm">
              Converse diretamente com o fornecedor via WhatsApp
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HandHeart className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Negocie</h3>
            <p className="text-gray-600 text-sm">
              Acerte todos os detalhes diretamente com o fornecedor
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">4. Pague</h3>
            <p className="text-gray-600 text-sm">
              Faça o pagamento diretamente ao fornecedor
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 not-prose">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                Totalmente gratuito para clientes
              </h4>
              <p className="text-green-800 text-sm">
                Você não paga nada para usar nossa plataforma. Busque, compare e 
                negocie sem custos adicionais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona para fornecedores */}
      <section className="mb-12">
        <h2>Para fornecedores de espaços e equipamentos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 not-prose">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Cadastre-se</h3>
            <p className="text-gray-600 text-sm">
              Crie sua conta e escolha um plano mensal
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">2. Anuncie</h3>
            <p className="text-gray-600 text-sm">
              Publique seus espaços ou equipamentos com fotos e detalhes
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Receba contatos</h3>
            <p className="text-gray-600 text-sm">
              Clientes interessados entrarão em contato diretamente
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">4. Fature 100%</h3>
            <p className="text-gray-600 text-sm">
              Receba o valor integral sem desconto de comissões
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 not-prose">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">
                Planos mensais transparentes
              </h4>
              <p className="text-blue-800 text-sm mb-3">
                Pague apenas uma assinatura mensal fixa, sem surpresas ou taxas 
                por transação. Cancele quando quiser.
              </p>
              <Link 
                to="/planos" 
                className="inline-flex items-center text-blue-600 font-medium text-sm hover:text-blue-700"
              >
                Ver planos disponíveis
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="mb-12">
        <h2>Por que escolher o EventSpace?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold">Zero Comissão</h3>
            </div>
            <p className="text-gray-600">
              Não cobramos percentual sobre suas vendas. O que você negocia, 
              você recebe integralmente.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold">Contato Direto</h3>
            </div>
            <p className="text-gray-600">
              Facilita a comunicação direta entre clientes e fornecedores, 
              sem intermediários.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold">Transparência Total</h3>
            </div>
            <p className="text-gray-600">
              Preços claros, sem taxas ocultas. Você sabe exatamente quanto 
              vai pagar ou receber.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-orange-600 mr-3" />
              <h3 className="text-xl font-semibold">Comunidade Local</h3>
            </div>
            <p className="text-gray-600">
              Fortalece a economia local conectando empreendedores da sua região.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2>Perguntas Frequentes</h2>
        
        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Como o EventSpace ganha dinheiro se não cobra comissão?
            </h3>
            <p className="text-gray-600">
              Nosso modelo é baseado em assinaturas mensais pagas pelos fornecedores. 
              Isso nos permite manter a plataforma funcionando sem cobrar taxas sobre 
              as transações.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              O EventSpace garante a qualidade dos serviços?
            </h3>
            <p className="text-gray-600">
              Somos uma plataforma de conexão, não garantimos a qualidade dos serviços. 
              Recomendamos sempre verificar referências, avaliar o fornecedor e fazer 
              contratos diretos quando necessário.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Como é feito o pagamento?
            </h3>
            <p className="text-gray-600">
              Os pagamentos são feitos diretamente entre cliente e fornecedor. O EventSpace 
              não processa pagamentos, garantindo que você tenha total controle sobre 
              suas transações financeiras.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">
              Posso cancelar minha assinatura a qualquer momento?
            </h3>
            <p className="text-gray-600">
              Sim! Nossas assinaturas são mensais e podem ser canceladas a qualquer 
              momento sem multas ou taxas de cancelamento.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center not-prose">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Junte-se à nossa comunidade e descubra como é fácil conectar-se 
            diretamente com fornecedores de confiança.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/espacos"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Buscar Espaços
            </Link>
            <Link 
              to="/equipamentos"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Buscar Equipamentos
            </Link>
            <Link 
              to="/cadastro"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Anunciar meus Serviços
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </LegalLayout>
  )
}