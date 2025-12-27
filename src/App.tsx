import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Public pages
import Home from './pages/Home'
import Equipment from './pages/public/Equipment'
import Anunciantes from './pages/public/Anunciantes'
import Spaces from './pages/public/Spaces'
import AdDetails from './pages/AdDetails'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SignupSuccess from './pages/auth/SignupSuccess'

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard'
import MyAds from './pages/dashboard/MyAds'
import CreateAd from './pages/dashboard/CreateAd'
import EditAd from './pages/dashboard/EditAd'
import ReviewsManagement from './pages/dashboard/ReviewsManagement'
import Settings from './pages/dashboard/Settings'
import Analytics from './pages/dashboard/Analytics'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Legal pages
import HowItWorks from './pages/legal/HowItWorks'
import TermsOfService from './pages/legal/TermsOfService'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'

import LoadingSpinner from './components/ui/LoadingSpinner'

// Auth components
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Toast system
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/ui/ToastContainer'

// Simple auth-only protected route (for checkout, admin, etc)
function SimpleProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Verificando autenticação..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Public Only Route Component (for auth pages)
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Verificando autenticação..." />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ToastProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/equipamentos" element={<Equipment />} />
          <Route path="/anunciantes" element={<Anunciantes />} />
          <Route path="/espacos" element={<Spaces />} />
          <Route path="/anuncio/:id" element={<AdDetails />} />
          <Route path="/equipamentos/:id" element={<AdDetails />} />
          <Route path="/anunciantes/:id" element={<AdDetails />} />
          <Route path="/espacos/:id" element={<AdDetails />} />

          {/* Legal pages */}
          <Route path="/como-funciona" element={<HowItWorks />} />
          <Route path="/termos" element={<TermsOfService />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />

          {/* Auth routes - only accessible when not logged in */}
          <Route path="/login" element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } />
          <Route path="/cadastro" element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } />
          <Route path="/recuperar-senha" element={
            <PublicOnlyRoute>
              <div>Password Recovery</div>
            </PublicOnlyRoute>
          } />
          <Route path="/signup-success" element={<SignupSuccess />} />

          {/* Protected Dashboard routes - require authentication only */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiresPaidPlan={false}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/meus-anuncios" element={
            <ProtectedRoute requiresPaidPlan={false}>
              <MyAds />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/criar-anuncio" element={
            <ProtectedRoute requiresPaidPlan={false}>
              <CreateAd />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/anuncios/:id/editar" element={
            <ProtectedRoute requiresPaidPlan={false}>
              <EditAd />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/avaliacoes" element={
            <ProtectedRoute requiresPaidPlan={false}>
              <ReviewsManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/analytics" element={
            <ProtectedRoute requiresPaidPlan={false}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/configuracoes" element={
            <ProtectedRoute requiresPaidPlan={false}>
              <Settings />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <SimpleProtectedRoute>
              <AdminDashboard />
            </SimpleProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Página não encontrada</h1></div>} />
        </Routes>
        <ToastContainer />
      </Router>
    </ToastProvider>
  )
}

export default App