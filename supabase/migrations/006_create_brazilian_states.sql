-- Create Brazilian states table for national coverage
CREATE TABLE IF NOT EXISTS public.brazilian_states (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  region VARCHAR(20) NOT NULL
);

-- Add RLS (read-only for everyone)
ALTER TABLE public.brazilian_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brazilian states are viewable by everyone" ON public.brazilian_states
    FOR SELECT USING (true);

-- Insert all 27 Brazilian states
INSERT INTO public.brazilian_states (code, name, region) VALUES
-- North region
('AC', 'Acre', 'Norte'),
('AP', 'Amapá', 'Norte'),
('AM', 'Amazonas', 'Norte'),
('PA', 'Pará', 'Norte'),
('RO', 'Rondônia', 'Norte'),
('RR', 'Roraima', 'Norte'),
('TO', 'Tocantins', 'Norte'),

-- Northeast region
('AL', 'Alagoas', 'Nordeste'),
('BA', 'Bahia', 'Nordeste'),
('CE', 'Ceará', 'Nordeste'),
('MA', 'Maranhão', 'Nordeste'),
('PB', 'Paraíba', 'Nordeste'),
('PE', 'Pernambuco', 'Nordeste'),
('PI', 'Piauí', 'Nordeste'),
('RN', 'Rio Grande do Norte', 'Nordeste'),
('SE', 'Sergipe', 'Nordeste'),

-- Central-West region
('GO', 'Goiás', 'Centro-Oeste'),
('MT', 'Mato Grosso', 'Centro-Oeste'),
('MS', 'Mato Grosso do Sul', 'Centro-Oeste'),
('DF', 'Distrito Federal', 'Centro-Oeste'),

-- Southeast region
('ES', 'Espírito Santo', 'Sudeste'),
('MG', 'Minas Gerais', 'Sudeste'),
('RJ', 'Rio de Janeiro', 'Sudeste'),
('SP', 'São Paulo', 'Sudeste'),

-- South region
('PR', 'Paraná', 'Sul'),
('RS', 'Rio Grande do Sul', 'Sul'),
('SC', 'Santa Catarina', 'Sul');

-- Create indexes
CREATE INDEX idx_brazilian_states_region ON public.brazilian_states(region);