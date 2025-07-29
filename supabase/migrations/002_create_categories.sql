-- Create categories table for equipment and spaces
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('equipment', 'space')),
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories (read-only for all users)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
    FOR SELECT USING (true);

-- Insert initial categories for equipments
INSERT INTO public.categories (name, type, slug, description) VALUES
-- Equipment categories
('Som e Áudio', 'equipment', 'som-e-audio', 'Equipamentos de som, microfones, caixas acústicas'),
('Iluminação', 'equipment', 'iluminacao', 'Equipamentos de iluminação, spots, lasers, strobo'),
('Decoração', 'equipment', 'decoracao', 'Itens decorativos, flores, arranjos, painéis'),
('Mesa e Cadeira', 'equipment', 'mesa-e-cadeira', 'Mesas, cadeiras, mobiliário para eventos'),
('Buffet e Catering', 'equipment', 'buffet-e-catering', 'Equipamentos para servir comida e bebidas'),
('Fotografia e Filmagem', 'equipment', 'fotografia-e-filmagem', 'Equipamentos para registro do evento'),
('Entretenimento', 'equipment', 'entretenimento', 'Brinquedos, jogos, atividades para convidados'),
('Tendas e Coberturas', 'equipment', 'tendas-e-coberturas', 'Tendas, gazebos, coberturas para eventos'),
('Limpeza', 'equipment', 'limpeza', 'Equipamentos de limpeza e manutenção'),
('Segurança', 'equipment', 'seguranca', 'Equipamentos de segurança e monitoramento'),

-- Space categories  
('Salão de Festas', 'space', 'salao-de-festas', 'Salões cobertos para eventos e festas'),
('Espaço ao Ar Livre', 'space', 'espaco-ao-ar-livre', 'Jardins, quintais, áreas abertas'),
('Casa de Eventos', 'space', 'casa-de-eventos', 'Casas especializadas em eventos'),
('Chácara', 'space', 'chacara', 'Chácaras e sítios para eventos'),
('Clube', 'space', 'clube', 'Clubes sociais e esportivos'),
('Hotel e Pousada', 'space', 'hotel-e-pousada', 'Hotéis e pousadas com espaços para eventos'),
('Restaurante', 'space', 'restaurante', 'Restaurantes com espaços para eventos'),
('Praia', 'space', 'praia', 'Espaços na praia para eventos'),
('Fazenda', 'space', 'fazenda', 'Fazendas e propriedades rurais'),
('Coworking', 'space', 'coworking', 'Espaços de coworking para eventos corporativos');

-- Create index for better performance
CREATE INDEX idx_categories_type ON public.categories(type);
CREATE INDEX idx_categories_slug ON public.categories(slug);