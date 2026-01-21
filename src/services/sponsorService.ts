import { apiClient } from '@/lib/api-client'

export interface CreateSponsorParams {
  name: string
  linkIcon: string // 'whatsapp' | 'instagram' | 'site'
  linkUrl: string
  bannerDesktopUrl: string
  bannerMobileUrl: string
  tier: 'BRONZE' | 'SILVER' | 'GOLD'
  userId: string
}

export interface Sponsor {
  id: string
  name: string
  banner_desktop_url: string
  banner_mobile_url: string
  link_url: string
  tier: string
  status: string
}

class SponsorService {
  async uploadBanner(file: File): Promise<string> {
    // The apiClient.uploadFiles handles FormData creation internally
    const { data, error } = await apiClient.uploadFiles<{ images: { medium: string, large: string, thumbnail: string }[] }>(
      '/api/upload/images',
      [file],
      { spaceId: 'sponsor_upload' }
    )

    if (error) {
      throw new Error(error.message || 'Erro ao fazer upload do banner')
    }

    if (!data?.images?.[0]) {
      throw new Error('Falha no upload: Nenhuma imagem retornada')
    }

    // Return the largest/best version
    return data.images[0].large || data.images[0].medium || data.images[0].thumbnail
  }

  async createSponsor(params: CreateSponsorParams): Promise<{ id: string, checkoutUrl?: string, sessionId?: string }> {
    const payload = {
      name: params.name,
      link_url: params.linkUrl,
      tier: params.tier,
      user_id: params.userId,
      banner_desktop_url: params.bannerDesktopUrl,
      banner_mobile_url: params.bannerMobileUrl
    }
    const { data, error } = await apiClient.post<{ id: string, checkoutUrl?: string, sessionId?: string }>('/api/sponsors/checkout', payload)

    if (error) {
      throw new Error(error.message || 'Erro ao criar patrocinador')
    }

    if (!data) {
      throw new Error('Sem resposta do servidor')
    }

    return data
  }
}

export const sponsorService = new SponsorService()
