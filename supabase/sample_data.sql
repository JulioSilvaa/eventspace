-- Sample data for EventSpace platform
-- Execute after main migrations to populate with example data

-- Insert sample ads (will need real user IDs after users are created)
-- This is just for reference - actual data should be inserted via the application

-- Sample Equipment Ads
/*
INSERT INTO public.ads (
  user_id, category_id, title, description, price, price_type,
  state, city, neighborhood, delivery_available, delivery_fee, 
  contact_whatsapp, contact_phone, status
) VALUES
-- Som e Áudio
('user-uuid-here', 1, 'Sistema de Som Completo JBL', 'Sistema de som profissional com 2 caixas JBL, mesa de som e microfones sem fio. Ideal para festas até 200 pessoas.', 300.00, 'daily', 'SP', 'São Paulo', 'Vila Madalena', true, 50.00, '11999999999', '1133334444', 'active'),

-- Iluminação  
('user-uuid-here', 2, 'Kit Iluminação LED Profissional', 'Kit completo com 8 refletores LED coloridos, strobo e máquina de fumaça. Perfeito para festas e eventos.', 250.00, 'daily', 'RJ', 'Rio de Janeiro', 'Copacabana', true, 40.00, '21888888888', '2122223333', 'active'),

-- Mesa e Cadeira
('user-uuid-here', 4, 'Conjunto Mesa Redonda + 8 Cadeiras', 'Mesa redonda de madeira para 8 pessoas com cadeiras estofadas. Ideal para jantares e cerimônias.', 150.00, 'daily', 'MG', 'Belo Horizonte', 'Savassi', false, null, '31777777777', '3111112222', 'active');
*/

-- Sample Space Ads  
/*
INSERT INTO public.ads (
  user_id, category_id, title, description, price, price_type,
  state, city, neighborhood, specifications, 
  contact_whatsapp, contact_phone, status
) VALUES
-- Salão de Festas
('user-uuid-here', 11, 'Salão de Festas Elegante - 150 pessoas', 'Salão climatizado com pista de dança, copa, banheiros e estacionamento. Capacidade para 150 pessoas. Inclui mesas e cadeiras.', 800.00, 'daily', 'SP', 'São Paulo', 'Moema', '{"capacity": 150, "air_conditioning": true, "parking": true, "kitchen": true}', '11666666666', '1155556666', 'active'),

-- Chácara
('user-uuid-here', 14, 'Chácara com Piscina - Interior SP', 'Chácara completa com casa, piscina, churrasqueira e área verde. Perfeita para confraternizações e eventos familiares.', 600.00, 'daily', 'SP', 'Cotia', 'Centro', '{"pool": true, "barbecue": true, "green_area": true, "house": true}', '11555555555', '1144445555', 'active'),

-- Espaço ao Ar Livre
('user-uuid-here', 12, 'Jardim para Eventos - Vista Mar', 'Lindo jardim com vista para o mar, ideal para casamentos e eventos sofisticados. Capacidade até 200 pessoas.', 1200.00, 'daily', 'RJ', 'Rio de Janeiro', 'Barra da Tijuca', '{"sea_view": true, "garden": true, "capacity": 200, "wedding_ready": true}', '21444444444', '2133334444', 'active');
*/

-- Note: Replace 'user-uuid-here' with actual user UUIDs after user registration
-- This data should be inserted through the application interface for proper user association

SELECT 'Sample data template created. Insert actual data via application interface.' as status;