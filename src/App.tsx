import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import React, { Suspense, lazy } from 'react'

// Contexts
import { ToastProvider } from './contexts/ToastContext'
import { AdminAuthProvider } from './contexts/admin/AdminAuthContext'

// Components
import LoadingScreen from '@/components/ui/LoadingScreen'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import { ToastContainer } from './components/ui/ToastContainer'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const CreateAd = lazy(() => import('./pages/dashboard/CreateAd'))
const EditAd = lazy(() => import('./pages/dashboard/EditAd'))
const MyAds = lazy(() => import('./pages/dashboard/MyAds'))
const Analytics = lazy(() => import('./pages/dashboard/Analytics'))
const Settings = lazy(() => import('./pages/dashboard/Settings'))
const PlanSelection = lazy(() => import('./pages/public/Plans'))
// const Checkout = lazy(() => import('./pages/dashboard/Checkout'))
const PaymentSuccess = lazy(() => import('./pages/public/PaymentSuccess'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Spaces = lazy(() => import('./pages/public/Spaces'))
const Anunciantes = lazy(() => import('./pages/public/Anunciantes'))
const AdDetails = lazy(() => import('./pages/AdDetails'))
const HowItWorks = lazy(() => import('./pages/legal/HowItWorks'))
const SponsorCheckout = lazy(() => import('./pages/public/SponsorCheckout'))

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'))
const AdminAdsPage = lazy(() => import('./pages/admin/AdsList'))
const AdminConfigPage = lazy(() => import('./pages/admin/AdminConfigPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AdminAuthProvider>
          <ToastProvider>
            <div className="app-container">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Register />} />
                  <Route path="/espacos" element={<Spaces />} />
                  <Route path="/espacos/:id" element={<AdDetails />} />
                  <Route path="/anunciantes" element={<Anunciantes />} />
                  <Route path="/anunciantes/:id" element={<AdDetails />} />
                  <Route path="/anunciante/:id" element={<AdDetails />} />
                  <Route path="/como-funciona" element={<HowItWorks />} />

                  {/* Sponsor Checkout */}
                  <Route path="/checkout/sponsor" element={
                    <ProtectedRoute>
                      <SponsorCheckout />
                    </ProtectedRoute>
                  } />

                  {/* Dashboard Routes (Protected) */}
                  <Route path="/dashboard/*" element={
                    <ProtectedRoute>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="criar-anuncio" element={<CreateAd />} />
                        <Route path="meus-anuncios" element={<MyAds />} />
                        <Route path="anuncios/:id/editar" element={<EditAd />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="favoritos" element={<Favorites />} />
                        <Route path="configuracoes" element={<Settings />} />

                        {/* <Route path="checkout/:planId" element={<Checkout />} /> */}
                        <Route path="pagamento/sucesso" element={<PaymentSuccess />} />
                      </Routes>
                    </ProtectedRoute>
                  } />

                  {/* Advertiser Profile Route for logged in users fallback */}
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />

                  {/* Public Plans Route */}
                  <Route path="/planos" element={<PlanSelection />} />
                  <Route path="/anuncie/novo" element={<CreateAd />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={
                    <AdminProtectedRoute>
                      <AdminLayout>
                        <Routes>
                          <Route index element={<AdminDashboard />} />
                          <Route path="users" element={<AdminUsersPage />} />
                          <Route path="ads" element={<AdminAdsPage />} />
                          <Route path="config" element={<AdminConfigPage />} />
                        </Routes>
                      </AdminLayout>
                    </AdminProtectedRoute>
                  } />

                  {/* Payment Success Callback */}
                  <Route path="/payment/success" element={<PaymentSuccess />} />

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              <ToastContainer />
              <Toaster position="top-right" />
            </div>
          </ToastProvider>
        </AdminAuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App