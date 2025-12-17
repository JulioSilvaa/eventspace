export default function DevNotice() {
  const isDev = import.meta.env.DEV
  const hasApi = import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL !== 'http://localhost:3000'

  if (!isDev || hasApi) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-yellow-400">⚠️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Modo Desenvolvimento:</strong> API não configurada explicitamente.
            O sistema está usando <code>http://localhost:3000</code> como padrão.
            Para apontar para outra API, configure <code className="bg-yellow-100 px-1 rounded">VITE_API_BASE_URL</code> no arquivo <code>.env</code>.
          </p>
        </div>
      </div>
    </div>
  )
}