export default function DevNotice() {
  const isDev = import.meta.env.DEV
  const hasSupabase = import.meta.env.VITE_SUPABASE_URL && 
                     import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'

  if (!isDev || hasSupabase) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-yellow-400">⚠️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            <strong>Modo Desenvolvimento:</strong> Supabase não configurado. 
            Para funcionalidade completa, configure as variáveis de ambiente 
            <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_URL</code> e{' '}
            <code className="bg-yellow-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code>.
          </p>
        </div>
      </div>
    </div>
  )
}