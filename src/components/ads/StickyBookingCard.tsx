import { formatPrice } from '@/lib/utils'
import { Phone, MessageCircle, Share2, ShieldCheck, Crown, Instagram, Mail } from 'lucide-react'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import { usePricingModels } from '@/hooks/usePricingModels'
import { useMemo } from 'react'

interface StickyBookingCardProps {
  ad: any
  onWhatsApp: () => void
  onCall: () => void
  onShare: () => void
}

export default function StickyBookingCard({ ad, onWhatsApp, onCall, onShare }: StickyBookingCardProps) {
  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return ''
    // Remove all non-digits and leading 55 if present to avoid duplication
    const clean = phone.replace(/\D/g, '').replace(/^55/, '')
    // Format as +55 (XX) XXXXX-XXXX
    return `+55 ${clean.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')}`
  }

  const { data: pricingModels } = usePricingModels()

  const unitMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (pricingModels) {
      pricingModels.forEach(pm => {
        if (pm.unit) {
          map[pm.key] = `/${pm.unit}`
        }
      })
    }
    return map
  }, [pricingModels])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
        {/* Header with Price */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Valor do aluguel</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(ad.price, ad.price_type).split('/')[0]}
            </span>
            <span className="text-gray-500 mb-1.5 font-medium">
              {unitMap[ad.price_type] || '/unid'}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* WhatsApp Button - Primary */}
          {(ad.contact_whatsapp || ad.contact_phone) && (
            <button
              onClick={onWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg shadow-green-100"
            >
              <MessageCircle className="w-5 h-5" />
              Conversar no WhatsApp
            </button>
          )}

          {/* Phone Call Button - Secondary */}
          {(ad.contact_phone || ad.contact_whatsapp || ad.contact_whatsapp_alternative) && (
            <button
              onClick={onCall}
              className="w-full bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 text-gray-700 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-5 h-5" />
              Ligar para Anunciante
            </button>
          )}

          {/* Numbers Display */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            {ad.contact_whatsapp && (
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => {
                navigator.clipboard.writeText(ad.contact_whatsapp)
                // Optional: show toast
              }}>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-green-700 font-bold uppercase tracking-wide leading-none mb-0.5">WhatsApp Principal</p>
                  <p className="text-sm font-bold text-gray-700 font-mono">{formatPhoneNumber(ad.contact_whatsapp)}</p>
                </div>
              </div>
            )}

            {ad.contact_phone && ad.contact_phone !== ad.contact_whatsapp && (
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigator.clipboard.writeText(ad.contact_phone)}>
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide leading-none mb-0.5">Telefone</p>
                  <p className="text-sm font-bold text-gray-700 font-mono">{formatPhoneNumber(ad.contact_phone)}</p>
                </div>
              </div>
            )}

            {/* Alternative Number */}
            {ad.contact_whatsapp_alternative && (
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigator.clipboard.writeText(ad.contact_whatsapp_alternative)}>
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide leading-none mb-0.5">WhatsApp Alternativo</p>
                  <p className="text-sm font-bold text-gray-700 font-mono">{formatPhoneNumber(ad.contact_whatsapp_alternative)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Email */}
          {ad.contact_email && (
            <div className="flex items-center justify-center gap-2 text-gray-600 py-2 border-t border-gray-100 mt-2">
              <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-gray-500 flex-shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium truncate max-w-[200px]">{ad.contact_email}</span>
            </div>
          )}

          {/* Instagram Button - Prominent as requested */}
          {ad.contact_instagram && (
            <a
              href={`https://instagram.com/${ad.contact_instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-100 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group"
            >
              <div className="bg-pink-500 text-white p-1 rounded-md group-hover:scale-110 transition-transform">
                <Instagram className="w-4 h-4" />
              </div>
              Instagram
            </a>
          )}

          {/* Facebook Button - Secondary Social */}
          {ad.contact_facebook && (
            <a
              href={ad.contact_facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span className="font-bold">f</span>
              Facebook
            </a>
          )}
        </div>

        {/* Safety Badges */}
        <div className="py-4 border-t border-gray-100 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Negociação Segura</p>
              <p className="text-xs text-gray-500">Você negocia direto com o proprietário.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900">0% de Comissão</p>
              <p className="text-xs text-gray-500">Não cobramos taxas de serviço.</p>
            </div>
          </div>
        </div>

        {/* Owner Mini Profile */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
              {ad.owner?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{ad.owner?.name || 'Anunciante'}</p>
              <p className="text-xs text-gray-500">Membro desde 2024</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onShare} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <FavoriteButton adId={ad.id} size="md" variant="button" />
          </div>
        </div>
      </div>
    </div>
  )
}
