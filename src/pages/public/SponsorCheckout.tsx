import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Upload, Check, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { sponsorService } from '@/services/sponsorService'
import { stripe } from '@/lib/stripe'

// Validation Schema
const sponsorSchema = z.object({
  name: z.string().min(3, 'Nome da empresa é obrigatório (mínimo 3 caracteres)'),
  linkUrl: z.string().url('URL inválida (inclua https://)'),
})

type SponsorForm = z.infer<typeof sponsorSchema>

const PLANS = {
  Bronze: { price: 200, name: 'Bronze Partner' },
  Silver: { price: 450, name: 'Silver Partner' },
  Gold: { price: 800, name: 'Gold Partner' },
}

const FileUpload = ({
  label,
  file,
  setFile,
  dimensions,
  expectedWidth,
  expectedHeight
}: {
  label: string,
  file: File | null,
  setFile: (f: File | null) => void,
  dimensions: string,
  expectedWidth: number,
  expectedHeight: number
}) => {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      if (img.width !== expectedWidth || img.height !== expectedHeight) {
        toast.error(`Dimensões incorretas! A imagem deve ter ${expectedWidth}x${expectedHeight}px. (Atual: ${img.width}x${img.height}px)`)
        return
      }
      setFile(selectedFile)
    }
    img.src = URL.createObjectURL(selectedFile)
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${file ? 'border-green-500 bg-green-50/30' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
      >
        {file && preview ? (
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto max-h-[300px] object-contain mx-auto"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
              <p className="text-white font-medium mb-2 drop-shadow-md">{file.name}</p>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm shadow-sm"
              >
                Trocar Imagem
              </button>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
              <Check className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="relative py-8">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-50 transition-colors">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-700">Clique para selecionar</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Obrigatório: {dimensions}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SponsorCheckout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const plan = searchParams.get('plan') as keyof typeof PLANS
  const currentPlan = PLANS[plan] || PLANS.Silver

  const [desktopBanner, setDesktopBanner] = useState<File | null>(null)
  const [mobileBanner, setMobileBanner] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const { register, handleSubmit, formState: { errors } } = useForm<SponsorForm>({
    resolver: zodResolver(sponsorSchema)
  })



  const onSubmit = async (data: SponsorForm) => {
    if (!user) {
      toast.error('Você precisa estar logado para continuar')
      navigate('/login', { state: { from: `/checkout/sponsor?plan=${plan}` } })
      return
    }

    if (!desktopBanner || !mobileBanner) {
      toast.error('Por favor, faça o upload dos banners')
      return
    }

    // Validate Dimensions
    const validateImage = (file: File, expectedW: number, expectedH: number, name: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          URL.revokeObjectURL(img.src)
          if (img.width !== expectedW || img.height !== expectedH) {
            reject(new Error(`A imagem ${name} deve ter exatamente ${expectedW}x${expectedH}px. Atual: ${img.width}x${img.height}px`))
          } else {
            resolve()
          }
        }
        img.onerror = () => {
          URL.revokeObjectURL(img.src)
          reject(new Error(`Erro ao ler imagem ${name}`))
        }
        img.src = URL.createObjectURL(file)
      })
    }

    try {
      await validateImage(desktopBanner, 1200, 200, 'Desktop')
      await validateImage(mobileBanner, 600, 300, 'Mobile')
    } catch (e: any) {
      toast.error(e.message)
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Upload Images
      setUploadStatus('Enviando banner desktop...')
      const desktopUrl = await sponsorService.uploadBanner(desktopBanner)

      setUploadStatus('Enviando banner mobile...')
      const mobileUrl = await sponsorService.uploadBanner(mobileBanner)

      setUploadStatus('Gerando checkout...')

      // 2. Create Sponsor & Checkout
      const response = await sponsorService.createSponsor({
        name: data.name,
        linkIcon: 'site',
        linkUrl: data.linkUrl,
        bannerDesktopUrl: desktopUrl,
        bannerMobileUrl: mobileUrl,
        tier: plan.toUpperCase() as 'BRONZE' | 'SILVER' | 'GOLD',
        userId: user.id
      })

      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      } else if (response.sessionId) {
        const stripeInstance = await stripe
        await stripeInstance?.redirectToCheckout({ sessionId: response.sessionId })
      } else {
        toast.success('Solicitação enviada com sucesso!')
        navigate('/dashboard')
      }

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao processar. Tente novamente.')
    } finally {
      setIsSubmitting(false)
      setUploadStatus('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-primary-900 text-white p-8">
            <h1 className="text-2xl font-bold mb-2">Finalizar Contratação</h1>
            <p className="text-primary-100 opacity-90">Preencha os dados do seu anúncio de Patrocinador</p>
          </div>

          <div className="p-8">
            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800 font-semibold">Plano Selecionado</p>
                <p className="text-xl font-bold text-blue-900">{currentPlan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-800 font-semibold">Valor Mensal</p>
                <p className="text-2xl font-black text-blue-900">R$ {currentPlan.price}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa / Marca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: EventSpace Ltda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  {...register('name')}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link de Destino <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://suaempresa.com.br"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  {...register('linkUrl')}
                />
                {errors.linkUrl && <p className="mt-1 text-sm text-red-600">{errors.linkUrl.message}</p>}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Banners Publicitários</h3>

                <FileUpload
                  label="Banner Desktop (1200x200px)"
                  file={desktopBanner}
                  setFile={setDesktopBanner}
                  dimensions="1200x200px"
                  expectedWidth={1200}
                  expectedHeight={200}
                />

                <FileUpload
                  label="Banner Mobile (600x300px)"
                  file={mobileBanner}
                  setFile={setMobileBanner}
                  dimensions="600x300px"
                  expectedWidth={600}
                  expectedHeight={300}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {uploadStatus || 'Processando...'}
                    </>
                  ) : (
                    <>
                      Ir para Pagamento
                      <ArrowRight className="w-6 h-6" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-500 mt-4">
                  Pagamento processado de forma segura pelo Stripe. Você poderá cancelar a qualquer momento.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
