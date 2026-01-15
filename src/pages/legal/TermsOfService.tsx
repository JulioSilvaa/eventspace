import LegalLayout from '@/components/layout/LegalLayout'

export default function TermsOfService() {
  const breadcrumbs = [
    { label: 'Termos de Uso' }
  ]

  return (
    <LegalLayout
      title="Termos de Uso"
      subtitle="Estes termos estabelecem as regras e condições para o uso da plataforma EventSpace."
      breadcrumbs={breadcrumbs}
    >
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg not-prose">
        <p className="text-blue-800 text-sm">
          <strong>Última atualização:</strong> 26 de julho de 2025
        </p>
      </div>

      <section className="mb-8">
        <h2>1. Definições</h2>
        <p>
          Para os fins destes Termos de Uso, consideram-se:
        </p>
        <ul>
          <li><strong>EventSpace:</strong> A plataforma digital que conecta fornecedores de espaços e equipamentos para eventos com potenciais clientes;</li>
          <li><strong>Usuário:</strong> Qualquer pessoa que acesse ou utilize a plataforma EventSpace;</li>
          <li><strong>Fornecedor:</strong> Usuário que oferece espaços ou equipamentos para locação através da plataforma;</li>
          <li><strong>Cliente:</strong> Usuário que busca espaços ou equipamentos para eventos;</li>
          <li><strong>Anúncio:</strong> Conteúdo publicado por Fornecedores contendo informações sobre espaços ou equipamentos disponíveis;</li>
          <li><strong>Serviços:</strong> Todas as funcionalidades disponibilizadas pela plataforma EventSpace.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>2. Aceitação dos Termos</h2>
        <p>
          Ao criar uma conta, acessar ou utilizar qualquer funcionalidade da plataforma EventSpace,
          você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso
          e com nossa Política de Privacidade.
        </p>
        <p>
          Se você não concorda com algum termo aqui estabelecido, deve interromper imediatamente
          o uso da plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2>3. Descrição dos Serviços</h2>
        <h3>3.1 Natureza da Plataforma</h3>
        <p>
          O EventSpace é uma plataforma de intermediação digital que facilita a conexão direta
          entre Fornecedores e Clientes interessados em locação de espaços e equipamentos para eventos.
        </p>

        <h3>3.2 Modelo de Negócio</h3>
        <p>
          O EventSpace é uma plataforma 100% gratuita para todos os seus usuários.
          Não cobramos assinaturas, taxas de intermediação ou comissões sobre transações.
        </p>

        <h3>3.3 Limitações</h3>
        <p>
          O EventSpace não:
        </p>
        <ul>
          <li>Processa pagamentos entre Fornecedores e Clientes;</li>
          <li>Garante a qualidade dos serviços oferecidos;</li>
          <li>Atua como intermediário em disputas contratuais;</li>
          <li>Assume responsabilidade por danos ou prejuízos decorrentes de transações.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>4. Cadastro e Conta de Usuário</h2>
        <h3>4.1 Requisitos</h3>
        <p>
          Para utilizar a plataforma como Fornecedor, você deve:
        </p>
        <ul>
          <li>Ser maior de 18 anos ou ter autorização legal para contratar;</li>
          <li>Fornecer informações verdadeiras, precisas e atualizadas;</li>
          <li>Manter a confidencialidade de suas credenciais de acesso;</li>
          <li>Ter uma conta ativa e verificada para publicar anúncios;</li>
        </ul>

        <h3>4.2 Responsabilidades</h3>
        <p>
          Você é responsável por todas as atividades realizadas em sua conta e deve
          notificar imediatamente o EventSpace sobre qualquer uso não autorizado.
        </p>
        <p className="mt-2">
          Para sua segurança e integridade da plataforma, ações críticas (como login, alterações de dados e criações de anúncios)
          são registradas em nossos logs de auditoria.
        </p>
      </section>

      <section className="mb-8">
        <h2>5. Regras para Fornecedores</h2>
        <h3>5.1 Conteúdo dos Anúncios</h3>
        <p>
          Ao publicar anúncios, o Fornecedor deve:
        </p>
        <ul>
          <li>Fornecer descrições precisas e completas;</li>
          <li>Utilizar fotos reais e atualizadas;</li>
          <li>Informar preços de forma clara e honesta;</li>
          <li>Manter as informações sempre atualizadas;</li>
          <li>Respeitar os direitos autorais e de imagem.</li>
        </ul>

        <h3>5.2 Conduta</h3>
        <p>
          É vedado ao Fornecedor:
        </p>
        <ul>
          <li>Publicar conteúdo falso, enganoso ou fraudulento;</li>
          <li>Utilizar a plataforma para atividades ilegais;</li>
          <li>Discriminar clientes por qualquer motivo;</li>
          <li>Solicitar pagamentos através da plataforma;</li>
          <li>Divulgar dados de contato de forma inadequada.</li>
        </ul>

        <h3>5.3 Publicação de Anúncios</h3>
        <p>
          A publicação de anúncios é gratuita. O EventSpace reserva-se o direito de
          estabelecer limites para o número de anúncios ativos por usuário, conforme
          sua política de uso.
        </p>
      </section>

      <section className="mb-8">
        <h2>6. Regras para Clientes</h2>
        <h3>6.1 Uso Adequado</h3>
        <p>
          Clientes devem utilizar a plataforma de forma respeitosa e honesta,
          contatando Fornecedores apenas quando há interesse genuíno em locação.
        </p>

        <h3>6.2 Condutas Proibidas</h3>
        <p>
          É vedado ao Cliente:
        </p>
        <ul>
          <li>Utilizar informações para fins diferentes da locação;</li>
          <li>Fazer contato abusivo ou inadequado com Fornecedores;</li>
          <li>Copiar ou reproduzir conteúdo da plataforma sem autorização;</li>
          <li>Utilizar robôs ou scripts para extração massiva de dados.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>7. Propriedade Intelectual</h2>
        <p>
          Todos os direitos sobre a plataforma EventSpace, incluindo design, código,
          marca e funcionalidades, pertencem exclusivamente ao EventSpace.
        </p>
        <p>
          O conteúdo publicado pelos usuários (textos, fotos, descrições) permanece
          de propriedade dos respectivos autores, que concedem ao EventSpace licença
          para exibição na plataforma.
        </p>
      </section>

      <section className="mb-8">
        <h2>8. Privacidade e Proteção de Dados</h2>
        <p>
          O tratamento de dados pessoais segue nossa Política de Privacidade,
          elaborada em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <p>
          Recomendamos a leitura integral da Política de Privacidade para
          compreender como coletamos, utilizamos e protegemos suas informações.
        </p>
      </section>

      <section className="mb-8">
        <h2>9. Limitação de Responsabilidade</h2>
        <h3>9.1 Isenção de Responsabilidade</h3>
        <p>
          O EventSpace não se responsabiliza por:
        </p>
        <ul>
          <li>Qualidade, segurança ou legalidade dos serviços oferecidos por Fornecedores;</li>
          <li>Cumprimento de acordos feitos entre Usuários;</li>
          <li>Danos materiais ou morais decorrentes de transações;</li>
          <li>Falhas temporárias no sistema ou indisponibilidade dos serviços;</li>
          <li>Ações de terceiros ou força maior.</li>
        </ul>

        <h3>9.2 Recomendações</h3>
        <p>
          Recomendamos que os usuários:
        </p>
        <ul>
          <li>Verifiquem pessoalmente espaços e equipamentos antes da contratação;</li>
          <li>Formalizem acordos por escrito quando necessário;</li>
          <li>Mantenham documentação de todas as transações;</li>
          <li>Reportem imediatamente qualquer problema ou irregularidade.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2>10. Suspensão e Encerramento</h2>
        <h3>10.1 Suspensão de Conta</h3>
        <p>
          O EventSpace reserva-se o direito de suspender ou encerrar contas que:
        </p>
        <ul>
          <li>Violem estes Termos de Uso;</li>
          <li>Apresentem atividades suspeitas ou fraudulentas;</li>
          <li>Causem danos à plataforma ou outros usuários;</li>
          <li>Permaneçam inativas por período prolongado.</li>
        </ul>

        <h3>10.2 Encerramento Voluntário</h3>
        <p>
          Usuários podem encerrar suas contas a qualquer momento através das
          configurações da conta ou entrando em contato conosco.
        </p>
      </section>

      <section className="mb-8">
        <h2>11. Gratuidade e Taxas</h2>
        <p>
          O uso das funcionalidades atuais da plataforma é gratuito.
          O EventSpace poderá, no futuro, introduzir funcionalidades premium pagas,
          mediante prévia alteração destes Termos e notificação aos usuários.
        </p>
      </section>

      <section className="mb-8">
        <h2>12. Resolução de Conflitos</h2>
        <h3>12.1 Mediação</h3>
        <p>
          Conflitos entre usuários devem ser resolvidos diretamente entre as partes.
          O EventSpace pode, a seu critério, oferecer mediação informal.
        </p>

        <h3>12.2 Jurisdição</h3>
        <p>
          Disputas que não puderem ser resolvidas amigavelmente serão submetidas
          ao foro da comarca de São Paulo, SP, com exclusão de qualquer outro.
        </p>
      </section>

      <section className="mb-8">
        <h2>13. Modificações dos Termos</h2>
        <p>
          O EventSpace reserva-se o direito de modificar estes Termos de Uso a qualquer
          momento. Usuários serão notificados sobre alterações significativas através
          da plataforma ou por email.
        </p>
        <p>
          O uso continuado da plataforma após modificações constitui aceitação dos
          novos termos.
        </p>
      </section>

      <section className="mb-8">
        <h2>14. Disposições Gerais</h2>
        <h3>14.1 Integralidade</h3>
        <p>
          Estes Termos, juntamente com a Política de Privacidade, constituem o acordo
          integral entre você e o EventSpace.
        </p>

        <h3>14.2 Nulidade Parcial</h3>
        <p>
          Se qualquer disposição destes Termos for considerada inválida, as demais
          permanecerão em pleno vigor.
        </p>

        <h3>14.3 Lei Aplicável</h3>
        <p>
          Estes Termos são regidos pelas leis brasileiras, especialmente pelo
          Marco Civil da Internet e Código de Defesa do Consumidor.
        </p>
      </section>

      <section className="mb-8">
        <h2>15. Contato</h2>
        <p>
          Para esclarecimentos sobre estes Termos de Uso, entre em contato conosco:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg not-prose">
          <ul className="space-y-2 text-sm">
            <li><strong>Email:</strong> contato@eventspace.com.br</li>
            <li><strong>Endereço:</strong> A ser definido</li>
            <li><strong>Horário de atendimento:</strong> Segunda a sexta, 9h às 18h</li>
          </ul>
        </div>
      </section>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg not-prose">
        <p className="text-blue-800 text-sm">
          <strong>Importante:</strong> Este documento estabelece um acordo legal entre você
          e o EventSpace. Recomendamos que leia atentamente e consulte um advogado se
          tiver dúvidas sobre qualquer disposição.
        </p>
      </div>
    </LegalLayout>
  )
}