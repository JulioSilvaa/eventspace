import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Shield,
  CreditCard,
  Bell,
  Trash2,
  Settings as SettingsIcon
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'

type SettingsTab = 'personal' | 'security' | 'subscription' | 'privacy' | 'account'

export default function Settings() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal')

  const tabs = [
    {
      id: 'personal' as SettingsTab,
      name: 'Informações Pessoais',
      icon: User,
      description: 'Nome, telefone e localização'
    },
    {
      id: 'security' as SettingsTab,
      name: 'Segurança',
      icon: Shield,
      description: 'Senha e email'
    },
    {
      id: 'subscription' as SettingsTab,
      name: 'Assinatura',
      icon: CreditCard,
      description: 'Plano e pagamentos'
    },
    {
      id: 'privacy' as SettingsTab,
      name: 'Privacidade',
      icon: Bell,
      description: 'Notificações e consentimentos'
    },
    {
      id: 'account' as SettingsTab,
      name: 'Conta',
      icon: Trash2,
      description: 'Gerenciamento da conta'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <SettingsIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
              <p className="text-gray-600 mt-1">
                Gerencie suas informações pessoais e preferências da conta
              </p>
            </div>
          </div>

          {/* Profile Info Header */}
          {profile && profile.full_name && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-600">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
                  <p className="text-sm text-gray-600">{profile.email}</p>
                  <p className="text-xs text-gray-500">
                    Plano {profile.plan_type || 'free'} • {profile.city || 'N/A'}, {profile.state || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs text-gray-500">{tab.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Tab Header */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  {(() => {
                    const activeTabData = tabs.find(tab => tab.id === activeTab)
                    const Icon = activeTabData?.icon || SettingsIcon
                    return (
                      <>
                        <Icon className="w-6 h-6 text-gray-700" />
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {activeTabData?.name}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {activeTabData?.description}
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'personal' && <PersonalInformationSection />}
                {activeTab === 'security' && <SecuritySection />}
                {activeTab === 'subscription' && <SubscriptionSection />}
                {activeTab === 'privacy' && <PrivacySection />}
                {activeTab === 'account' && <AccountManagementSection />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Personal Information Section
function PersonalInformationSection() {
  const { profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    state: profile?.state || '',
    city: profile?.city || '',
    region: profile?.region || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await updateProfile(formData)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo
          </label>
          <input
            type="text"
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Telefone
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
            Região (Opcional)
          </label>
          <input
            type="text"
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="Centro, Zona Sul, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
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

    setIsLoading(true)
    try {
      const result = await changePassword(passwordData.newPassword)
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
    <div className="space-y-8">
      {/* Change Password */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Senha Atual
            </label>
            <input
              type="password"
              id="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              id="newPassword"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>

      {/* Change Email */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Email</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Para alterar seu email, entre em contato com o suporte através do email: suporte@eventspace.com.br
          </p>
        </div>
      </div>
    </div>
  )
}

// Subscription Section
function SubscriptionSection() {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gerenciar Assinatura</h3>
        <p className="text-sm text-gray-600">
          Visualize e gerencie sua assinatura atual, métodos de pagamento e histórico de cobrança.
        </p>
      </div>

      <SubscriptionCard />
    </div>
  )
}

// Privacy Section
function PrivacySection() {
  const { profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    marketing_consent: profile?.marketing_consent || false,
    email_notifications: true, // This would come from user preferences
    sms_notifications: false
  })

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      const result = await updateProfile({
        marketing_consent: preferences.marketing_consent,
        marketing_consent_at: preferences.marketing_consent ? new Date().toISOString() : undefined
      })

      if (result.error) {
        alert('Erro ao atualizar preferências: ' + result.error)
      } else {
        alert('Preferências atualizadas com sucesso!')
      }
    } catch (err) {
      console.error('Error updating preferences:', err)
      alert('Erro inesperado ao atualizar preferências')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferências de Comunicação</h3>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="marketing_consent"
                checked={preferences.marketing_consent}
                onChange={(e) => setPreferences({ ...preferences, marketing_consent: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="marketing_consent" className="font-medium text-gray-700">
                Receber emails de marketing
              </label>
              <p className="text-gray-500">
                Receba ofertas especiais, novidades e dicas por email.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="email_notifications"
                checked={preferences.email_notifications}
                onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="email_notifications" className="font-medium text-gray-700">
                Notificações por email
              </label>
              <p className="text-gray-500">
                Receba notificações sobre seus anúncios e atividades da conta.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Salvando...' : 'Salvar Preferências'}
          </button>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações de Privacidade</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Termos aceitos em:</strong> {profile?.terms_accepted_at ? new Date(profile.terms_accepted_at).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Política de privacidade aceita em:</strong> {profile?.privacy_accepted_at ? new Date(profile.privacy_accepted_at).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Consentimento de marketing:</strong> {profile?.marketing_consent_at ? new Date(profile.marketing_consent_at).toLocaleDateString() : 'Não concedido'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Account Management Section
function AccountManagementSection() {
  const { profile } = useAuth()
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
    if (!confirm('Tem certeza que deseja desativar sua conta? Esta ação pode ser revertida entrando em contato conosco.')) {
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement account deactivation
      alert('Funcionalidade de desativação será implementada em breve')
    } catch (err) {
      console.error('Error deactivating account:', err)
      alert('Erro ao desativar conta')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('ATENÇÃO: Esta ação é irreversível! Tem certeza que deseja excluir permanentemente sua conta e todos os seus dados?')) {
      return
    }

    if (!confirm('Digite "EXCLUIR" para confirmar a exclusão da conta:') ||
      prompt('Digite "EXCLUIR" para confirmar:') !== 'EXCLUIR') {
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement account deletion
      alert('Funcionalidade de exclusão será implementada em breve')
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Erro ao excluir conta')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Account Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Conta</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>ID da conta:</strong> {profile?.id}</p>
            <p><strong>Conta criada em:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Última atualização:</strong> {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Status da conta:</strong> {profile?.account_status === 'active' ? 'Ativa' : 'Inativa'}</p>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Exportar Dados</h3>
        <p className="text-sm text-gray-600 mb-4">
          Baixe uma cópia de todos os seus dados armazenados em nossa plataforma.
        </p>
        <button
          onClick={handleExportData}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Exportando...' : 'Exportar Meus Dados'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-medium text-red-900 mb-4">Zona de Perigo</h3>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Desativar Conta</h4>
            <p className="text-sm text-red-700 mb-3">
              Desative temporariamente sua conta. Você pode reativá-la entrando em contato conosco.
            </p>
            <button
              onClick={handleDeactivateAccount}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Desativar Conta
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Excluir Conta</h4>
            <p className="text-sm text-red-700 mb-3">
              Exclua permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Excluir Conta Permanentemente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}