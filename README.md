# EventSpace - Plataforma Nacional de Aluguel de Equipamentos e Espaços

Uma plataforma moderna construída com Vite + React + TypeScript + Supabase para conectar organizadores de eventos com fornecedores de equipamentos e espaços em todo o Brasil.

## 🚀 Características Principais

- **Negociação Direta**: 0% de comissão sobre aluguéis
- **Sistema de Trial**: 7 dias gratuitos para testar a plataforma
- **Planos Inteligentes**: Básico (R$ 49,90) e Premium (R$ 79,90)
- **Upgrade Contextual**: Modais estratégicos para conversão
- **Cobertura Nacional**: Busca por estado e cidade
- **Transparência Total**: Modelo de negócio claro
- **Interface Moderna**: Design responsivo e intuitivo
- **Autenticação Segura**: Sistema completo de login/cadastro

## 📋 Stack Tecnológica

- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Roteamento**: React Router v6
- **Estado**: Zustand
- **Backend**: Supabase (Database + Auth + Storage)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 🏗 Estrutura do Projeto

```
src/
├── components/         # Componentes reutilizáveis
│   ├── layout/        # Header, Footer, etc.
│   ├── ui/            # Componentes base
│   └── forms/         # Formulários
├── pages/             # Páginas da aplicação
│   ├── auth/          # Login, Cadastro
│   ├── dashboard/     # Painel do usuário
│   ├── public/        # Páginas públicas
│   └── admin/         # Painel administrativo
├── lib/               # Configurações e utilitários
├── hooks/             # Custom hooks
├── stores/            # Zustand stores
├── types/             # TypeScript types
└── App.tsx           # Componente principal com rotas
```

## 🎯 Rotas Principais

### Públicas
- `/` - Homepage
- `/equipamentos` - Listagem de equipamentos
- `/espacos` - Listagem de espaços
- `/equipamentos/:id` - Detalhes do equipamento
- `/espacos/:id` - Detalhes do espaço

### Autenticação
- `/login` - Login
- `/cadastro` - Cadastro
- `/recuperar-senha` - Recuperação de senha

### Dashboard
- `/dashboard` - Painel principal
- `/meus-anuncios` - Gerenciar anúncios
- `/criar-anuncio` - Criar novo anúncio
- `/planos` - Planos de assinatura

### Admin
- `/admin` - Painel administrativo

## 🛠 Como Executar

1. **Instalar dependências**:
```bash
npm install
```

2. **Configurar variáveis de ambiente**:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Supabase.

3. **Executar em desenvolvimento**:
```bash
npm run dev
```

4. **Build para produção**:
```bash
npm run build
```

## 🎨 Design System

### Cores Principais
- **Primary**: Azul (#3b82f6) - Botões e elementos principais
- **Success**: Verde (#22c55e) - Indicadores de sucesso
- **Warning**: Laranja (#f59e0b) - Alertas e destaques

### Componentes Base
- Botões com estados hover/focus
- Formulários com validação
- Cards responsivos
- Grid layout flexível

## 🔐 Autenticação

Sistema completo implementado com Supabase Auth:
- Cadastro com email/senha
- Login seguro
- Recuperação de senha
- Perfis de usuário com localização
- Sessões persistentes

## 📱 Deploy

Otimizado para deploy em:
- **Vercel** (recomendado)
- **Netlify**
- **GitHub Pages**

Configure redirects para SPA no provedor escolhido.

## ✅ Funcionalidades Implementadas

### Sistema Completo de Trial e Planos
- **Trial de 7 dias**: Cadastro automático com 1 anúncio gratuito
- **Upgrade Inteligente**: Modais contextuais nos pontos estratégicos
- **Planos Restructurados**: 
  - Trial: 7 dias grátis (1 anúncio)
  - Básico: R$ 49,90/mês (3 anúncios)
  - Premium: R$ 79,90/mês (5 anúncios + destaque)

### Dashboard Avançado
- **Indicadores de Trial**: Progresso visual com dias e anúncios restantes
- **Métricas em Tempo Real**: Contadores de anúncios e limites por plano
- **Ações Rápidas**: Acesso direto às funcionalidades principais

### Sistema de Conversão
- **Checkout Contextual**: Direcionamento estratégico para upgrade
- **4 Contextos de Modal**: create_ad, feature_ad, trial_ending, generic
- **Página de Pricing**: Comparação clara dos planos com benefícios

## 📈 Próximos Passos

1. ~~**Sistema de Trial**: Implementado ✅~~
2. ~~**Upgrade Contextual**: Implementado ✅~~
3. **Sistema de Upload**: Imagens para anúncios
4. **Pagamentos**: Integração com Stripe/PIX
5. **Admin Panel**: Gestão da plataforma

## 🤝 Contribuição

Este projeto segue o plano detalhado em `claude_code_tasks.md`. Cada etapa está documentada e pronta para implementação.

---

**EventSpace** - Conectamos, vocês negociam! 🎉