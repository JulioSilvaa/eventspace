import { Suspense, lazy, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Splash Screen
import SplashScreen from './components/SplashScreen'

// Public pages
const Home = lazy(() => import('./pages/Home'))
const Equipment = lazy(() => import('./pages/public/Equipment'))
const Anunciantes = lazy(() => import('./pages/public/Anunciantes'))
const Spaces = lazy(() => import('./pages/public/Spaces'))
const Plans = lazy(() => import('./pages/public/Plans'))
const AdDetails = lazy(() => import('./pages/AdDetails'))
const PaymentSuccess = lazy(() => import('./pages/public/PaymentSuccess'))
const Advertise = lazy(() => import('./pages/public/BecomeSponsor'))
import SponsorCheckout from './pages/public/SponsorCheckout'

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const SignupSuccess = lazy(() => import('./pages/auth/SignupSuccess'))

// Dashboard pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const MyAds = lazy(() => import('./pages/dashboard/MyAds'))
const CreateAd = lazy(() => import('./pages/dashboard/CreateAd'))
const EditAd = lazy(() => import('./pages/dashboard/EditAd'))
const ReviewsManagement = lazy(() => import('./pages/dashboard/ReviewsManagement'))
const Settings = lazy(() => import('./pages/dashboard/Settings'))
const Analytics = lazy(() => import('./pages/dashboard/Analytics'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const UsersList = lazy(() => import('./pages/admin/UsersList'))
const AdsList = lazy(() => import('./pages/admin/AdsList'))
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
// Admin components are not lazy loaded here as they are used in imports for layout/protection which might be needed immediately or handled differently. 
// However, the pages themselves should be lazy loaded.
// Note: AdminProtectedRoute and AdminLayout are components, not pages, so we keep them eager if they are small, or lazy load them too if needed. 
// For now, let's keep components eager and pages lazy.

// Legal pages
const HowItWorks = lazy(() => import('./pages/legal/HowItWorks'))
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'))
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'))

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

import { AdminAuthProvider } from './contexts/admin/AdminAuthContext'
import ScrollToTop from './components/ScrollToTop'

import { Analytics as VercelAnalytics } from '@vercel/analytics/react'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} minDuration={2000} />
  }

  return (
    <ToastProvider>
      <AdminAuthProvider>
        <VercelAnalytics />

        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <LoadingSpinner message="Carregando..." />
            </div>
          }>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/equipamentos" element={<Equipment />} />
              <Route path="/anunciantes" element={<Anunciantes />} />
              <Route path="/espacos" element={<Spaces />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/anuncie" element={<Advertise />} />
              <Route path="/anuncio/:id" element={<AdDetails />} />
              <Route path="/equipamentos/:id" element={<AdDetails />} />
              <Route path="/anunciantes/:id" element={<AdDetails />} />
              <Route path="/espacos/:id" element={<AdDetails />} />

              {/* Legal pages */}
              <Route path="/como-funciona" element={<HowItWorks />} />
              <Route path="/termos" element={<TermsOfService />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/checkout/sponsor" element={
                <SimpleProtectedRoute>
                  <SponsorCheckout />
                </SimpleProtectedRoute>
              } />

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
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <UsersList />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />
              <Route path="/admin/ads" element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <AdsList />
                  </AdminLayout>
                </AdminProtectedRoute>
              } />

              {/* 404 */}
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Página não encontrada</h1></div>} />
            </Routes>
          </Suspense>
          <ToastContainer />
        </Router>
      </AdminAuthProvider>
    </ToastProvider>
  )
}

export default App