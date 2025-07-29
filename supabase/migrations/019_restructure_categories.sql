-- Reestruturação das categorias para foco em eventos
-- Remove categorias inadequadas e adiciona tipo 'service'

-- 1. Adicionar tipo 'service' ao check constraint
ALTER TABLE public.categories 
DROP CONSTRAINT IF EXISTS categories_type_check;

ALTER TABLE public.categories 
ADD CONSTRAINT categories_type_check 
CHECK (type IN ('equipment', 'space', 'service'));

-- 2. Adicionar campos para hierarquia de categorias
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Remover categorias inadequadas de espaços
DELETE FROM public.categories 
WHERE slug IN ('coworking', 'praia', 'hotel-e-pousada', 'fazenda');

-- 4. Adicionar nova categoria de espaço
INSERT INTO public.categories (name, type, slug, description, is_active) VALUES
('Área de Lazer Completa', 'space', 'area-de-lazer-completa', 'Área com piscina, churrasqueira e espaço completo', true);

-- 5. Criar categorias principais de serviços
INSERT INTO public.categories (name, type, slug, description, is_active) VALUES
-- Categorias principais de serviços
('Buffet / Alimentação', 'service', 'buffet-alimentacao', 'Serviços de alimentação e bebidas', true),
('Decoração e Ambientação', 'service', 'decoracao-ambientacao', 'Serviços de decoração e ambientação', true),
('Entretenimento / Animação', 'service', 'entretenimento-animacao', 'Serviços de entretenimento e animação', true),
('Brinquedos e Estruturas', 'service', 'brinquedos-estruturas', 'Aluguel de brinquedos e estruturas', true),
('Fotografia e Filmagem Profissional', 'service', 'fotografia-filmagem-profissional', 'Serviços profissionais de fotografia e filmagem', true),
('Beleza e Vestuário', 'service', 'beleza-vestuario', 'Serviços de beleza e aluguel de vestuário', true),
('Logística e Estrutura', 'service', 'logistica-estrutura', 'Serviços de apoio e infraestrutura', true);

-- 6. Adicionar subcategorias de Buffet / Alimentação
INSERT INTO public.categories (name, type, slug, description, parent_id, is_active) 
SELECT 
  name, 'service', slug, description, cat.id, true
FROM (VALUES
  ('Buffet Completo', 'buffet-completo', 'Buffet completo para jantar/almoço'),
  ('Coffee Break', 'coffee-break', 'Serviço de coffee break'),
  ('Coquetel / Finger Food', 'coquetel-finger-food', 'Coquetéis e finger foods'),
  ('Churrasco', 'churrasco-servico', 'Serviço de churrasco completo'),
  ('Doces e Bolos Personalizados', 'doces-bolos-personalizados', 'Doces e bolos personalizados'),
  ('Food Trucks / Barracas Temáticas', 'food-trucks-barracas', 'Food trucks e barracas temáticas'),
  ('Bartenders / Drinks', 'bartenders-drinks', 'Bartenders e serviços de drinks')
) AS sub(name, slug, description)
CROSS JOIN public.categories cat
WHERE cat.slug = 'buffet-alimentacao';

-- 7. Adicionar subcategorias de Decoração e Ambientação
INSERT INTO public.categories (name, type, slug, description, parent_id, is_active) 
SELECT 
  name, 'service', slug, description, cat.id, true
FROM (VALUES
  ('Decoração Temática', 'decoracao-tematica', 'Decoração personalizada por tema'),
  ('Balões Personalizados', 'baloes-personalizados', 'Balões e decoração com balões'),
  ('Flores / Arranjos', 'flores-arranjos', 'Arranjos florais e decoração com flores'),
  ('Mobiliário para Locação', 'mobiliario-locacao', 'Aluguel de mobiliário decorativo'),
  ('Iluminação Cênica', 'iluminacao-cenica', 'Iluminação decorativa e cênica')
) AS sub(name, slug, description)
CROSS JOIN public.categories cat
WHERE cat.slug = 'decoracao-ambientacao';

-- 8. Adicionar subcategorias de Entretenimento / Animação
INSERT INTO public.categories (name, type, slug, description, parent_id, is_active) 
SELECT 
  name, 'service', slug, description, cat.id, true
FROM (VALUES
  ('DJ', 'dj', 'Serviços de DJ para eventos'),
  ('Músicos / Bandas', 'musicos-bandas', 'Músicos e bandas ao vivo'),
  ('Recreadores Infantis', 'recreadores-infantis', 'Recreação e animação infantil'),
  ('Palhaços / Personagens Vivos', 'palhacos-personagens', 'Palhaços e personagens para festas'),
  ('Mágicos', 'magicos', 'Shows de mágica e ilusionismo'),
  ('Animadores', 'animadores', 'Animadores para eventos')
) AS sub(name, slug, description)
CROSS JOIN public.categories cat
WHERE cat.slug = 'entretenimento-animacao';

-- 9. Adicionar subcategorias de Brinquedos e Estruturas
INSERT INTO public.categories (name, type, slug, description, parent_id, is_active) 
SELECT 
  name, 'service', slug, description, cat.id, true
FROM (VALUES
  ('Pula-pula', 'pula-pula', 'Pula-pula e camas elásticas'),
  ('Piscina de Bolinhas', 'piscina-bolinhas', 'Piscina de bolinhas para crianças'),
  ('Cama Elástica', 'cama-elastica', 'Cama elástica para eventos'),
  ('Tobogã Inflável', 'toboga-inflavel', 'Tobogãs infláveis'),
  ('Touro Mecânico', 'touro-mecanico', 'Touro mecânico para eventos'),
  ('Carrinhos Elétricos', 'carrinhos-eletricos', 'Carrinhos elétricos para crianças'),
  ('Brinquedos Eletrônicos', 'brinquedos-eletronicos', 'Aluguel de brinquedos eletrônicos')
) AS sub(name, slug, description)
CROSS JOIN public.categories cat
WHERE cat.slug = 'brinquedos-estruturas';

-- 10. Adicionar subcategorias de Fotografia e Filmagem Profissional
INSERT INTO public.categories (name, type, slug, description, parent_id, is_active) 
SELECT 
  name, 'service', slug, description, cat.id, true
FROM (VALUES
  ('Fotógrafo Profissional', 'fotografo-profissional', 'Serviços de fotografia profissional'),
  ('Filmagem com Drone', 'filmagem-drone', 'Filmagem aérea com drone'),
  ('Cabine de Fotos', 'cabine-fotos', 'Cabine de fotos para eventos'),
  ('Totem Fotográfico', 'totem-fotografico', 'Totem de fotos instantâneas')
) AS sub(name, slug, description)
CROSS JOIN public.categories cat
WHERE cat.slug = 'fotografia-filmagem-profissional';

-- 11. Adicionar subcategorias de Beleza e Vestuário
INSERT INTO public.categories (name, type, slug, description, parent_id, is_active) 
SELECT 
  name, 'service', slug, description, cat.id, true
FROM (VALUES
  ('Cabelo e Maquiagem', 'cabelo-maquiagem', 'Serviços de cabelo e maquiagem'),
  ('Aluguel de Roupas', 'aluguel-roupas', 'Aluguel de trajes sociais e infantis'),
  ('Estética para Noivas/Debutantes', 'estetica-noivas-debutantes', 'Serviços estéticos especializados')
) AS sub(name, slug, description)
CROSS JOIN public.categories cat
WHERE cat.slug = 'beleza-vestuario';

-- 12. Adicionar subcategorias de Logística e Estrutura
INSERT INTO public.categories (name, type, slug, description, parent_id, is_active) 
SELECT 
  name, 'service', slug, description, cat.id, true
FROM (VALUES
  ('Gerador de Energia', 'gerador-energia', 'Aluguel de geradores de energia'),
  ('Banheiros Químicos', 'banheiros-quimicos', 'Aluguel de banheiros químicos'),
  ('Seguranças', 'segurancas', 'Serviços de segurança para eventos'),
  ('Valet / Estacionamento', 'valet-estacionamento', 'Serviços de valet e estacionamento'),
  ('Limpeza / Pós-evento', 'limpeza-pos-evento', 'Serviços de limpeza pós-evento')
) AS sub(name, slug, description)
CROSS JOIN public.categories cat
WHERE cat.slug = 'logistica-estrutura';

-- 13. Atualizar equipamentos existentes (renomear alguns)
UPDATE public.categories 
SET name = 'Mobiliário para Eventos', 
    slug = 'mobiliario-para-eventos',
    description = 'Mesas, cadeiras e mobiliário para eventos'
WHERE slug = 'mesa-e-cadeira';

UPDATE public.categories 
SET name = 'Equipamentos de Cozinha/Buffet', 
    slug = 'equipamentos-cozinha-buffet',
    description = 'Equipamentos para preparar e servir comida e bebidas'
WHERE slug = 'buffet-e-catering';

-- 14. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- 15. Comentários para documentação
COMMENT ON COLUMN public.categories.parent_id IS 'ID da categoria pai para criar hierarquia';
COMMENT ON COLUMN public.categories.is_active IS 'Indica se a categoria está ativa e disponível para uso';