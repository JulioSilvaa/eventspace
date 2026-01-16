import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Trash2,
  Home,
  MapPin,
  Phone,
  Save,
  Loader2,
  Settings as SettingsIcon,
  XCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRealTimeMetrics, useEventTracking } from '@/hooks/useRealTimeMetrics'
import { apiClient } from '@/lib/api-client'
import subscriptionService, { Subscription } from '@/services/subscriptionService'
import { maskPhone, maskCEP, unmask } from '@/utils/masks'
import AlertModal from '@/components/ui/AlertModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { Instagram, Facebook } from 'lucide-react'

// Generic handler to apply masks and preserve cursor logic
const useMaskedInput = (
  setValue: (val: any) => void,
  fieldName?: string
) => {
  return (e: React.ChangeEvent<HTMLInputElement>, maskFn: (val: string) => string) => {
    const input = e.target
    const start = input.selectionStart || 0
    const value = input.value

    const unmaskedLengthBefore = value.slice(0, start).replace(/\D/g, '').length
    const masked = maskFn(value)

    // If setValue expects an object update (like in Settings state), we might need custom logic.
    // But here we have simple setFormData({ ...formData, phone: ... })
    // So we just return the masked value and let the component handle state update? No, we need to handle cursor.
    // The component handles state update via onChange.
    // We can't easily abstract this without ref to input.
    // Let's implement the handler inside the component for simplicity of access to state setter if needed, 
    // OR just return the masked value and do the cursor trick in a useEffect or separate helper?

    // Actually, we can just do the cursor trick here if we don't control state directly but just input ref?
    // But we are in a controlled component.

    // Let's fallback to manual implementation inside PersonalInformationSection and PropertySection.
    return masked;
  }
}

// Helper to handle cursor placement after render
const preserveCursor = (input: HTMLInputElement, valueBefore: string, start: number, maskedValue: string) => {
  const unmaskedLengthBefore = valueBefore.slice(0, start).replace(/\D/g, '').length

  setTimeout(() => {
    let newPos = 0
    let tempDigits = 0
    for (let i = 0; i < maskedValue.length; i++) {
      if (/\d/.test(maskedValue[i])) tempDigits++
      if (tempDigits === unmaskedLengthBefore) {
        newPos = i + 1
        break
      }
    }
    if (unmaskedLengthBefore === 0) newPos = 0;
    input.setSelectionRange(newPos, newPos)
  }, 0)
}

type SettingsTab = 'personal' | 'security' | 'property' | 'account'

export default function Settings() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal')

  // Modal states
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'default'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'default'
  })

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({ isOpen: true, type, title, message })
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'default' = 'default') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type })
  }

  const tabs = [
    {
      id: 'personal' as SettingsTab,
      name: 'Informações Pessoais',
      icon: User,
      description: 'Email, nome e telefone'
    },
    {
      id: 'security' as SettingsTab,
      name: 'Segurança',
      icon: Shield,
      description: 'Senha e email'
    },
    {
      id: 'property' as SettingsTab,
      name: 'Meu Anúncio',
      icon: Home,
      description: 'Endereço, telefone e dados'
    },
    {
      id: 'account' as SettingsTab,
      name: 'Conta',
      icon: Trash2,
      description: 'Gerenciamento da conta'
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-16">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Voltar à Área do Anunciante
            </Link>
            <div className="flex items-center gap-4">
              <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-500/20">
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Configurações</h1>
                  <p className="text-gray-500 font-medium">Personalize sua experiência na plataforma</p>
                </div>
              </div>
            </div>

            {profile && (
              <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 hidden md:flex">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner">
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{profile.full_name}</div>
                  <div className="text-xs font-medium text-gray-500">{profile.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-3">
            <nav className="flex lg:block overflow-x-auto pb-4 lg:pb-0 space-x-4 lg:space-x-0 lg:space-y-3 lg:sticky lg:top-24 no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 lg:w-full group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl transition-all duration-300 ${isActive
                      ? 'bg-white text-primary-600 shadow-md shadow-gray-200/50 border border-gray-100'
                      : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                      }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-primary-50' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left hidden md:block">
                      <div className="font-bold text-sm leading-tight">{tab.name}</div>
                      <div className="text-[10px] uppercase tracking-wider font-bold opacity-60 mt-0.5">{tab.description}</div>
                    </div>
                    {/* Mobile Only Label */}
                    <div className="block md:hidden font-bold text-sm whitespace-nowrap">
                      {tab.name}
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-6 md:mb-8 px-2">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab)
                  return (
                    <>
                      <div className="w-1 h-6 bg-primary-600 rounded-full" />
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-none">{activeTabData?.name}</h2>
                        <p className="text-sm font-medium text-gray-500 mt-1">{activeTabData?.description}</p>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Tab Content */}
              <div className="md:p-2">
                {activeTab === 'personal' && <PersonalInformationSection />}
                {activeTab === 'security' && <SecuritySection />}
                {activeTab === 'property' && <PropertySection showAlert={showAlert} showConfirm={showConfirm} />}
                {activeTab === 'account' && <AccountManagementSection />}
              </div>
            </div>
          </div>
        </div>

        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
        />

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          confirmText="Confirmar"
          cancelText="Cancelar"
        />
      </div>
    </div>
  )
}

// Personal Information Section
function PersonalInformationSection() {
  const { profile, updateProfile, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  })

  // Load user data from database
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return

      setIsFetching(true)
      try {
        const { data, error } = await apiClient.get<{ data: any }>(`/api/user/${user.id}`)

        if (!error && data?.data) {
          setFormData({
            full_name: data.data.name || data.data.full_name || '',
            email: data.data.email || '',
            phone: maskPhone(data.data.phone || ''),
          })
        }
      } catch (err) {
        console.error('Error loading user data:', err)
      } finally {
        setIsFetching(false)
      }
    }

    loadUserData()
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProfile({
        ...formData,
        phone: unmask(formData.phone),
      })
      if (result.error) {
        alert('Erro ao atualizar perfil: ' + result.error)
      } else {
        alert('Perfil atualizado com sucesso!')
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('Erro inesperado ao atualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <div className="md:col-span-2">
              <label htmlFor="full_name" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                Nome Completo
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                Endereço de Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Bell className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-12 pr-28 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed font-medium"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded-lg border border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                  Protegido
                </div>
              </div>
              <p className="mt-2 text-[10px] text-gray-400 font-bold px-1 italic">
                * Para alterar o email de acesso, entre em contato com nosso suporte técnico.
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                Telefone de Recado
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const input = e.target
                    const val = input.value
                    const start = input.selectionStart || 0
                    const masked = maskPhone(val)
                    setFormData({ ...formData, phone: masked })
                    preserveCursor(input, val, start, masked)
                  }}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium text-gray-900"
                />
              </div>
            </div>


          </div>

          <div className="flex justify-end border-t border-gray-50 pt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              SALVAR ALTERAÇÕES
            </button>
          </div>
        </form >
      </div >
    </div >
  )
}

// Security Section
function SecuritySection() {
  const { changePassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    if (!passwordData.currentPassword) {
      alert('Por favor, informe sua senha atual')
      return
    }

    setIsLoading(true)
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (result.error) {
        alert('Erro ao alterar senha: ' + result.error)
      } else {
        alert('Senha alterada com sucesso!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) {
      console.error('Error changing password:', err)
      alert('Erro inesperado ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Change Password Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Alterar Senha de Acesso</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                Senha Atual
              </label>
              <input
                type="password"
                id="currentPassword"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2 px-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none font-medium"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              ATUALIZAR SENHA AGORA
            </button>
          </div>
        </form>
      </div>

      {/* Change Email Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Email da Conta</h3>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-900">Segurança de Email</p>
            <p className="text-sm text-blue-700/80 font-medium max-w-lg">
              Por medidas de segurança, a alteração de email exige validação manual.
              Entre em contato conosco para iniciar o processo.
            </p>
          </div>
          <a
            href="mailto:suporte@eventspace.com.br"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl border border-blue-200 hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap w-full md:w-auto"
          >
            Falar com Suporte
          </a>
        </div>
      </div>
    </div>
  )
}



// Property Section (Meu Anúncio)
function PropertySection({ showAlert, showConfirm }: {
  showAlert: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void,
  showConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'default') => void
}) {
  const { user, profile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [spaces, setSpaces] = useState<any[]>([])
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null)
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([])

  // Fetch subscriptions
  useEffect(() => {
    if (user) {
      subscriptionService.getUserSubscriptions(user.id).then(subs => {
        setUserSubscriptions(subs)
      })
    }
  }, [user])

  const handleCancelSubscription = () => {
    if (!selectedSpaceId) return;

    const sub = userSubscriptions.find(s => s.space_id === selectedSpaceId && s.status === 'active');

    if (!sub) {
      showAlert('error', 'Erro', 'Nenhuma assinatura ativa encontrada para este anúncio.');
      return;
    }

    if (sub.cancel_at_period_end) {
      showAlert('info', 'Já Cancelado', 'A assinatura deste anúncio já foi cancelada e não será renovada.');
      return;
    }

    const performCancel = async () => {
      const success = await subscriptionService.cancelSubscription(sub.id)
      if (success) {
        // Optimistic update
        setUserSubscriptions(prev => prev.map(s =>
          s.id === sub.id ? { ...s, cancel_at_period_end: true } : s
        ));
        showAlert('success', 'Sucesso', 'Assinatura cancelada com sucesso. Ela não será renovada.')
        // Refresh subscriptions
        if (user) {
          const updatedSubs = await subscriptionService.getUserSubscriptions(user.id)
          setUserSubscriptions(updatedSubs)
        }
      } else {
        showAlert('error', 'Erro', 'Erro ao cancelar assinatura. Tente novamente.')
      }
    }

    showConfirm(
      'Cancelar Renovação',
      'Tem certeza que deseja cancelar a renovação automática da assinatura? O anúncio continuará ativo até o fim do período pago.',
      performCancel,
      'warning'
    );
  }

  const { trackListingUpdated } = useEventTracking(selectedSpaceId || undefined)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_day: 0,
    price_per_weekend: 0,
    capacity: 0,
    phone: '',
    whatsapp: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: '',
      country: 'Brasil'
    }
  })

  // Load spaces
  useEffect(() => {
    async function loadSpaces() {
      if (!user?.id) return

      try {
        const { data, error } = await apiClient.get<any>(`/api/spaces?owner_id=${user.id}`)

        if (error) {
          console.error('Error loading spaces:', error)
          return
        }

        const loadedSpaces = data?.spaces || []
        setSpaces(loadedSpaces)

        if (loadedSpaces.length > 0 && !selectedSpaceId) {
          setSelectedSpaceId(loadedSpaces[0].id)
        }
      } catch (err) {
        console.error('Unexpected error loading spaces:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadSpaces()
  }, [user?.id])

  // Update form data when selected space changes
  useEffect(() => {
    if (!selectedSpaceId || spaces.length === 0) return

    const space = spaces.find(s => s.id === selectedSpaceId)
    if (!space) return

    setFormData({
      title: space.title || '',
      description: space.description || '',
      price_per_day: space.price_per_day || 0,
      price_per_weekend: space.price_per_weekend || 0,
      capacity: space.capacity || 0,

      // For contacts: try Space, then Profile
      phone: maskPhone(space.contact_phone || profile?.phone || ''),
      whatsapp: maskPhone(space.contact_whatsapp || space.contact_phone || profile?.phone || ''),

      address: {
        street: space.address?.street || '',
        number: space.address?.number || '',
        neighborhood: space.address?.neighborhood || '',
        city: space.address?.city || '',
        state: space.address?.state || '',
        zipcode: maskCEP(space.address?.zipcode || space.address?.postal_code || ''),
        country: space.address?.country || 'Brasil'
      }
    })
  }, [selectedSpaceId, spaces, profile])

  const handleUpdateSpace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSpaceId) return

    setIsSaving(true)
    try {
      const { error } = await apiClient.patch(`/api/spaces/${selectedSpaceId}`, {
        ...formData,
        phone: unmask(formData.phone),
        contact_phone: unmask(formData.phone),
        contact_whatsapp: unmask(formData.whatsapp),
        address: {
          ...formData.address,
          zipcode: unmask(formData.address.zipcode)
        }
      })

      if (error) {
        showAlert('error', 'Erro', 'Erro ao atualizar anúncio: ' + error.message)
      } else {
        await trackListingUpdated(['settings_update'], { source: 'settings_page' })

        // Update local state
        setSpaces(prev => prev.map(s => s.id === selectedSpaceId ? { ...s, ...formData } : s))
        showAlert('success', 'Sucesso', 'Anúncio atualizado com sucesso!')
      }
    } catch (err: any) {
      console.error('Error updating space:', err)
      showAlert('error', 'Erro', 'Erro ao atualizar anúncio: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSpace = async () => {
    if (!selectedSpaceId) return

    // Check for active recurring subscription
    const activeSub = userSubscriptions.find(s => s.space_id === selectedSpaceId && s.status === 'active' && !s.cancel_at_period_end);
    if (activeSub) {
      showAlert('error', 'Ação Bloqueada', 'Este anúncio possui uma assinatura ativa. Você deve cancelar a assinatura antes de excluir o anúncio para evitar cobranças indevidas.');
      return;
    }

    showConfirm(
      'Excluir Anúncio',
      'Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.',
      async () => {
        setIsDeleting(true)
        try {
          const { error } = await apiClient.delete(`/api/spaces/${selectedSpaceId}`)

          if (error) {
            showAlert('error', 'Erro', 'Erro ao excluir anúncio: ' + error.message)
          } else {
            showAlert('success', 'Sucesso', 'Anúncio excluído com sucesso!')

            // Remove from local state
            const remainingSpaces = spaces.filter(s => s.id !== selectedSpaceId)
            setSpaces(remainingSpaces)

            if (remainingSpaces.length > 0) {
              setSelectedSpaceId(remainingSpaces[0].id)
            } else {
              setSelectedSpaceId(null)
            }
          }
        } catch (err: any) {
          console.error('Error deleting space:', err)
          showAlert('error', 'Erro', 'Erro ao excluir anúncio: ' + err.message)
        } finally {
          setIsDeleting(false)
        }
      },
      'danger'
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (spaces.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Nenhum anúncio encontrado</h3>
        <p className="text-gray-500 mb-6">Você ainda não possui um imóvel cadastrado.</p>
        <Link
          to="/dashboard/anunciar"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Criar meu primeiro anúncio
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleUpdateSpace} className="space-y-8">

      {/* Space Selector & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {spaces.length > 1 ? (
          <div className="w-full sm:w-auto sm:min-w-[300px]">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecione o Anúncio</label>
            <div className="relative">
              <select
                value={selectedSpaceId || ''}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-medium text-gray-900 cursor-pointer shadow-sm"
              >
                {spaces.map(space => (
                  <option key={space.id} value={space.id}>
                    {space.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <SettingsIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              O anúncio selecionado abaixo será carregado para edição ou exclusão.
            </p>
          </div>
        ) : (
          <div></div> // Spacer
        )}

        <div className="flex gap-2 w-full sm:w-auto">
          {(() => {
            const activeSub = userSubscriptions.find(s => s.space_id === selectedSpaceId && s.status === 'active' && !s.cancel_at_period_end);
            if (activeSub) {
              return (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-orange-600 font-bold hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancelar Assinatura
                </button>
              )
            }
            return null;
          })()}

          <button
            type="button"
            onClick={handleDeleteSpace}
            disabled={isDeleting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Excluir Anúncio
          </button>
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Home className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Dados Básicos</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Anúncio</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              placeholder="Ex: Chácara Bela Vista"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none min-h-[120px]"
              placeholder="Descreva as principais características do seu espaço..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Cobrança</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    checked={!formData.price_per_weekend}
                    onChange={() => setFormData({ ...formData, price_per_weekend: 0 })}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-gray-700">Por Dia</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priceType"
                    checked={!!formData.price_per_weekend}
                    onChange={() => setFormData({ ...formData, price_per_weekend: formData.price_per_day || 0, price_per_day: 0 })}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-gray-700">Por Final de Semana</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor {formData.price_per_weekend > 0 ? '(Por Final de Semana)' : '(Por Dia)'} (R$)
              </label>
              <input
                type="number"
                value={formData.price_per_weekend > 0 ? formData.price_per_weekend : formData.price_per_day}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (formData.price_per_weekend > 0 || (formData.price_per_weekend === 0 && formData.price_per_day === 0 && e.target.name === 'weekend')) {
                    // logic handled by radio state mostly, but here we just update the active one
                    if (formData.price_per_weekend > 0) {
                      setFormData({ ...formData, price_per_weekend: val });
                    } else {
                      setFormData({ ...formData, price_per_day: val });
                    }
                  } else {
                    // default to updating daily if in daily mode
                    setFormData({ ...formData, price_per_day: val });
                  }
                }}
                // Simplified handler for clarity
                onInput={(e) => {
                  const val = parseFloat((e.target as HTMLInputElement).value);
                  if (formData.price_per_weekend > 0) {
                    setFormData({ ...formData, price_per_weekend: val });
                  } else {
                    setFormData({ ...formData, price_per_day: val });
                  }
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Capacidade (Pessoas)</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address & Contact Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Endereço e Contato</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rua / Logradouro</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número</label>
            <input
              type="text"
              value={formData.address.number}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, number: e.target.value }
              })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bairro</label>
            <input
              type="text"
              value={formData.address.neighborhood}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, neighborhood: e.target.value }
              })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">CEP</label>
            <input
              type="text"
              value={formData.address.zipcode}
              onChange={(e) => {
                const input = e.target
                const val = input.value
                const start = input.selectionStart || 0
                const masked = maskCEP(val)
                setFormData({
                  ...formData,
                  address: { ...formData.address, zipcode: masked }
                })
                preserveCursor(input, val, start, masked)
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              placeholder="00000-000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade / Estado</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.address.city}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
              />
              <input
                type="text"
                value={formData.address.state}
                readOnly
                className="w-20 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed text-center"
              />
            </div>
          </div>

          <div className="md:col-span-2 border-t pt-6 mt-2">
            <h4 className="font-bold text-gray-900 mb-4">Informações de Contato do Anúncio</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">Telefone</label>
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const input = e.target
                    const val = input.value
                    const start = input.selectionStart || 0
                    const masked = maskPhone(val)
                    setFormData({ ...formData, phone: masked })
                    preserveCursor(input, val, start, masked)
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700">WhatsApp</label>
                </div>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => {
                    const input = e.target
                    const val = input.value
                    const start = input.selectionStart || 0
                    const masked = maskPhone(val)
                    setFormData({ ...formData, whatsapp: masked })
                    preserveCursor(input, val, start, masked)
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Salvar Alterações
        </button>
      </div>
    </form>
  )
}

// Account Management Section
function AccountManagementSection() {
  const { profile, signOut, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleExportData = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement data export functionality
      alert('Funcionalidade de exportação de dados será implementada em breve')
    } catch (err) {
      console.error('Error exporting data:', err)
      alert('Erro ao exportar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (!confirm('Tem certeza que deseja desativar sua conta? Seus anúncios não serão mais exibidos na plataforma.')) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await apiClient.patch(`/api/user/${user?.id}`, {
        status: 1 // UserIsActive.INATIVO = 1
      })

      if (error) {
        throw new Error(error.message)
      }

      alert('Sua conta foi desativada com sucesso. Você será desconectado.')
      await signOut()
    } catch (err: any) {
      console.error('Error deactivating account:', err)
      alert('Erro ao desativar conta: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateAccount = async () => {
    setIsLoading(true)
    try {
      const { error } = await apiClient.patch(`/api/user/${user?.id}`, {
        status: 0 // UserIsActive.ATIVO = 0
      })

      if (error) {
        throw new Error(error.message)
      }

      alert('Sua conta foi reativada com sucesso! Seus anúncios voltarão a ficar visíveis.')
      // Refresh page to update profile status
      window.location.reload()
    } catch (err: any) {
      console.error('Error reactivating account:', err)
      alert('Erro ao reativar conta: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmation = prompt('ATENÇÃO: Esta ação é irreversível! Seus anúncios e dados serão excluídos permanentemente. Digite "EXCLUIR" para confirmar:')

    if (confirmation !== 'EXCLUIR') {
      alert('Confirmação inválida. A conta não foi excluída.')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await apiClient.delete(`/api/user/${user?.id}`)

      if (error) {
        throw new Error(error.message)
      }

      alert('Sua conta foi excluída permanentemente. Sentiremos sua falta!')
      await signOut()
    } catch (err: any) {
      console.error('Error deleting account:', err)
      alert('Erro ao excluir conta: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Account Info Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Identidade da Conta</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">ID Único</div>
            <div className="text-sm font-bold text-gray-700 break-all">{profile?.id}</div>
          </div>
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Status Atual</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${profile?.account_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${profile?.account_status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {profile?.account_status === 'active' ? 'Ativa' : 'Inativa'}
            </div>
          </div>
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Membro Desde</div>
            <div className="text-sm font-bold text-gray-700">{profile?.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}</div>
          </div>
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Última Atividade</div>
            <div className="text-sm font-bold text-gray-700">{profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Export Data Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
            <Save className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">Portabilidade de Dados</h3>
        </div>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 font-medium text-gray-600 text-sm leading-relaxed">
          Baixe uma cópia completa de todos os seus dados armazenados em nossa plataforma, seguindo as diretrizes da LGPD.
        </div>
        <button
          onClick={handleExportData}
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'PREPARANDO DADOS...' : 'EXPORTAR MEUS DADOS'}
        </button>
      </div>

      {/* Danger Zone Card */}
      <div className="bg-red-50/30 rounded-3xl border-2 border-red-100 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-red-100 rounded-xl text-red-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-red-900 tracking-tight italic">Zona de Risco</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="font-bold text-red-900">
              {profile?.account_status === 'active' ? 'Desativação Temporária' : 'Reativação de Conta'}
            </div>
            <p className="text-sm text-red-800/70 font-medium">
              {profile?.account_status === 'active'
                ? 'Seus anúncios ficarão ocultos para outros usuários enquanto sua conta estiver inativa.'
                : 'Sua conta está desativada. Reative-a para que seus anúncios voltem a aparecer na plataforma.'}
            </p>
            {profile?.account_status === 'active' ? (
              <button
                onClick={handleDeactivateAccount}
                disabled={isLoading}
                className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all shadow-sm"
              >
                Desativar Conta
              </button>
            ) : (
              <button
                onClick={handleReactivateAccount}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-500/10"
              >
                Reativar Minha Conta
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="font-bold text-red-900">Exclusão Permanente</div>
            <p className="text-sm text-red-800/70 font-medium whitespace-pre-wrap">
              Ação irreversível! Apaga permanentemente TODOS os seus anúncios, avaliações, mensagens e histórico.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-500/10"
            >
              Excluir Permanentemente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}