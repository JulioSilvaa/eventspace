import LoadingSpinner from './LoadingSpinner'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <LoadingSpinner size="lg" message="Carregando..." />
    </div>
  )
}
