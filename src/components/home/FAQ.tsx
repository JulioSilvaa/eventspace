import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { faqs } from '@/content/home'

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Perguntas Frequentes</h2>
          <p className="text-lg text-gray-500">Tudo sobre nossa conexão direta.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden transition-all duration-200 hover:border-gray-200">
              <button
                className="w-full px-8 py-6 text-left font-bold text-gray-900 flex justify-between items-center text-lg focus:outline-none"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span>{faq.question}</span>
                <ChevronRight
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${openFaq === index ? 'rotate-90' : ''}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-8 pb-8 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
