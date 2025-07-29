import LegalLayout from '@/components/layout/LegalLayout'

export default function PrivacyPolicy() {
  const breadcrumbs = [
    { label: 'Política de Privacidade' }
  ]

  return (
    <LegalLayout
      title="Política de Privacidade"
      subtitle="Esta política explica como coletamos, utilizamos e protegemos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD)."
      breadcrumbs={breadcrumbs}
    >
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg not-prose">
        <p className="text-blue-800 text-sm">
          <strong>Última atualização:</strong> 26 de julho de 2025<br />
          <strong>Vigência:</strong> Esta política está em vigor e é aplicável a todos os usuários da plataforma EventSpace.
        </p>
      </div>

      <section className="mb-8">
        <h2>1. Definições</h2>
        <p>
          Para melhor compreensão desta Política de Privacidade, consideram-se:
        </p>
        <ul>
          <li><strong>Dados Pessoais:</strong> Informação relacionada a pessoa natural identificada ou identificável;</li>
          <li><strong>Titular:</strong> Pessoa natural a quem se referem os dados pessoais;</li>
          <li><strong>Controlador:</strong> O EventSpace, responsável pelas decisões sobre o tratamento de dados;</li>
          <li><strong>Tratamento:</strong> Toda operação realizada com dados pessoais (coleta, armazenamento, uso, etc.);</li>
          <li><strong>LGPD:</strong> Lei Geral de Proteção de Dados (Lei nº 13.709/2018);</li>
          <li><strong>Consentimento:</strong> Manifestação livre, informada e inequívoca do titular.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>2. Responsável pelo Tratamento dos Dados</h2>
        <div className="bg-gray-50 p-4 rounded-lg not-prose">
          <p><strong>Controlador de Dados:</strong> EventSpace</p>
          <p><strong>Email:</strong> privacidade@eventspace.com.br</p>
          <p><strong>Encarregado de Dados (DPO):</strong> A ser definido</p>
        </div>
        <p>
          O EventSpace atua como controlador dos dados pessoais coletados através da plataforma 
          e é responsável por assegurar o cumprimento da legislação de proteção de dados.
        </p>
      </section>

      <section className="mb-8">
        <h2>3. Dados Pessoais Coletados</h2>
        <h3>3.1 Dados Fornecidos Diretamente pelo Usuário</h3>
        <p>
          <strong>Durante o cadastro:</strong>
        </p>
        <ul>
          <li>Nome completo</li>
          <li>Endereço de email</li>
          <li>Número de telefone/WhatsApp</li>
          <li>Localização (cidade e estado)</li>
          <li>Senha (armazenada de forma criptografada)</li>
        </ul>
        
        <p>
          <strong>Durante o uso da plataforma:</strong>
        </p>
        <ul>
          <li>Informações de anúncios (para fornecedores)</li>
          <li>Fotos e descrições de espaços/equipamentos</li>
          <li>Preferências de busca</li>
          <li>Histórico de interações</li>
        </ul>

        <h3>3.2 Dados Coletados Automaticamente</h3>
        <ul>
          <li>Endereço IP</li>
          <li>Informações do dispositivo e navegador</li>
          <li>Data e hora de acesso</li>
          <li>Páginas visitadas</li>
          <li>Origem do acesso (referrer)</li>
          <li>Cookies e tecnologias similares</li>
        </ul>

        <h3>3.3 Dados de Pagamento</h3>
        <p>
          Dados de pagamento são processados exclusivamente pela Stripe (processador PCI-DSS compliant). 
          O EventSpace não armazena informações completas de cartão de crédito.
        </p>
      </section>

      <section className="mb-8">
        <h2>4. Finalidades do Tratamento</h2>
        <h3>4.1 Finalidades Primárias</h3>
        <ul>
          <li><strong>Prestação de serviços:</strong> Operação da plataforma de conexão</li>
          <li><strong>Gerenciamento de conta:</strong> Criação, autenticação e manutenção de contas</li>
          <li><strong>Facilitação de contatos:</strong> Permitir comunicação entre fornecedores e clientes</li>
          <li><strong>Processamento de pagamentos:</strong> Gestão de assinaturas de fornecedores</li>
        </ul>

        <h3>4.2 Finalidades Secundárias</h3>
        <ul>
          <li><strong>Melhoria da plataforma:</strong> Análise de uso e otimizações</li>
          <li><strong>Suporte ao cliente:</strong> Atendimento e resolução de problemas</li>
          <li><strong>Segurança:</strong> Prevenção de fraudes e uso indevido</li>
          <li><strong>Cumprimento legal:</strong> Atendimento a obrigações legais e regulatórias</li>
        </ul>

        <h3>4.3 Marketing (mediante consentimento)</h3>
        <ul>
          <li>Envio de newsletter e atualizações</li>
          <li>Notificações sobre novos recursos</li>
          <li>Promoções e ofertas especiais</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>5. Base Legal para o Tratamento</h2>
        <p>
          O tratamento de dados pessoais é baseado nas seguintes hipóteses legais previstas na LGPD:
        </p>
        <ul>
          <li><strong>Execução de contrato (Art. 7º, V):</strong> Dados necessários para prestação dos serviços</li>
          <li><strong>Legítimo interesse (Art. 7º, IX):</strong> Melhoria da plataforma e prevenção de fraudes</li>
          <li><strong>Consentimento (Art. 7º, I):</strong> Comunicações de marketing e cookies não essenciais</li>
          <li><strong>Cumprimento de obrigação legal (Art. 7º, II):</strong> Quando exigido por lei</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>6. Compartilhamento de Dados</h2>
        <h3>6.1 Compartilhamento Necessário</h3>
        <p>
          <strong>Com outros usuários:</strong> Informações de contato são compartilhadas para 
          facilitar a comunicação (conforme funcionalidade da plataforma).
        </p>
        
        <p>
          <strong>Com prestadores de serviços:</strong>
        </p>
        <ul>
          <li>Stripe (processamento de pagamentos)</li>
          <li>Supabase (hospedagem de dados)</li>
          <li>Provedores de infraestrutura</li>
          <li>Serviços de análise e monitoramento</li>
        </ul>

        <h3>6.2 Compartilhamento Legal</h3>
        <p>
          Podemos compartilhar dados quando:
        </p>
        <ul>
          <li>Exigido por ordem judicial ou autoridade competente</li>
          <li>Necessário para cumprir obrigação legal</li>
          <li>Para proteger direitos, propriedade ou segurança</li>
          <li>Em caso de investigação de atividades suspeitas</li>
        </ul>

        <h3>6.3 Não Vendemos Dados</h3>
        <p>
          O EventSpace não vende, aluga ou comercializa dados pessoais de usuários 
          para terceiros para fins de marketing.
        </p>
      </section>

      <section className="mb-8">
        <h2>7. Armazenamento e Segurança</h2>
        <h3>7.1 Localização dos Dados</h3>
        <p>
          Os dados são armazenados em servidores localizados preferencialmente no Brasil 
          ou em países com nível adequado de proteção conforme reconhecido pela ANPD.
        </p>

        <h3>7.2 Medidas de Segurança</h3>
        <ul>
          <li>Criptografia de dados em trânsito e em repouso</li>
          <li>Controles de acesso baseados em função</li>
          <li>Monitoramento de segurança 24/7</li>
          <li>Backup seguro e redundante</li>
          <li>Auditoria regular de segurança</li>
          <li>Treinamento de equipe em proteção de dados</li>
        </ul>

        <h3>7.3 Retenção de Dados</h3>
        <p>
          Os dados são mantidos pelo tempo necessário para as finalidades estabelecidas ou 
          conforme exigido por lei:
        </p>
        <ul>
          <li><strong>Dados de conta ativa:</strong> Durante a vigência da conta</li>
          <li><strong>Dados de conta encerrada:</strong> Até 5 anos para questões legais</li>
          <li><strong>Dados de pagamento:</strong> Conforme exigências fiscais (5-10 anos)</li>
          <li><strong>Logs de acesso:</strong> Até 6 meses para segurança</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>8. Direitos dos Titulares</h2>
        <p>
          Conforme a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
        </p>
        
        <h3>8.1 Direitos Garantidos</h3>
        <ul>
          <li><strong>Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
          <li><strong>Correção:</strong> Atualizar dados incompletos, inexatos ou desatualizados</li>
          <li><strong>Anonimização/Eliminação:</strong> Solicitar a remoção de dados desnecessários</li>
          <li><strong>Portabilidade:</strong> Receber dados em formato estruturado</li>
          <li><strong>Informação:</strong> Conhecer entidades com quem compartilhamos dados</li>
          <li><strong>Revogação de consentimento:</strong> Retirar consentimento a qualquer momento</li>
          <li><strong>Oposição:</strong> Opor-se ao tratamento em certas situações</li>
        </ul>

        <h3>8.2 Como Exercer seus Direitos</h3>
        <p>
          Para exercer qualquer direito, entre em contato conosco através de:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg not-prose">
          <ul className="space-y-1">
            <li><strong>Email:</strong> privacidade@eventspace.com.br</li>
            <li><strong>Assunto:</strong> "Exercício de Direito LGPD"</li>
            <li><strong>Prazo de resposta:</strong> Até 15 dias úteis</li>
          </ul>
        </div>

        <h3>8.3 Limitações</h3>
        <p>
          Alguns direitos podem ter limitações quando o tratamento for necessário para:
        </p>
        <ul>
          <li>Cumprimento de obrigação legal</li>
          <li>Exercício regular de direitos</li>
          <li>Proteção da vida ou segurança</li>
          <li>Tutela da saúde em procedimento de profissional de saúde</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>9. Cookies e Tecnologias de Rastreamento</h2>
        <h3>9.1 Tipos de Cookies</h3>
        <p>
          <strong>Cookies Essenciais (sempre ativos):</strong>
        </p>
        <ul>
          <li>Autenticação de sessão</li>
          <li>Segurança da plataforma</li>
          <li>Funcionalidades básicas</li>
        </ul>

        <p>
          <strong>Cookies de Performance (com consentimento):</strong>
        </p>
        <ul>
          <li>Google Analytics</li>
          <li>Monitoramento de erros</li>
          <li>Otimização de performance</li>
        </ul>

        <h3>9.2 Gestão de Cookies</h3>
        <p>
          Você pode gerenciar cookies através das configurações do seu navegador ou 
          através do nosso painel de preferências disponível na plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2>10. Menores de Idade</h2>
        <p>
          A plataforma EventSpace é destinada a usuários maiores de 18 anos. 
          Não coletamos intencionalmente dados de menores de idade.
        </p>
        <p>
          Caso tome conhecimento de que coletamos dados de menor de idade, 
          tomaremos medidas para excluir essas informações imediatamente.
        </p>
      </section>

      <section className="mb-8">
        <h2>11. Transferência Internacional</h2>
        <p>
          Alguns de nossos prestadores de serviços podem estar localizados fora do Brasil. 
          Garantimos que essas transferências ocorram apenas para países com nível adequado 
          de proteção ou mediante garantias específicas de proteção.
        </p>
        <p>
          <strong>Prestadores internacionais principais:</strong>
        </p>
        <ul>
          <li>Stripe (EUA) - Certificação adequada</li>
          <li>Supabase (EUA) - Acordo de transferência</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>12. Violação de Dados</h2>
        <p>
          Em caso de incidente de segurança que possa acarretar risco aos direitos 
          e liberdades dos titulares:
        </p>
        <ul>
          <li>Notificaremos a ANPD em até 72 horas</li>
          <li>Comunicaremos os titulares afetados quando aplicável</li>
          <li>Tomaremos medidas imediatas de contenção</li>
          <li>Implementaremos melhorias de segurança</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>13. Alterações na Política</h2>
        <p>
          Esta Política de Privacidade pode ser atualizada periodicamente para refletir 
          mudanças em nossas práticas ou na legislação.
        </p>
        <p>
          <strong>Alterações significativas:</strong>
        </p>
        <ul>
          <li>Notificação por email</li>
          <li>Destaque na plataforma</li>
          <li>Período de 30 dias para manifestação</li>
        </ul>
        <p>
          <strong>Alterações menores:</strong> Atualizações automáticas com notificação na plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2>14. Reclamações e Recursos</h2>
        <h3>14.1 Canal Interno</h3>
        <p>
          Para questões sobre tratamento de dados, contate primeiro nosso DPO através 
          de privacidade@eventspace.com.br.
        </p>

        <h3>14.2 Autoridade Nacional</h3>
        <p>
          Caso não fique satisfeito com nossa resposta, você pode apresentar reclamação 
          à Autoridade Nacional de Proteção de Dados (ANPD):
        </p>
        <div className="bg-gray-50 p-4 rounded-lg not-prose">
          <p><strong>ANPD:</strong> https://www.gov.br/anpd/</p>
          <p><strong>Canal:</strong> Sistema eletrônico de ouvidoria</p>
        </div>
      </section>

      <section className="mb-8">
        <h2>15. Contato</h2>
        <p>
          Para questões sobre esta Política de Privacidade ou exercício de direitos:
        </p>
        <div className="bg-blue-50 p-4 rounded-lg not-prose">
          <ul className="space-y-2">
            <li><strong>Encarregado de Dados (DPO):</strong> A ser definido</li>
            <li><strong>Email:</strong> privacidade@eventspace.com.br</li>
            <li><strong>Endereço:</strong> A ser definido</li>
            <li><strong>Horário:</strong> Segunda a sexta, 9h às 18h</li>
          </ul>
        </div>
      </section>

      <div className="mt-12 p-6 bg-green-50 border border-green-200 rounded-lg not-prose">
        <h3 className="text-green-900 font-semibold mb-2">Compromisso com a Privacidade</h3>
        <p className="text-green-800 text-sm">
          O EventSpace está comprometido com a proteção da sua privacidade e o cumprimento 
          integral da Lei Geral de Proteção de Dados. Tratamos seus dados com transparência, 
          segurança e respeito aos seus direitos.
        </p>
      </div>
    </LegalLayout>
  )
}