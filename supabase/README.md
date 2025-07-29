# EventSpace Database Setup

Este diretório contém todas as migrações SQL necessárias para configurar o banco de dados do EventSpace no Supabase.

## 🏗 Estrutura do Banco

### Tabelas Principais
- **profiles** - Perfis de usuários com localização nacional
- **categories** - Categorias de equipamentos e espaços
- **ads** - Anúncios com campos de localização obrigatórios
- **ad_images** - Imagens dos anúncios
- **payments** - Pagamentos e assinaturas
- **brazilian_states** - Estados brasileiros para filtros

## 🚀 Como Executar

### Opção 1: Arquivo por arquivo (Recomendado)
Execute cada migração em ordem no SQL Editor do Supabase:

1. `001_create_profiles.sql`
2. `002_create_categories.sql`
3. `003_create_ads.sql`
4. `004_create_ad_images.sql`
5. `005_create_payments.sql`
6. `006_create_brazilian_states.sql`
7. `007_create_performance_indexes.sql`

### Opção 2: Script completo
Execute o arquivo `setup.sql` que inclui todas as migrações.

## 📊 Features Implementadas

### ✅ Localização Nacional
- Estados e cidades obrigatórios em anúncios
- Filtros por localização otimizados
- Suporte a raio de entrega

### ✅ Categorias Completas
- 10 categorias de equipamentos
- 10 categorias de espaços
- Sistema de slugs para URLs amigáveis

### ✅ Performance Otimizada
- Índices para buscas por localização
- Busca full-text em português
- Índices compostos para queries complexas

### ✅ Segurança (RLS)
- Row Level Security habilitado
- Políticas de acesso por usuário
- Conteúdo público apenas para anúncios ativos

### ✅ Campos Específicos
- Especificações em JSONB
- Sistema de entregas
- Contatos diretos (WhatsApp/telefone)
- Métricas de visualização

## 🔧 Funções Especiais

- `increment_ad_views()` - Incrementa visualizações
- `update_updated_at_column()` - Atualiza timestamps automaticamente

## 📈 Próximos Passos

Após executar as migrações:
1. Testar autenticação no frontend
2. Implementar upload de imagens
3. Configurar storage buckets
4. Testar queries de busca

---

**Project ID**: zdvsafxltfdzjspmsdla