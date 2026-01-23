import { Link } from 'react-router-dom'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { howItWorks } from '@/content/home'

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Como funciona?</h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">Em três passos simples, você assume o controle do seu evento.</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent -translate-x-1/2" />

          <div className="space-y-32">
            {howItWorks.map((step, index) => (
              <div key={step.step} className={`relative flex flex-col lg:flex-row items-center gap-16 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>

                {/* Text Content */}
                <div className={`flex-1 text-center ${index % 2 === 1 ? 'lg:text-right' : 'lg:text-left'}`}>
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 mb-8 transform transition-transform hover:rotate-6 ${index % 2 === 1 ? 'lg:ml-auto' : ''}`}>
                    <step.icon className="w-10 h-10" />
                  </div>

                  <h3 className="text-3xl font-bold text-gray-900 mb-6">{step.title}</h3>
                  <p className="text-xl text-gray-500 leading-relaxed mx-auto lg:mx-0 max-w-md">
                    {step.description}
                  </p>
                </div>

                {/* Center Step Number (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-gray-100 text-gray-900 font-black text-xl z-20">
                  {step.step}
                </div>

                {/* Image */}
                <div className="flex-1 w-full">
                  <div className="relative group">
                    <div className={`absolute inset-0 bg-gray-900 rounded-[2rem] transform opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 ${index % 2 === 0 ? 'translate-x-4 translate-y-4' : '-translate-x-4 translate-y-4'}`}></div>
                    <LazyLoadImage
                      src={step.image}
                      alt={step.title}
                      className="relative w-full h-80 md:h-[500px] object-cover rounded-[2rem] shadow-xl grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
                      effect="blur"
                      wrapperClassName="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-24">
          <Link
            to="/cadastro"
            className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full hover:bg-black transition-all hover:scale-105 font-bold text-lg shadow-xl shadow-gray-200"
          >
            Começar Agora
          </Link>
        </div>
      </div>
    </section>
  )
}
