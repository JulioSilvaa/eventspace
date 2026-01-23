import {
  Wifi,
  Car,
  Utensils,
  Bath,
  Snowflake,
  Wind,
  Waves,
  Flame,
  TreePine,
  Music,
  Camera,
  Shield,
  UserCheck,
  Sparkles,
  UtensilsCrossed,
  Volume2,
  Lightbulb,
  Palette,
  Users,
  Gamepad2,
  Dumbbell,
  Plus,
  X,
  Check,
  Tv,
  Sofa,
  Coffee,
  Microwave,
  Refrigerator,
  WashingMachine,
  Speaker,
  Phone,
  MapPin
} from 'lucide-react'
import { useState } from 'react'

interface AmenitiesSelectorProps {
  selectedAmenities: string[]
  selectedFeatures: string[]
  selectedServices: string[]
  onAmenitiesChange: (amenities: string[]) => void
  onFeaturesChange: (features: string[]) => void
  onServicesChange: (services: string[]) => void
  categoryType: 'space' | 'service' | 'equipment' | 'advertiser' // 'advertiser' kept for backward compat if needed, but we will move away
  customAmenities?: string[]
  customFeatures?: string[]
  customServices?: string[]
  onCustomAmenitiesChange?: (amenities: string[]) => void
  onCustomFeaturesChange?: (features: string[]) => void
  onCustomServicesChange?: (services: string[]) => void
}

const AMENITIES = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'parking', name: 'Estacionamento', icon: Car },
  { id: 'kitchen', name: 'Cozinha', icon: Utensils },
  { id: 'bathrooms', name: 'Banheiros', icon: Bath },
  { id: 'air_conditioning', name: 'Ar Condicionado', icon: Snowflake },
  { id: 'ventilation', name: 'Ventilação', icon: Wind },
  { id: 'tv', name: 'TV/Televisão', icon: Tv },
  { id: 'furniture', name: 'Mobiliário', icon: Sofa },
  { id: 'coffee_area', name: 'Área de Café', icon: Coffee },
  { id: 'microwave', name: 'Micro-ondas', icon: Microwave },
  { id: 'refrigerator', name: 'Geladeira/Frigobar', icon: Refrigerator },
  { id: 'washing_machine', name: 'Máquina de Lavar', icon: WashingMachine },
  { id: 'sound_basic', name: 'Som Básico', icon: Speaker },
  { id: 'phone', name: 'Telefone', icon: Phone },
  { id: 'location_access', name: 'Fácil Acesso', icon: MapPin },
]

const SPACE_FEATURES = [
  { id: 'pool', name: 'Piscina', icon: Waves },
  { id: 'bbq', name: 'Churrasqueira', icon: Flame },
  { id: 'garden', name: 'Área Verde/Jardim', icon: TreePine },
  { id: 'soccer_field', name: 'Campo de Futebol', icon: Users },
  { id: 'game_room', name: 'Salão de Jogos', icon: Gamepad2 },
  { id: 'gym', name: 'Academia', icon: Dumbbell },
  { id: 'sound_system', name: 'Som Ambiente', icon: Music },
  { id: 'lighting', name: 'Iluminação Especial', icon: Lightbulb },
  { id: 'decoration', name: 'Decoração Inclusa', icon: Palette },
]

const EQUIPMENT_FEATURES = [
  { id: 'professional_sound', name: 'Som Profissional', icon: Volume2 },
  { id: 'lighting_system', name: 'Sistema de Iluminação', icon: Lightbulb },
  { id: 'decoration_items', name: 'Itens Decorativos', icon: Palette },
  { id: 'recording_equipment', name: 'Equipamento de Gravação', icon: Camera },
]

const SERVICE_FEATURES = [
  { id: 'team', name: 'Equipe Própria', icon: Users },
  { id: 'uniform', name: 'Trabalha Uniformizado', icon: UserCheck },
  { id: 'equipment_own', name: 'Equipamento Próprio', icon: Speaker },
  { id: 'transport_own', name: 'Transporte Próprio', icon: Car },
]

const SERVICES = [
  { id: 'cleaning', name: 'Limpeza', icon: Sparkles },
  { id: 'security', name: 'Segurança', icon: Shield },
  { id: 'waitstaff', name: 'Garçom/Atendimento', icon: UserCheck },
  { id: 'catering', name: 'Buffet/Catering', icon: UtensilsCrossed },
  { id: 'setup', name: 'Montagem/Desmontagem', icon: Users },
]

export default function AmenitiesSelector({
  selectedAmenities,
  selectedFeatures,
  selectedServices,
  onAmenitiesChange,
  onFeaturesChange,
  onServicesChange,
  categoryType,
  customAmenities = [],
  customFeatures = [],
  customServices = [],
  onCustomAmenitiesChange,
  onCustomFeaturesChange,
  onCustomServicesChange
}: AmenitiesSelectorProps) {
  const [newAmenity, setNewAmenity] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newService, setNewService] = useState('')

  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId]
    onAmenitiesChange(newAmenities)
  }

  const handleFeatureToggle = (featureId: string) => {
    const newFeatures = selectedFeatures.includes(featureId)
      ? selectedFeatures.filter(id => id !== featureId)
      : [...selectedFeatures, featureId]
    onFeaturesChange(newFeatures)
  }

  const handleServiceToggle = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    onServicesChange(newServices)
  }

  // Custom amenities handlers
  const addCustomAmenity = () => {
    const trimmedValue = newAmenity.trim()

    if (trimmedValue && !customAmenities.includes(trimmedValue)) {
      if (onCustomAmenitiesChange) {
        onCustomAmenitiesChange([...customAmenities, trimmedValue])
        setNewAmenity('')
      } else {
        console.error('onCustomAmenitiesChange callback not provided')
      }
    }
  }

  const removeCustomAmenity = (amenity: string) => {
    if (onCustomAmenitiesChange) {
      onCustomAmenitiesChange(customAmenities.filter(item => item !== amenity))
    }
  }

  const addCustomFeature = () => {
    const trimmedValue = newFeature.trim()

    if (trimmedValue && !customFeatures.includes(trimmedValue)) {
      if (onCustomFeaturesChange) {
        onCustomFeaturesChange([...customFeatures, trimmedValue])
        setNewFeature('')
      } else {
        console.error('onCustomFeaturesChange callback not provided')
      }
    }
  }

  const removeCustomFeature = (feature: string) => {
    if (onCustomFeaturesChange) {
      onCustomFeaturesChange(customFeatures.filter(item => item !== feature))
    }
  }

  const addCustomService = () => {
    const trimmedValue = newService.trim()

    if (trimmedValue && !customServices.includes(trimmedValue)) {
      if (onCustomServicesChange) {
        onCustomServicesChange([...customServices, trimmedValue])
        setNewService('')
      } else {
        console.error('onCustomServicesChange callback not provided')
      }
    }
  }

  const removeCustomService = (service: string) => {
    if (onCustomServicesChange) {
      onCustomServicesChange(customServices.filter(item => item !== service))
    }
  }

  const getFeaturesList = () => {
    switch (categoryType) {
      case 'space': return SPACE_FEATURES
      case 'service': return SERVICE_FEATURES
      case 'equipment': return EQUIPMENT_FEATURES
      case 'advertiser': return EQUIPMENT_FEATURES // Fallback
      default: return SPACE_FEATURES
    }
  }

  const features = getFeaturesList()

  const getFeaturesTitle = () => {
    switch (categoryType) {
      case 'space': return 'Recursos para Eventos'
      case 'service': return 'Diferenciais do Serviço'
      case 'equipment': return 'Características do Equipamento'
      default: return 'Recursos'
    }
  }

  return (
    <div className="space-y-8">
      {/* Comodidades Básicas */}
      {/* Comodidades Básicas - Apenas para Espaços */}
      {categoryType === 'space' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comodidades Básicas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {AMENITIES.map((amenity) => {
              const Icon = amenity.icon
              const isSelected = selectedAmenities.includes(amenity.id)

              return (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.id)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left relative
                    ${isSelected
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm truncate">{amenity.name}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-green-600 ml-auto" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom Amenities */}
          {customAmenities.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Comodidades personalizadas:</h4>
              <div className="flex flex-wrap gap-2">
                {customAmenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm border border-primary-200"
                  >
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomAmenity(amenity)}
                      className="text-primary-500 hover:text-primary-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Amenity - Only show if callback is available */}
          {onCustomAmenitiesChange && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adicionar comodidade personalizada
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Ex: Karaokê, Mesa de bilhar, Espaço kids..."
                  maxLength={50}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                />
                <button
                  type="button"
                  onClick={addCustomAmenity}
                  disabled={!newAmenity.trim()}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {newAmenity.length}/50 caracteres
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recursos Especiais */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {getFeaturesTitle()}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((feature) => {
            const Icon = feature.icon
            const isSelected = selectedFeatures.includes(feature.id)

            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleFeatureToggle(feature.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                  ${isSelected
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                <span className="font-medium text-sm truncate">{feature.name}</span>
              </button>
            )
          })}
        </div>

        {/* Custom Features */}
        {customFeatures.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recursos personalizados:</h4>
            <div className="flex flex-wrap gap-2">
              {customFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200"
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomFeature(feature)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Feature - Only show if callback is available */}
        {onCustomFeaturesChange && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {categoryType === 'space' ? 'Adicionar recurso para eventos personalizado' : 'Adicionar diferencial personalizado'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder={categoryType === 'space'
                  ? "Ex: Palco com piano, Deck com vista, Espaço para foodtrucks..."
                  : "Ex: Atendimento bilíngue, Equipamento de última geração..."
                }
                maxLength={50}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
              />
              <button
                type="button"
                onClick={addCustomFeature}
                disabled={!newFeature.trim()}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {newFeature.length}/50 caracteres
            </p>
          </div>
        )}
      </div>

      {/* Serviços Inclusos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Serviços Inclusos
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICES.map((service) => {
            const Icon = service.icon
            const isSelected = selectedServices.includes(service.id)

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceToggle(service.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="font-medium text-sm truncate">{service.name}</span>
              </button>
            )
          })}
        </div>

        {/* Custom Services */}
        {customServices.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Serviços personalizados:</h4>
            <div className="flex flex-wrap gap-2">
              {customServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200"
                >
                  <span>{service}</span>
                  <button
                    type="button"
                    onClick={() => removeCustomService(service)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Service - Only show if callback is available */}
        {onCustomServicesChange && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar serviço personalizado
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Ex: DJ incluso, Decoração temática, Recepcionista, Valet parking..."
                maxLength={50}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
              />
              <button
                type="button"
                onClick={addCustomService}
                disabled={!newService.trim()}
                className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {newService.length}/50 caracteres
            </p>
          </div>
        )}
      </div>

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Dica importante</h4>
        <p className="text-sm text-blue-700 mb-2">
          Selecione apenas as comodidades e serviços que estão realmente disponíveis.
          Isso ajuda os interessados a encontrar exatamente o que procuram e evita mal-entendidos.
        </p>
        <p className="text-sm text-blue-700">
          <strong>Use os campos personalizados</strong> para adicionar comodidades, recursos ou serviços únicos
          que não estão nas listas padrão. Isso torna seu anúncio mais completo e atrativo!
        </p>
      </div>
    </div>
  )
}