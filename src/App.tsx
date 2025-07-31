import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Public pages
import Home from './pages/Home'
import Equipment from './pages/public/Equipment'
import Anunciantes from './pages/public/Anunciantes'
import Spaces from './pages/public/Spaces'
import Pricing from './pages/Pricing'
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

// Checkout pages
import Checkout from './pages/checkout/Checkout'
import CheckoutSuccess from './pages/checkout/CheckoutSuccess'
import CheckoutError from './pages/checkout/CheckoutError'
import CancelSubscription from './pages/checkout/CancelSubscription'
import CancelSuccess from './pages/checkout/CancelSuccess'
import UpgradeSubscription from './pages/checkout/UpgradeSubscription'
import UpgradeSuccess from './pages/checkout/UpgradeSuccess'
import DowngradeSubscription from './pages/checkout/DowngradeSubscription'
import DowngradeSuccess from './pages/checkout/DowngradeSuccess'

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
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/planos" element={<Pricing />} />
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
        
        {/* Checkout routes - auth only (no paid plan required) */}
        <Route path="/checkout" element={
          <SimpleProtectedRoute>
            <Checkout />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/success" element={
          <SimpleProtectedRoute>
            <CheckoutSuccess />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/error" element={
          <SimpleProtectedRoute>
            <CheckoutError />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/cancel" element={
          <SimpleProtectedRoute>
            <CancelSubscription />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/cancel-success" element={
          <SimpleProtectedRoute>
            <CancelSuccess />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/upgrade" element={
          <SimpleProtectedRoute>
            <UpgradeSubscription />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/upgrade-success" element={
          <SimpleProtectedRoute>
            <UpgradeSuccess />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/downgrade" element={
          <SimpleProtectedRoute>
            <DowngradeSubscription />
          </SimpleProtectedRoute>
        } />
        <Route path="/checkout/downgrade-success" element={
          <SimpleProtectedRoute>
            <DowngradeSuccess />
          </SimpleProtectedRoute>
        } />
        
        {/* Protected Dashboard routes - require paid plan */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiresPaidPlan={true}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/meus-anuncios" element={
          <ProtectedRoute requiresPaidPlan={true}>
            <MyAds />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/criar-anuncio" element={
          <ProtectedRoute requiresPaidPlan={true}>
            <CreateAd />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/anuncios/:id/editar" element={
          <ProtectedRoute requiresPaidPlan={true}>
            <EditAd />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/avaliacoes" element={
          <ProtectedRoute requiresPaidPlan={true}>
            <ReviewsManagement />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute requiresPaidPlan={true}>
            <div>Analytics Dashboard</div>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/configuracoes" element={
          <ProtectedRoute requiresPaidPlan={true}>
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