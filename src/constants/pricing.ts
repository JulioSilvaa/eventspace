export const PRICING_TYPES = {
  daily: {
    label: 'Por Dia (Diária)',
    unit: 'dia',
    description: 'Valor cobrado por período de 24 horas. Ideal para chácaras e sítios.'
  },
  weekend: {
    label: 'Por Final de Semana',
    unit: 'fim de semana',
    description: 'Pacote fechado de Sexta a Domingo. Muito comum para eventos.'
  },
  hourly: {
    label: 'Por Hora',
    unit: 'hora',
    description: 'Valor cobrado por hora de uso. Ideal para quadras, estúdios ou serviços rápidos.'
  },
  person: {
    label: 'Por Pessoa',
    unit: 'pessoa',
    description: 'Valor por convidado. Padrão para Buffet e Churrasco.'
  },
  unit: {
    label: 'Por Unidade',
    unit: 'unidade',
    description: 'Valor unitário. Ideal para aluguel de mesas, cadeiras isoladas.'
  },
  set: {
    label: 'Por Jogo/Conjunto',
    unit: 'jogo',
    description: 'Valor por conjunto (Ex: 1 Mesa + 4 Cadeiras).'
  },
  event: {
    label: 'Por Evento (Pacote Fixo)',
    unit: 'evento',
    description: 'Preço único pelo serviço completo no evento (ex: DJ por 4 horas, Show).'
  },
  overnight: {
    label: 'Pernoite',
    unit: 'noite',
    description: 'Para hospedagem ou estadia curta.'
  },
  budget: {
    label: 'A Combinar / Consultar',
    unit: '',
    description: 'Não exibe preço fixo no anúncio. Aparecerá como "A Combinar".'
  }
} as const;

export type PricingType = keyof typeof PRICING_TYPES;

export const CATEGORY_PRICING_CONFIG: Record<string, PricingType[]> = {
  // Espaços
  space: ['daily', 'weekend', 'hourly', 'overnight'],

  // Equipamentos
  equipment: ['unit', 'set', 'hourly', 'daily'],

  // Serviços
  service: ['person', 'hourly', 'event', 'budget'],
};

// Fallback configuration if type is unknown
export const DEFAULT_PRICING_OPTIONS: PricingType[] = ['daily', 'hourly', 'event', 'budget'];
