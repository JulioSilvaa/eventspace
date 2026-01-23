import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative bg-white pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Dynamic Background Elements - No standard mesh/blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] left-[10%] w-[40vw] h-[40vw] bg-blue-100/40 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] bg-orange-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Badge - Centered */}
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-semibold text-gray-700 tracking-wide uppercase text-[10px] md:text-xs">
            Negociação Direta • 0% Comissão
          </span>
        </div>

        {/* Massive Typography Hero */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[0.95] mb-8">
          Encontre seu <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            espaço ideal.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          A plataforma mais transparente para seus eventos.
          Conecte-se diretamente com proprietários, sem taxas ocultas.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            to="/espacos"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
          >
            Explorar Espaços
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
          </Link>
          <Link
            to="/como-funciona"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-gray-900 transition-all duration-200 bg-white border-2 border-gray-100 rounded-full hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5"
          >
            Como Funciona
          </Link>
        </div>

        {/* Social Proof Bar - Minimalist */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 border-t border-gray-100 pt-10">
          <div className="text-center">
            <div className="text-3xl font-black text-gray-900 leading-none mb-1">500+</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Espaços Verificados</div>
          </div>
          <div className="w-px h-12 bg-gray-100 hidden md:block"></div>
          <div className="text-center">
            <div className="text-3xl font-black text-gray-900 leading-none mb-1">1.2k+</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Eventos Realizados</div>
          </div>
          <div className="w-px h-12 bg-gray-100 hidden md:block"></div>
          <div className="text-center">
            <div className="text-3xl font-black text-gray-900 leading-none mb-1">100%</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seguro</div>
          </div>
        </div>
      </div>
    </section>
  )
}
