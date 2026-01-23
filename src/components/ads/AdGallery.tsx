import { useState, useCallback, useEffect } from 'react'
import { ZoomIn, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

interface ImageData {
  url?: string
  image_url?: string
}

interface AdGalleryProps {
  title: string
  images: (string | ImageData)[]
}

export default function AdGallery({ title, images = [] }: AdGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)

  // Helpers to get URL regardless of format
  const getImageUrl = (img: string | ImageData) => {
    if (typeof img === 'string') return img
    return img.url || img.image_url || '/placeholder-image.jpg'
  }

  const safeImages = images.map(img => getImageUrl(img))

  const openModal = (index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const nextModalImage = useCallback(() => {
    setModalImageIndex((prev) => (prev + 1) % safeImages.length)
  }, [safeImages.length])

  const prevModalImage = useCallback(() => {
    setModalImageIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      if (e.key === 'Escape') {
        closeModal()
      } else if (e.key === 'ArrowLeft') {
        prevModalImage()
      } else if (e.key === 'ArrowRight') {
        nextModalImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, nextModalImage, prevModalImage])

  if (!safeImages.length) {
    return (
      <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-2" />
          <p>Nenhuma imagem disponível</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Mobile Gallery (Swipeable - unchanged) */}
        <div className="md:hidden relative -mx-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-video">
            {safeImages.map((image, index) => (
              <div
                key={index}
                className="snap-center flex-shrink-0 w-full h-full relative"
                onClick={() => openModal(index)}
              >
                <img
                  src={image}
                  alt={`${title} - Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <div className="absolute bottom-3 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 pointer-events-none">
            <Camera className="w-3 h-3" />
            <span>{safeImages.length} fotos</span>
          </div>
        </div>

        {/* Desktop Gallery (Pro Mosaic Layout) */}
        <div className="hidden md:block rounded-3xl overflow-hidden shadow-sm border border-gray-100 h-[400px] lg:h-[500px]">
          {/* If 1 image */}
          {safeImages.length === 1 && (
            <div
              className="w-full h-full relative group cursor-pointer"
              onClick={() => openModal(0)}
            >
              <img
                src={safeImages[0]}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <Overlay />
            </div>
          )}

          {/* If 2 images */}
          {safeImages.length === 2 && (
            <div className="grid grid-cols-2 gap-2 h-full">
              {safeImages.map((img, idx) => (
                <div key={idx} className="relative group cursor-pointer h-full overflow-hidden" onClick={() => openModal(idx)}>
                  <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                  <Overlay />
                </div>
              ))}
            </div>
          )}

          {/* If 3 images */}
          {safeImages.length === 3 && (
            <div className="grid grid-cols-3 gap-2 h-full">
              <div className="col-span-2 relative group cursor-pointer overflow-hidden" onClick={() => openModal(0)}>
                <img src={safeImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
              </div>
              <div className="flex flex-col gap-2 h-full">
                {safeImages.slice(1).map((img, idx) => (
                  <div key={idx} className="relative group cursor-pointer h-full overflow-hidden" onClick={() => openModal(idx + 1)}>
                    <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                    <Overlay />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If 4 images (as per user screenshot, needs fixing) */}
          {safeImages.length === 4 && (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
              {/* Main image spanning 2 rows and 2 cols */}
              <div
                className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
                onClick={() => openModal(0)}
              >
                <img src={safeImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
              </div>
              {/* Secondary images */}
              <div className="col-span-2 row-span-1 grid grid-cols-2 gap-2">
                <div className="relative group cursor-pointer overflow-hidden" onClick={() => openModal(1)}>
                  <img src={safeImages[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                  <Overlay />
                </div>
                <div className="relative group cursor-pointer overflow-hidden" onClick={() => openModal(2)}>
                  <img src={safeImages[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                  <Overlay />
                </div>
              </div>
              {/* Forth image spanning full width of remaining col */}
              <div className="col-span-2 row-span-1 relative group cursor-pointer overflow-hidden" onClick={() => openModal(3)}>
                <img src={safeImages[3]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
              </div>
            </div>
          )}

          {/* If 5+ images (Standard Airbnb Layout) */}
          {safeImages.length >= 5 && (
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
              {/* Main Image */}
              <div
                className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
                onClick={() => openModal(0)}
              >
                <img src={safeImages[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
              </div>

              {/* Middle Top */}
              <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden" onClick={() => openModal(1)}>
                <img src={safeImages[1]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
              </div>

              {/* Right Top */}
              <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden" onClick={() => openModal(2)}>
                <img src={safeImages[2]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
              </div>

              {/* Middle Bottom */}
              <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden" onClick={() => openModal(3)}>
                <img src={safeImages[3]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
              </div>

              {/* Right Bottom (With Counter) */}
              <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden" onClick={() => openModal(4)}>
                <img src={safeImages[4]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                <Overlay />
                {safeImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                    <span className="text-white font-bold text-xl">+{safeImages.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-[2010] p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-[2010] text-white/80 font-medium">
            {modalImageIndex + 1} / {safeImages.length}
          </div>

          {/* Navigation */}
          {safeImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevModalImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[2010] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors md:block" // Show on mobile too if possible, or rely on swipe
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextModalImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[2010] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors md:block"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Main Image Container */}
          <div className="relative w-full h-full flex items-center justify-center" onClick={closeModal}>
            <img
              src={safeImages[modalImageIndex]}
              alt={title}
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl scale-100 animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            />
          </div>
        </div>
      )}
    </>
  )
}

function Overlay() {
  return (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100" />
    </div>
  )
}
