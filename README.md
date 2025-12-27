# EventSpace - Plataforma Nacional de Aluguel de Espaços

Uma plataforma moderna construída com Vite + React + TypeScript, integrada a uma API Marketplace personalizada para conectar organizadores de eventos com proprietários de espaços em todo o Brasil.

## 🚀 Características Principais

- **Negociação Direta**: 0% de comissão sobre aluguéis
- **Sistema de Trial**: Período gratuito para testar a plataforma
- **Assinaturas via Stripe**: Fluxo completo de pagamento e ativação de planos
- **Gestão de Avaliações**: Sistema bidirecional de avaliações e respostas dos proprietários
- **Métricas em Tempo Real**: Dashboard dinâmico com visualizações e contatos
- **Cobertura Nacional**: Busca por estado e cidade com máscaras automáticas
- **Interface Moderna**: Design responsivo e intuitivo com Vanilla CSS

## 📋 Stack Tecnológica

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Vanilla CSS (Premium Design System)
- **Roteamento**: React Router v6
- **Estado**: Zustand
- **Backend**: Marketplace API (Express + Prisma + PostgreSQL)
- **Pagamentos**: Stripe Integration
- **Forms**: React Hook Form + Zod + Input Masks
- **Icons**: Lucide React

## 🏗 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── dashboard/     # Cards de métricas, atividade recente
│   ├── layout/        # Header, Footer, etc.
│   ├── reviews/       # Sistema de avaliação e respostas
│   └── ui/            # Componentes base e modais
├── pages/             # Páginas da aplicação
│   ├── auth/          # Login, Cadastro
│   ├── dashboard/     # Painel de controle, Configurações, Avaliações
│   └── public/        # Home, Busca, Detalhes do Anúncio
├── lib/               # Configurações de API e utilitários
├── hooks/             # Hooks de autenticação e métricas
├── stores/            # Zustand stores (Auth, Ads)
├── types/             # Definições de tipos TypeScript
└── utils/             # Máscaras de input (CPF, CEP, Telefone)
```

## 🎯 Rotas Principais

### Públicas
- `/` - Homepage
- `/espacos` - Busca e filtragem de espaços
- `/espacos/:id` - Detalhes do espaço com avaliações públicas

### Autenticação
- `/login` - Login seguro com HttpOnly cookies
- `/cadastro` - Cadastro de novos proprietários
- `/recuperar-senha` - Fluxo de reset de senha

### Dashboard
- `/dashboard` - Painel principal com métricas reais e atividade recente
- `/dashboard/meus-anuncios` - Gerenciar anúncios existentes
- `/dashboard/criar-anuncio` - Assistente de criação de anúncios (Multi-step)
- `/dashboard/avaliacoes` - Gestão centralizada de comentários e respostas
- `/dashboard/configuracoes` - Gestão de perfil e redes sociais

## 🛠 Como Executar

1. **Instalar dependências**:
```bash
npm install
```

2. **Configurar variáveis de ambiente**:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com a URL da Marketplace API (padrão: `http://localhost:5000`).

3. **Executar em desenvolvimento**:
```bash
npm run dev
```

## ✅ Funcionalidades Recentes

### Dashboard de Métricas Real-time
- Integração total com o backend para contagem de visualizações, contatos e favoritos.
- Feed de "Atividade Recente" que mostra interações em tempo real.

### Sistema de Avaliações (Fim a Fim)
- Usuários públicos podem avaliar anúncios.
- Proprietários recebem notificações no dashboard.
- Tela dedicada para responder e editar respostas às avaliações.

### Gestão de Perfil Social
- Adição de campos para WhatsApp, Instagram e Facebook no perfil do usuário.
- Exibição dinâmica de ícones sociais nas páginas de detalhes dos anúncios.

### Experiência de Usuário (UX)
- Máscaras automáticas para campos sensíveis (Telefone, CEP).
- Validações de formulário em tempo real com feedback visual.

### Sistema de Busca Aprimorado
- Busca robusta por nome, descrição e bairro.
- Filtros avançados com adição de busca por **Bairro**.
- Suporte a busca **insensível a acentos** (diacríticos) e case-insensitive, facilitando a localização de espaços.

---

**EventSpace** - Conectamos, vocês negociam! 🎉