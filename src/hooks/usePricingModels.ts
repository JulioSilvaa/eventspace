import { useQuery } from '@tanstack/react-query';
import { getPricingModels } from '@/services/pricing';

export function usePricingModels() {
  return useQuery({
    queryKey: ['pricing-models'],
    queryFn: getPricingModels,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 2,
    retry: 1,
    refetchOnWindowFocus: false
  });
}
