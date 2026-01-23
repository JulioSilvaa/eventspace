import { apiClient } from '@/lib/api-client';

export interface PricingModel {
  id: string;
  key: string;
  label: string;
  unit?: string;
  description?: string;
}

export async function getPricingModels() {
  const { data, error } = await apiClient.get<PricingModel[]>('/api/pricing-models');

  if (error) {
    console.error('Error fetching pricing models:', error);
    return [];
  }

  return data || [];
}
