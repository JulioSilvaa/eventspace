import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  X,
  AlertCircle,
  Camera
} from 'lucide-react'
import { AdImage } from '@/types'
import {
  optimizeImage,
  estimateOptimizedSize,
  type OptimizedImageVersions
} from '@/services/imageOptimizationService'

interface ImageFile {
  id: string
  file: File
  preview: string
  uploading?: boolean
  optimizing?: boolean
  optimized?: OptimizedImageVersions
  optimizationError?: string
  error?: string
  originalSize?: number
  optimizedSize?: number
  savings?: number
}

interface ImageUploadProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[] | ((prev: ImageFile[]) => ImageFile[])) => void
  maxImages: number
  disabled?: boolean
  existingImages?: AdImage[]
  onRemovedExistingImagesChange?: (removedIds: string[]) => void
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages,
  disabled = false,
  existingImages = [],
  onRemovedExistingImagesChange
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [removedExistingImages, setRemovedExistingImages] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    const activeExistingImages = existingImages.filter(img => !removedExistingImages.includes(img.id))
    const totalCurrentImages = images.length + activeExistingImages.length
    const remainingSlots = maxImages - totalCurrentImages
    const filesToAdd = acceptedFiles.slice(0, remainingSlots)

    // Criar imagens iniciais com estado de otimização
    const newImages: ImageFile[] = filesToAdd.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      optimizing: true,
      originalSize: file.size,
      ...estimateOptimizedSize(file.size)
    }))

    // Adicionar imagens imediatamente para mostrar progresso
    onImagesChange([...images, ...newImages])

    // Otimizar cada imagem em paralelo
    newImages.forEach(async (imageFile, index) => {
      try {
        const optimizedVersions = await optimizeImage(imageFile.file, totalCurrentImages + index)

        // Calcular tamanho total otimizado
        const optimizedSize = optimizedVersions.thumbnail.size +
          optimizedVersions.medium.size +
          optimizedVersions.large.size +
          (optimizedVersions.original?.size || 0)

        const savings = imageFile.originalSize! - optimizedSize

        // Atualizar a imagem com versões otimizadas
        onImagesChange((prev: ImageFile[]) =>
          prev.map((img: ImageFile) =>
            img.id === imageFile.id
              ? {
                ...img,
                optimizing: false,
                optimized: optimizedVersions,
                optimizedSize,
                savings,
                // Usar a versão medium como preview
                preview: URL.createObjectURL(optimizedVersions.medium)
              }
              : img
          )
        )
      } catch (error) {
        console.error('Erro na otimização:', error)

        // Marcar erro na otimização mas manter imagem original
        onImagesChange((prev: ImageFile[]) =>
          prev.map((img: ImageFile) =>
            img.id === imageFile.id
              ? {
                ...img,
                optimizing: false,
                optimizationError: error instanceof Error ? error.message : 'Erro desconhecido'
              }
              : img
          )
        )
      }
    })
  }, [images, maxImages, onImagesChange, disabled, existingImages, removedExistingImages])

  const activeExistingImages = existingImages.filter(img => !removedExistingImages.includes(img.id))
  const totalCurrentImages = images.length + activeExistingImages.length

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: disabled || totalCurrentImages >= maxImages,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  })

  const removeImage = (id: string) => {
    if (disabled) return

    // Check if it's a new image (has file) or existing image
    const imageToRemove = images.find(img => img.id === id)
    if (imageToRemove) {
      // It's a new image - remove from new images array and revoke URL
      URL.revokeObjectURL(imageToRemove.preview)
      onImagesChange(images.filter(img => img.id !== id))
    } else {
      // It's an existing image - mark as removed
      setRemovedExistingImages(prev => [...prev, id])
    }
  }

  const removeExistingImage = (id: string) => {
    if (disabled) return
    const newRemovedImages = [...removedExistingImages, id]
    setRemovedExistingImages(newRemovedImages)
    onRemovedExistingImagesChange?.(newRemovedImages)
  }

  const canAddMore = totalCurrentImages < maxImages && !disabled

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagens do Anúncio
            <span className="text-red-500 ml-1">*</span>
          </label>
          <p className="text-sm text-gray-500">
            Até {maxImages} imagens ({totalCurrentImages}/{maxImages} adicionadas)
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${dragActive || isDragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
            }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Solte as imagens aqui' : 'Clique ou arraste imagens'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, JPEG ou WEBP até 5MB cada
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {(activeExistingImages.length > 0 || images.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Existing Images */}
          {activeExistingImages
            .sort((a, b) => a.display_order - b.display_order)
            .map((image, index) => (
              <div
                key={`existing-${image.id}`}
                className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={image.image_url}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Order Badge */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <button
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Main Image Badge */}
                {index === 0 && activeExistingImages.length > 0 && images.length === 0 && (
                  <div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}

                {/* Existing Badge */}
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Atual
                </div>
              </div>
            ))}

          {/* New Images */}
          {images.map((image, index) => (
            <div
              key={`new-${image.id}`}
              className="relative group bg-gray-100 rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Order Badge */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {activeExistingImages.length + index + 1}
              </div>

              {/* Remove Button */}
              {!disabled && (
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Main Image Badge */}
              {index === 0 && activeExistingImages.length === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}

              {/* New Badge */}
              <div className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Nova
              </div>

              {/* Uploading State */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Error State */}
              {image.error && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-80 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}